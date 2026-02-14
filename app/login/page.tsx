'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/pages/login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      // Store user info in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Store in sessionStorage only (cleared when browser closes)
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Show success message
      alert('✅ Login successful!');
      
      // FORCE REDIRECT to dashboard
      window.location.href = '/dashboard';
      
    } else {
      setError(data.error || 'Invalid phone number or password');
    }
  } catch (err) {
    setError('Failed to connect to server');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Access your account securely</p>
          <div className={styles.welcomeBack}>
            <span>👋</span> We missed you!
          </div>
        </div>

        <div className={styles.formContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>📱</span> Phone Number <span>*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter your 10-digit phone number"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>🔒</span> Password <span>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className={styles.input}
              />
            </div>

            <div className={styles.forgotPassword}>
  <Link href="/forgot-password">Forgot password?</Link>
</div>

            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? 'Logging in...' : 'Login to Your Account'}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className={styles.signupLink}>
            <p>
              Don't have an account?
              <Link href="/signup">Create one now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}