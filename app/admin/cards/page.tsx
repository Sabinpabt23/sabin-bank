'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/admin-dashboard.module.css';

export default function AdminCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, blocked, expired, pending

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/admin/cards');
      const data = await res.json();
      setCards(data.cards || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cardId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, status: newStatus }),
      });

      if (res.ok) {
        fetchCards();
      }
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const filteredCards = cards.filter((card: any) => {
    const matchesSearch = 
      card.cardHolder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cardNumber?.includes(searchTerm) ||
      card.phoneNumber?.includes(searchTerm);
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && card.status === filter;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading cards...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Sabin Bank</h2>
          <p>Admin Panel</p>
        </div>
        
        <nav className={styles.nav}>
          <button onClick={() => router.push('/admin/dashboard')} className={styles.navItem}>Dashboard</button>
          <button onClick={() => router.push('/admin/users')} className={styles.navItem}>Users</button>
          <button className={`${styles.navItem} ${styles.active}`}>Cards</button>
          <button onClick={() => router.push('/admin/card-requests')} className={styles.navItem}>Card Requests</button>
          <button onClick={() => router.push('/admin/transactions')} className={styles.navItem}>Transactions</button>
        </nav>

        <button onClick={() => {
          localStorage.removeItem('admin');
          router.push('/admin/login');
        }} className={styles.logoutButton}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Card Management</h1>
          <p>View and manage all bank cards</p>
        </header>

        {/* Stats Summary */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Cards</h3>
            <p className={styles.statNumber}>{cards.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Cards</h3>
            <p className={styles.statNumber}>
              {cards.filter((c: any) => c.status === 'active').length}
            </p>
          </div>
          <div className={styles.statCard}>
            <h3>Blocked Cards</h3>
            <p className={styles.statNumber}>
              {cards.filter((c: any) => c.status === 'blocked').length}
            </p>
          </div>
          <div className={styles.statCard}>
            <h3>Pending</h3>
            <p className={styles.statNumber}>
              {cards.filter((c: any) => c.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search by card holder, user, or card number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Cards</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Cards Table */}
        <section className={styles.section}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Card Number</th>
                  <th>Card Holder</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.noData}>
                      No cards found
                    </td>
                  </tr>
                ) : (
                  filteredCards.map((card: any) => (
                    <tr key={card._id}>
                      <td className={styles.cardNumberCell}>
                        {card.status === 'pending' ? (
                          <span className={styles.pendingText}>Pending Generation</span>
                        ) : (
                          `**** **** **** ${card.cardNumber?.slice(-4)}`
                        )}
                      </td>
                      <td>{card.cardHolder}</td>
                      <td>
                        <div>{card.userName}</div>
                        <div className={styles.userPhone}>{card.phoneNumber}</div>
                      </td>
                      <td>
                        <span className={styles.cardTypeBadge}>{card.cardType}</span>
                      </td>
                      <td>
                        {card.status === 'pending' ? '--/--' : `${card.expiryMonth}/${card.expiryYear}`}
                      </td>
                      <td>
                        <span className={`${styles.status} ${styles[card.status]}`}>
                          {card.status}
                        </span>
                      </td>
                      <td>{new Date(card.createdAt).toLocaleDateString()}</td>
                      <td>
                        {card.status !== 'pending' && (
                          <button 
                            onClick={() => handleToggleStatus(card._id, card.status)}
                            className={card.status === 'active' ? styles.blockButton : styles.unblockButton}
                          >
                            {card.status === 'active' ? 'Block' : 'Unblock'}
                          </button>
                        )}
                        {card.status === 'pending' && (
                          <span className={styles.pendingLabel}>Awaiting Approval</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}