import styles from './mockTests.module.css';

export default function MockTestsLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="skeleton" style={{ height: '2rem', width: '220px' }} />
        <div className="skeleton" style={{ height: '1rem', width: '380px', marginTop: '0.5rem' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    </div>
  );
}
