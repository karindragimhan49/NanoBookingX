import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const spinner = (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.ring}></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        {spinner}
        <p className={styles.text}>Loading...</p>
      </div>
    );
  }
  return spinner;
}
