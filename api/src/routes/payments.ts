/**
 * @file payments.ts
 * @author Angelo Nicolson
 * @brief Stripe payment processing for tutoring bookings
 * @description Handles payment intent creation, webhook processing, refunds, and secure payment flow
 * with full PCI compliance through Stripe.
 */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import {
  paymentRateLimit,
  handleValidationErrors,
  idempotencyCheck,
  validateWebhookSignature
} from '../middleware/security';
import { query } from '../database/connection';

const router = Router();

// Initialize Stripe with validation
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('⚠️  STRIPE_SECRET_KEY is not set in environment variables');
  console.error('   Please add STRIPE_SECRET_KEY to your .env file');
  console.error('   See SECURE_BOOKING_SETUP.md for setup instructions');
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover'
    })
  : null;

const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% platform fee

/**
 * Calculate pricing breakdown for a booking
 */
const calculatePricing = (
  basePrice: number,
  numSlots: number,
  isGroupSession: boolean,
  groupSize: number,
  isRecurring: boolean,
  recurringWeeks: number
) => {
  let sessionPrice = basePrice * numSlots;

  // Apply group discount (20% off per additional student)
  if (isGroupSession && groupSize > 1) {
    sessionPrice = sessionPrice * groupSize * 0.8;
  }

  // Calculate total for recurring
  const totalAmount = isRecurring ? sessionPrice * recurringWeeks : sessionPrice;

  // Calculate fees
  const platformFee = totalAmount * PLATFORM_FEE_PERCENTAGE;
  const tutorEarnings = totalAmount - platformFee;

  return {
    sessionPrice,
    totalAmount,
    platformFee,
    tutorEarnings
  };
};

/**
 * Create a Payment Intent for a booking
 */
router.post(
  '/create-payment-intent',
  requireAuth,
  paymentRateLimit,
  idempotencyCheck,
  [
    body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
    body('bookingDetails').isObject().withMessage('Booking details required'),
    body('bookingDetails.tutorId').notEmpty().withMessage('Tutor ID required'),
    body('bookingDetails.sessionType').notEmpty().withMessage('Session type required'),
    body('bookingDetails.date').isISO8601().withMessage('Valid date required'),
    body('bookingDetails.timeSlots').isArray({ min: 1 }).withMessage('At least one time slot required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({
          error: 'Payment service unavailable',
          message: 'Stripe payment processing is not configured. Please contact administrator.'
        });
      }

      const user = (req as any).user;
      const { amount, currency = 'usd', bookingDetails } = req.body;

      // Validate tutor exists and is active
      const tutorResult = await query(
        `SELECT t.*, u.email as tutor_email, u.first_name, u.last_name
         FROM tutors t
         JOIN users u ON t.user_id = u.id
         WHERE t.id = $1 AND t.is_active = true AND t.approval_status = 'approved'`,
        [bookingDetails.tutorId]
      );

      if (tutorResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Tutor not found or unavailable'
        });
      }

      const tutor = tutorResult.rows[0];

      // Verify amount matches expected pricing
      const pricing = calculatePricing(
        bookingDetails.sessionPrice || amount,
        bookingDetails.timeSlots?.length || 1,
        bookingDetails.isGroupSession || false,
        bookingDetails.groupSize || 1,
        bookingDetails.isRecurring || false,
        bookingDetails.recurringWeeks || 1
      );

      // Allow 1% variance for rounding
      if (Math.abs(pricing.totalAmount - amount) > amount * 0.01) {
        return res.status(400).json({
          error: 'Amount mismatch',
          message: 'The provided amount does not match the calculated booking price'
        });
      }

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId: user.userId.toString(),
          tutorId: bookingDetails.tutorId.toString(),
          sessionType: bookingDetails.sessionType,
          sessionDate: bookingDetails.date,
          isRecurring: bookingDetails.isRecurring ? 'true' : 'false',
          recurringWeeks: bookingDetails.recurringWeeks?.toString() || '1',
          isGroupSession: bookingDetails.isGroupSession ? 'true' : 'false',
          groupSize: bookingDetails.groupSize?.toString() || '1',
          platformFee: pricing.platformFee.toFixed(2),
          tutorEarnings: pricing.tutorEarnings.toFixed(2)
        },
        description: `Tutoring session with ${tutor.first_name} ${tutor.last_name}`,
        receipt_email: user.email,
        // Enable automatic payment methods (cards, digital wallets)
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Store pending transaction in database
      const transactionResult = await query(
        `INSERT INTO payment_transactions (
          transaction_type,
          payment_provider,
          provider_transaction_id,
          payer_id,
          tutor_id,
          amount_total,
          platform_fee,
          tutor_earnings,
          currency,
          status,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          'purchase',
          'stripe',
          paymentIntent.id,
          user.userId,
          bookingDetails.tutorId,
          pricing.totalAmount,
          pricing.platformFee,
          pricing.tutorEarnings,
          currency.toUpperCase(),
          'pending',
          JSON.stringify(bookingDetails)
        ]
      );

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transactionResult.rows[0].id,
        amount: pricing.totalAmount
      });
    } catch (error: any) {
      console.error('[PAYMENT ERROR]', error);

      // Handle specific Stripe errors
      if (error.type === 'StripeCardError') {
        return res.status(400).json({
          error: 'Card error',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Payment intent creation failed',
        message: 'Unable to process payment. Please try again.'
      });
    }
  }
);

/**
 * Stripe webhook handler for payment events
 */
router.post(
  '/webhook',
  validateWebhookSignature(process.env.STRIPE_WEBHOOK_SECRET || ''),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe) {
      console.error('[WEBHOOK ERROR] Stripe not configured');
      return res.status(503).json({ error: 'Payment service unavailable' });
    }

    if (!webhookSecret) {
      console.error('[WEBHOOK ERROR] STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error('[WEBHOOK ERROR] Signature verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    try {
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentSuccess(paymentIntent);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentFailure(paymentIntent);
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          await handleRefund(charge);
          break;
        }

        default:
          console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('[WEBHOOK ERROR] Processing failed:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('[PAYMENT SUCCESS]', paymentIntent.id);

  await query('BEGIN');

  try {
    // Update transaction status
    await query(
      `UPDATE payment_transactions
       SET status = 'completed', updated_at = NOW()
       WHERE provider_transaction_id = $1`,
      [paymentIntent.id]
    );

    // Get transaction details
    const transactionResult = await query(
      `SELECT * FROM payment_transactions WHERE provider_transaction_id = $1`,
      [paymentIntent.id]
    );

    if (transactionResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionResult.rows[0];
    const bookingDetails = transaction.metadata;

    // Create booking(s) - handle recurring sessions
    const isRecurring = bookingDetails.isRecurring === true;
    const recurringWeeks = bookingDetails.recurringWeeks || 1;
    let parentBookingId: number | null = null;

    for (let week = 0; week < recurringWeeks; week++) {
      const sessionDate = new Date(bookingDetails.date);
      sessionDate.setDate(sessionDate.getDate() + (week * 7));

      const bookingResult = await query(
        `INSERT INTO bookings (
          tutor_id,
          student_id,
          booked_by_id,
          session_type,
          session_date,
          start_time,
          end_time,
          duration_minutes,
          is_recurring,
          recurring_weeks,
          parent_booking_id,
          recurrence_instance,
          is_group_session,
          group_size,
          group_participants,
          payment_intent_id,
          payment_transaction_id,
          amount_paid,
          currency,
          platform_fee,
          tutor_earnings,
          status,
          notes,
          student_name,
          student_email,
          parent_email,
          confirmed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW())
        RETURNING id`,
        [
          transaction.tutor_id,
          bookingDetails.studentId || transaction.payer_id,
          transaction.payer_id,
          bookingDetails.sessionType,
          sessionDate.toISOString().split('T')[0],
          bookingDetails.timeSlots[0],
          bookingDetails.timeSlots[bookingDetails.timeSlots.length - 1],
          bookingDetails.timeSlots.length * 60,
          isRecurring,
          recurringWeeks,
          parentBookingId,
          week + 1,
          bookingDetails.isGroupSession || false,
          bookingDetails.groupSize || 1,
          JSON.stringify(bookingDetails.groupParticipants || []),
          week === 0 ? paymentIntent.id : null, // Only first booking gets payment intent ID
          week === 0 ? transaction.id : null,
          transaction.amount_total / recurringWeeks, // Split amount across sessions
          transaction.currency,
          transaction.platform_fee / recurringWeeks,
          transaction.tutor_earnings / recurringWeeks,
          'confirmed',
          bookingDetails.notes,
          bookingDetails.studentName,
          bookingDetails.studentEmail,
          bookingDetails.parentEmail || null
        ]
      );

      // Set parent booking ID for subsequent recurring bookings
      if (week === 0) {
        parentBookingId = bookingResult.rows[0].id;
      }
    }

    await query('COMMIT');

    // TODO: Send confirmation email
    console.log('[BOOKING CREATED] Payment successful, booking confirmed');
  } catch (error) {
    await query('ROLLBACK');
    console.error('[PAYMENT SUCCESS ERROR]', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('[PAYMENT FAILED]', paymentIntent.id);

  await query(
    `UPDATE payment_transactions
     SET status = 'failed',
         failure_reason = $1,
         updated_at = NOW()
     WHERE provider_transaction_id = $2`,
    [
      paymentIntent.last_payment_error?.message || 'Payment failed',
      paymentIntent.id
    ]
  );

  // TODO: Send failure notification email
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  console.log('[REFUND PROCESSED]', charge.id);

  await query(
    `UPDATE payment_transactions
     SET status = 'refunded', updated_at = NOW()
     WHERE provider_transaction_id = $1`,
    [charge.payment_intent]
  );

  await query(
    `UPDATE bookings
     SET status = 'cancelled',
         cancelled_at = NOW(),
         updated_at = NOW()
     WHERE payment_intent_id = $1`,
    [charge.payment_intent]
  );

  // TODO: Send refund confirmation email
}

/**
 * Process refund for cancelled booking
 */
router.post(
  '/refund',
  requireAuth,
  paymentRateLimit,
  [
    body('bookingId').isInt().withMessage('Valid booking ID required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({
          error: 'Payment service unavailable',
          message: 'Stripe payment processing is not configured. Please contact administrator.'
        });
      }

      const user = (req as any).user;
      const { bookingId, reason } = req.body;

      // Get booking details
      const bookingResult = await query(
        `SELECT * FROM bookings
         WHERE id = $1 AND (booked_by_id = $2 OR $3 = ANY(ARRAY['admin', 'owner']))`,
        [bookingId, user.userId, user.role]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Booking not found or unauthorized'
        });
      }

      const booking = bookingResult.rows[0];

      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          error: 'Cannot refund this booking',
          message: 'Only confirmed bookings can be refunded'
        });
      }

      // Check cancellation policy (e.g., must cancel 24 hours in advance)
      const bookingDateTime = new Date(`${booking.session_date}T${booking.start_time}`);
      const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

      let refundAmount = booking.amount_paid;

      if (hoursUntilBooking < 24) {
        // Less than 24 hours: 50% refund
        refundAmount = booking.amount_paid * 0.5;
      } else if (hoursUntilBooking < 48) {
        // Less than 48 hours: 75% refund
        refundAmount = booking.amount_paid * 0.75;
      }
      // 48+ hours: full refund

      if (!booking.payment_intent_id) {
        return res.status(400).json({
          error: 'No payment found for this booking'
        });
      }

      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment_intent_id,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          bookingId: bookingId.toString(),
          cancelledBy: user.userId.toString(),
          cancellationReason: reason || 'Customer request'
        }
      });

      // Update booking status
      await query(
        `UPDATE bookings
         SET status = 'cancelled',
             cancellation_reason = $1,
             cancelled_at = NOW(),
             cancelled_by_id = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [reason || 'Customer cancellation', user.userId, bookingId]
      );

      return res.status(200).json({
        success: true,
        refund: {
          id: refund.id,
          amount: refundAmount,
          status: refund.status
        },
        message: `Refund of $${refundAmount.toFixed(2)} processed successfully`
      });
    } catch (error: any) {
      console.error('[REFUND ERROR]', error);

      if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
          error: 'Refund failed',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Refund processing failed',
        message: 'Unable to process refund. Please contact support.'
      });
    }
  }
);

export default router;
