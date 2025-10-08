import { authFetch } from '../../../utils/authFetch';
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Save, X, Plus } from 'lucide-react';
import './TutorAvailability.css';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityOverride {
  date: string;
  isAvailable: boolean;
  reason?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

interface TutorAvailabilityProps {
  tutorId: number;
}

const TutorAvailability: React.FC<TutorAvailabilityProps> = ({ tutorId }) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'overrides'>('weekly');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Initialize empty availability schedule
  const initializeAvailability = () => {
    const slots: AvailabilitySlot[] = [];
    for (let day = 0; day < 7; day++) {
      slots.push({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: day >= 1 && day <= 5 // Mon-Fri by default
      });
    }
    return slots;
  };

  useEffect(() => {
    fetchAvailability();
  }, [tutorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // const response = await authFetch(`/api/tutors/${tutorId}/availability`);
      // const data = await response.json();
      // setAvailability(data.availability || initializeAvailability());
      // setOverrides(data.overrides || []);
      
      // For now, use default data
      setAvailability(initializeAvailability());
      setOverrides([]);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability(initializeAvailability());
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].isAvailable = !newAvailability[dayIndex].isAvailable;
    setAvailability(newAvailability);
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex][field] = value;
    setAvailability(newAvailability);
  };

  const addOverride = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setOverrides([...overrides, {
      date: tomorrow.toISOString().split('T')[0],
      isAvailable: false,
      reason: '',
      allDay: true
    }]);
  };

  const removeOverride = (index: number) => {
    const newOverrides = overrides.filter((_, i) => i !== index);
    setOverrides(newOverrides);
  };

  const handleOverrideChange = (index: number, field: keyof AvailabilityOverride, value: any) => {
    const newOverrides = [...overrides];
    newOverrides[index] = { ...newOverrides[index], [field]: value };
    setOverrides(newOverrides);
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      const response = await authFetch(`/api/tutors/${tutorId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ availability })
      });
      
      if (response.ok) {
        // Save overrides separately
        for (const override of overrides) {
          await authFetch(`/api/tutors/${tutorId}/availability/override`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(override)
          });
        }
        
        alert('Availability saved successfully!');
      } else {
        alert('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error saving availability');
    } finally {
      setSaving(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (loading) {
    return <div className="loading">Loading availability...</div>;
  }

  return (
    <div className="tutor-availability">
      <div className="availability-header">
        <h2>Manage Your Availability</h2>
        <button 
          className="save-button"
          onClick={saveAvailability}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="availability-tabs">
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <Calendar size={16} />
          Weekly Schedule
        </button>
        <button 
          className={`tab ${activeTab === 'overrides' ? 'active' : ''}`}
          onClick={() => setActiveTab('overrides')}
        >
          <Clock size={16} />
          Special Dates
        </button>
      </div>

      {activeTab === 'weekly' && (
        <div className="weekly-schedule">
          <p className="schedule-description">
            Set your regular weekly availability. Students will be able to book sessions during these times.
          </p>
          
          <div className="days-list">
            {availability.map((slot, index) => (
              <div key={index} className={`day-row ${!slot.isAvailable ? 'unavailable' : ''}`}>
                <div className="day-toggle">
                  <input
                    type="checkbox"
                    id={`day-${index}`}
                    checked={slot.isAvailable}
                    onChange={() => handleDayToggle(index)}
                  />
                  <label htmlFor={`day-${index}`}>
                    {dayNames[slot.dayOfWeek]}
                  </label>
                </div>
                
                {slot.isAvailable && (
                  <div className="time-selection">
                    <div className="time-input">
                      <label>From:</label>
                      <select
                        value={slot.startTime}
                        onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="time-input">
                      <label>To:</label>
                      <select
                        value={slot.endTime}
                        onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'overrides' && (
        <div className="overrides-section">
          <div className="overrides-header">
            <p className="overrides-description">
              Add special dates when you're unavailable (holidays, vacations) or have different hours.
            </p>
            <button className="add-override-btn" onClick={addOverride}>
              <Plus size={16} />
              Add Special Date
            </button>
          </div>
          
          <div className="overrides-list">
            {overrides.length === 0 ? (
              <div className="no-overrides">
                No special dates configured. Your regular weekly schedule will apply.
              </div>
            ) : (
              overrides.map((override, index) => (
                <div key={index} className="override-item">
                  <div className="override-controls">
                    <div className="form-group">
                      <label>Date:</label>
                      <input
                        type="date"
                        value={override.date}
                        onChange={(e) => handleOverrideChange(index, 'date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status:</label>
                      <select
                        value={override.isAvailable ? 'available' : 'unavailable'}
                        onChange={(e) => handleOverrideChange(index, 'isAvailable', e.target.value === 'available')}
                      >
                        <option value="unavailable">Unavailable</option>
                        <option value="available">Available (special hours)</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={override.allDay}
                          onChange={(e) => handleOverrideChange(index, 'allDay', e.target.checked)}
                        />
                        All day
                      </label>
                    </div>
                    
                    {!override.allDay && (
                      <>
                        <div className="form-group">
                          <label>From:</label>
                          <select
                            value={override.startTime || '09:00'}
                            onChange={(e) => handleOverrideChange(index, 'startTime', e.target.value)}
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>To:</label>
                          <select
                            value={override.endTime || '17:00'}
                            onChange={(e) => handleOverrideChange(index, 'endTime', e.target.value)}
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    
                    <div className="form-group full-width">
                      <label>Reason (optional):</label>
                      <input
                        type="text"
                        value={override.reason || ''}
                        onChange={(e) => handleOverrideChange(index, 'reason', e.target.value)}
                        placeholder="e.g., Holiday, Conference, etc."
                      />
                    </div>
                    
                    <button
                      className="remove-override-btn"
                      onClick={() => removeOverride(index)}
                      title="Remove this override"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="availability-tips">
        <h3>Tips for Managing Availability</h3>
        <ul>
          <li>Keep your schedule updated to avoid booking conflicts</li>
          <li>Block out time for preparation between sessions</li>
          <li>Consider time zones if you work with international students</li>
          <li>Set special dates well in advance to give students time to reschedule</li>
        </ul>
      </div>
    </div>
  );
};

export default TutorAvailability;