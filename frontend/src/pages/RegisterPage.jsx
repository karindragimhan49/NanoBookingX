import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 3) e.fullName = 'Name must be at least 3 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await authApi.register({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone });
      login(data.token, data.user);
      toast.success('Account created! Welcome to GlobeTrek Adventures.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className={styles.page}>
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
            <h2 className={styles.panelTitle}>Start Your Journey</h2>
            <p className={styles.panelText}>
              Create your free account and unlock exclusive tour packages, personalised recommendations,
              and a seamless travel booking experience across Sri Lanka.
            </p>
            <div className={styles.panelFeatures}>
              {['Free account creation', 'Instant booking confirmation', 'Manage all bookings online', 'Exclusive member deals'].map(f => (
                <div key={f} className={styles.panelFeature}>
                  <div className={styles.featureDot} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panelBg}>
            <img
              src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=900&q=80"
              alt="Sri Lanka wildlife"
            />
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formInner}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create an account</h1>
            <p className={styles.formSubtitle}>Join GlobeTrek Adventures and begin exploring Sri Lanka.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={`form-input ${styles.withIcon} ${errors.fullName ? 'error' : ''}`}
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={set('fullName')}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <p className="form-error">{errors.fullName}</p>}
            </div>

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
              <label className="form-label">Phone Number <span style={{ color: 'var(--clr-text-light)', fontWeight: 400 }}>(optional)</span></label>
              <div className={styles.inputWrap}>
                <Phone size={16} className={styles.inputIcon} />
                <input
                  type="tel"
                  className={`form-input ${styles.withIcon}`}
                  placeholder="+94 7X XXX XXXX"
                  value={form.phone}
                  onChange={set('phone')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${styles.withIcon} ${styles.withAction} ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${styles.withIcon} ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className={styles.termsText}>
              By creating an account, you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
