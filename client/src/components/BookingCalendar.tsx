import React, { useState } from 'react';
import { PaymentForm } from './PaymentForm';
import { PaymentSuccess } from './PaymentSuccess';
import './BookingCalendar.css';

interface BookingCalendarProps {
  tutorId: string;
  sessionType: string;
  onBackToProfile: () => void;
  onBookingConfirm: (bookingDetails: BookingDetails) => void;
}

interface BookingDetails {
  tutorId: string;
  sessionType: string;
  date: string;
  time: string;
  studentName: string;
  studentEmail: string;
  parentEmail?: string;
  notes: string;
  amount: number;
  paymentIntentId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarDay {
  date: Date;
  day: number;
  available: boolean;
  slots: TimeSlot[];
}

const sessionTypes = {
  '30min': { name: '30-Minute Session', price: 25, duration: '30 minutes' },
  '60min': { name: '1-Hour Session', price: 45, duration: '1 hour' },
  '90min': { name: '90-Minute Session', price: 65, duration: '1.5 hours' },
  'test-prep': { name: 'Test Prep Package', price: 85, duration: '2 hours' }
};

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  tutorId,
  sessionType,
  onBackToProfile,
  onBookingConfirm
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Booking flow state
  const [bookingStep, setBookingStep] = useState<'calendar' | 'payment' | 'success'>('calendar');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');

  const sessionInfo = sessionTypes[sessionType as keyof typeof sessionTypes];

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const date = new Date(year, month, 1 - (firstDay.getDay() - i));
      days.push({
        date,
        day: date.getDate(),
        available: false,
        slots: []
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isAvailable = date >= today;
      const slots = isAvailable ? generateTimeSlots(date) : [];
      
      days.push({
        date,
        day,
        available: isAvailable,
        slots
      });
    }
    
    return days;
  };

  // Generate available time slots for a given date
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();
    
    // Skip Sundays (0)
    if (dayOfWeek === 0) return slots;
    
    // Different availability based on day of week
    const startHour = dayOfWeek === 6 ? 9 : 15; // Saturday starts at 9am, weekdays at 3pm
    const endHour = dayOfWeek === 6 ? 17 : 20;  // Saturday ends at 5pm, weekdays at 8pm
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 60) { // Only hour slots
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const timeDisplay = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        // Randomly make some slots unavailable for realism
        const available = Math.random() > 0.3;
        
        slots.push({
          time: timeDisplay,
          available
        });
      }
    }
    
    return slots;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const prevMonth = () => {
    const today = new Date();
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (newMonth >= new Date(today.getFullYear(), today.getMonth())) {
      setCurrentMonth(newMonth);
      setSelectedDate(null);
      setSelectedTime('');
    }
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.available && day.slots.length > 0) {
      setSelectedDate(day.date);
      setSelectedTime('');
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !studentName || !studentEmail) {
      alert('Please fill in all required fields');
      return;
    }

    const details: BookingDetails = {
      tutorId,
      sessionType,
      date: selectedDate.toDateString(),
      time: selectedTime,
      studentName,
      studentEmail,
      parentEmail,
      notes,
      amount: sessionInfo?.price || 0
    };

    setBookingDetails(details);
    setBookingStep('payment');
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    if (bookingDetails) {
      const finalBookingDetails = {
        ...bookingDetails,
        paymentIntentId: paymentIntent.id
      };
      
      setBookingDetails(finalBookingDetails);
      setBookingStep('success');
      onBookingConfirm(finalBookingDetails);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleReturnToDashboard = () => {
    // Reset all state and go back to main app
    setBookingStep('calendar');
    setBookingDetails(null);
    setSelectedDate(null);
    setSelectedTime('');
    setStudentName('');
    setStudentEmail('');
    setParentEmail('');
    setNotes('');
    onBackToProfile();
  };

  const selectedDaySlots = selectedDate 
    ? calendarDays.find(day => 
        day.date.toDateString() === selectedDate.toDateString()
      )?.slots || []
    : [];

  // Render different steps based on booking flow
  if (bookingStep === 'payment' && bookingDetails) {
    return (
      <PaymentForm
        amount={bookingDetails.amount}
        sessionName={sessionInfo?.name || 'Tutoring Session'}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onBack={() => setBookingStep('calendar')}
      />
    );
  }

  if (bookingStep === 'success' && bookingDetails) {
    return (
      <PaymentSuccess
        bookingDetails={{
          ...bookingDetails,
          tutorName: 'Your Tutor', // Would get from tutor data
          paymentIntentId: bookingDetails.paymentIntentId || ''
        }}
        onReturnToDashboard={handleReturnToDashboard}
      />
    );
  }

  return (
    <div className="booking-calendar-container">
      <button className="back-button" onClick={onBackToProfile}>
        ← Back to Profile
      </button>

      <div className="booking-header">
        <h2>Schedule Your Session</h2>
        <div className="session-summary">
          <span className="session-name">{sessionInfo?.name}</span>
          <span className="session-details">{sessionInfo?.duration} • ${sessionInfo?.price}</span>
        </div>
      </div>

      <div className="booking-content">
        <div className="calendar-section">
          <div className="calendar-header">
            <button 
              className="nav-button" 
              onClick={prevMonth}
              disabled={currentMonth.getMonth() === new Date().getMonth()}
            >
              ←
            </button>
            <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button className="nav-button" onClick={nextMonth}>→</button>
          </div>

          <div className="calendar-grid">
            <div className="weekday-headers">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday-header">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  className={`calendar-day ${
                    day.available && day.slots.length > 0 ? 'available' : 'unavailable'
                  } ${
                    selectedDate?.toDateString() === day.date.toDateString() ? 'selected' : ''
                  }`}
                  onClick={() => handleDateSelect(day)}
                  disabled={!day.available || day.slots.length === 0}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="time-slots-section">
              <h4>Available Times for {selectedDate.toLocaleDateString()}</h4>
              <div className="time-slots-grid">
                {selectedDaySlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${
                      selectedTime === slot.time ? 'selected' : ''
                    }`}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="booking-form-section">
          <div className="booking-form">
            <h3>Student Information</h3>
            
            <div className="form-group">
              <label htmlFor="studentName">Student Name *</label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentEmail">Student Email *</label>
              <input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentEmail">Parent Email (if student is under 18)</label>
              <input
                id="parentEmail"
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics you'd like to focus on, learning preferences, or other information..."
                rows={4}
              />
            </div>

            {selectedDate && selectedTime && (
              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <div className="summary-item">
                  <span>Session:</span>
                  <span>{sessionInfo?.name}</span>
                </div>
                <div className="summary-item">
                  <span>Date:</span>
                  <span>{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <span>Time:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="summary-item">
                  <span>Duration:</span>
                  <span>{sessionInfo?.duration}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>${sessionInfo?.price}</span>
                </div>
              </div>
            )}

            <button
              className={`confirm-booking-btn ${
                selectedDate && selectedTime && studentName && studentEmail ? '' : 'disabled'
              }`}
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || !studentName || !studentEmail}
            >
              Continue to Payment
            </button>

            <p className="booking-note">
              💡 You'll receive a confirmation email with video call details after booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};