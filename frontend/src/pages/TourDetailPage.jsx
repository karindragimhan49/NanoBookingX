import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, CheckCircle, XCircle, ChevronRight, Calendar, Minus, Plus, Shield, Info } from 'lucide-react';
import { packagesApi } from '../api/packagesApi';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import styles from './TourDetailPage.module.css';

const TABS = ['Overview', 'Itinerary', 'Includes'];

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [booking, setBooking] = useState({ date: '', travelers: 2, notes: '' });
  const [booking_loading, setBookingLoading] = useState(false);

  useEffect(() => {
    packagesApi.getById(id)
      .then(data => setPkg(data.package))
      .catch(() => navigate('/tours'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/tours/${id}` } } });
      return;
    }
    if (!booking.date) {
      toast.error('Please select a travel date');
      return;
    }
    if (new Date(booking.date) <= new Date()) {
      toast.error('Travel date must be in the future');
      return;
    }
    setBookingLoading(true);
    try {
      await bookingApi.create({
        travelPackageId: pkg.id,
        travelStartDate: booking.date,
        numberOfTravelers: booking.travelers,
        specialRequirements: booking.notes,
      });
      toast.success('Booking confirmed! Check your dashboard for details.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!pkg) return null;

  const totalPrice = (pkg.effectivePrice * booking.travelers).toFixed(2);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <img
          src={pkg.imageUrl}
          alt={pkg.name}
          className={styles.heroImg}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1920&q=80'; }}
        />
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/tours">Tours</Link>
            <ChevronRight size={14} />
            <span>{pkg.name}</span>
          </div>
          <div className={styles.heroMeta}>
            <span className={`badge badge-secondary`}>{pkg.category}</span>
            <span className={`badge`} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{pkg.difficulty}</span>
          </div>
          <h1 className={styles.heroTitle}>{pkg.name}</h1>
          <div className={styles.heroStats}>
            <span><MapPin size={14} /> {pkg.destination?.city}</span>
            <span><Clock size={14} /> {pkg.durationDays} Days / {pkg.durationNights} Nights</span>
            <span><Users size={14} /> Max {pkg.maxGroupSize} travelers</span>
            {pkg.averageRating > 0 && <span><Star size={14} /> {pkg.averageRating.toFixed(1)} ({pkg.reviewCount} reviews)</span>}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            {/* Tabs */}
            <div className={styles.tabs}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Overview' && (
              <div className={styles.tabContent}>
                <h2 className={styles.sectionTitle}>About This Tour</h2>
                <p className={styles.description}>{pkg.description}</p>

                {pkg.activities?.length > 0 && (
                  <div className={styles.activities}>
                    <h3 className={styles.subsectionTitle}>Activities</h3>
                    <div className={styles.activitiesGrid}>
                      {pkg.activities.map((act, i) => (
                        <span key={i} className={styles.activityTag}>{act}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.highlights}>
                  <h3 className={styles.subsectionTitle}>Tour Highlights</h3>
                  <div className={styles.highlightGrid}>
                    <div className={styles.highlightCard}>
                      <Clock size={20} className={styles.highlightIcon} />
                      <div>
                        <p className={styles.highlightLabel}>Duration</p>
                        <p className={styles.highlightValue}>{pkg.durationDays} Days / {pkg.durationNights} Nights</p>
                      </div>
                    </div>
                    <div className={styles.highlightCard}>
                      <Users size={20} className={styles.highlightIcon} />
                      <div>
                        <p className={styles.highlightLabel}>Group Size</p>
                        <p className={styles.highlightValue}>Max {pkg.maxGroupSize} travelers</p>
                      </div>
                    </div>
                    <div className={styles.highlightCard}>
                      <MapPin size={20} className={styles.highlightIcon} />
                      <div>
                        <p className={styles.highlightLabel}>Destination</p>
                        <p className={styles.highlightValue}>{pkg.destination?.city}, {pkg.destination?.country}</p>
                      </div>
                    </div>
                    <div className={styles.highlightCard}>
                      <Info size={20} className={styles.highlightIcon} />
                      <div>
                        <p className={styles.highlightLabel}>Difficulty</p>
                        <p className={styles.highlightValue} style={{ textTransform: 'capitalize' }}>{pkg.difficulty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Itinerary' && (
              <div className={styles.tabContent}>
                <h2 className={styles.sectionTitle}>Day-by-Day Itinerary</h2>
                <div className={styles.itinerary}>
                  {(pkg.itinerary || []).map((day, i) => (
                    <div key={i} className={styles.itineraryDay}>
                      <div className={styles.dayNumber}>Day {day.day || i + 1}</div>
                      <div className={styles.dayContent}>
                        <h4 className={styles.dayTitle}>{day.title}</h4>
                        <p className={styles.dayDesc}>{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Includes' && (
              <div className={styles.tabContent}>
                <div className={styles.includesGrid}>
                  <div className={styles.includesList}>
                    <h3 className={styles.subsectionTitle} style={{ color: '#065f46' }}>What's Included</h3>
                    {(pkg.includes || []).map((item, i) => (
                      <div key={i} className={styles.includeItem}>
                        <CheckCircle size={16} className={styles.includeIcon} style={{ color: '#10B981' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.includesList}>
                    <h3 className={styles.subsectionTitle} style={{ color: '#92400e' }}>What's Not Included</h3>
                    {(pkg.excludes || []).map((item, i) => (
                      <div key={i} className={styles.includeItem}>
                        <XCircle size={16} className={styles.includeIcon} style={{ color: '#F59E0B' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Panel */}
          <aside className={styles.bookingPanel}>
            <div className={styles.bookingCard}>
              <div className={styles.bookingPrice}>
                {pkg.discountedPrice && (
                  <span className={styles.bookingOldPrice}>${pkg.pricePerPerson}</span>
                )}
                <span className={styles.bookingCurrentPrice}>${pkg.effectivePrice}</span>
                <span className={styles.bookingPer}> / person</span>
              </div>
              {pkg.availableSeats < 5 && pkg.availableSeats > 0 && (
                <p className={styles.urgency}>{pkg.availableSeats} spots remaining!</p>
              )}

              <div className={styles.bookingForm}>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    Travel Start Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    min={today}
                    value={booking.date}
                    onChange={e => setBooking(b => ({ ...b, date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Travelers</label>
                  <div className={styles.counterInput}>
                    <button
                      className={styles.counterBtn}
                      onClick={() => setBooking(b => ({ ...b, travelers: Math.max(1, b.travelers - 1) }))}
                      disabled={booking.travelers <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.counterValue}>{booking.travelers}</span>
                    <button
                      className={styles.counterBtn}
                      onClick={() => setBooking(b => ({ ...b, travelers: Math.min(pkg.availableSeats || pkg.maxGroupSize, b.travelers + 1) }))}
                      disabled={booking.travelers >= (pkg.availableSeats || pkg.maxGroupSize)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requirements (optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Dietary requirements, accessibility needs..."
                    value={booking.notes}
                    onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className={styles.bookingSummary}>
                  <div className={styles.summaryRow}>
                    <span>${pkg.effectivePrice} x {booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className={styles.summaryDivider} />
                  <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <button
                  className={`btn btn-primary ${styles.bookBtn}`}
                  onClick={handleBook}
                  disabled={booking_loading || pkg.availableSeats === 0}
                >
                  {booking_loading ? 'Booking...' : pkg.availableSeats === 0 ? 'Fully Booked' : isAuthenticated ? 'Book Now' : 'Sign In to Book'}
                </button>

                <div className={styles.bookingNote}>
                  <Shield size={13} />
                  <span>Secure booking &bull; Free cancellation within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div className={styles.contactCard}>
              <p className={styles.contactTitle}>Need help deciding?</p>
              <p className={styles.contactText}>Our travel experts are available to help you choose the perfect tour.</p>
              <Link to="/contact" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Contact Us
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
