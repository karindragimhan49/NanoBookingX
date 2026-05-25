import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await authApi.login(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <Link to="/" className={styles.brandLink}>
            <Globe size={28} strokeWidth={1.5} />
            <div>
              <span className={styles.brandName}>GlobeTrek</span>
              <span className={styles.brandSub}>Adventures</span>
            </div>
          </Link>
          <div className={styles.panelContent}>
            <h2 className={styles.panelTitle}>Discover Sri Lanka</h2>
            <p className={styles.panelText}>
              Join thousands of travelers who have explored the pearl of the Indian Ocean
              with our expertly curated tours and experiences.
            </p>
            <div className={styles.panelFeatures}>
              {['6 curated tour categories', 'Expert local guides', 'Secure online booking', '24/7 traveler support'].map(f => (
                <div key={f} className={styles.panelFeature}>
                  <div className={styles.featureDot} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panelBg}>
            <img
              src="https://images.unsplash.com/photo-1580181591617-79e8b65c94e1?auto=format&fit=crop&w=900&q=80"
              alt="Sigiriya Rock"
            />
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className={styles.formSide}>
        <div className={styles.formInner}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Welcome back</h1>
            <p className={styles.formSubtitle}>Sign in to manage your bookings and explore new adventures.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  className={`form-input ${styles.withIcon} ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <div className={styles.labelRow}>
                <label className="form-label">Password</label>
                <a href="#" className={styles.forgotLink}>Forgot password?</a>
              </div>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${styles.withIcon} ${styles.withAction} ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>Demo credentials</span>
          </div>

          <div className={styles.demoCards}>
            {[
              { role: 'Admin', email: 'admin@globetrek.lk', pass: 'admin@123' },
              { role: 'Staff', email: 'staff@globetrek.lk', pass: 'staff@123' },
              { role: 'Customer', email: 'customer@globetrek.lk', pass: 'customer@123' },
            ].map(d => (
              <button
                key={d.role}
                className={styles.demoCard}
                onClick={() => setForm({ email: d.email, password: d.pass })}
              >
                <span className={styles.demoRole}>{d.role}</span>
                <span className={styles.demoEmail}>{d.email}</span>
              </button>
            ))}
          </div>

          <p className={styles.switchLink}>
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
