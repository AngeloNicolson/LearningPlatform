// Backend API endpoint for payment processing
// This would typically be in a separate Node.js/Express server
// For demo purposes, showing the structure here

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payment_method, amount, currency = 'usd', booking_details } = req.body;

    // Validate required fields
    if (!payment_method || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: payment_method, amount' 
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects amount in cents
      currency,
      payment_method,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        tutorId: booking_details?.tutorId || '',
        sessionType: booking_details?.sessionType || '',
        studentName: booking_details?.studentName || '',
        studentEmail: booking_details?.studentEmail || ''
      }
    });

    // Handle different payment statuses
    if (paymentIntent.status === 'succeeded') {
      // Payment successful - save booking to database
      await saveBookingToDatabase(booking_details, paymentIntent.id);
      
      // Send confirmation email
      await sendConfirmationEmail(booking_details, paymentIntent.id);

      return res.status(200).json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100 // Convert back to dollars
        }
      });
    } else if (paymentIntent.status === 'requires_action') {
      // 3D Secure authentication required
      return res.status(200).json({
        requires_action: true,
        client_secret: paymentIntent.client_secret
      });
    } else {
      return res.status(400).json({
        error: 'Payment failed',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: error.message,
        code: error.code
      });
    } else if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        error: 'Too many requests made to the API too quickly'
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid parameters were supplied to Stripe API'
      });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({
        error: 'An error occurred internally with Stripe API'
      });
    } else if (error.type === 'StripeConnectionError') {
      return res.status(500).json({
        error: 'Some kind of error occurred during the HTTPS communication'
      });
    } else if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({
        error: 'You probably used an incorrect API key'
      });
    } else {
      return res.status(500).json({
        error: 'An unexpected error occurred'
      });
    }
  }
}

// Helper function to save booking to database
async function saveBookingToDatabase(bookingDetails, paymentIntentId) {
  // This would connect to your database (PostgreSQL, MongoDB, etc.)
  // Example structure:
  
  /*
  const booking = {
    id: generateUniqueId(),
    tutorId: bookingDetails.tutorId,
    studentName: bookingDetails.studentName,
    studentEmail: bookingDetails.studentEmail,
    sessionType: bookingDetails.sessionType,
    date: bookingDetails.date,
    time: bookingDetails.time,
    amount: bookingDetails.amount,
    paymentIntentId,
    status: 'confirmed',
    createdAt: new Date(),
    notes: bookingDetails.notes,
    parentEmail: bookingDetails.parentEmail
  };

  await database.bookings.insert(booking);
  */
  
  console.log('Booking saved:', bookingDetails, paymentIntentId);
}

// Helper function to send confirmation email
async function sendConfirmationEmail(bookingDetails, paymentIntentId) {
  // This would integrate with email service (SendGrid, Mailgun, etc.)
  // Example structure:
  
  /*
  const emailTemplate = {
    to: bookingDetails.studentEmail,
    subject: 'Tutoring Session Confirmed',
    html: `
      <h2>Your tutoring session is confirmed!</h2>
      <p>Hi ${bookingDetails.studentName},</p>
      <p>Your tutoring session has been successfully booked:</p>
      <ul>
        <li>Date: ${bookingDetails.date}</li>
        <li>Time: ${bookingDetails.time}</li>
        <li>Session: ${bookingDetails.sessionType}</li>
        <li>Amount Paid: $${bookingDetails.amount}</li>
      </ul>
      <p>Payment ID: ${paymentIntentId}</p>
      <p>Join link will be sent 1 hour before your session.</p>
    `
  };

  await emailService.send(emailTemplate);
  */
  
  console.log('Confirmation email sent:', bookingDetails.studentEmail);
}

// Environment variables needed:
// STRIPE_SECRET_KEY=sk_test_your_secret_key_here
// DATABASE_URL=your_database_connection_string
// EMAIL_API_KEY=your_email_service_api_key