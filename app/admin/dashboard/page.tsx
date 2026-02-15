'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/admin-dashboard.module.css';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity, 
  LogOut, 
  ChevronRight, 
  Check, 
  X, 
  AlertCircle,
  Search,
  ArrowUpRight
} from 'lucide-react';

// --- Components for cleaner code ---

// 1. Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`${styles.toast} ${type === 'error' ? styles.error : ''}`}>
    {type === 'success' ? <Check size={20} color="#059669" /> : <AlertCircle size={20} color="#ef4444" />}
    <div>
      <p style={{ margin: 0, fontWeight: 600 }}>{type === 'success' ? 'Success' : 'Error'}</p>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{message}</p>
    </div>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
      <X size={16} />
    </button>
  </div>
);

// 2. Skeleton Loader Component
const DashboardSkeleton = () => (
  <div className={styles.skeletonContainer}>
    <div className={styles.skeletonHeader}></div>
    <div className={styles.skeletonGrid}>
      {[1, 2, 3, 4].map(i => <div key={i} className={styles.skeletonCard}></div>)}
    </div>
    <div className={styles.skeletonTable}></div>
  </div>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    totalCards: 0,
    totalTransactions: 0,
    pendingCardRequests: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [cardRequests, setCardRequests] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchDashboardData();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  };

  const fetchDashboardData = async () => {
    try {
      // Simulate network delay for effect (remove in production)
      // await new Promise(r => setTimeout(r, 800)); 
      
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      
      if (res.ok) {
        setStats(data.stats);
        setPendingRequests(data.pendingRequests || []);
        setCardRequests(data.cardRequests || []);
        setRecentUsers(data.recentUsers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showToast('Failed to load dashboard data', 'error');
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
        showToast('User approved successfully!');
        fetchDashboardData();
      }
    } catch (error) {
      showToast('Error approving user', 'error');
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject' }),
      });

      if (res.ok) {
        showToast('User rejected', 'success');
        fetchDashboardData();
      }
    } catch (error) {
      showToast('Error rejecting user', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className={styles.dashboard}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Sabin Bank</h2>
          <p>Administrator</p>
        </div>
        
       <nav className={styles.nav}>
  <button className={`${styles.navItem} ${styles.active}`}>Dashboard</button>
  <button onClick={() => router.push('/admin/users')} className={styles.navItem}>Users</button>
  <button onClick={() => router.push('/admin/cards')} className={styles.navItem}>Cards</button>
  <button onClick={() => router.push('/admin/card-requests')} className={styles.navItem}>
    Card Requests 
    {stats.pendingCardRequests > 0 && (
      <span className={styles.badge}>{stats.pendingCardRequests}</span>
    )}
  </button>
  <button onClick={() => router.push('/admin/transactions')} className={styles.navItem}>Transactions</button>
  {/* Add System Health Button */}
  <button 
    onClick={() => router.push('/system-health')} 
    className={styles.navItem}
    style={{ 
      background: 'red', 
      color: 'white',
      marginTop: '1rem',
      border: '1px solid red',
      boxShadow: '0 2px 4px rgba(255, 0, 0, 0.2)',
      transition: 'background 0.3s, color 0.3s',
    }}
  >
    🔧 System Health
  </button>
</nav>

        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, here's what's happening today.</p>
          </div>
          {/* Example of where a date picker or global search could go */}
        </header>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<Users size={24} />} 
          />
          <StatCard 
            title="Pending Approvals" 
            value={stats.pendingUsers} 
            icon={<AlertCircle size={24} />} 
          />
          <StatCard 
            title="Active Cards" 
            value={stats.totalCards} 
            icon={<CreditCard size={24} />} 
          />
          <StatCard 
            title="Card Requests" 
            value={stats.pendingCardRequests} 
            icon={<Activity size={24} />} 
          />
        </div>

        {/* 1. Pending Card Requests Section */}
        {cardRequests.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Pending Card Requests</h2>
              <button onClick={() => router.push('/admin/card-requests')} className={styles.viewAllButton}>
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Card Type</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cardRequests.slice(0, 5).map((req: any) => (
                    <tr key={req.id}>
                      <td style={{fontWeight: 500}}>{req.userName}</td>
                      <td><span className={styles.cardTypeBadge}>{req.cardType}</span></td>
                      <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {req.reason}
                      </td>
                      <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => router.push(`/admin/card-requests`)}
                          className={styles.detailsButton}
                        >
                          Review <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 2. Pending User Approvals */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
             <h2>Pending User Approvals</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / Phone</th>
                  <th>Requested Card</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noData}>
                      <div className={styles.noDataIcon}><Check size={40} /></div>
                      All caught up! No pending user approvals.
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((user: any) => (
                    <tr key={user._id}>
                      <td style={{fontWeight: 600}}>{user.fullName}</td>
                      <td>
                        <div>{user.email}</div>
                        <div style={{fontSize: '0.8rem', color: '#999'}}>{user.phoneNumber}</div>
                      </td>
                      <td>
                        {user.requestedCard ? (
                          <span className={styles.badgeYes}>{user.cardType}</span>
                        ) : (
                          <span className={styles.badgeNo}>None</span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleApprove(user._id)}
                            className={styles.approveButton}
                            title="Approve User"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(user._id)}
                            className={styles.rejectButton}
                            title="Reject User"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Recent Users */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Recent User Registrations</h2>
            <button onClick={() => router.push('/admin/users')} className={styles.viewAllButton}>
                View All <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.noData}>No recent users found</td>
                  </tr>
                ) : (
                  recentUsers.map((user: any) => (
                    <tr key={user._id}>
                      <td style={{fontWeight: 500}}>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.status} ${styles[user.status]}`}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', 
                            background: user.status === 'active' ? '#166534' : user.status === 'pending' ? '#92400e' : '#991b1b'
                          }}></span>
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

// Simple Sub-component for Stats to reduce repetition
function StatCard({ title, value, icon }: { title: string, value: number, icon: any }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <h3>{title}</h3>
        <div className={styles.iconWrapper}>{icon}</div>
      </div>
      <p className={styles.statNumber}>{value.toLocaleString()}</p>
    </div>
  );
}