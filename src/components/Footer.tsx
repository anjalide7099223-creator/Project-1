import React from 'react';
import { MessageCircle, Mail, Phone, MapPin, Instagram, Facebook, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Footer: React.FC = () => {
  const { settings, setActiveView, setIsAdminLoginOpen, isAdmin } = useStore();

  const storeName = settings?.storeName || 'Stitches of Elegance';
  const cleanPhone = settings?.whatsappNumber?.replace(/\D/g, '') || '919876543210';

  return (
    <footer id="contact-section" className="bg-[#241e1c] text-[#d6ccc4] pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={storeName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-stone-700 bg-white"
                />
              ) : null}
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                {storeName}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {settings?.tagline || 'Handmade with Love'} · Exquisite artisanal garments and custom bespoke tailoring. Every stitch crafted with precision and passion.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-[#8f3e43] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-[#8f3e43] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center hover:bg-emerald-800 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white transition-colors"
                >
                  Shop Collection
                </button>
              </li>
              <li>
                <a href="#about-section" className="text-stone-300 hover:text-white transition-colors">
                  Our Story & Heritage
                </a>
              </li>
              <li>
                <a href="#contact-section" className="text-stone-300 hover:text-white transition-colors">
                  Contact & Custom Orders
                </a>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct Ordering Info */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4">
              Direct Ordering
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              We provide personal concierge service for all orders directly via WhatsApp. Select your items and checkout to send your order.
            </p>
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${storeName}, I have a custom inquiry!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4">
              Studio & Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              {settings?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{settings.phone}</span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{settings.email}</span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">Handcrafted in India</span>
            <span>·</span>
            {isAdmin ? (
              <button
                onClick={() => setActiveView('admin')}
                className="text-stone-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Owner Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
