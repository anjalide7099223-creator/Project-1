import React from 'react';
import { ShoppingBag, Lock, MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Header: React.FC = () => {
  const {
    settings,
    cart,
    isAdmin,
    activeView,
    setActiveView,
    setIsCartOpen,
    setIsAdminLoginOpen,
    logoutAdmin,
  } = useStore();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);

  const storeName = settings?.storeName || 'Stitches of Elegance';
  const logoUrl = settings?.logoUrl;

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      {/* Top Announcement Bar */}
      {settings?.showAnnouncement && showAnnouncement && settings?.announcementBarText && (
        <div className="bg-[#2d2522] text-[#f5ede4] text-xs font-medium py-1.5 px-4 flex items-center justify-between">
          <div className="flex-1 text-center truncate">
            {settings.announcementBarText}
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            aria-label="Dismiss announcement"
            className="text-[#d8c5b5] hover:text-white p-0.5 ml-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation (3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Single element Brand wordmark with logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              {logoUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-300 shadow-xs bg-white shrink-0">
                  <img
                    src={logoUrl}
                    alt={storeName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#2d2522] text-[#e8ded3] flex items-center justify-center font-serif text-lg font-bold border border-stone-400 shrink-0">
                  {storeName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 leading-tight">
                  {storeName}
                </span>
                {settings?.tagline && (
                  <span className="text-[11px] uppercase tracking-widest text-stone-500 font-medium">
                    {settings.tagline}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single line, quiet hover) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            <button
              onClick={() => setActiveView('home')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap pb-1 border-b-2 ${
                activeView === 'home' ? 'border-[#8f3e43] text-stone-950 font-semibold' : 'border-transparent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('shop')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap pb-1 border-b-2 ${
                activeView === 'shop' ? 'border-[#8f3e43] text-stone-950 font-semibold' : 'border-transparent'
              }`}
            >
              Shop Collection
            </button>
            <a
              href="#about-section"
              onClick={() => activeView !== 'home' && setActiveView('home')}
              className="hover:text-stone-950 transition-colors whitespace-nowrap pb-1 border-b-2 border-transparent"
            >
              Our Story
            </a>
            <a
              href="#contact-section"
              onClick={() => activeView !== 'home' && setActiveView('home')}
              className="hover:text-stone-950 transition-colors whitespace-nowrap pb-1 border-b-2 border-transparent"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: Primary Action Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {/* WhatsApp Quick Chat */}
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${storeName}, I would like to inquire about your handcrafted collection!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors whitespace-nowrap"
                title="Chat with us on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Order</span>
              </a>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View shopping cart"
              className="relative p-2.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#8f3e43] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView(activeView === 'admin' ? 'home' : 'admin')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeView === 'admin'
                      ? 'bg-[#8f3e43] text-white'
                      : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={logoutAdmin}
                  className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2 ml-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none"
                title="Admin Dashboard Login"
                aria-label="Admin Dashboard Login"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
