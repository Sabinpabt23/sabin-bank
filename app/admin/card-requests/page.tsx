'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/admin-dashboard.module.css';

export default function AdminCardRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/card-requests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
  console.log("🔵 Approve clicked for ID:", id); // Add this
  setProcessingId(id);
  try {
    console.log("🟡 Sending request to:", `/api/admin/card-requests/${id}`); // Add this
    
    const res = await fetch(`/api/admin/card-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });

    console.log("🟢 Response status:", res.status); // Add this
    const data = await res.json();
    console.log("📦 Response data:", data); // Add this

    if (res.ok) {
      alert('✅ Card approved successfully!');
      fetchRequests();
    } else {
      alert(data.error || 'Failed to approve');
    }
  } catch (error) {
    console.error('❌ Error:', error); 
    alert('Something went wrong');
  } finally {
    setProcessingId(null);
  }
};

  const handleReject = async (id: string) => {
  if (!confirm('Are you sure you want to reject this card request?')) return;
  
  setProcessingId(id);
  try {
    const res = await fetch(`/api/admin/card-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    });

    if (res.ok) {
      alert('❌ Card request rejected');
      fetchRequests();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to reject');
    }
  } catch (error) {
    alert('Something went wrong');
  } finally {
    setProcessingId(null);
  }
};

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading card requests...</p>
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
  <button onClick={() => router.push('/admin/cards')} className={styles.navItem}>Cards</button>
  <button onClick={() => router.push('/admin/card-requests')} className={`${styles.navItem} ${styles.active}`}>Card Requests</button>
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
          <h1>Card Requests</h1>
          <p>Review and process user card requests</p>
        </header>

        <section className={styles.section}>
          {requests.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>💳</div>
              <h3>No pending requests</h3>
              <p>There are no card requests to review at this time.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Card Type</th>
                    <th>Card Holder</th>
                    <th>Reason</th>
                    <th>Requested On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any) => (
                    <tr key={req.id}>
                      <td>{req.userName}</td>
                      <td>{req.userEmail}</td>
                      <td>{req.phoneNumber}</td>
                      <td>
                        <span className={styles.cardTypeBadge}>{req.cardType}</span>
                      </td>
                      <td>{req.cardHolder}</td>
                      <td className={styles.reasonCell}>{req.reason}</td>
                      <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleApprove(req.id)}
                          disabled={processingId === req.id}
                          className={styles.approveButton}
                        >
                          {processingId === req.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          className={styles.rejectButton}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
