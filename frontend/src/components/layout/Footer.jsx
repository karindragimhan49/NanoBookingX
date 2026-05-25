import { Link } from 'react-router-dom';
import { Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Globe size={28} strokeWidth={1.5} />
            <div>
              <span className={styles.brandName}>GlobeTrek</span>
              <span className={styles.brandSub}>Adventures</span>
            </div>
          </div>
          <p className={styles.brandDesc}>
            Your trusted partner for unforgettable travel experiences across the beautiful island of Sri Lanka.
            We craft journeys that inspire, connect, and transform.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" className={styles.socialLink} aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>

        <div className={styles.links}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <Link to="/" className={styles.link}>Home</Link>
          <Link to="/tours" className={styles.link}>Tour Packages</Link>
          <Link to="/about" className={styles.link}>About Us</Link>
          <Link to="/contact" className={styles.link}>Contact</Link>
          <Link to="/register" className={styles.link}>Create Account</Link>
        </div>

        <div className={styles.links}>
          <h4 className={styles.colTitle}>Tour Categories</h4>
          <Link to="/tours?category=cultural" className={styles.link}>Cultural Tours</Link>
          <Link to="/tours?category=wildlife" className={styles.link}>Wildlife Safaris</Link>
          <Link to="/tours?category=adventure" className={styles.link}>Adventure Tours</Link>
          <Link to="/tours?category=beach" className={styles.link}>Beach Escapes</Link>
          <Link to="/tours?category=luxury" className={styles.link}>Luxury Tours</Link>
        </div>

        <div className={styles.contact}>
          <h4 className={styles.colTitle}>Contact Us</h4>
          <div className={styles.contactItem}>
            <MapPin size={15} className={styles.contactIcon} />
            <span>123 Beach Road, Negombo, Sri Lanka</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={15} className={styles.contactIcon} />
            <span>+94 31 222 3456</span>
          </div>
          <div className={styles.contactItem}>
            <Mail size={15} className={styles.contactIcon} />
            <span>info@globetrek.lk</span>
          </div>
          <div className={styles.hours}>
            <p className={styles.hoursTitle}>Office Hours</p>
            <p>Mon – Fri: 8:00 AM – 6:00 PM</p>
            <p>Sat: 9:00 AM – 3:00 PM</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} GlobeTrek Adventures. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Privacy Policy</a>
            <a href="#" className={styles.bottomLink}>Terms of Service</a>
            <a href="#" className={styles.bottomLink}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
