'use client';

import { useState } from 'react';
import styles from '@/styles/components/Modal.module.css';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromPhone: string;
  balance: number;
  onTransferComplete: () => void;
}

export default function TransferModal({ isOpen, onClose, fromPhone, balance, onTransferComplete }: TransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    toPhone: '',
    amount: '',
    description: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(formData.amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPhone,
          toPhone: formData.toPhone,
          amount: parseFloat(formData.amount),
          description: formData.description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Transfer successful!');
        onTransferComplete();
        onClose();
        setFormData({ toPhone: '', amount: '', description: '' });
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Send Money</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.balanceInfo}>
            Available Balance: <strong>${balance.toFixed(2)}</strong>
          </div>

          <div className={styles.formGroup}>
            <label>Receiver's Phone Number</label>
            <input
              type="tel"
              value={formData.toPhone}
              onChange={(e) => setFormData({ ...formData, toPhone: e.target.value })}
              required
              placeholder="98XXXXXXXX"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={balance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description (Optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this for?"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Sending...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}