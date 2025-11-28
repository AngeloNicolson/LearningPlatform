/**
 * @file TutorAvailabilityManager.tsx
 * @author Angelo Nicolson
 * @brief Calendly-style availability management for tutors
 * @description Allows tutors to set their weekly schedule, block vacation dates,
 * and manage custom hours - similar to Calendly's availability interface.
 */

import React, { useState, useEffect } from 'react';
import './TutorAvailabilityManager.css';

interface TimeSlot {
  id: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Exception {
  id: number;
  date: string;
  type: 'unavailable' | 'custom_hours';
  startTime?: string;
  endTime?: string;
  reason?: string;
}

interface TutorAvailabilityManagerProps {
  tutorId: number;
  onSave?: () => void;
}

const TutorAvailabilityManager: React.FC<TutorAvailabilityManagerProps> = ({ tutorId, onSave }) => {
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'exceptions'>('schedule');
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  const [newException, setNewException] = useState({
    date: '',
    type: 'unavailable' as 'unavailable' | 'custom_hours',
    startTime: '09:00',
    endTime: '17:00',
    reason: ''
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedule();
    fetchExceptions();
  }, [tutorId]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/schedule`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExceptions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/exceptions`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setExceptions(data.exceptions || []);
    } catch (error) {
      console.error('Failed to fetch exceptions:', error);
    }
  };

  const addTimeSlot = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/schedule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newSlot)
        }
      );

      if (response.ok) {
        await fetchSchedule();
        setNewSlot({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
        onSave?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add availability');
      }
    } catch (error) {
      console.error('Failed to add time slot:', error);
      alert('Failed to add availability');
    }
  };

  const deleteTimeSlot = async (slotId: number) => {
    if (!confirm('Remove this availability block?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/schedule/${slotId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        await fetchSchedule();
        onSave?.();
      } else {
        alert('Failed to delete availability');
      }
    } catch (error) {
      console.error('Failed to delete time slot:', error);
      alert('Failed to delete availability');
    }
  };

  const toggleSlotActive = async (slot: TimeSlot) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/schedule/${slot.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isActive: !slot.isActive })
        }
      );

      if (response.ok) {
        await fetchSchedule();
        onSave?.();
      }
    } catch (error) {
      console.error('Failed to toggle slot:', error);
    }
  };

  const addException = async () => {
    if (!newException.date) {
      alert('Please select a date');
      return;
    }

    try {
      const payload: any = {
        date: newException.date,
        type: newException.type,
        reason: newException.reason || undefined
      };

      if (newException.type === 'custom_hours') {
        payload.startTime = newException.startTime;
        payload.endTime = newException.endTime;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/exceptions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        await fetchExceptions();
        setNewException({
          date: '',
          type: 'unavailable',
          startTime: '09:00',
          endTime: '17:00',
          reason: ''
        });
        onSave?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add exception');
      }
    } catch (error) {
      console.error('Failed to add exception:', error);
      alert('Failed to add exception');
    }
  };

  const deleteException = async (exceptionId: number) => {
    if (!confirm('Remove this exception?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/tutors/${tutorId}/exceptions/${exceptionId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        await fetchExceptions();
        onSave?.();
      }
    } catch (error) {
      console.error('Failed to delete exception:', error);
    }
  };

  // Group schedule by day
  const scheduleByDay = schedule.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, TimeSlot[]>);

  if (loading) {
    return <div className="availability-loading">Loading availability...</div>;
  }

  return (
    <div className="tutor-availability-manager">
      <div className="availability-header">
        <h2>⏰ Set Your Availability</h2>
        <p>Manage when students can book sessions with you</p>
      </div>

      <div className="availability-tabs">
        <button
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Weekly Schedule
        </button>
        <button
          className={`tab ${activeTab === 'exceptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('exceptions')}
        >
          🚫 Exceptions & Vacations
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div className="schedule-tab">
          <div className="schedule-info">
            <h3>Weekly Recurring Schedule</h3>
            <p>Set the hours you're generally available each week</p>
          </div>

          <div className="add-slot-form">
            <h4>Add Availability Block</h4>
            <div className="form-row">
              <select
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
              >
                {dayNames.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>

              <input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              />

              <span>to</span>

              <input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              />

              <button className="btn-add" onClick={addTimeSlot}>
                + Add
              </button>
            </div>
          </div>

          <div className="weekly-schedule-grid">
            {dayNames.map((dayName, dayIndex) => {
              const daySlots = scheduleByDay[dayIndex] || [];
              return (
                <div key={dayIndex} className="day-column">
                  <div className="day-header">
                    <strong>{dayName}</strong>
                    <span className="slot-count">
                      {daySlots.filter(s => s.isActive).length} block{daySlots.filter(s => s.isActive).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="day-slots">
                    {daySlots.length === 0 ? (
                      <div className="no-slots">Unavailable</div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`time-slot ${!slot.isActive ? 'inactive' : ''}`}
                        >
                          <div className="slot-time">
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </div>
                          <div className="slot-actions">
                            <button
                              className="btn-toggle"
                              onClick={() => toggleSlotActive(slot)}
                              title={slot.isActive ? 'Disable' : 'Enable'}
                            >
                              {slot.isActive ? '👁️' : '🚫'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => deleteTimeSlot(slot.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'exceptions' && (
        <div className="exceptions-tab">
          <div className="exceptions-info">
            <h3>Date-Specific Exceptions</h3>
            <p>Block out vacation days or set custom hours for specific dates</p>
          </div>

          <div className="add-exception-form">
            <h4>Add Exception</h4>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newException.date}
                onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={newException.type}
                onChange={(e) => setNewException({
                  ...newException,
                  type: e.target.value as 'unavailable' | 'custom_hours'
                })}
              >
                <option value="unavailable">🚫 Unavailable (Vacation/Holiday)</option>
                <option value="custom_hours">⏰ Custom Hours</option>
              </select>
            </div>

            {newException.type === 'custom_hours' && (
              <div className="form-row">
                <input
                  type="time"
                  value={newException.startTime}
                  onChange={(e) => setNewException({ ...newException, startTime: e.target.value })}
                />
                <span>to</span>
                <input
                  type="time"
                  value={newException.endTime}
                  onChange={(e) => setNewException({ ...newException, endTime: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label>Reason (optional)</label>
              <input
                type="text"
                placeholder="e.g., Christmas Holiday, Conference"
                value={newException.reason}
                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
              />
            </div>

            <button className="btn-add-exception" onClick={addException}>
              Add Exception
            </button>
          </div>

          <div className="exceptions-list">
            <h4>Upcoming Exceptions</h4>
            {exceptions.length === 0 ? (
              <div className="no-exceptions">No exceptions scheduled</div>
            ) : (
              <div className="exception-items">
                {exceptions
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((exception) => (
                    <div key={exception.id} className="exception-item">
                      <div className="exception-icon">
                        {exception.type === 'unavailable' ? '🚫' : '⏰'}
                      </div>
                      <div className="exception-details">
                        <div className="exception-date">
                          {new Date(exception.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="exception-type">
                          {exception.type === 'unavailable' ? (
                            <span>Unavailable</span>
                          ) : (
                            <span>
                              Custom Hours: {exception.startTime?.slice(0, 5)} - {exception.endTime?.slice(0, 5)}
                            </span>
                          )}
                        </div>
                        {exception.reason && (
                          <div className="exception-reason">{exception.reason}</div>
                        )}
                      </div>
                      <button
                        className="btn-delete-exception"
                        onClick={() => deleteException(exception.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorAvailabilityManager;
