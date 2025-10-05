import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe, StripeCardElementOptions } from '@stripe/stripe-js';
import './PaymentForm.css';

// Initialize Stripe - you'll need to replace with your publishable key
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');

interface PaymentFormProps {
  amount: number;
  sessionName: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
  loading?: boolean;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  amount,
  sessionName,
  onSuccess,
  onError,
  onBack,
  loading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const cardElementOptions: StripeCardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: '400',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
      complete: {
        color: '#10b981',
      },
    },
    hidePostalCode: false,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        onError(paymentMethodError.message || 'Payment method creation failed');
        setProcessing(false);
        return;
      }

      // In a real app, you'd send this to your backend
      // For demo purposes, we'll simulate a successful payment
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: paymentMethod.id,
          amount: amount * 100, // Stripe uses cents
          currency: 'usd',
        }),
      });

      const { client_secret, error } = await response.json();

      if (error) {
        onError(error);
        setProcessing(false);
        return;
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret);

      if (confirmError) {
        onError(confirmError.message || 'Payment confirmation failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      onError('An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
  };

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <button className="back-button" onClick={onBack} disabled={processing}>
          ← Back to Booking Details
        </button>
        <h3>Complete Your Payment</h3>
        <div className="payment-summary">
          <div className="session-info">
            <span className="session-name">{sessionName}</span>
            <span className="session-price">${amount}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-section">
          <h4>Payment Information</h4>
          <div className="card-element-container">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
        </div>

        <div className="security-info">
          <div className="security-badges">
            <span className="security-badge">🔒 SSL Secured</span>
            <span className="security-badge">💳 PCI Compliant</span>
          </div>
          <p className="security-text">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>

        <div className="payment-total">
          <div className="total-row">
            <span>Session Total:</span>
            <span className="total-amount">${amount}</span>
          </div>
          <div className="fees-info">
            <small>Includes all taxes and fees</small>
          </div>
        </div>

        <button
          type="submit"
          className={`pay-button ${(!stripe || !cardComplete || processing || loading) ? 'disabled' : ''}`}
          disabled={!stripe || !cardComplete || processing || loading}
        >
          {processing ? (
            <>
              <span className="spinner"></span>
              Processing Payment...
            </>
          ) : (
            `Pay $${amount}`
          )}
        </button>

        <div className="payment-footer">
          <p className="refund-policy">
            💡 Free cancellation up to 24 hours before your session
          </p>
        </div>
      </form>
    </div>
  );
};

// Wrapper component with Stripe Elements provider
export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};