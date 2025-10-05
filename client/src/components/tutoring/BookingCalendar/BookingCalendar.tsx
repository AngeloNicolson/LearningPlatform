import React, { useState, useEffect } from 'react';
import { PaymentForm } from '../../payments/PaymentForm/PaymentForm';
import { PaymentSuccess } from '../../payments/PaymentSuccess/PaymentSuccess';
import './BookingCalendar.css';

interface BookingCalendarProps {
  tutorId: string;
  sessionType: string;
  onBackToProfile: () => void;
  onBookingConfirm: (bookingDetails: BookingDetails) => void;
  userRole?: string;
  parentId?: number | null;
}

interface BookingDetails {
  tutorId: string;
  sessionType: string;
  date: string;
  time: string;
  timeSlots: string[];
  isRecurring: boolean;
  recurringWeeks?: number;
  studentName: string;
  studentEmail: string;
  studentId?: number;
  parentEmail?: string;
  notes: string;
  amount: number;
  paymentIntentId?: string;
  isGroupSession?: boolean;
  groupParticipants?: string[];
  totalParticipants?: number;
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

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  tutorId,
  sessionType,
  onBackToProfile,
  onBookingConfirm,
  userRole = 'personal'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [selectedChild, setSelectedChild] = useState<number | 'self' | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Group session state
  const [isGroupSession, setIsGroupSession] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<string[]>(['']);
  const [groupSize, setGroupSize] = useState(2);
  
  // Booking flow state
  const [bookingStep, setBookingStep] = useState<'calendar' | 'payment' | 'success'>('calendar');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [availability, setAvailability] = useState<{ [date: string]: string[] }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const sessionInfo = sessionTypes[sessionType as keyof typeof sessionTypes];
  const isParent = userRole === 'parent';

  // Fetch children if parent
  useEffect(() => {
    if (isParent) {
      fetchChildren();
      // Default to 'self' for parent bookings
      setSelectedChild('self');
      // Get parent's info from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setStudentName(`${user.firstName || ''} ${user.lastName || ''}`);
        setStudentEmail(user.email || '');
      }
    }
  }, [isParent]);

  // Fetch availability when month changes
  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, tutorId]);

  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/users/children`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoadingChildren(false);
    }
  };

  const fetchAvailability = async () => {
    if (!tutorId) return;
    
    setLoadingAvailability(true);
    const newAvailability: { [date: string]: string[] } = {};
    
    try {
      // Get first and last day of current month view
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Fetch availability for each day
      const promises = [];
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        
        promises.push(
          fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/${tutorId}/availability?date=${dateStr}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) {
                newAvailability[dateStr] = data.availableSlots || [];
              }
            })
            .catch(err => console.error(`Failed to fetch availability for ${dateStr}:`, err))
        );
      }
      
      await Promise.all(promises);
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleChildSelect = (value: string) => {
    if (value === 'self') {
      setSelectedChild('self');
      // Get parent's info from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setStudentName(`${user.firstName || ''} ${user.lastName || ''}`);
        setStudentEmail(user.email || '');
      }
    } else {
      const childId = Number(value);
      setSelectedChild(childId);
      const child = children.find(c => c.id === childId);
      if (child) {
        setStudentName(`${child.firstName} ${child.lastName}`);
        setStudentEmail(child.email);
      }
    }
  };

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
      const dateStr = date.toISOString().split('T')[0];
      const isAvailable = date >= today;
      const availableSlots = availability[dateStr] || [];
      
      // Generate slots from 9 AM to 6 PM and mark available based on API data
      const slots: TimeSlot[] = [];
      if (isAvailable) {
        for (let hour = 9; hour <= 18; hour++) {
          const hour12 = hour > 12 ? hour - 12 : hour;
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hourDisplay = hour12 === 0 ? 12 : hour12;
          const timeDisplay = `${hourDisplay}:00 ${ampm}`;
          const time24 = `${hour.toString().padStart(2, '0')}:00`;
          
          slots.push({
            time: timeDisplay,
            available: availableSlots.includes(time24)
          });
        }
      }
      
      days.push({
        date,
        day,
        available: isAvailable && slots.some(slot => slot.available),
        slots
      });
    }
    
    return days;
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
    setSelectedTimeSlots([]);
  };

  const prevMonth = () => {
    const today = new Date();
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (newMonth >= new Date(today.getFullYear(), today.getMonth())) {
      setCurrentMonth(newMonth);
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedTimeSlots([]);
    }
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.available && day.slots.length > 0) {
      setSelectedDate(day.date);
      setSelectedTime('');
      setSelectedTimeSlots([]);
    }
  };

  // Helper function to convert time string to minutes for sorting
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':');
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + parseInt(minute);
  };

  // Helper function to sort time slots chronologically
  const sortTimeSlots = (slots: string[]): string[] => {
    return slots.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  };

  const handleTimeSlotToggle = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    const slotTime = slot.time;
    if (selectedTimeSlots.includes(slotTime)) {
      // Remove the slot
      const newSlots = selectedTimeSlots.filter(t => t !== slotTime);
      setSelectedTimeSlots(newSlots);
      // Update selectedTime to first remaining slot or empty string
      if (selectedTime === slotTime) {
        setSelectedTime(newSlots.length > 0 ? newSlots[0] : '');
      }
    } else {
      // Add the slot (no consecutive restriction)
      const newSlots = sortTimeSlots([...selectedTimeSlots, slotTime]);
      setSelectedTimeSlots(newSlots);
      if (!selectedTime) {
        setSelectedTime(newSlots[0]);
      }
    }
  };

  const handleBooking = () => {
    if (!selectedDate || selectedTimeSlots.length === 0 || !studentName || !studentEmail) {
      alert('Please fill in all required fields and select at least one time slot');
      return;
    }

    if (isParent && !selectedChild) {
      alert('Please select who this session is for');
      return;
    }
    
    if (isGroupSession && groupParticipants.some(p => p && !p.includes('@'))) {
      alert('Please enter valid email addresses for all group participants');
      return;
    }

    // Calculate total amount based on number of slots, group size, and recurring weeks
    let baseAmount = (sessionInfo?.price || 0) * selectedTimeSlots.length;
    
    // Apply group discount (20% off per student for groups)
    if (isGroupSession) {
      const actualParticipants = groupParticipants.filter(p => p !== '').length + 1; // +1 for primary student
      const groupDiscount = 0.8; // 20% discount
      baseAmount = baseAmount * actualParticipants * groupDiscount;
    }
    
    const totalAmount = isRecurring ? baseAmount * recurringWeeks : baseAmount;

    const details: BookingDetails = {
      tutorId,
      sessionType,
      date: selectedDate.toDateString(),
      time: selectedTimeSlots[0], // First slot for display
      timeSlots: selectedTimeSlots,
      isRecurring,
      recurringWeeks: isRecurring ? recurringWeeks : undefined,
      studentName,
      studentEmail,
      studentId: isParent && selectedChild !== 'self' ? Number(selectedChild) || undefined : undefined,
      parentEmail: isParent ? '' : parentEmail,
      notes,
      amount: totalAmount,
      isGroupSession,
      groupParticipants: isGroupSession ? groupParticipants.filter(p => p !== '') : undefined,
      totalParticipants: isGroupSession ? groupParticipants.filter(p => p !== '').length + 1 : 1
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
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const handleReturnToDashboard = () => {
    // Reset all state and go back to main app
    setBookingStep('calendar');
    setBookingDetails(null);
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedTimeSlots([]);
    setIsRecurring(false);
    setRecurringWeeks(4);
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
              <p className="time-selection-hint">Select one or more consecutive hours</p>
              <div className="time-slots-grid">
                {selectedDaySlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${
                      selectedTimeSlots.includes(slot.time) ? 'selected' : ''
                    }`}
                    onClick={() => handleTimeSlotToggle(slot)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              
              {selectedTimeSlots.length > 0 && (
                <div className="session-options">
                  <div className="session-type-section">
                    <h4>Session Type</h4>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="sessionFrequency"
                          value="onetime"
                          checked={!isRecurring}
                          onChange={() => setIsRecurring(false)}
                        />
                        <span>One-time session</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="sessionFrequency"
                          value="recurring"
                          checked={isRecurring}
                          onChange={() => setIsRecurring(true)}
                        />
                        <span>Recurring weekly</span>
                      </label>
                    </div>
                    
                    {isRecurring && (
                      <div className="recurring-weeks">
                        <label htmlFor="weeks">Number of weeks:</label>
                        <select
                          id="weeks"
                          value={recurringWeeks}
                          onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                        >
                          <option value={2}>2 weeks</option>
                          <option value={4}>4 weeks</option>
                          <option value={8}>8 weeks</option>
                          <option value={12}>12 weeks</option>
                          <option value={16}>16 weeks</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div className="group-session-section">
                    <h4>Session Format</h4>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="sessionFormat"
                          value="individual"
                          checked={!isGroupSession}
                          onChange={() => setIsGroupSession(false)}
                        />
                        <span>Individual session</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="sessionFormat"
                          value="group"
                          checked={isGroupSession}
                          onChange={() => setIsGroupSession(true)}
                        />
                        <span>Group session (2-7 students)</span>
                      </label>
                    </div>
                    
                    {isGroupSession && (
                      <div className="group-settings">
                        <div className="form-group">
                          <label htmlFor="groupSize">Number of participants:</label>
                          <select
                            id="groupSize"
                            value={groupSize}
                            onChange={(e) => {
                              const size = Number(e.target.value);
                              setGroupSize(size);
                              const newParticipants = Array(size - 1).fill('');
                              setGroupParticipants(newParticipants);
                            }}
                          >
                            <option value={2}>2 students</option>
                            <option value={3}>3 students</option>
                            <option value={4}>4 students</option>
                            <option value={5}>5 students</option>
                            <option value={6}>6 students</option>
                            <option value={7}>7 students</option>
                          </select>
                        </div>
                        
                        <div className="participants-list">
                          <h5>Additional Participants (besides primary student)</h5>
                          {groupParticipants.map((participant, index) => (
                            <div key={index} className="form-group">
                              <label htmlFor={`participant-${index}`}>Participant {index + 2} Email:</label>
                              <input
                                id={`participant-${index}`}
                                type="email"
                                value={participant}
                                onChange={(e) => {
                                  const newParticipants = [...groupParticipants];
                                  newParticipants[index] = e.target.value;
                                  setGroupParticipants(newParticipants);
                                }}
                                placeholder={`participant${index + 2}@example.com`}
                              />
                            </div>
                          ))}
                          <p className="group-discount-note">
                            💡 Group sessions receive a 20% discount per student!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="booking-form-section">
          <div className="booking-form">
            <h3>Student Information</h3>
            
            {isParent && (
              <div className="form-group">
                <label htmlFor="childSelect">Who is this session for? *</label>
                {loadingChildren ? (
                  <div className="loading">Loading...</div>
                ) : (
                  <select
                    id="childSelect"
                    value={selectedChild || ''}
                    onChange={(e) => handleChildSelect(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="self">Myself</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="studentName">Student Name *</label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student's full name"
                required
                disabled={isParent && selectedChild !== 'self'}
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
                disabled={isParent && selectedChild !== 'self'}
              />
            </div>

            {!isParent && (
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
            )}

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

            {selectedDate && selectedTimeSlots.length > 0 && (
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
                  <span>
                    {selectedTimeSlots.length === 1 
                      ? selectedTimeSlots[0]
                      : `${selectedTimeSlots[0]} - ${selectedTimeSlots[selectedTimeSlots.length - 1]}`
                    }
                  </span>
                </div>
                <div className="summary-item">
                  <span>Duration:</span>
                  <span>{selectedTimeSlots.length} hour{selectedTimeSlots.length > 1 ? 's' : ''}</span>
                </div>
                {isRecurring && (
                  <div className="summary-item">
                    <span>Recurrence:</span>
                    <span>Weekly for {recurringWeeks} weeks</span>
                  </div>
                )}
                <div className="summary-item">
                  <span>Price per session:</span>
                  <span>${(sessionInfo?.price || 0) * selectedTimeSlots.length}</span>
                </div>
                {isGroupSession && (
                  <div className="summary-item">
                    <span>Format:</span>
                    <span>Group ({groupParticipants.filter(p => p !== '').length + 1} students)</span>
                  </div>
                )}
                {isRecurring && (
                  <div className="summary-item">
                    <span>Number of sessions:</span>
                    <span>{recurringWeeks}</span>
                  </div>
                )}
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>
                    ${
                      (() => {
                        let baseAmount = (sessionInfo?.price || 0) * selectedTimeSlots.length;
                        if (isGroupSession) {
                          const actualParticipants = groupParticipants.filter(p => p !== '').length + 1;
                          baseAmount = baseAmount * actualParticipants * 0.8; // 20% discount
                        }
                        return isRecurring ? baseAmount * recurringWeeks : baseAmount;
                      })()
                    }
                  </span>
                </div>
                {isGroupSession && (
                  <div className="summary-item discount">
                    <span></span>
                    <small className="discount-text">20% group discount applied!</small>
                  </div>
                )}
              </div>
            )}

            <button
              className={`confirm-booking-btn ${
                selectedDate && selectedTimeSlots.length > 0 && studentName && studentEmail ? '' : 'disabled'
              }`}
              onClick={handleBooking}
              disabled={!selectedDate || selectedTimeSlots.length === 0 || !studentName || !studentEmail}
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