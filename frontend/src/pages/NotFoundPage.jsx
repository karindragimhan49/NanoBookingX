import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.number}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.subtitle}>
          It looks like this page has gone on a journey of its own.
          Let's get you back on track and explore Sri Lanka's wonders.
        </p>
        <div className={styles.actions}>
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={18} /> Back to Home
          </Link>
          <Link to="/tours" className="btn btn-outline btn-lg">
            <Compass size={18} /> Explore Tours
          </Link>
        </div>
      </div>
    </div>
  );
}
