'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddCardModal from '@/app/components/AddCardModal';
import TransferModal from '@/app/components/TransferModal';
import Link from 'next/link';
import DepositModal from '@/app/components/DepositModal';
import CardDetailsModal from '@/app/components/CardDetailsModal';
import { 
  FiHome, 
  FiTrendingUp, 
  FiCreditCard, 
  FiPieChart, 
  FiSettings,
  FiBell,
  FiSend,
  FiDownload,
  FiUpload,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiPlus,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiClock,
  FiAward,
  FiLogOut,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar as FiCalendarIcon,
  FiCreditCard as FiCreditCardIcon,
  FiFileText,
  FiCamera,
  FiEdit,
} from 'react-icons/fi';
import styles from '@/styles/pages/dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedCard, setSelectedCard] = useState<any>(null);
const [showCardModal, setShowCardModal] = useState(false);


const handleCardClick = (card: any) => {
  console.log('Card clicked:', card); 
  setSelectedCard(card);
  setShowCardModal(true);
};

  useEffect(() => {
    // Check if user is logged in
    const userFromLocal = localStorage.getItem('user');
    const userFromSession = sessionStorage.getItem('user');
    const user = userFromLocal || userFromSession;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch dashboard data
    fetchDashboardData(JSON.parse(user).phoneNumber);
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const fetchDashboardData = async (phoneNumber: string) => {
    try {
      const res = await fetch(`/api/dashboard?phoneNumber=${phoneNumber}`);
      const data = await res.json();
      
      if (res.ok) {
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.loading}>
        <p>Failed to load dashboard. Please try again.</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <div className={styles.logo}>
            <span>🏦</span>
            <span>Sabin Bank</span>
          </div>

          <div className={styles.navLinks}>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`${styles.navLink} ${activeTab === 'overview' ? styles.active : ''}`}
            >
              <FiHome />
              <span>Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`${styles.navLink} ${activeTab === 'profile' ? styles.active : ''}`}
            >
              <FiUser />
              <span>Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('cards')}
              className={`${styles.navLink} ${activeTab === 'cards' ? styles.active : ''}`}
            >
              <FiCreditCard />
              <span>Cards</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`${styles.navLink} ${activeTab === 'settings' ? styles.active : ''}`}
            >
              <FiSettings />
              <span>Settings</span>
            </button>
          </div>

          <div className={styles.userMenu}>
            <div className={styles.notifications}>
              <FiBell size={20} />
              <span className={styles.notificationBadge}>0</span>
            </div>
            <div className={styles.userProfile} onClick={() => setActiveTab('profile')}>
              <div className={styles.userAvatar}>
                {dashboardData.user.fullName?.charAt(0) || 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{dashboardData.user.fullName}</span>
                <span className={styles.userRole}>{dashboardData.user.accountType}</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h1>Welcome, {dashboardData.user.fullName?.split(' ')[0]}! 👋</h1>
            <p>Account: {dashboardData.user.accountNumber}</p>
          </div>
          <div className={styles.dateTime}>
            <div className={styles.date}>
              <FiCalendar /> {formattedDate}
            </div>
            <div className={styles.time}>
              <FiClock /> {formattedTime}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Account Summary */}
            <div className={styles.accountSummary}>
              <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>
                  <FiDollarSign />
                </div>
                <div className={styles.cardLabel}>Total Balance</div>
                <div className={styles.cardValue}>
                  {showBalance ? formatCurrency(dashboardData.summary.totalBalance) : '••••••'}
                  <button onClick={() => setShowBalance(!showBalance)} className={styles.eyeButton}>
                    {showBalance ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className={styles.cardChange}>Available Balance</div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>
                  <FiCreditCard />
                </div>
                <div className={styles.cardLabel}>Account Status</div>
                <div className={styles.cardValue}>
                  {dashboardData.summary.accountStatus}
                </div>
                <div className={styles.cardChange}>Active since {new Date(dashboardData.user.memberSince).getFullYear()}</div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>
                  <FiArrowDownLeft />
                </div>
                <div className={styles.cardLabel}>Pending</div>
                <div className={styles.cardValue}>
                  {dashboardData.summary.pendingTransactions}
                </div>
                <div className={styles.cardChange}>Transactions</div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>
                  <FiAward />
                </div>
                <div className={styles.cardLabel}>Member Since</div>
                <div className={styles.cardValue}>
                  {new Date(dashboardData.user.memberSince).getFullYear()}
                </div>
                <div className={styles.cardChange}>Loyalty Status</div>
              </div>
            </div>

            {/* Accounts Section */}
            <div className={styles.accountsSection}>
              {dashboardData.accounts.map((account: any, index: number) => (
                <div key={index} className={styles.accountCard}>
                  <div className={styles.accountCardHeader}>
                    <span className={styles.accountType}>{account.type}</span>
                    <span className={styles.accountNumber}>{account.accountNumberMasked}</span>
                  </div>
                  <div className={styles.accountBalance}>
                    {showBalance ? formatCurrency(account.balance) : '••••••'}
                  </div>
                  <div className={styles.accountFooter}>
                    <span>Status: {account.status}</span>
                    <span>Available: {showBalance ? formatCurrency(account.balance) : '••••••'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
<div className={styles.quickActionsSection}>
  <h3 className={styles.sectionTitle}>Quick Actions</h3>
  <div className={styles.actionsGrid}>
    <button 
      className={styles.actionButton}
      onClick={() => setShowTransferModal(true)}
    >
      <FiSend /> Send Money
    </button>
    <button 
      className={styles.actionButton}
      onClick={() => {
        setModalType('deposit');
        setShowDepositModal(true);
      }}
    >
      <FiDownload /> Deposit
    </button>
    <button 
      className={styles.actionButton}
      onClick={() => {
        setModalType('withdraw');
        setShowWithdrawModal(true);
      }}
    >
      <FiUpload /> Withdraw
    </button>
    <button 
      className={styles.actionButton}
      onClick={() => setShowAddCardModal(true)}
    >
      <FiCreditCard /> Add Card
    </button>
  </div>
</div>
            {/* Recent Transactions */}
<div className={styles.recentTransactions}>
  <div className={styles.transactionHeader}>
    <h3 className={styles.sectionTitle}>Recent Transactions</h3>
    {dashboardData.recentTransactions.length > 0 && (
      <Link href="#" className={styles.viewAllLink}>
        View All <FiChevronRight />
      </Link>
    )}
  </div>
  
  {dashboardData.recentTransactions.length === 0 ? (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>📭</div>
      <h4>No transactions yet</h4>
      <p>Your transactions will appear here once you start banking</p>
      <button 
        className={styles.primaryButton}
        onClick={() => {
          setModalType('deposit');
          setShowDepositModal(true);
        }}
      >
        Make a Deposit
      </button>
    </div>
  ) : (
    <div className={styles.transactionList}>
      {dashboardData.recentTransactions.map((transaction: any) => (
        <div key={transaction.id} className={styles.transactionItem}>
          <div className={styles.transactionLeft}>
            <div className={`${styles.transactionIcon} ${styles[transaction.type]}`}>
              {transaction.icon}
            </div>
            <div className={styles.transactionDetails}>
              <h4>{transaction.name}</h4>
              <p>
                {transaction.category} • {transaction.date} at {transaction.time}
              </p>
            </div>
          </div>
          <div className={`${styles.transactionAmount} ${
            transaction.type === 'credit' ? styles.positive : styles.negative
          }`}>
            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                {dashboardData.user.fullName?.charAt(0)}
              </div>
              <div className={styles.profileTitle}>
                <h2>Personal Information</h2>
                <p>Manage your account details</p>
              </div>
              <button className={styles.editProfileButton}>
                <FiEdit /> Edit Profile
              </button>
            </div>

            <div className={styles.profileGrid}>
           <div className={styles.profileCard}>
  <h3>Basic Information</h3>
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiUser /> Full Name
    </div>
    <div className={styles.infoValue}>{dashboardData.user.fullName}</div>
  </div>
  
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiPhone /> Phone Number
    </div>
    <div className={styles.infoValue}>{dashboardData.user.phoneNumber}</div>
  </div>
  
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiMail /> Email Address
    </div>
    <div className={styles.infoValue}>{dashboardData.user.email}</div>
  </div>
  
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiMapPin /> Location
    </div>
    <div className={styles.infoValue}>{dashboardData.user.location}</div>
  </div>
  
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiCalendarIcon /> Birth Date
    </div>
    <div className={styles.infoValue}>{formatDate(dashboardData.user.birthDate)}</div>
  </div>
  
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiUser /> Gender
    </div>
    <div className={styles.infoValue}>{dashboardData.user.gender}</div>
  </div>
</div>


<div className={styles.profileCard}>
  <h3>Card Information</h3>
  <div className={styles.infoRow}>
    <div className={styles.infoLabel}>
      <FiCreditCard /> Card Status
    </div>
    <div className={styles.infoValue}>
      {dashboardData.cards.length > 0 ? (
        <span className={styles.cardActiveBadge}>✅ Active ({dashboardData.cards.length})</span>
      ) : (
        <span className={styles.cardInactiveBadge}>⭕ Not Issued</span>
      )}
    </div>
  </div>
  
  {dashboardData.cards.length > 0 && (
    <>
      <div className={styles.infoRow}>
        <div className={styles.infoLabel}>
          <FiCreditCard /> Card Type
        </div>
        <div className={styles.infoValue}>
          {dashboardData.cards.map((card: any, index: number) => (
            <span key={index} className={styles.cardTypeBadge}>{card.type}</span>
          ))}
        </div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoLabel}>
          <FiCalendar /> Expiry
        </div>
        <div className={styles.infoValue}>
          {dashboardData.cards.map((card: any, index: number) => (
            <span key={index}>{card.expiry}</span>
          ))}
        </div>
      </div>
    </>
  )}
</div>

              <div className={styles.profileCard}>
                <h3>Account Information</h3>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <FiCreditCardIcon /> Account Number
                  </div>
                  <div className={styles.infoValue}>{dashboardData.user.accountNumber}</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <FiCalendarIcon /> Member Since
                  </div>
                  <div className={styles.infoValue}>{formatDate(dashboardData.user.memberSince)}</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <FiAward /> Account Type
                  </div>
                  <div className={styles.infoValue}>{dashboardData.user.accountType}</div>
                </div>
              </div>

              <div className={styles.profileCard}>
                <h3>Identification Documents</h3>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <FiFileText /> ID Type
                  </div>
                  <div className={styles.infoValue}>
                    {dashboardData.user.idType === 'citizenship' ? 'Citizenship' : 'Driving License'}
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <FiFileText /> ID Number
                  </div>
                  <div className={styles.infoValue}>{dashboardData.user.idNumber}</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <FiCamera /> ID Photo
                  </div>
                  <div className={styles.infoValue}>
                    <button className={styles.viewDocumentButton}>View Document</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

       {/* Cards Tab */}
{activeTab === 'cards' && (
  <div className={styles.cardsSection}>
    <div className={styles.cardsHeader}>
      <h2>Your Cards</h2>
      <button 
        className={styles.addCardButton}
        onClick={() => setShowAddCardModal(true)}
        disabled // Disable since cards are now issued by admin
      >
        <FiPlus /> Request New Card
      </button>
    </div>
    
    {dashboardData.cards.length === 0 ? (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>💳</div>
        <h3>No cards yet</h3>
        <p>Your admin will issue a card after account approval</p>
      </div>
    ) : (
      <div className={styles.cardGrid}>
        {dashboardData.cards.map((card: any, index: number) => (
          <div 
            key={index} 
            className={styles.bankCard}
            onClick={() => handleCardClick(card)}
          >
            <div className={styles.cardChip}></div>
            <div className={styles.cardNumber}>{card.number}</div>
            <div className={styles.cardDetails}>
              <div className={styles.cardHolder}>
                <span className={styles.cardLabel}>Card Holder</span>
                <span className={styles.cardValue}>{card.holderName}</span>
              </div>
              <div className={styles.cardExpiry}>
                <span className={styles.cardLabel}>Expires</span>
                <span className={styles.cardValue}>{card.expiry}</span>
              </div>
            </div>
            <div className={styles.cardType}>{card.type}</div>
            <div className={styles.cardStatus}>
              <span className={styles.activeBadge}>● Active</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.settingsSection}>
            <h2>Account Settings</h2>
            <div className={styles.settingsGrid}>
              <div className={styles.settingsCard}>
                <h3>Security</h3>
                <button className={styles.settingsButton}>Change Password</button>
                <button className={styles.settingsButton}>Two-Factor Authentication</button>
                <button className={styles.settingsButton}>Login History</button>
              </div>
              <div className={styles.settingsCard}>
                <h3>Preferences</h3>
                <button className={styles.settingsButton}>Notification Settings</button>
                <button className={styles.settingsButton}>Language</button>
                <button className={styles.settingsButton}>Theme</button>
              </div>
              <div className={styles.settingsCard}>
                <h3>Account Management</h3>
                <button className={styles.settingsButton}>Close Account</button>
                <button className={styles.settingsButton}>Download Statements</button>
                <button className={styles.settingsButton}>Update Information</button>
              </div>
            </div>
          </div>
        )}
      </main>
       {/* Modals */}
<AddCardModal
  isOpen={showAddCardModal}
  onClose={() => setShowAddCardModal(false)}
  phoneNumber={dashboardData.user.phoneNumber}
  onCardAdded={() => {
    fetchDashboardData(dashboardData.user.phoneNumber);
  }}
/>

<TransferModal
  isOpen={showTransferModal}
  onClose={() => setShowTransferModal(false)}
  fromPhone={dashboardData.user.phoneNumber}
  balance={dashboardData.summary.totalBalance}
  onTransferComplete={() => {
    fetchDashboardData(dashboardData.user.phoneNumber);
  }}
/>

<DepositModal
  isOpen={showDepositModal}
  onClose={() => setShowDepositModal(false)}
  type={modalType}
  phoneNumber={dashboardData.user.phoneNumber}
  onComplete={() => {
    fetchDashboardData(dashboardData.user.phoneNumber);
  }}
/>

<DepositModal
  isOpen={showWithdrawModal}
  onClose={() => setShowWithdrawModal(false)}
  type="withdraw"
  phoneNumber={dashboardData.user.phoneNumber}
  onComplete={() => {
    fetchDashboardData(dashboardData.user.phoneNumber);
  }}
/>

<CardDetailsModal
  isOpen={showCardModal}
  onClose={() => setShowCardModal(false)}
  card={selectedCard}
/>

    </div>
  );
}