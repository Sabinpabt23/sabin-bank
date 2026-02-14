'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('OTP sent to your email!');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('OTP verified! Set your new password.');
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Password reset successfully! Please login with your new password.');
        router.push('/login');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Reset Password</h1>
          <p>We'll help you get back into your account</p>
        </div>

        <div className={styles.progressBar}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
            <span>1</span> Email
          </div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <span>2</span> Verify
          </div>
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
            <span>3</span> Reset
          </div>
        </div>

        <form onSubmit={
          step === 1 ? handleSendOtp :
          step === 2 ? handleVerifyOtp :
          handleResetPassword
        } className={styles.form}>
          
          {error && <div className={styles.errorMessage}>⚠️ {error}</div>}
          {message && <div className={styles.successMessage}>✅ {message}</div>}

          {step === 1 && (
            <>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your registered email"
                />
              </div>
              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.formGroup}>
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="6-digit OTP"
                  maxLength={6}
                />
              </div>
              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}

          <div className={styles.links}>
            <Link href="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}