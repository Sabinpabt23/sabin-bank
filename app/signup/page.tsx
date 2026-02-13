'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/pages/signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    gender: 'male',
    birthDate: '',
    idType: 'citizenship',
    idNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
    special: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string) => {
    setPasswordValidations({
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate all password requirements
    const allValid = Object.values(passwordValidations).every(v => v);
    if (!allValid) {
      setError('Please meet all password requirements');
      return;
    }

    // Validate terms
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For now, we'll send data without the file (we'll add file upload later)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          gender: formData.gender,
          birthDate: formData.birthDate,
          idType: formData.idType,
          idNumber: formData.idNumber,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Account created successfully!\n\nYour Account Number: ${data.user.accountNumber}\n\nPlease save this number for login.`);
        router.push('/login');
      } else {
        setError(data.error || 'Something went wrong');
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
          <h1>Open Your Account</h1>
          <p>Join thousands of satisfied customers</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className={styles.formGrid}>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Full Name <span>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className={styles.input}
              />
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Phone Number <span>*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="98XXXXXXXX"
                className={styles.input}
              />
            </div>

            {/* Location */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Location <span>*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="City, District"
                className={styles.input}
              />
            </div>

            {/* Gender */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Gender <span>*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Birth Date */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Birth Date <span>*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>

            {/* ID Type */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                ID Type <span>*</span>
              </label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="citizenship">Citizenship</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            {/* ID Number */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>
                ID Number <span>*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                placeholder="Enter your ID number"
                className={styles.input}
              />
            </div>

            {/* ID Upload Section */}
            <div className={styles.idUploadSection}>
              <h3>Upload ID Photo (Front)</h3>
              <label className={styles.uploadButton}>
                <span>📎</span>
                {idFile ? 'Change File' : 'Choose File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </label>
              {idFile && (
                <div className={styles.fileInfo}>
                  <span>✅</span> {idFile.name}
                </div>
              )}
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Password <span>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                className={styles.input}
              />
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Confirm Password <span>*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className={`${styles.input} ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? styles.inputError
                    : ''
                }`}
              />
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className={styles.passwordRequirements}>
                <p>Password must contain:</p>
                <ul>
                  <li className={passwordValidations.length ? styles.valid : styles.invalid}>
                    {passwordValidations.length ? '✅' : '❌'} At least 8 characters
                  </li>
                  <li className={passwordValidations.uppercase ? styles.valid : styles.invalid}>
                    {passwordValidations.uppercase ? '✅' : '❌'} One uppercase letter
                  </li>
                  <li className={passwordValidations.lowercase ? styles.valid : styles.invalid}>
                    {passwordValidations.lowercase ? '✅' : '❌'} One lowercase letter
                  </li>
                  <li className={passwordValidations.number ? styles.valid : styles.invalid}>
                    {passwordValidations.number ? '✅' : '❌'} One number
                  </li>
                  <li className={passwordValidations.special ? styles.valid : styles.invalid}>
                    {passwordValidations.special ? '✅' : '❌'} One special character
                  </li>
                </ul>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className={styles.termsSection}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <span>→</span>}
              </button>
              <Link href="/" className={styles.cancelButton}>
                Cancel
              </Link>
            </div>

            {/* Login Link */}
            <div className={styles.loginLink}>
              <p>
                Already have an account?
                <Link href="/login">Login here</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}