import { Link } from 'react-router-dom';
import { Award, Users, Globe, Heart, MapPin, Star } from 'lucide-react';
import styles from './AboutPage.module.css';

const TEAM = [
  { name: 'Kasun Jayawardena', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', bio: '15 years of experience crafting unforgettable Sri Lanka travel experiences.' },
  { name: 'Sarah Fernando', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b7c5?auto=format&fit=crop&w=200&q=80', bio: 'Expert in coordinating complex multi-day tours and customer relations.' },
  { name: 'Pradeep Rajapaksa', role: 'Senior Tour Guide', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', bio: 'Certified wildlife naturalist and cultural heritage expert with 12 years field experience.' },
  { name: 'Amaya Perera', role: 'Travel Consultant', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', bio: 'Passionate traveler who has personally explored every corner of Sri Lanka.' },
];

const VALUES = [
  { icon: Heart, title: 'Authentic Experiences', desc: 'We believe travel should connect you with the real soul of a destination — its people, culture, and natural beauty.' },
  { icon: Award, title: 'Excellence in Service', desc: 'From the first inquiry to the final farewell, we maintain the highest standards of quality and professionalism.' },
  { icon: Globe, title: 'Responsible Tourism', desc: 'We are committed to sustainable practices that protect Sri Lanka\'s environment and support local communities.' },
  { icon: Users, title: 'Personalised Journeys', desc: 'Every traveler is unique. We listen carefully and design experiences that reflect your personal travel style.' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img src="https://images.unsplash.com/photo-1571406384609-2b9f83ccf4b6?auto=format&fit=crop&w=1920&q=80" alt="Kandy" />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.eyebrow}>Our Story</p>
          <h1 className={styles.heroTitle}>Passionate About<br />Sri Lanka Travel</h1>
          <p className={styles.heroSubtitle}>
            Founded in Negombo, GlobeTrek Adventures has been crafting exceptional Sri Lanka travel
            experiences since 2012, combining expert local knowledge with world-class service.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <p className="section-label">Who We Are</p>
              <h2 className="section-title">More Than a Travel Agency</h2>
              <div className="divider" />
              <p className={styles.storyText}>
                GlobeTrek Adventures was born from a simple belief: that travel, done right,
                has the power to transform lives. Based in Negombo on Sri Lanka's west coast,
                we have spent over a decade exploring every corner of this breathtaking island
                to bring you authentic, curated travel experiences.
              </p>
              <p className={styles.storyText}>
                Our team of passionate travel professionals, expert local guides, and
                dedicated support staff work together to ensure every journey exceeds your
                expectations — from the first inquiry to the final farewell.
              </p>
              <div className={styles.storyStats}>
                {[
                  { value: '2,500+', label: 'Happy Travelers' },
                  { value: '45+', label: 'Tour Packages' },
                  { value: '12+', label: 'Years Experience' },
                  { value: '98%', label: 'Satisfaction Rate' },
                ].map(s => (
                  <div key={s.label} className={styles.storyStat}>
                    <span className={styles.storyStatValue}>{s.value}</span>
                    <span className={styles.storyStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.storyImages}>
              <div className={styles.imgMain}>
                <img src="https://images.unsplash.com/photo-1580181591617-79e8b65c94e1?auto=format&fit=crop&w=700&q=80" alt="Sigiriya" />
              </div>
              <div className={styles.imgSecondary}>
                <img src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=500&q=80" alt="Elephant" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <div className="text-center">
            <p className="section-label">What Drives Us</p>
            <h2 className="section-title">Our Core Values</h2>
            <div className="divider divider-center" />
          </div>
          <div className="grid-4" style={{ marginTop: '48px' }}>
            {VALUES.map(v => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}><v.icon size={24} strokeWidth={1.5} /></div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <p className="section-label">The People Behind GlobeTrek</p>
            <h2 className="section-title">Meet Our Team</h2>
            <div className="divider divider-center" />
            <p className="section-subtitle">
              Our dedicated team brings decades of combined experience in Sri Lanka travel,
              ensuring every tour is handled with expertise and genuine care.
            </p>
          </div>
          <div className="grid-4" style={{ marginTop: '48px' }}>
            {TEAM.map(m => (
              <div key={m.name} className={styles.teamCard}>
                <div className={styles.teamImg}>
                  <img src={m.img} alt={m.name} onError={e => { e.target.style.display='none'; }} />
                </div>
                <h3 className={styles.teamName}>{m.name}</h3>
                <p className={styles.teamRole}>{m.role}</p>
                <p className={styles.teamBio}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={`section ${styles.ctaSection}`}>
        <div className={styles.ctaBg}>
          <img src="https://images.unsplash.com/photo-1576011853-e7d44d64fa14?auto=format&fit=crop&w=1920&q=80" alt="Galle Fort" />
          <div className={styles.ctaOverlay} />
        </div>
        <div className={`container ${styles.ctaContent}`}>
          <p className="section-label" style={{ color: 'var(--clr-secondary)' }}>Ready to Explore?</p>
          <h2 className={styles.ctaTitle}>Let's Plan Your Dream Sri Lanka Trip</h2>
          <p className={styles.ctaSubtitle}>
            Browse our curated tour packages or get in touch with our travel experts to design
            a personalised journey just for you.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tours" className="btn btn-secondary btn-lg">Browse Tours</Link>
            <Link to="/contact" className="btn btn-outline-white btn-lg">Talk to an Expert</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
