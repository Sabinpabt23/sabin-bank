'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/admin-dashboard.module.css';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    totalCards: 0,
    totalTransactions: 0,
    pendingCardRequests: 0, // ADD THIS
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [cardRequests, setCardRequests] = useState([]); // ADD THIS
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      
      if (res.ok) {
        setStats(data.stats);
        setPendingRequests(data.pendingRequests || []);
        setCardRequests(data.cardRequests || []); // ADD THIS
        setRecentUsers(data.recentUsers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      });

      if (res.ok) {
        alert('User approved successfully!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject' }),
      });

      if (res.ok) {
        alert('User rejected');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  const handleCardRequest = (requestId: string, action: 'approve' | 'reject') => {
    router.push(`/admin/card-requests`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading admin dashboard...</p>
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
          <button className={`${styles.navItem} ${styles.active}`}>Dashboard</button>
          <button onClick={() => router.push('/admin/users')} className={styles.navItem}>Users</button>
          <button onClick={() => router.push('/admin/cards')} className={styles.navItem}>Cards</button>
          <button onClick={() => router.push('/admin/card-requests')} className={styles.navItem}>
            Card Requests {stats.pendingCardRequests > 0 && (
              <span className={styles.badge}>{stats.pendingCardRequests}</span>
            )}
          </button>
          <button onClick={() => router.push('/admin/transactions')} className={styles.navItem}>Transactions</button>
        </nav>

        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin</p>
        </header>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Users</h3>
            <p className={styles.statNumber}>{stats.totalUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pending Users</h3>
            <p className={styles.statNumber}>{stats.pendingUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Users</h3>
            <p className={styles.statNumber}>{stats.activeUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Cards</h3>
            <p className={styles.statNumber}>{stats.totalCards}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Card Requests</h3>
            <p className={styles.statNumber}>{stats.pendingCardRequests}</p>
          </div>
        </div>

        {/* Pending Card Requests Section - NEW */}
        {cardRequests.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Pending Card Requests</h2>
              <button 
                onClick={() => router.push('/admin/card-requests')}
                className={styles.viewAllButton}
              >
                View All
              </button>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Card Type</th>
                    <th>Card Holder</th>
                    <th>Reason</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cardRequests.slice(0, 5).map((req: any) => (
                    <tr key={req.id}>
                      <td>{req.userName}</td>
                      <td>
                        <span className={styles.cardTypeBadge}>{req.cardType}</span>
                      </td>
                      <td>{req.cardHolder}</td>
                      <td className={styles.reasonCell}>{req.reason}</td>
                      <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td>
                        <button 
  onClick={() => router.push(`/admin/card-requests`)}
  className={styles.approveButton}
>
  View Details
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pending Approval Requests */}
        <section className={styles.section}>
          <h2>Pending User Approvals</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Requested Card</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.noData}>
                      No pending requests
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((user: any) => (
                    <tr key={user._id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber}</td>
                      <td>
                        {user.requestedCard ? (
                          <span className={styles.badgeYes}>{user.cardType}</span>
                        ) : (
                          <span className={styles.badgeNo}>No</span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleApprove(user._id)}
                          className={styles.approveButton}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(user._id)}
                          className={styles.rejectButton}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Users */}
        <section className={styles.section}>
          <h2>Recent Users</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noData}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user: any) => (
                    <tr key={user._id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber}</td>
                      <td>
                        <span className={`${styles.status} ${styles[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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