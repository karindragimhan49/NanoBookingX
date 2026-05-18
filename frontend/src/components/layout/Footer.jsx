/**
 * Footer.jsx — Global Site Footer
 * ----------------------------------
 * Provides navigation links, company info, and social links.
 * Displayed on all pages via the Layout component.
 */

import { Link } from "react-router-dom";
import { Globe, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700/50 bg-slate-900 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ---- Brand Column ---- */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-teal-400" strokeWidth={1.5} />
              <span className="text-lg font-bold text-white">
                Globe<span className="text-teal-400">Trek</span> Adventures
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sri Lanka's premier travel partner, crafting unforgettable adventures
              from the shores of Negombo to the peaks of the Hill Country.
            </p>
            {/* Contact Details */}
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>12 Main Street, Negombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>+94 31 222 3456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>hello@globetrekadventures.lk</span>
              </div>
            </div>
          </div>

          {/* ---- Explore Links ---- */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {[
                { label: "All Tours", path: "/tours" },
                { label: "Beach & Coastal", path: "/tours?category=beach" },
                { label: "Cultural Heritage", path: "/tours?category=cultural" },
                { label: "Wildlife Safaris", path: "/tours?category=wildlife" },
                { label: "Hill Country", path: "/tours?category=hills" },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Company Links ---- */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Guides", path: "/guides" },
                { label: "Contact Us", path: "/contact" },
                { label: "Blog", path: "/blog" },
                { label: "Careers", path: "/careers" },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Legal & Social ---- */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 mb-6">
              {[
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Service", path: "/terms" },
                { label: "Cookie Policy", path: "/cookies" },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media Icons */}
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Copyright Bar ---- */}
        <div className="mt-10 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <p>© {currentYear} GlobeTrek Adventures. All rights reserved.</p>
          <p>Crafted with ❤️ in Negombo, Sri Lanka 🇱🇰</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
