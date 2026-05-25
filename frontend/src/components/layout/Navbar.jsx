import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/tours', label: 'Tours & Packages' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <Globe size={26} strokeWidth={1.5} className={styles.brandIcon} />
          <div>
            <span className={styles.brandName}>GlobeTrek</span>
            <span className={styles.brandSub}>Adventures</span>
          </div>
        </Link>

        <nav className={styles.desktopNav}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setDropdownOpen(o => !o)}
              >
                <div className={styles.avatar}>{user?.fullName?.charAt(0) || 'U'}</div>
                <span className={styles.userName}>{user?.fullName?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.open : ''}`} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user?.fullName}</p>
                    <p className={styles.dropdownEmail}>{user?.email}</p>
                    <span className={`badge badge-primary ${styles.roleBadge}`}>{user?.role}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className={`btn btn-outline btn-sm`}>Sign In</Link>
              <Link to="/register" className={`btn btn-primary btn-sm`}>Get Started</Link>
            </div>
          )}

          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className={styles.mobileDivider} />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <div className={styles.mobileAuth}>
              <Link to="/login" className="btn btn-outline" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
