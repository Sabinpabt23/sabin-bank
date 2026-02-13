// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/pages/welcome.module.css';


export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section with Image */}
      <section className={styles.hero}>
        <Image
          src="/images/bank-hero.png"
          alt="Sabin Bank Building"
          fill
          className={styles.heroImage}
          priority
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Welcome to Sabin Bank
          </h1>
          
          <p className={styles.subtitle}>
            Your Trusted Partner in Financial Growth
          </p>

          <div className={styles.buttonGroup}>
            <Link href="/login" className={styles.primaryButton}>
              Login
            </Link>
            <Link href="/signup" className={styles.secondaryButton}>
              Open Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Moved to Bottom */}
      <section className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>
          Why Choose Sabin Bank?
        </h2>
        <p className={styles.featuresSubtitle}>
          Experience banking that puts you first
        </p>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3 className={styles.featureTitle}>Secure Banking</h3>
            <p className={styles.featureDescription}>
              Your money is safe with our bank-grade security and encryption
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Instant Transfers</h3>
            <p className={styles.featureDescription}>
              Send money instantly to any account with zero delays
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h3 className={styles.featureTitle}>Mobile Friendly</h3>
            <p className={styles.featureDescription}>
              Bank on the go with our fully responsive mobile design
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2026 Sabin Bank. All rights reserved.
      </footer>
    </div>
  );
}