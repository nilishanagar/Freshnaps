import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import freshNapsLogo from '../../assets/freshnaps-logo.png';

const footerLinks = {
  shop: [
    { label: 'Mattresses', to: '/shop?category=mattress' },
    { label: 'Pillows', to: '/shop?category=pillow' },
    { label: 'Bedsheets', to: '/shop?category=bedsheet' },
    { label: 'Comforters', to: '/shop?category=comforter' },
    { label: 'Blankets', to: '/shop?category=blanket' },
    { label: 'Cushions', to: '/shop?category=cushion' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    // { label: 'Blog', to: '#' },
    // { label: 'Careers', to: '#' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms-of-service' },
  ],
};

const socials = [
  { icon: FaInstagram, label: 'Instagram', href: 'https://www.instagram.com/freshnapsmattress?igsh=bTVxYThyazR6ODZr' },
  { icon: FaFacebook,  label: 'Facebook',  href: '#' },
  { icon: FaXTwitter,  label: 'X (Twitter)', href: '#' },
  { icon: FaYoutube,   label: 'YouTube',   href: '#' },
];

const trustBadges = [
  { icon: Lock,        text: 'Secure Checkout' },
  { icon: Truck,       text: 'Free Shipping ₹999+' },
  { icon: RotateCcw,   text: '30-Day Returns' },
  { icon: ShieldCheck, text: '2-Year Warranty' },
];

const Footer = () => {
  const ROYAL_URL = import.meta.env.VITE_ROYAL_MARWADI_URL || 'https://royalmarwadi.com';

  return (
    <footer className="bg-gray-50 dark:bg-surface-950 text-gray-600 dark:text-gray-300 pt-16 pb-0 border-t border-gray-200 dark:border-surface-900">
      <div className="container-custom">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4 group">
              <img
                src={freshNapsLogo}
                alt="FreshNaps Mattress"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:brightness-110"
              />
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              Premium bedding and home comfort products crafted for those who believe a great day begins with a perfect night's sleep.
            </p>

            {/* Social links */}
            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-surface-900 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white dark:hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors hover:pl-1 duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors hover:pl-1 duration-200 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                <MapPin size={15} className="text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Royal Marwadi Near Roop Laxmi Furniture, Mandi Road, Sawai Madhopur, Rajasthan, 322001</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                <Phone size={15} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <a href="tel:+919057204097" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">+91 9057204097</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={15} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <a href="mailto:freshnapsmattress@gmail.com" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">freshnapsmattress@gmail.com</a>
              </li>
            </ul>

            <a
              href={ROYAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A75D46] to-[#D58C73] text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(167,93,70,0.2)] hover:shadow-[0_8px_24px_rgba(167,93,70,0.3)] transition-all hover:-translate-y-0.5"
            >
              <Leaf size={14} /> Royal Marwadi
            </a>
          </div>
        </div>

        {/* Trust badges strip */}
        <div className="border-t border-gray-200 dark:border-surface-800 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon size={15} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-surface-800 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Freshnaps. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/privacy-policy" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms-of-service" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
