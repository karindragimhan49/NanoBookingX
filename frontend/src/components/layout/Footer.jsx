/**
 * Footer.jsx — Global Professional Site Footer
 * ===============================================
 * A four-column white footer with light gray top border, providing:
 *  - Brand column: logo, tagline, social links, trust badges
 *  - Explore column: links to key package categories
 *  - Company column: links to static company pages
 *  - Contact column: physical address (Negombo), phone, email, hours
 * Bottom bar: copyright + legal links.
 *
 * DESIGN: White background (#FFFFFF), cool gray text, blue link hover.
 *         Clean 4-column grid that stacks to 2 on tablet and 1 on mobile.
 */

import { Link } from "react-router-dom";
import { Globe, MapPin, Phone, Mail, Clock, ArrowUpRight, Shield, Award } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   INLINE SVG SOCIAL ICONS
   lucide-react v0.300+ removed all brand/social icons.
   We render them as small inline SVGs to avoid the dependency.
   ───────────────────────────────────────────────────────────── */

/** Facebook "f" logo */
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

/** Instagram camera logo */
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

/** X / Twitter bird-like logo */
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/** YouTube play-button logo */
const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   DATA — Static link arrays (keeps JSX clean)
   ───────────────────────────────────────────────────────────── */

/** Tour category quick links */
const EXPLORE_LINKS = [
  { label: "All Packages",       to: "/tours" },
  { label: "Beach & Coastal",    to: "/tours?category=beach" },
  { label: "Cultural Heritage",  to: "/tours?category=cultural" },
  { label: "Wildlife Safaris",   to: "/tours?category=wildlife" },
  { label: "Hill Country",       to: "/tours?category=hills" },
  { label: "Adventure Sports",   to: "/tours?category=adventure" },
];

/** Company / static page links */
const COMPANY_LINKS = [
  { label: "About Us",     to: "/about" },
  { label: "Contact Us",   to: "/contact" },
  { label: "Our Guides",   to: "/about#guides" },
  { label: "Travel Blog",  to: "/about#blog" },
  { label: "Careers",      to: "/about#careers" },
  { label: "Partner With Us", to: "/contact#partner" },
];

/** Legal / bottom-bar links */
const LEGAL_LINKS = [
  { label: "Privacy Policy",  to: "/about#privacy" },
  { label: "Terms of Service", to: "/about#terms" },
  { label: "Cookie Policy",   to: "/about#cookies" },
  { label: "Refund Policy",   to: "/about#refund" },
];

/** Social media profiles */
const SOCIAL_LINKS = [
  {
    icon: FacebookIcon,
    href: "https://facebook.com",
    label: "Follow GlobeTrek on Facebook",
  },
  {
    icon: InstagramIcon,
    href: "https://instagram.com",
    label: "Follow GlobeTrek on Instagram",
  },
  {
    icon: TwitterIcon,
    href: "https://twitter.com",
    label: "Follow GlobeTrek on X (Twitter)",
  },
  {
    icon: YoutubeIcon,
    href: "https://youtube.com",
    label: "Subscribe to GlobeTrek on YouTube",
  },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT — Footer Column Heading
   ───────────────────────────────────────────────────────────── */
const ColumnHeading = ({ children }) => (
  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
    {children}
  </h3>
);

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT — Footer Nav Link
   ───────────────────────────────────────────────────────────── */
const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="
        text-sm text-gray-600 hover:text-blue-700
        transition-colors duration-150 inline-flex items-center gap-1 group
      "
    >
      {children}
      {/* Subtle arrow that appears on hover for external-feeling links */}
      <ArrowUpRight
        className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5"
        aria-hidden="true"
      />
    </Link>
  </li>
);

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT — Contact Info Row
   ───────────────────────────────────────────────────────────── */
const ContactRow = ({ Icon, children, href, isLink = false }) => {
  const content = (
    <span className="text-sm text-gray-600 leading-relaxed">{children}</span>
  );

  return (
    <div className="flex items-start gap-3">
      {/* Icon in a small blue-tinted box */}
      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
      </div>
      {/* Content — optionally a clickable link */}
      {isLink && href
        ? <a href={href} className="text-sm text-gray-600 hover:text-blue-700 transition-colors leading-relaxed">{children}</a>
        : content
      }
    </div>
  );
};


/* ═════════════════════════════════════════════════════════════
   MAIN FOOTER COMPONENT
   ═════════════════════════════════════════════════════════════ */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-gray-200 mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >

      {/* ── Main Footer Grid ──────────────────────────────────── */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ════════════════════════════════════════════════════
              COLUMN 1 — Brand, tagline, trust badges, social
              ════════════════════════════════════════════════════ */}
          <div className="sm:col-span-2 lg:col-span-1">

            {/* Brand logo */}
            <Link
              to="/"
              aria-label="GlobeTrek Adventures — Go to home"
              className="inline-flex items-center gap-2.5 group mb-4"
            >
              <div className="
                w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center
                group-hover:bg-blue-700 transition-colors duration-200
              ">
                <Globe className="w-5 h-5 text-white" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-gray-900 text-base tracking-tight">
                  Globe<span className="text-blue-600">Trek</span>
                </span>
                <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">
                  Adventures
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-xs">
              Sri Lanka's most trusted travel partner. Crafting unforgettable
              journeys from our home in Negombo since 2016.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <Shield className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                <span>Award Winning</span>
              </div>
            </div>

            {/* Social media icons */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                Follow Us
              </p>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                      text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50
                      transition-all duration-150
                    "
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              COLUMN 2 — Explore (tour categories)
              ════════════════════════════════════════════════════ */}
          <div>
            <ColumnHeading>Explore Tours</ColumnHeading>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map(({ label, to }) => (
                <FooterLink key={to} to={to}>{label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* ════════════════════════════════════════════════════
              COLUMN 3 — Company pages
              ════════════════════════════════════════════════════ */}
          <div>
            <ColumnHeading>Company</ColumnHeading>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ label, to }) => (
                <FooterLink key={to} to={to}>{label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* ════════════════════════════════════════════════════
              COLUMN 4 — Contact Information
              ════════════════════════════════════════════════════ */}
          <div>
            <ColumnHeading>Get In Touch</ColumnHeading>

            <address className="not-italic space-y-3.5">

              {/* Physical address */}
              <ContactRow Icon={MapPin}>
                No. 12, Sea View Lane,<br />
                Negombo, 11500,<br />
                Sri Lanka 🇱🇰
              </ContactRow>

              {/* Phone */}
              <ContactRow
                Icon={Phone}
                href="tel:+94312223456"
                isLink
              >
                +94 31 222 3456
              </ContactRow>

              {/* Email */}
              <ContactRow
                Icon={Mail}
                href="mailto:hello@globetrekadventures.lk"
                isLink
              >
                hello@globetrekadventures.lk
              </ContactRow>

              {/* Office hours */}
              <ContactRow Icon={Clock}>
                Mon – Sat: 8:00 AM – 6:00 PM (IST)
              </ContactRow>

            </address>

            {/* Quick contact CTA */}
            <Link
              to="/contact"
              id="footer-contact-cta"
              className="
                inline-flex items-center gap-2 mt-5 px-4 py-2.5
                rounded-xl bg-blue-600 text-white text-sm font-semibold
                hover:bg-blue-700 transition-colors duration-200
                shadow-sm shadow-blue-200
              "
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Send Us a Message
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────── */}
      <div className="border-t border-gray-100">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {currentYear} GlobeTrek Adventures (Pvt) Ltd. All rights reserved.
          </p>

          {/* Legal links */}
          <nav aria-label="Legal links">
            <ul className="flex items-center gap-4 flex-wrap justify-center">
              {LEGAL_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Made in Sri Lanka */}
          <p className="text-xs text-gray-400 hidden md:block">
            Made with ❤️ in Negombo, Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
