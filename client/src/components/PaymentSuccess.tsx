import React from 'react';
import './PaymentSuccess.css';

interface PaymentSuccessProps {
  bookingDetails: {
    tutorName: string;
    sessionType: string;
    date: string;
    time: string;
    studentName: string;
    studentEmail: string;
    amount: number;
    paymentIntentId: string;
  };
  onReturnToDashboard: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  bookingDetails,
  onReturnToDashboard
}) => {
  const {
    tutorName,
    sessionType,
    date,
    time,
    studentName,
    studentEmail,
    amount,
    paymentIntentId
  } = bookingDetails;

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <div className="checkmark-circle">
            <svg className="checkmark" viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>
        </div>

        <div className="success-content">
          <h2>Payment Successful! 🎉</h2>
          <p className="success-message">
            Your tutoring session has been booked and confirmed. You'll receive a confirmation email shortly.
          </p>

          <div className="booking-summary">
            <h3>Session Details</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Tutor:</span>
                <span className="value">{tutorName}</span>
              </div>
              <div className="summary-item">
                <span className="label">Session Type:</span>
                <span className="value">{sessionType}</span>
              </div>
              <div className="summary-item">
                <span className="label">Date:</span>
                <span className="value">{new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="summary-item">
                <span className="label">Time:</span>
                <span className="value">{time}</span>
              </div>
              <div className="summary-item">
                <span className="label">Student:</span>
                <span className="value">{studentName}</span>
              </div>
              <div className="summary-item">
                <span className="label">Amount Paid:</span>
                <span className="value price">${amount}</span>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-icon">📧</div>
                <div className="step-content">
                  <strong>Confirmation Email</strong>
                  <p>Check your email ({studentEmail}) for session details and video call link</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">📅</div>
                <div className="step-content">
                  <strong>Calendar Invitation</strong>
                  <p>Add the session to your calendar so you don't miss it</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">💻</div>
                <div className="step-content">
                  <strong>Join the Session</strong>
                  <p>Use the video call link 5 minutes before your session starts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-receipt">
            <h4>Payment Receipt</h4>
            <div className="receipt-info">
              <span>Payment ID: {paymentIntentId}</span>
              <span>Transaction Date: {new Date().toLocaleDateString()}</span>
            </div>
            <p className="receipt-note">
              Keep this information for your records. A detailed receipt has been sent to your email.
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="return-button primary"
              onClick={onReturnToDashboard}
            >
              Return to Dashboard
            </button>
            <button 
              className="return-button secondary"
              onClick={() => window.print()}
            >
              Print Receipt
            </button>
          </div>

          <div className="support-info">
            <p className="support-text">
              Need help? Contact our support team or reach out to your tutor directly.
            </p>
            <div className="support-links">
              <button className="support-link">📞 Contact Support</button>
              <button className="support-link">❓ Help Center</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};