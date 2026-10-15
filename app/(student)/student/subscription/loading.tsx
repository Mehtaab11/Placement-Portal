import styles from './subscription.module.css';

export default function SubscriptionLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="skeleton" style={{ height: '2rem', width: '200px' }} />
        <div className="skeleton" style={{ height: '1rem', width: '320px', marginTop: '0.5rem' }} />
      </div>
      <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    </div>
  );
}
