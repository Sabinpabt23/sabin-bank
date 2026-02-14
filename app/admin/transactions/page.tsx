'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  ComposedChart, Line
} from 'recharts';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity,
  FiDownload, FiCalendar, FiFilter, FiSearch, FiRefreshCw,
  FiArrowUpRight, FiArrowDownLeft, FiRepeat, FiClock,
  FiUsers, FiCreditCard, FiBarChart2, FiPieChart as FiPieChartIcon
} from 'react-icons/fi';
import styles from '@/styles/pages/admin-transactions.module.css';

const COLORS = ['#2e7d32', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalCount: 0,
    avgAmount: 0,
    depositVolume: 0,
    withdrawalVolume: 0,
    transferVolume: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [filter, setFilter] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chartType, setChartType] = useState('volume'); // volume, count, ohlc

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/transactions?filter=' + filter;
      if (dateRange.start && dateRange.end) {
        url += `&startDate=${dateRange.start}&endDate=${dateRange.end}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      setTransactions(data.transactions || []);
      setStats(data.stats || {});
      setChartData(data.chartData || []);
      setTopUsers(data.topUsers || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setDateRange({ start: '', end: '' });
    setShowDatePicker(false);
    setTimeout(fetchTransactions, 100);
  };

  const handleDateRangeApply = () => {
    setShowDatePicker(false);
    fetchTransactions();
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Type', 'From', 'To', 'Amount', 'Status', 'Description'].join(','),
      ...transactions.map((t: any) => [
        new Date(t.date).toLocaleString(),
        t.type,
        t.from.name,
        t.to.name,
        t.amount,
        t.status,
        t.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter((t: any) => {
    if (!searchTerm) return true;
    return (
      t.from.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.to.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.from.phone?.includes(searchTerm) ||
      t.to.phone?.includes(searchTerm) ||
      t.amount.toString().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading market data...</p>
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
          <button onClick={() => router.push('/admin/card-requests')} className={styles.navItem}>Card Requests</button>
          <button className={`${styles.navItem} ${styles.active}`}>Transactions</button>
        </nav>

        <button onClick={() => {
          localStorage.removeItem('admin');
          router.push('/admin/login');
        }} className={styles.logoutButton}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header with Market Status */}
        <div className={styles.marketHeader}>
          <div>
            <h1>Transaction Analytics</h1>
            <p className={styles.marketStatus}>
              <span className={styles.liveIndicator}></span>
             LIVE BANKING • {new Date().toLocaleString()}
            </p>
          </div>
          <div className={styles.marketTicker}>
            <div className={styles.tickerItem}>
              <span>VOLUME</span>
              <strong>${stats.totalVolume.toLocaleString()}</strong>
            </div>
            <div className={styles.tickerItem}>
              <span>TOTAL TRANSACTIONS</span>
              <strong>{stats.totalCount}</strong>
            </div>
            <div className={styles.tickerItem}>
              <span>AVG TRANSACTION</span>
              <strong>${stats.avgAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={styles.controlPanel}>
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${filter === 'today' ? styles.active : ''}`}
              onClick={() => handleFilterChange('today')}
            >
              Today
            </button>
            <button 
              className={`${styles.filterTab} ${filter === 'week' ? styles.active : ''}`}
              onClick={() => handleFilterChange('week')}
            >
              This Week
            </button>
            <button 
              className={`${styles.filterTab} ${filter === 'month' ? styles.active : ''}`}
              onClick={() => handleFilterChange('month')}
            >
              This Month
            </button>
            <button 
              className={`${styles.filterTab} ${filter === 'year' ? styles.active : ''}`}
              onClick={() => handleFilterChange('year')}
            >
              This Year
            </button>
            <button 
              className={`${styles.filterTab} ${showDatePicker ? styles.active : ''}`}
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <FiCalendar /> Custom
            </button>
          </div>

          <div className={styles.actionButtons}>
            <button onClick={exportToCSV} className={styles.exportButton}>
              <FiDownload /> Export
            </button>
            <button onClick={fetchTransactions} className={styles.refreshButton}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        {showDatePicker && (
          <div className={styles.datePicker}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
            <button onClick={handleDateRangeApply} className={styles.applyButton}>
              Apply
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#e8f5e9', color: '#2e7d32' }}>
              <FiDollarSign />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Volume</span>
              <span className={styles.statValue}>${stats.totalVolume.toLocaleString()}</span>
              <span className={styles.statChange}>
                <FiTrendingUp /> +12.5%
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fff3cd', color: '#ff9800' }}>
              <FiBarChart2 />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Trades</span>
              <span className={styles.statValue}>{stats.totalCount}</span>
              <span className={styles.statChange}>
                <FiTrendingUp /> +8.2%
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#e3f2fd', color: '#2196f3' }}>
              <FiArrowUpRight />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Deposits</span>
              <span className={styles.statValue}>${stats.depositVolume.toLocaleString()}</span>
              <span className={styles.statChangePositive}>
                <FiTrendingUp /> +15.3%
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#ffebee', color: '#f44336' }}>
              <FiArrowDownLeft />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Withdrawals</span>
              <span className={styles.statValue}>${stats.withdrawalVolume.toLocaleString()}</span>
              <span className={styles.statChangeNegative}>
                <FiTrendingDown /> -3.1%
              </span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2>Financial Overview</h2>
            <div className={styles.chartControls}>
              <button 
                className={`${styles.chartTypeButton} ${chartType === 'volume' ? styles.active : ''}`}
                onClick={() => setChartType('volume')}
              >
                Volume
              </button>
              <button 
                className={`${styles.chartTypeButton} ${chartType === 'ohlc' ? styles.active : ''}`}
                onClick={() => setChartType('ohlc')}
              >
                 Range
              </button>
              <button 
                className={`${styles.chartTypeButton} ${chartType === 'count' ? styles.active : ''}`}
                onClick={() => setChartType('count')}
              >
                Frequency
              </button>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'volume' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="displayDate" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    contentStyle={{ background: 'white', borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Bar yAxisId="left" dataKey="volume" fill="#2e7d32" opacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="close" stroke="#ff9800" strokeWidth={2} />
                </ComposedChart>
              ) : chartType === 'ohlc' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ background: 'white', borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="high" fill="#4caf50" name="High" />
                  <Bar dataKey="low" fill="#f44336" name="Low" />
                  <Line type="monotone" dataKey="close" stroke="#2196f3" strokeWidth={2} name="Close" />
                </ComposedChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#2e7d32" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={styles.twoColumn}>
          {/* Left Column - Transaction Type Distribution */}
          <div className={styles.pieChartCard}>
            <h2>Transaction Distribution</h2>
            <div className={styles.pieChartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Deposits', value: stats.depositVolume },
                      { name: 'Withdrawals', value: stats.withdrawalVolume },
                      { name: 'Transfers', value: stats.transferVolume },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {[0,1,2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.pieLegend}>
                <div><span style={{ background: '#2e7d32' }}></span> Deposits</div>
                <div><span style={{ background: '#ff9800' }}></span> Withdrawals</div>
                <div><span style={{ background: '#f44336' }}></span> Transfers</div>
              </div>
            </div>
          </div>

          {/* Right Column - Top Users */}
          <div className={styles.topUsersCard}>
            <h2>Top Spender</h2>
            <div className={styles.topUsersList}>
              {topUsers.map((user: any, index: number) => (
                <div key={index} className={styles.topUser}>
                  <div className={styles.userRank}>#{index + 1}</div>
                  <div className={styles.userInfo}>
                    <strong>{user.name}</strong>
                    <span>{user.phone}</span>
                  </div>
                  <div className={styles.userVolume}>
                    <strong>${user.volume.toLocaleString()}</strong>
                    <span>Volume</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by user name, phone, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Transactions Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2>Recent Transactions</h2>
            <span className={styles.tableCount}>{filteredTransactions.length} transactions</span>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 10).map((t: any) => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.timeCell}>
                        <FiClock />
                        {new Date(t.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles[t.type]}`}>
                        {t.type === 'deposit' && <FiArrowDownLeft />}
                        {t.type === 'withdrawal' && <FiArrowUpRight />}
                        {t.type === 'transfer' && <FiRepeat />}
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <strong>{t.from.name}</strong>
                        <span>{t.from.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <strong>{t.to.name}</strong>
                        <span>{t.to.phone}</span>
                      </div>
                    </td>
                    <td className={t.type === 'deposit' ? styles.positive : styles.negative}>
                      ${t.amount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}