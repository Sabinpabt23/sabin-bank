'use client';

import { useState } from 'react';
import styles from '@/styles/components/Modal.module.css';

interface RequestCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onRequestSubmitted: () => void;
}

export default function RequestCardModal({ isOpen, onClose, phoneNumber, onRequestSubmitted }: RequestCardModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardType: 'VISA',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1️⃣ Form submitted", { ...formData, phoneNumber });
    setLoading(true);

    try {
      console.log("2️⃣ Sending request to /api/cards/request");
      const res = await fetch('/api/cards/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phoneNumber,
        }),
      });

      console.log("3️⃣ Response status:", res.status);
      const data = await res.json();
      console.log("4️⃣ Response data:", data);

      if (res.ok) {
        console.log("5️⃣ Request successful");
        alert('✅ Card request submitted! Admin will review your request.');
        onRequestSubmitted();
        onClose();
      } else {
        console.log("5️⃣ Request failed:", data.error);
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('❌ Catch error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Request New Card</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Card Holder Name</label>
            <input
              type="text"
              value={formData.cardHolder}
              onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
              required
              placeholder="Enter name on card"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Card Type</label>
            <select
              value={formData.cardType}
              onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
              required
            >
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">Mastercard</option>
              <option value="AMEX">American Express</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Reason for Request</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              placeholder="Tell us why you need a new card (lost, damaged, upgrade, etc.)"
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.cardPreview}>
            <h4>Card Preview</h4>
            <div className={styles.previewCard}>
              <div className={styles.previewChip}></div>
              <div className={styles.previewNumber}>**** **** **** ****</div>
              <div className={styles.previewDetails}>
                <span>{formData.cardHolder || 'CARD HOLDER'}</span>
                <span>**/**</span>
              </div>
              <div className={styles.previewType}>{formData.cardType}</div>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>📋 Your request will be reviewed by bank admin within 24-48 hours.</p>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}