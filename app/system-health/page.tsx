'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/system-health.module.css';

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [runningTest, setRunningTest] = useState(false);
  const router = useRouter();
  const [dbError, setDbError] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    checkHealth();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkHealth();
      }, 30000);
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

const checkHealth = async () => {
  setLoading(true);
  setDbError(false);
  setApiError(false);
  
  try {
    // Try to fetch health data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch('/api/system-health', {
      signal: controller.signal
    }).catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - Database might be down');
      }
      throw err;
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    setHealthData(data);
    setLastChecked(new Date());
    setApiError(false);
    
  } catch (error: any) {
    console.error('Health check failed:', error);
    setApiError(true);
    
    // Create offline health data
    setHealthData({
      overall: false,
      responseTime: 0,
      services: {
        database: {
          status: false,
          type: 'MongoDB',
          message: error.message || 'Connection failed',
          latency: 0,
          collections: 0,
          collectionsList: []
        },
        api: {
          status: false,
          auth: false,
          transactions: false,
          cards: false,
          admin: false
        },
        server: {
          status: true,
          nodeVersion: process.version,
          nextVersion: process.env.npm_package_version || 'N/A',
          environment: process.env.NODE_ENV || 'development',
          memory: 'N/A',
          uptime: '0s',
          platform: navigator?.platform || 'unknown',
          cpuCount: 0
        },
        storage: {
          status: false,
          totalUsers: 0,
          totalCards: 0,
          totalTransactions: 0,
          pendingRequests: 0
        }
      },
      errors: [{
        time: new Date().toISOString(),
        message: error.message || 'Database connection failed'
      }]
    });
  } finally {
    setLoading(false);
  }
};

  const runDiagnostic = async () => {
    setRunningTest(true);
    setTestResults([]);
    
    const tests = [
      { name: 'Database Connection', endpoint: '/api/test' },
      { name: 'Auth API', endpoint: '/api/auth/test' },
      { name: 'User Creation Test', endpoint: '/api/test/user', method: 'POST' },
      { name: 'Transaction Test', endpoint: '/api/test/transaction' },
      { name: 'Admin Access', endpoint: '/api/admin/test' },
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const start = Date.now();
        const res = await fetch(test.endpoint, {
          method: test.method || 'GET'
        });
        const data = await res.json();
        const time = Date.now() - start;
        
        results.push({
          name: test.name,
          status: res.ok ? 'passed' : 'failed',
          time: `${time}ms`,
          message: data.message || data.error || 'OK',
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error: any) {
        results.push({
          name: test.name,
          status: 'error',
          time: 'N/A',
          message: error.message,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      setTestResults([...results]);
      await new Promise(r => setTimeout(r, 500)); // Delay between tests
    }
    
    setRunningTest(false);
  };

const getStatusClass = (type: string) => {
  switch(type) {
    case 'online':
      return styles.success;
    case 'degraded':
      return styles.degraded;
    case 'offline':
      return styles.error;
    default:
      return styles.error;
  }
};

const getStatusIcon = (type: string) => {
  switch(type) {
    case 'online':
      return '✅';
    case 'degraded':
      return '🟡';
    case 'offline':
      return '❌';
    default:
      return '❌';
  }
};

const getStatusText = (type: string) => {
  switch(type) {
    case 'online':
      return 'Online';
    case 'degraded':
      return 'Degraded';
    case 'offline':
      return 'Offline';
    default:
      return 'Offline';
  }
};

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const exportHealthReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      health: healthData,
      testResults: testResults
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const simulateError = (type: string) => {
    // For testing purposes - simulates different error scenarios
    const errorMessages: any = {
      db: 'Database connection timeout',
      api: 'API rate limit exceeded',
      auth: 'Authentication service unavailable',
      memory: 'High memory usage detected'
    };
    
    alert(`🔴 SIMULATED ERROR: ${errorMessages[type] || 'Unknown error'}\n(This is just a test!)`);
  };

  return (
    <div className={styles.container}>
      {/* Header with more controls */}
      <div className={styles.header}>
        <div>
          <h1>🔧 System Health Dashboard</h1>
          <div className={styles.statusLine}>
  <span className={`${styles.liveBadge} ${
  healthData?.services?.database?.status && healthData?.services?.server?.status 
    ? styles.online 
    : healthData?.services?.server?.status && !healthData?.services?.database?.status
    ? styles.degraded
    : styles.offline
}`}>
  {healthData?.services?.database?.status && healthData?.services?.server?.status 
    ? '● ALL SYSTEMS ONLINE' 
    : healthData?.services?.server?.status && !healthData?.services?.database?.status
    ? '● DEGRADED MODE (Database Offline)'
    : '● SYSTEM OFFLINE'}
</span>
            <p className={styles.timestamp} suppressHydrationWarning>
              Last checked: {lastChecked.toLocaleString()}
              {loading && <span className={styles.refreshing}> ⟳</span>}
            </p>
          </div>
        </div>
        
        <div className={styles.controls}>
          <label className={styles.autoRefresh}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto (30s)
          </label>
          <button 
            onClick={checkHealth} 
            className={styles.refreshButton}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={runDiagnostic} 
            className={styles.diagnosticButton}
            disabled={runningTest}
          >
            🩺 Run Full Diagnostic
          </button>
          <button 
            onClick={exportHealthReport} 
            className={styles.exportButton}
            disabled={!healthData}
          >
            📊 Export Report
          </button>
        </div>
      </div>

{/* Degraded Mode Warning Banner */}
{apiError && (
  <div className={styles.degradedBanner}>
    <div className={styles.degradedIcon}>🟡</div>
    <div className={styles.degradedMessage}>
      <h3>System Running in Degraded Mode</h3>
      <p>Database connection failed. The app is partially functional (UI only).</p>
      <p className={styles.errorDetails}>Error: {healthData?.errors[0]?.message || 'Request timeout - Database might be down'}</p>
    </div>
    <button 
      onClick={checkHealth}
      className={styles.retryButton}
      disabled={loading}
    >
      {loading ? 'Retrying...' : 'Retry Connection'}
    </button>
  </div>
)}
      {/* Quick Action Bar */}
      <div className={styles.quickActions}>
        <button onClick={() => router.push('/admin/dashboard')} className={styles.quickAction}>
          🏦 Admin Panel
        </button>
        <button onClick={() => window.open('/api/test', '_blank')} className={styles.quickAction}>
          🔍 Test API
        </button>
        <button onClick={() => simulateError('db')} className={styles.quickAction}>
          ⚠️ Simulate DB Error
        </button>
        <button onClick={() => window.location.reload()} className={styles.quickAction}>
          🔄 Reload Page
        </button>
      </div>

      {!healthData ? (
        <div className={styles.loading}>Loading system health data...</div>
      ) : (
        <>
          {/* Overview Cards - Now with click handlers */}
          <div className={styles.overviewGrid}>
         <div 
  className={`${styles.overviewCard} ${
    healthData?.services?.database?.status && healthData?.services?.server?.status 
      ? styles.success 
      : healthData?.services?.server?.status && !healthData?.services?.database?.status
      ? styles.degraded
      : styles.error
  }`}
  onClick={() => toggleSection('overall')}
>
  <div className={styles.overviewIcon}>
    {healthData?.services?.database?.status && healthData?.services?.server?.status 
      ? '✅' 
      : healthData?.services?.server?.status && !healthData?.services?.database?.status
      ? '🟡'
      : '❌'
    }
  </div>
  <div className={styles.overviewInfo}>
    <h3>System Status</h3>
    <p className={styles.statusText}>
      {healthData?.services?.database?.status && healthData?.services?.server?.status 
        ? 'Online' 
        : healthData?.services?.server?.status && !healthData?.services?.database?.status
        ? 'Degraded'
        : 'Offline'
      }
    </p>
  </div>
</div>

            <div className={styles.overviewCard} onClick={() => toggleSection('performance')}>
              <div className={styles.overviewIcon}>⏱️</div>
              <div className={styles.overviewInfo}>
                <h3>Response Time</h3>
                <p className={styles.valueText}>{healthData.responseTime}ms</p>
                <span className={styles.trend}>Normal</span>
              </div>
            </div>

            <div className={styles.overviewCard} onClick={() => toggleSection('services')}>
              <div className={styles.overviewIcon}>📊</div>
              <div className={styles.overviewInfo}>
                <h3>Services</h3>
                <p className={styles.valueText}>
                  {Object.values(healthData.services).filter((s: any) => s.status).length}/
                  {Object.keys(healthData.services).length} Online
                </p>
              </div>
            </div>

            <div className={styles.overviewCard} onClick={() => toggleSection('uptime')}>
              <div className={styles.overviewIcon}>📅</div>
              <div className={styles.overviewInfo}>
                <h3>Uptime</h3>
                <p className={styles.valueText}>{healthData.services.server.uptime}</p>
              </div>
            </div>
          </div>

          {/* Expanded Section based on click */}
          {expandedSection === 'performance' && (
            <div className={styles.expandedSection}>
              <h3>Performance Metrics</h3>
              <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                  <span>API Latency</span>
                  <strong>{healthData.responseTime}ms</strong>
                </div>
                <div className={styles.metric}>
                  <span>Database Query</span>
                  <strong>{healthData.services.database.latency}ms</strong>
                </div>
                <div className={styles.metric}>
                  <span>Memory Usage</span>
                  <strong>{healthData.services.server.memory}</strong>
                </div>
                <div className={styles.metric}>
                  <span>CPU Cores</span>
                  <strong>{healthData.services.server.cpuCount}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Test Results */}
          {testResults.length > 0 && (
            <div className={styles.testResults}>
              <h2>🧪 Diagnostic Test Results</h2>
              <div className={styles.testList}>
                {testResults.map((test, index) => (
                  <div key={index} className={`${styles.testItem} ${styles[test.status]}`}>
                    <div className={styles.testHeader}>
                      <span className={styles.testName}>{test.name}</span>
                      <span className={styles.testStatus}>
                        {test.status === 'passed' ? '✅ Passed' : 
                         test.status === 'failed' ? '❌ Failed' : '⚠️ Error'}
                      </span>
                    </div>
                    <div className={styles.testDetails}>
                      <span>Time: {test.time}</span>
                      <span>Message: {test.message}</span>
                      <span className={styles.testTimestamp}>{test.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Grid with more details */}
          <div className={styles.servicesGrid}>
            {/* Database Status - Enhanced */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceHeader} onClick={() => toggleSection('db-details')}>
                <h3>🗄️ Database</h3>
                <span className={`${styles.statusBadge} ${healthData.services.database.status ? styles.success : styles.error}`}>
  {healthData.services.database.status ? 'Online' : 'Offline'}
</span>
              </div>
              <div className={styles.serviceDetails}>
                <div className={styles.detailRow}>
                  <span>Type:</span>
                  <strong>{healthData.services.database.type}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Connection:</span>
                  <strong className={healthData.services.database.status ? styles.success : styles.error}>
  {healthData.services.database.status ? '✅' : '❌'} 
  {healthData.services.database.message}
</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Latency:</span>
                  <strong>{healthData.services.database.latency}ms</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Collections:</span>
                  <strong>{healthData.services.database.collections}</strong>
                </div>
              </div>
              
              {expandedSection === 'db-details' && (
                <div className={styles.expandedDetails}>
                  <h4>Collection Details</h4>
                  {healthData.services.database.collectionsList.map((col: any, idx: number) => (
                    <div key={idx} className={styles.collectionRow}>
                      <span>{col.name}</span>
                      <span>{col.count || 0} docs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* API Status - Enhanced */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceHeader}>
                <h3>🌐 API Endpoints</h3>
                <span className={`${styles.statusBadge} ${healthData.services.api.status ? styles.success : styles.error}`}>
  {healthData.services.api.status ? 'Online' : 'Offline'}
</span>
              </div>
              <div className={styles.apiEndpoints}>
                <div className={styles.endpointRow}>
                  <span>Auth API</span>
                  <span className={healthData.services.api.auth ? styles.success : styles.error}>
  {healthData.services.api.auth ? '✅' : '❌'}
</span>
                </div>
                <div className={styles.endpointRow}>
                  <span>Transactions</span>
                  <div className={styles.endpointRow}>
  <span className={healthData.services.api.transactions ? styles.success : styles.error}>
    {healthData.services.api.transactions ? '✅' : '❌'}
  </span>
</div>
                </div>
                <div className={styles.endpointRow}>
                  <span>Cards API</span>
                  <span className={healthData.services.api.cards ? styles.success : styles.error}>
  {healthData.services.api.cards ? '✅' : '❌'}
</span>
                </div>
                <div className={styles.endpointRow}>
                  <span>Admin API</span>
                  <span className={healthData.services.api.admin ? styles.success : styles.error}>
  {healthData.services.api.admin ? '✅' : '❌'}
</span>
                </div>
              </div>
            </div>

            {/* Storage Stats - Enhanced */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceHeader}>
                <h3>💾 Storage Stats</h3>
                <span className={`${styles.statusBadge} ${healthData.services.storage.status ? styles.success : styles.error}`}>
  {healthData.services.storage.status ? 'Online' : 'Offline'}
</span>
              </div>
              <div className={styles.storageStats}>
                <div className={styles.statBar}>
                  <span>Users</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{width: '100%'}}></div>
                  </div>
                  <span>{healthData.services.storage.totalUsers}</span>
                </div>
                <div className={styles.statBar}>
                  <span>Cards</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{width: '70%'}}></div>
                  </div>
                  <span>{healthData.services.storage.totalCards}</span>
                </div>
                <div className={styles.statBar}>
                  <span>Transactions</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{width: '85%'}}></div>
                  </div>
                  <span>{healthData.services.storage.totalTransactions}</span>
                </div>
                <div className={styles.statBar}>
                  <span>Pending</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressWarning} style={{width: `${Math.min(healthData.services.storage.pendingRequests * 10, 100)}%`}}></div>
                  </div>
                  <span>{healthData.services.storage.pendingRequests}</span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceHeader}>
                <h3>🖥️ System Info</h3>
                <span className={styles.statusBadge}>Info</span>
              </div>
              <div className={styles.systemInfo}>
                <div className={styles.infoRow}>
                  <span>Node:</span>
                  <strong>{healthData.services.server.nodeVersion}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Next.js:</span>
                  <strong>{healthData.services.server.nextVersion}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Environment:</span>
                  <strong className={healthData.services.server.environment === 'production' ? styles.prod : styles.dev}>
                    {healthData.services.server.environment}
                  </strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Platform:</span>
                  <strong>{healthData.services.server.platform}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Memory:</span>
                  <strong>{healthData.services.server.memory}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Error Log Section */}
          {healthData.errors && healthData.errors.length > 0 && (
            <div className={styles.errorsSection}>
              <h2>⚠️ Active Issues ({healthData.errors.length})</h2>
              <div className={styles.errorsList}>
                {healthData.errors.map((error: any, index: number) => (
                  <div key={index} className={styles.errorItem}>
                    <span className={styles.errorTime}>{new Date(error.time).toLocaleTimeString()}</span>
                    <span className={styles.errorMessage}>{error.message}</span>
                    <button className={styles.debugButton}>🔍 Debug</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation Engine */}
          <div className={styles.recommendations}>
            <h2>💡 Recommendations</h2>
            <div className={styles.recommendationList}>
              {!healthData.services.database.status && (
                <div className={styles.recommendation}>
                  <span className={styles.recommendationIcon}>🔴</span>
                  <span>Database is down - Check MongoDB service</span>
                </div>
              )}
              {healthData.services.database.latency > 100 && (
                <div className={styles.recommendation}>
                  <span className={styles.recommendationIcon}>🟡</span>
                  <span>High database latency - Consider indexing</span>
                </div>
              )}
              {healthData.services.storage.pendingRequests > 10 && (
                <div className={styles.recommendation}>
                  <span className={styles.recommendationIcon}>🟠</span>
                  <span>{healthData.services.storage.pendingRequests} pending requests - Review admin queue</span>
                </div>
              )}
              {healthData.services.server.environment === 'development' && (
                <div className={styles.recommendation}>
                  <span className={styles.recommendationIcon}>💡</span>
                  <span>Running in development mode - Switch to production for deployment</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}