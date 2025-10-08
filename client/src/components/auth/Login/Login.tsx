import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'personal' | 'parent' | 'tutor'>('personal');

  const quickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Login failed';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Quick login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user info in localStorage (or context)
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, firstName, lastName, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If tutor, redirect to onboarding, else auto-login
      if (selectedRole === 'tutor') {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setShowRegister(false);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{showRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="tagline">
            {showRegister 
              ? 'Join our mathematical learning community' 
              : 'Sign in to access your tutoring dashboard'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!showRegister ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tutorplatform.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="demo-credentials">
              <p>Quick Login (Dev Mode):</p>
              <div className="quick-login-buttons">
                <button
                  type="button"
                  className="quick-login-btn"
                  onClick={() => quickLogin('owner@tutorplatform.com', 'password123')}
                  disabled={isLoading}
                >
                  👑 Owner
                </button>
                <button
                  type="button"
                  className="quick-login-btn"
                  onClick={() => quickLogin('admin@tutorplatform.com', 'password123')}
                  disabled={isLoading}
                >
                  🔧 Admin
                </button>
                <button
                  type="button"
                  className="quick-login-btn"
                  onClick={() => quickLogin('sarah.chen@tutors.com', 'password123')}
                  disabled={isLoading}
                >
                  👨‍🏫 Tutor
                </button>
                <button
                  type="button"
                  className="quick-login-btn"
                  onClick={() => quickLogin('john.parent@email.com', 'password123')}
                  disabled={isLoading}
                >
                  👨‍👩‍👧 Parent
                </button>
                <button
                  type="button"
                  className="quick-login-btn"
                  onClick={() => quickLogin('alex.student@email.com', 'password123')}
                  disabled={isLoading}
                >
                  🎓 Student
                </button>
              </div>
            </div>

            <div className="auth-switch">
              <p>Don't have an account?</p>
              <button 
                type="button"
                className="link-button"
                onClick={() => setShowRegister(true)}
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>I want to:</label>
              <div className="role-selection">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="personal"
                    checked={selectedRole === 'personal'}
                    onChange={(e) => setSelectedRole(e.target.value as 'personal' | 'parent' | 'tutor')}
                  />
                  <div className="role-card">
                    <span className="role-icon">🎓</span>
                    <span className="role-title">Personal Account</span>
                    <span className="role-desc">Access resources and book tutors for yourself</span>
                  </div>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="parent"
                    checked={selectedRole === 'parent'}
                    onChange={(e) => setSelectedRole(e.target.value as 'personal' | 'parent' | 'tutor')}
                  />
                  <div className="role-card">
                    <span className="role-icon">👨‍👩‍👧</span>
                    <span className="role-title">Parent Account</span>
                    <span className="role-desc">Manage your children's learning</span>
                  </div>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={selectedRole === 'tutor'}
                    onChange={(e) => setSelectedRole(e.target.value as 'personal' | 'parent' | 'tutor')}
                  />
                  <div className="role-card">
                    <span className="role-icon">👨‍🏫</span>
                    <span className="role-title">Become a Tutor</span>
                    <span className="role-desc">Teach and earn (requires approval)</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                type="email"
                id="reg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="auth-switch">
              <p>Already have an account?</p>
              <button 
                type="button"
                className="link-button"
                onClick={() => setShowRegister(false)}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};