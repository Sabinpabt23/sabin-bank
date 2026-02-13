'use client';

import { useState } from 'react';
import styles from '@/styles/components/Modal.module.css';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onCardAdded: () => void;
}

export default function AddCardModal({ isOpen, onClose, phoneNumber, onCardAdded }: AddCardModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardType: 'VISA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phoneNumber,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Card added successfully!');
        onCardAdded();
        onClose();
      } else {
        alert(data.error || 'Failed to add card');
      }
    } catch (error) {
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
          <h2>Add New Card</h2>
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

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}