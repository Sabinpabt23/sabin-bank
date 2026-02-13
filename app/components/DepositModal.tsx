'use client';

import { useState } from 'react';
import styles from '@/styles/components/Modal.module.css';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  phoneNumber: string;
  onComplete: () => void;
}

export default function DepositModal({ isOpen, onClose, type, phoneNumber, onComplete }: DepositModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          amount: parseFloat(amount),
          type: type,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful! New balance: $${data.newBalance.toFixed(2)}`);
        onComplete();
        onClose();
        setAmount('');
      } else {
        setError(data.error || 'Transaction failed');
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
          <h2>{type === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className={styles.infoBox}>
            <p>💡 Transaction Summary:</p>
            <ul>
              <li>Type: {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</li>
              <li>Amount: ${parseFloat(amount) || 0}</li>
              <li>Status: Instant</li>
            </ul>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Processing...' : type === 'deposit' ? 'Deposit' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}