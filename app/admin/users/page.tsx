'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/admin-dashboard.module.css';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, active, rejected

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && user.status === filter;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
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
          <button className={`${styles.navItem} ${styles.active}`}>Users</button>
          <button onClick={() => router.push('/admin/cards')} className={styles.navItem}>Cards</button>
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
          <h1>User Management</h1>
          <p>View and manage all bank users</p>
        </header>

        {/* Search and Filter */}
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Users</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Users Table */}
        <section className={styles.section}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Cards</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.noData}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any) => (
                    <tr key={user._id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber}</td>
                      <td>•••• {user.accountNumber?.slice(-4)}</td>
                      <td>
                        <span className={`${styles.status} ${styles[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.cardCount || 0}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => router.push(`/admin/users/${user._id}`)}
                          className={styles.viewButton}
                        >
                          View
                        </button>
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