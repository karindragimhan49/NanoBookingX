import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, Users, Star, SlidersHorizontal, X } from 'lucide-react';
import { packagesApi } from '../api/packagesApi';
import styles from './ToursPage.module.css';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'beach', label: 'Beach' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'budget', label: 'Budget' },
  { value: 'family', label: 'Family' },
];

const DIFFICULTIES = [
  { value: '', label: 'Any Difficulty' },
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
];

function TourCard({ pkg }) {
  return (
    <Link to={`/tours/${pkg.slug || pkg.id}`} className={styles.card}>
      <div className={styles.cardImg}>
        <img
          src={pkg.imageUrl}
          alt={pkg.name}
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80'; }}
        />
        {pkg.discountedPrice && <span className={styles.saleBadge}>SALE</span>}
        {pkg.isFeatured && !pkg.discountedPrice && <span className={styles.featuredBadge}>Featured</span>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={`badge badge-primary`}>{pkg.category}</span>
          <span className={styles.diff}>{pkg.difficulty}</span>
        </div>
        <h3 className={styles.cardTitle}>{pkg.name}</h3>
        <div className={styles.cardLocation}>
          <MapPin size={12} />
          <span>{pkg.destination?.city || pkg.destinationCity}</span>
        </div>
        <p className={styles.cardDesc}>{pkg.shortDescription}</p>
        <div className={styles.cardFooter}>
          <div className={styles.cardStats}>
            <span><Clock size={12} /> {pkg.durationDays}D/{pkg.durationNights}N</span>
            <span><Users size={12} /> Max {pkg.maxGroupSize}</span>
            {pkg.averageRating > 0 && <span><Star size={12} /> {pkg.averageRating.toFixed(1)}</span>}
          </div>
          <div className={styles.cardPrice}>
            {pkg.discountedPrice && (
              <span className={styles.oldPrice}>${pkg.pricePerPerson}</span>
            )}
            <div>
              <span className={styles.price}>${pkg.effectivePrice}</span>
              <span className={styles.per}>/person</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={`skeleton ${styles.skeletonImg}`} />
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 10, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 20, width: '90%', marginBottom: 8, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 40, width: '80%', marginBottom: 20, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 28, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function ToursPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const difficulty = searchParams.get('difficulty') || '';

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLoading(true);
    packagesApi.getAll({ search, category, difficulty })
      .then(data => setPackages(data.packages || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [search, category, difficulty]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch);
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const hasFilters = search || category || difficulty;

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageBg}>
          <img
            src="https://images.unsplash.com/photo-1553603227-2358aabe8842?auto=format&fit=crop&w=1920&q=80"
            alt="Sri Lanka landscape"
          />
          <div className={styles.pageBgOverlay} />
        </div>
        <div className={`container ${styles.pageHeaderContent}`}>
          <p className={styles.pageEyebrow}>Explore Our Collection</p>
          <h1 className={styles.pageTitle}>Tour Packages</h1>
          <p className={styles.pageSubtitle}>
            Discover {packages.length || '45+'} carefully curated experiences across Sri Lanka's most breathtaking destinations.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search & Filter Bar */}
        <div className={styles.filterBar}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search destinations, tours..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className={styles.searchInput}
            />
            {localSearch && (
              <button type="button" className={styles.clearSearch} onClick={() => { setLocalSearch(''); updateFilter('search', ''); }}>
                <X size={14} />
              </button>
            )}
          </form>

          <div className={styles.filterControls}>
            <select
              className={styles.filterSelect}
              value={category}
              onChange={e => updateFilter('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select
              className={styles.filterSelect}
              value={difficulty}
              onChange={e => updateFilter('difficulty', e.target.value)}
            >
              {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            {hasFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <X size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className={styles.categoryPills}>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              className={`${styles.pill} ${category === c.value ? styles.pillActive : ''}`}
              onClick={() => updateFilter('category', c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className={styles.resultsBar}>
          <p className={styles.resultsCount}>
            {loading ? 'Loading...' : `${packages.length} tour${packages.length !== 1 ? 's' : ''} found`}
            {hasFilters && !loading && ' (filtered)'}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : packages.length > 0 ? (
          <div className={styles.grid}>
            {packages.map(pkg => <TourCard key={pkg.id} pkg={pkg} />)}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Filter size={40} />
            </div>
            <h3 className={styles.emptyTitle}>No Tours Found</h3>
            <p className={styles.emptyText}>
              We couldn't find any tours matching your criteria.
              Try adjusting your filters or search terms.
            </p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
