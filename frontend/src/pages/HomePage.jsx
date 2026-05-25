import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Users, ChevronRight, Shield, Headphones, Award, ArrowRight } from 'lucide-react';
import { packagesApi } from '../api/packagesApi';
import styles from './HomePage.module.css';

const DESTINATIONS = [
  { name: 'Sigiriya', region: 'North Central', image: 'https://images.unsplash.com/photo-1580181591617-79e8b65c94e1?auto=format&fit=crop&w=600&q=80', count: 12 },
  { name: 'Kandy', region: 'Central Province', image: 'https://images.unsplash.com/photo-1571406384609-2b9f83ccf4b6?auto=format&fit=crop&w=600&q=80', count: 9 },
  { name: 'Yala', region: 'Southern Province', image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=600&q=80', count: 7 },
  { name: 'Galle', region: 'Southern Coast', image: 'https://images.unsplash.com/photo-1576011853-e7d44d64fa14?auto=format&fit=crop&w=600&q=80', count: 11 },
  { name: 'Mirissa', region: 'Southern Coast', image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=600&q=80', count: 6 },
  { name: 'Ella', region: 'Uva Province', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', count: 8 },
];

const FEATURES = [
  { icon: Shield, title: 'Secure Booking', desc: 'Your payments and personal data are protected with industry-standard encryption.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Our dedicated travel experts are available around the clock to assist you.' },
  { icon: Award, title: 'Expert Guides', desc: 'All tours are led by certified, experienced local guides who know Sri Lanka intimately.' },
  { icon: Star, title: 'Curated Experiences', desc: 'Handpicked destinations and activities that promise genuine, authentic experiences.' },
];

const STATS = [
  { value: '2,500+', label: 'Happy Travelers' },
  { value: '45+', label: 'Tour Packages' },
  { value: '12', label: 'Years Experience' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const TESTIMONIALS = [
  { name: 'Emma Richardson', country: 'United Kingdom', rating: 5, text: 'GlobeTrek arranged the most incredible 10-day tour of Sri Lanka. The guides were knowledgeable, the accommodations were superb, and every detail was perfectly planned.', avatar: 'E', tour: 'Sigiriya Cultural Tour' },
  { name: 'David Chen', country: 'Singapore', rating: 5, text: 'The Yala Safari exceeded all expectations. We spotted three leopards! The tented camp was luxurious and the whole experience was seamless from start to finish.', avatar: 'D', tour: 'Yala Safari Experience' },
  { name: 'Priya Nair', country: 'India', rating: 5, text: "The whale watching trip was breathtaking. We saw blue whales up close in the wild. GlobeTrek's attention to detail made our family holiday truly unforgettable.", avatar: 'P', tour: 'Whale Watching Adventure' },
];

function PackageCard({ pkg }) {
  return (
    <Link to={`/tours/${pkg.slug || pkg.id}`} className={`card ${styles.pkgCard}`}>
      <div className={styles.pkgImg}>
        <img src={pkg.imageUrl} alt={pkg.name} loading="lazy" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80'; }} />
        {pkg.discountedPrice && (
          <span className={styles.pkgDiscount}>SALE</span>
        )}
        {pkg.isFeatured && (
          <span className={styles.pkgFeatured}>Featured</span>
        )}
      </div>
      <div className={styles.pkgBody}>
        <div className={styles.pkgMeta}>
          <span className={`badge badge-primary`}>{pkg.category}</span>
          <span className={styles.pkgDiff}>{pkg.difficulty}</span>
        </div>
        <h3 className={styles.pkgName}>{pkg.name}</h3>
        <div className={styles.pkgLocation}>
          <MapPin size={13} />
          <span>{pkg.destination?.city || pkg.destinationCity}</span>
        </div>
        <p className={styles.pkgDesc}>{pkg.shortDescription}</p>
        <div className={styles.pkgFooter}>
          <div className={styles.pkgInfo}>
            <span><Clock size={13} /> {pkg.durationDays}D/{pkg.durationNights}N</span>
            <span><Users size={13} /> Max {pkg.maxGroupSize}</span>
            <span><Star size={13} /> {pkg.averageRating > 0 ? pkg.averageRating.toFixed(1) : 'New'}</span>
          </div>
          <div className={styles.pkgPrice}>
            {pkg.discountedPrice && <span className={styles.pkgOldPrice}>${pkg.pricePerPerson}</span>}
            <span className={styles.pkgCurrentPrice}>${pkg.effectivePrice}</span>
            <span className={styles.pkgPer}>/person</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    packagesApi.getAll({ featured: 'true' })
      .then(data => setFeaturedPackages(data.packages?.slice(0, 3) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/tours${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1920&q=80"
            alt="Sri Lanka tropical paradise"
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Discover Sri Lanka</p>
            <h1 className={styles.heroTitle}>
              Journey Beyond<br />
              <em>the Ordinary</em>
            </h1>
            <p className={styles.heroSubtitle}>
              From ancient rock fortresses to pristine beaches and wild safari landscapes —
              explore the pearl of the Indian Ocean with expertly crafted tours.
            </p>
            <form className={styles.heroSearch} onSubmit={handleSearch}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search destinations, tours..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button type="submit" className={`btn btn-secondary btn-lg ${styles.searchBtn}`}>
                Search Tours
              </button>
            </form>
            <div className={styles.heroTags}>
              {['Cultural Tours', 'Wildlife Safari', 'Beach Escapes', 'Adventure'].map(tag => (
                <button
                  key={tag}
                  className={styles.heroTag}
                  onClick={() => navigate(`/tours?category=${tag.split(' ')[0].toLowerCase()}`)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className="container">
            <div className={styles.heroStatsGrid}>
              {STATS.map(s => (
                <div key={s.label} className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{s.value}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className={`section ${styles.destSection}`}>
        <div className="container">
          <div className="text-center">
            <p className="section-label">Explore Sri Lanka</p>
            <h2 className="section-title">Popular Destinations</h2>
            <div className="divider divider-center" />
            <p className="section-subtitle">
              From misty mountains to golden beaches, Sri Lanka offers diverse landscapes
              and experiences within a single island.
            </p>
          </div>
          <div className={styles.destGrid}>
            {DESTINATIONS.map((dest, i) => (
              <Link
                key={dest.name}
                to={`/tours?search=${dest.name}`}
                className={`${styles.destCard} ${i === 0 ? styles.destLarge : ''}`}
              >
                <img src={dest.image} alt={dest.name} loading="lazy" />
                <div className={styles.destOverlay} />
                <div className={styles.destInfo}>
                  <h3 className={styles.destName}>{dest.name}</h3>
                  <p className={styles.destRegion}>{dest.region}</p>
                  <span className={styles.destCount}>{dest.count} tours</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className={`section ${styles.pkgSection}`}>
        <div className="container">
          <div className={styles.pkgHeader}>
            <div>
              <p className="section-label">Curated Experiences</p>
              <h2 className="section-title">Featured Tour Packages</h2>
              <div className="divider" />
              <p className="section-subtitle">
                Our most popular and highest-rated tours, selected for exceptional value and memorable experiences.
              </p>
            </div>
            <Link to="/tours" className={`btn btn-outline ${styles.viewAll}`}>
              View All Tours <ArrowRight size={16} />
            </Link>
          </div>
          <div className={`grid-3 ${styles.pkgGrid}`}>
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className={styles.pkgSkeleton}>
                    <div className={`skeleton ${styles.skeletonImg}`} />
                    <div style={{ padding: '20px' }}>
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '60%', height: '14px' }} />
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '90%', height: '20px', marginTop: '10px' }} />
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '75%', height: '14px', marginTop: '8px' }} />
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%', height: '28px', marginTop: '20px' }} />
                    </div>
                  </div>
                ))
              : featuredPackages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
            }
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <div className={styles.whyGrid}>
            <div className={styles.whyLeft}>
              <p className="section-label">Why GlobeTrek</p>
              <h2 className="section-title">Travel with Confidence</h2>
              <div className="divider" />
              <p className="section-subtitle" style={{ marginBottom: '32px' }}>
                With over 12 years of experience crafting Sri Lanka tours, we combine local expertise
                with world-class service to ensure your journey exceeds every expectation.
              </p>
              <Link to="/about" className="btn btn-primary">
                Learn About Us <ChevronRight size={16} />
              </Link>
            </div>
            <div className={styles.whyRight}>
              {FEATURES.map(f => (
                <div key={f.title} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <f.icon size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>{f.title}</h4>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.whyImage}>
            <img
              src="https://images.unsplash.com/photo-1553603227-2358aabe8842?auto=format&fit=crop&w=1200&q=80"
              alt="Sri Lanka tea plantation"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`section ${styles.testimonialSection}`}>
        <div className="container">
          <div className="text-center">
            <p className="section-label">What Travelers Say</p>
            <h2 className="section-title">Stories from Our Guests</h2>
            <div className="divider divider-center" />
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <p className={styles.testimonialName}>{t.name}</p>
                    <p className={styles.testimonialMeta}>{t.country} &bull; {t.tour}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg}>
          <img
            src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1920&q=80"
            alt="Sri Lanka beach"
          />
          <div className={styles.ctaOverlay} />
        </div>
        <div className={`container ${styles.ctaContent}`}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Adventure?</h2>
          <p className={styles.ctaSubtitle}>
            Create your account today and get access to exclusive deals, personalised recommendations,
            and a seamless booking experience.
          </p>
          <div className={styles.ctaBtns}>
            <Link to="/register" className="btn btn-secondary btn-lg">Create Free Account</Link>
            <Link to="/tours" className="btn btn-outline-white btn-lg">Explore Tours</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
