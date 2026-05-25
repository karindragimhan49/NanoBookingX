import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Package, MessageSquare, Users,
  CheckCircle, Clock, XCircle, ChevronRight, MapPin, AlertCircle,
  TrendingUp, Star
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import { inquiryApi } from '../api/inquiryApi';
import { packagesApi } from '../api/packagesApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './DashboardPage.module.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'badge-warning', icon: Clock },
  confirmed: { label: 'Confirmed', cls: 'badge-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', cls: 'badge-danger',  icon: XCircle },
  completed: { label: 'Completed', cls: 'badge-primary', icon: CheckCircle },
};

const INQUIRY_STATUS = {
  new:       { label: 'New',       cls: 'badge-warning' },
  read:      { label: 'Read',      cls: 'badge-neutral' },
  responded: { label: 'Responded', cls: 'badge-success' },
  closed:    { label: 'Closed',    cls: 'badge-neutral' },
};

/* ===== Customer Views ===== */
function CustomerBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getMyBookings()
      .then(d => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancel(id);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div className={styles.loader} />;

  if (!bookings.length) return (
    <div className={styles.empty}>
      <Calendar size={36} />
      <h3>No bookings yet</h3>
      <p>Start exploring our tour packages and book your first adventure.</p>
      <Link to="/tours" className="btn btn-primary btn-sm">Browse Tours</Link>
    </div>
  );

  return (
    <div className={styles.bookingsList}>
      {bookings.map(b => {
        const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
        const Icon = cfg.icon;
        return (
          <div key={b.id} className={styles.bookingCard}>
            <div className={styles.bookingImg}>
              {b.package?.imageUrl
                ? <img src={b.package.imageUrl} alt={b.package.name} onError={e => { e.target.style.display = 'none'; }} />
                : <Calendar size={24} />}
            </div>
            <div className={styles.bookingInfo}>
              <div className={styles.bookingTop}>
                <h4 className={styles.bookingName}>{b.package?.name || 'Tour Package'}</h4>
                <span className={`badge ${cfg.cls}`}><Icon size={11} /> {cfg.label}</span>
              </div>
              <div className={styles.bookingMeta}>
                {b.package?.destinationCity && <span><MapPin size={12} />{b.package.destinationCity}</span>}
                <span><Calendar size={12} />{new Date(b.travelStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span><Users size={12} />{b.numberOfTravellers} traveler{b.numberOfTravellers > 1 ? 's' : ''}</span>
              </div>
              <div className={styles.bookingFooter}>
                <span className={styles.bookingPrice}>Total: <strong>${parseFloat(b.totalPrice).toFixed(2)}</strong></span>
                {['pending', 'confirmed'].includes(b.status) && (
                  <button className={`btn btn-sm ${styles.cancelBtn}`} onClick={() => cancelBooking(b.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CustomerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inquiryApi.getMyInquiries()
      .then(d => setInquiries(d.inquiries || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loader} />;

  if (!inquiries.length) return (
    <div className={styles.empty}>
      <MessageSquare size={36} />
      <h3>No inquiries yet</h3>
      <p>Have a question about a tour? Send us a message.</p>
      <Link to="/contact" className="btn btn-primary btn-sm">Contact Us</Link>
    </div>
  );

  return (
    <div className={styles.inquiryList}>
      {inquiries.map(inq => {
        const cfg = INQUIRY_STATUS[inq.status] || INQUIRY_STATUS.new;
        return (
          <div key={inq.id} className={styles.inquiryCard}>
            <div className={styles.inquiryTop}>
              <h4 className={styles.inquirySubject}>{inq.subject}</h4>
              <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
            </div>
            <p className={styles.inquiryMsg}>{inq.message}</p>
            {inq.responseMessage && (
              <div className={styles.inquiryResponse}>
                <p className={styles.responseLabel}>Staff Response:</p>
                <p className={styles.responseText}>{inq.responseMessage}</p>
              </div>
            )}
            <p className={styles.inquiryDate}>{new Date(inq.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ===== Staff / Admin Views ===== */
function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    bookingApi.getAll({ status: filter || undefined })
      .then(d => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, status);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
      toast.success('Booking updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div className={styles.tableToolbar}>
        <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
      </div>
      {loading ? <div className={styles.loader} /> : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th><th>Package</th><th>Customer</th><th>Date</th><th>Travelers</th><th>Total</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={b.id}>
                    <td className={styles.tdMuted}>{b.id}</td>
                    <td><span className={styles.tdBold}>{b.package?.name || '—'}</span></td>
                    <td>{b.customer?.fullName || '—'}<br /><span className={styles.tdSub}>{b.customer?.email}</span></td>
                    <td>{b.travelStartDate ? new Date(b.travelStartDate).toLocaleDateString('en-GB') : '—'}</td>
                    <td>{b.numberOfTravellers}</td>
                    <td className={styles.tdBold}>${parseFloat(b.totalPrice).toFixed(2)}</td>
                    <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                      >
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!bookings.length && <p className={styles.tableEmpty}>No bookings found.</p>}
        </div>
      )}
    </div>
  );
}

function AllInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    inquiryApi.getAll()
      .then(d => setInquiries(d.inquiries || []))
      .finally(() => setLoading(false));
  }, []);

  const respond = async (id) => {
    if (!response.trim()) return toast.error('Response cannot be empty');
    try {
      await inquiryApi.update(id, { status: 'responded', responseMessage: response });
      setInquiries(qs => qs.map(q => q.id === id ? { ...q, status: 'responded', responseMessage: response } : q));
      setActive(null);
      setResponse('');
      toast.success('Response sent');
    } catch { toast.error('Failed to respond'); }
  };

  if (loading) return <div className={styles.loader} />;

  return (
    <div className={styles.inquiryMgmt}>
      {inquiries.map(inq => {
        const cfg = INQUIRY_STATUS[inq.status] || INQUIRY_STATUS.new;
        const isOpen = active === inq.id;
        return (
          <div key={inq.id} className={styles.inquiryCard}>
            <div className={styles.inquiryTop}>
              <div>
                <h4 className={styles.inquirySubject}>{inq.subject}</h4>
                <p className={styles.inquirySender}>{inq.senderName} &bull; {inq.senderEmail}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                <span className={`badge badge-neutral`}>{inq.priority}</span>
              </div>
            </div>
            <p className={styles.inquiryMsg}>{inq.message}</p>
            {inq.responseMessage && (
              <div className={styles.inquiryResponse}>
                <p className={styles.responseLabel}>Response sent:</p>
                <p className={styles.responseText}>{inq.responseMessage}</p>
              </div>
            )}
            {!inq.responseMessage && (
              <div>
                {isOpen ? (
                  <div className={styles.responseForm}>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Type your response..."
                      value={response}
                      onChange={e => setResponse(e.target.value)}
                      style={{ minHeight: '80px' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => respond(inq.id)}>Send Response</button>
                      <button className="btn btn-outline btn-sm" onClick={() => { setActive(null); setResponse(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => setActive(inq.id)}>
                    <MessageSquare size={13} /> Respond
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {!inquiries.length && (
        <div className={styles.empty}><MessageSquare size={36} /><h3>No inquiries found</h3></div>
      )}
    </div>
  );
}

function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.getAll()
      .then(d => setPackages(d.packages || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleFeatured = async (pkg) => {
    try {
      await packagesApi.update(pkg.id, { isFeatured: !pkg.isFeatured });
      setPackages(ps => ps.map(p => p.id === pkg.id ? { ...p, isFeatured: !p.isFeatured } : p));
    } catch { toast.error('Update failed'); }
  };

  const toggleActive = async (pkg) => {
    try {
      await packagesApi.update(pkg.id, { isActive: !pkg.isActive });
      setPackages(ps => ps.map(p => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p));
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className={styles.loader} />;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr><th>Package</th><th>Category</th><th>Price</th><th>Bookings</th><th>Featured</th><th>Status</th></tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id}>
              <td>
                <span className={styles.tdBold}>{pkg.name}</span><br />
                <span className={styles.tdSub}><MapPin size={10} /> {pkg.destination?.city}</span>
              </td>
              <td><span className="badge badge-primary">{pkg.category}</span></td>
              <td className={styles.tdBold}>${pkg.effectivePrice}/person</td>
              <td>{pkg.currentBookingsCount}/{pkg.maxGroupSize}</td>
              <td>
                <button
                  className={`badge ${pkg.isFeatured ? 'badge-secondary' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                  onClick={() => toggleFeatured(pkg)}
                >
                  {pkg.isFeatured ? 'Featured' : 'Regular'}
                </button>
              </td>
              <td>
                <button
                  className={`badge ${pkg.isActive ? 'badge-success' : 'badge-danger'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                  onClick={() => toggleActive(pkg)}
                >
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getAllUsers()
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (u) => {
    try {
      await authApi.updateUser(u.id, { isActive: !u.isActive });
      setUsers(us => us.map(x => x.id === u.id ? { ...x, isActive: !u.isActive } : x));
    } catch { toast.error('Update failed'); }
  };

  const changeRole = async (u, role) => {
    try {
      await authApi.updateUser(u.id, { role });
      setUsers(us => us.map(x => x.id === u.id ? { ...x, role } : x));
      toast.success('Role updated');
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className={styles.loader} />;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <span className={styles.tdBold}>{u.fullName}</span><br />
                <span className={styles.tdSub}>{u.email}</span>
              </td>
              <td>
                <select
                  className={styles.statusSelect}
                  value={u.role}
                  onChange={e => changeRole(u, e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className={styles.tdMuted}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
              <td>
                <button className="btn btn-outline btn-sm" onClick={() => toggleActive(u)}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== Main Dashboard ===== */
export default function DashboardPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const customerTabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'inquiries', label: 'My Inquiries', icon: MessageSquare },
  ];

  const staffTabs = [
    { id: 'all-bookings', label: 'All Bookings', icon: Calendar },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'packages', label: 'Packages', icon: Package },
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: Users }] : []),
  ];

  const tabs = isStaff ? staffTabs : customerTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatar}>{user?.fullName?.charAt(0) || 'U'}</div>
            <div>
              <p className={styles.sidebarName}>{user?.fullName}</p>
              <span className={`badge badge-primary`} style={{ fontSize: '0.72rem' }}>{user?.role}</span>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.sidebarItem} ${activeTab === tab.id ? styles.sidebarItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={17} />
                <span>{tab.label}</span>
              </button>
            ))}
            <div className={styles.sidebarDivider} />
            <Link to="/tours" className={styles.sidebarLink}>
              <ChevronRight size={15} /> Browse Tours
            </Link>
            <Link to="/contact" className={styles.sidebarLink}>
              <ChevronRight size={15} /> Contact Support
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <div>
              <h1 className={styles.contentTitle}>
                {activeTab === 'bookings' && 'My Bookings'}
                {activeTab === 'inquiries' && (isStaff ? 'Customer Inquiries' : 'My Inquiries')}
                {activeTab === 'all-bookings' && 'All Bookings'}
                {activeTab === 'packages' && 'Package Management'}
                {activeTab === 'users' && 'User Management'}
              </h1>
              <p className={styles.contentSubtitle}>
                Welcome back, <strong>{user?.fullName?.split(' ')[0]}</strong>
              </p>
            </div>
          </div>

          <div className={styles.tabPanel}>
            {activeTab === 'bookings' && <CustomerBookings user={user} />}
            {activeTab === 'inquiries' && !isStaff && <CustomerInquiries />}
            {activeTab === 'all-bookings' && <AllBookings />}
            {activeTab === 'inquiries' && isStaff && <AllInquiries />}
            {activeTab === 'packages' && <PackageManagement />}
            {activeTab === 'users' && <UserManagement />}
          </div>
        </main>
      </div>
    </div>
  );
}
