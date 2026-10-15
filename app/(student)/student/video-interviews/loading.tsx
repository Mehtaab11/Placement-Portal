import styles from './videoInterviews.module.css';

export default function VideoInterviewsLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="skeleton" style={{ height: '2rem', width: '250px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '1.25rem', width: '400px', borderRadius: '4px' }} />
      </div>
      <div className={styles.grid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '16px' }} />
        ))}
      </div>
    </div>
  );
}
