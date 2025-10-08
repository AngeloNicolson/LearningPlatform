import { authFetch } from '../../../utils/authFetch';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, MapPin } from 'lucide-react';
import './TutorSchedule.css';

interface Booking {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_group_session: boolean;
  total_participants: number;
  status: string;
  subject: string;
  notes: string;
  meeting_link?: string;
  booked_by_first: string;
  booked_by_last: string;
  booked_by_email: string;
  participants?: Array<{
    student_id: number;
    first_name: string;
    last_name: string;
  }>;
}

interface TutorScheduleProps {
  tutorId: number;
}

const TutorSchedule: React.FC<TutorScheduleProps> = ({ tutorId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [tutorId, selectedDate, viewType]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      const response = await authFetch(
        `/api/tutors/${tutorId}/schedule?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
        {
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(selectedDate);
    if (viewType === 'day') {
      return date;
    } else if (viewType === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day;
      return new Date(date.setDate(diff));
    } else {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
  };

  const getEndDate = () => {
    const date = new Date(selectedDate);
    if (viewType === 'day') {
      return date;
    } else if (viewType === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day + 6;
      return new Date(date.setDate(diff));
    } else {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
  };

  const getDayBookings = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.session_date.startsWith(dateStr));
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const renderDayView = () => {
    const timeSlots = getTimeSlots();
    const dayBookings = getDayBookings(selectedDate);

    return (
      <div className="day-view">
        <div className="day-header">
          <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        </div>
        <div className="time-grid">
          {timeSlots.map(time => {
            const slotBookings = dayBookings.filter(b => b.start_time.startsWith(time.split(':')[0]));
            
            return (
              <div key={time} className="time-slot">
                <div className="time-label">{time}</div>
                <div className="slot-content">
                  {slotBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className={`booking-card ${booking.status} ${booking.is_group_session ? 'group' : 'individual'}`}
                    >
                      <div className="booking-header">
                        <span className="booking-time">
                          {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                        </span>
                        {booking.is_group_session && (
                          <span className="group-badge">
                            <Users size={14} /> {booking.total_participants}
                          </span>
                        )}
                      </div>
                      <div className="booking-subject">{booking.subject}</div>
                      <div className="booking-student">
                        {booking.booked_by_first} {booking.booked_by_last}
                      </div>
                      {booking.meeting_link && (
                        <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className="meeting-link">
                          <Video size={14} /> Join Meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getStartDate();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    const timeSlots = getTimeSlots();

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="time-column"></div>
          {days.map(day => (
            <div key={day.toISOString()} className="day-column-header">
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className={`day-number ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="week-grid">
          {timeSlots.map(time => (
            <div key={time} className="week-row">
              <div className="time-label">{time}</div>
              {days.map(day => {
                const dayBookings = getDayBookings(day);
                const slotBookings = dayBookings.filter(b => b.start_time.startsWith(time.split(':')[0]));
                
                return (
                  <div key={`${day.toISOString()}-${time}`} className="week-cell">
                    {slotBookings.map(booking => (
                      <div 
                        key={booking.id} 
                        className={`booking-chip ${booking.status} ${booking.is_group_session ? 'group' : ''}`}
                        title={`${booking.subject} - ${booking.booked_by_first} ${booking.booked_by_last}`}
                      >
                        <span className="chip-subject">{booking.subject}</span>
                        {booking.is_group_session && (
                          <Users size={12} />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const startDate = getStartDate();
    const endDate = getEndDate();
    const weeks = [];
    const current = new Date(startDate);
    current.setDate(current.getDate() - current.getDay());

    while (current <= endDate || current.getDay() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return (
      <div className="month-view">
        <div className="month-header">
          <h3>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div className="month-grid">
          <div className="weekday-headers">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="month-week">
              {week.map(day => {
                const dayBookings = getDayBookings(day);
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`month-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  >
                    <div className="day-number">{day.getDate()}</div>
                    {dayBookings.length > 0 && (
                      <div className="day-bookings">
                        <div className="booking-count">{dayBookings.length} sessions</div>
                        {dayBookings.slice(0, 2).map(booking => (
                          <div key={booking.id} className="mini-booking">
                            <span className="mini-time">{booking.start_time.slice(0, 5)}</span>
                            <span className="mini-subject">{booking.subject.slice(0, 10)}</span>
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="more-bookings">+{dayBookings.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="tutor-schedule">
      <div className="schedule-controls">
        <div className="view-selector">
          <button 
            className={viewType === 'day' ? 'active' : ''}
            onClick={() => setViewType('day')}
          >
            Day
          </button>
          <button 
            className={viewType === 'week' ? 'active' : ''}
            onClick={() => setViewType('week')}
          >
            Week
          </button>
          <button 
            className={viewType === 'month' ? 'active' : ''}
            onClick={() => setViewType('month')}
          >
            Month
          </button>
        </div>
        
        <div className="navigation-controls">
          <button onClick={handlePrevious}>&lt;</button>
          <button onClick={handleToday}>Today</button>
          <button onClick={handleNext}>&gt;</button>
        </div>

        <div className="schedule-stats">
          <span className="stat">
            <Calendar size={16} />
            {bookings.length} Sessions
          </span>
          <span className="stat">
            <Clock size={16} />
            {bookings.reduce((sum, b) => sum + b.duration_minutes, 0)} min
          </span>
          <span className="stat">
            <Users size={16} />
            {bookings.filter(b => b.is_group_session).length} Groups
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading schedule...</div>
      ) : (
        <div className="schedule-content">
          {viewType === 'day' && renderDayView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'month' && renderMonthView()}
        </div>
      )}

      <div className="legend">
        <span className="legend-item confirmed">Confirmed</span>
        <span className="legend-item pending">Pending</span>
        <span className="legend-item completed">Completed</span>
        <span className="legend-item cancelled">Cancelled</span>
      </div>
    </div>
  );
};

export default TutorSchedule;