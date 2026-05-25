import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { inquiryApi } from '../api/inquiryApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './ContactPage.module.css';

const INFO_ITEMS = [
  { icon: MapPin, title: 'Office Address', lines: ['123 Beach Road, Negombo', 'Western Province, Sri Lanka'] },
  { icon: Phone, title: 'Phone Numbers', lines: ['+94 31 222 3456', '+94 77 123 4567'] },
  { icon: Mail, title: 'Email Address', lines: ['info@globetrek.lk', 'bookings@globetrek.lk'] },
  { icon: Clock, title: 'Office Hours', lines: ['Mon – Fri: 8:00 AM – 6:00 PM', 'Sat: 9:00 AM – 3:00 PM'] },
];

export default function ContactPage() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    senderName: user?.fullName || '',
    senderEmail: user?.email || '',
    subject: '',
    message: '',
    priority: 'normal',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.senderName.trim()) e.senderName = 'Name is required';
    if (!form.senderEmail) e.senderEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.senderEmail)) e.senderEmail = 'Invalid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await inquiryApi.create(form);
      toast.success('Your message has been sent. We\'ll respond within 24 hours.');
      setForm({ senderName: user?.fullName || '', senderEmail: user?.email || '', subject: '', message: '', priority: 'normal' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80" alt="Contact" />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.eyebrow}>Get In Touch</p>
          <h1 className={styles.heroTitle}>Contact Our Travel Experts</h1>
          <p className={styles.heroSubtitle}>
            Have a question about a tour, or ready to start planning your Sri Lanka adventure?
            Our team is here to help.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Contact Info */}
          <aside className={styles.info}>
            <div className={styles.infoCards}>
              {INFO_ITEMS.map(item => (
                <div key={item.title} className={styles.infoCard}>
                  <div className={styles.infoIcon}><item.icon size={20} strokeWidth={1.5} /></div>
                  <div>
                    <p className={styles.infoTitle}>{item.title}</p>
                    {item.lines.map(l => <p key={l} className={styles.infoLine}>{l}</p>)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.mapPlaceholder}>
              <MapPin size={32} />
              <p>GlobeTrek Adventures</p>
              <p style={{ fontSize: '0.82rem', opacity: 0.7 }}>123 Beach Road, Negombo</p>
            </div>
          </aside>

          {/* Contact Form */}
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <MessageSquare size={22} className={styles.formIcon} />
              <div>
                <h2 className={styles.formTitle}>Send Us a Message</h2>
                <p className={styles.formSubtitle}>We'll get back to you within 24 hours.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.senderName ? 'error' : ''}`}
                    placeholder="Full name"
                    value={form.senderName}
                    onChange={set('senderName')}
                  />
                  {errors.senderName && <p className="form-error">{errors.senderName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-input ${errors.senderEmail ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={form.senderEmail}
                    onChange={set('senderEmail')}
                  />
                  {errors.senderEmail && <p className="form-error">{errors.senderEmail}</p>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className={`form-input ${errors.subject ? 'error' : ''}`}
                    placeholder="e.g. Inquiry about Sigiriya tour"
                    value={form.subject}
                    onChange={set('subject')}
                  />
                  {errors.subject && <p className="form-error">{errors.subject}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={set('priority')}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className={`form-textarea ${errors.message ? 'error' : ''}`}
                  rows={6}
                  placeholder="Tell us about your travel plans, questions, or specific requirements..."
                  value={form.message}
                  onChange={set('message')}
                />
                {errors.message && <p className="form-error">{errors.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '8px' }}>
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
