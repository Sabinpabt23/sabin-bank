'use client';

import { useState } from 'react';
import styles from '@/styles/components/Modal.module.css';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: any;
}

export default function CardDetailsModal({ isOpen, onClose, card }: CardDetailsModalProps) {
  const [showCVV, setShowCVV] = useState(false);

  if (!isOpen || !card) return null;

  // Format the full card number with spaces every 4 digits
  const formatCardNumber = (num: string) => {
    if (!num) return '**** **** **** ****';
    return num.match(/.{1,4}/g)?.join(' ') || num;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Card Details</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.cardDetailsModal}>
          {/* Card Preview */}
          <div className={styles.cardPreview}>
            <div className={styles.previewCard}>
              <div className={styles.previewChip}></div>
              <div className={styles.previewNumber}>{card.number}</div>
              <div className={styles.previewDetails}>
                <span>{card.holderName}</span>
                <span>{card.expiry}</span>
              </div>
              <div className={styles.previewType}>{card.type}</div>
            </div>
          </div>

          {/* Card Details */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Card Number</span>
              <span className={styles.detailValue}>
                {formatCardNumber(card.fullNumber)}
              </span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Card Holder</span>
              <span className={styles.detailValue}>{card.holderName}</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Expiry Date</span>
              <span className={styles.detailValue}>{card.expiry}</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>CVV</span>
              <span className={styles.detailValue}>
                {showCVV ? card.cvv : '***'}
                <button 
                  onClick={() => setShowCVV(!showCVV)}
                  className={styles.toggleCVV}
                >
                  {showCVV ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Card Type</span>
              <span className={styles.detailValue}>{card.type}</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={`${styles.statusBadge} ${styles.active}`}>Active</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Issued Date</span>
              <span className={styles.detailValue}>
                {new Date(card.issuedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className={styles.warningBox}>
            <p>⚠️ Never share your CVV or card details with anyone</p>
          </div>
        </div>
      </div>
    </div>
  );
}