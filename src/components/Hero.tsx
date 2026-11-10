import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, Scissors, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Hero: React.FC = () => {
  const { settings, setActiveView } = useStore();
  const cleanPhone = settings?.whatsappNumber?.replace(/\D/g, '') || '919876543210';
  const storeName = settings?.storeName || 'Stitches of Elegance';

  const heading = settings?.heroHeading || 'Handcrafted Elegance, Sewn with Love';
  const subheading =
    settings?.heroSubheading ||
    'Exquisite tailored creations and artisanal bespoke pieces crafted with graceful silhouettes and timeless attention to detail.';
  const buttonText = settings?.heroButtonText || 'Explore Collection';
  const bannerUrl = settings?.bannerUrl;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f7f2ec] to-[#faf8f5] border-b border-stone-200">
      {/* Background Banner Image (if configured) or subtle texture overlay */}
      {bannerUrl ? (
        <div className="absolute inset-0 z-0">
          <img
            src={bannerUrl}
            alt="Store Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5] via-[#faf8f5]/85 to-[#faf8f5]/60" />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#8f3e43_1px,transparent_1px)] [background-size:16px_16px]" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl">
          
          {/* Atelier Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0e4d8] border border-[#dfcdbd] rounded-full text-xs font-semibold uppercase tracking-widest text-[#8f3e43] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings?.tagline || 'Handmade with Love'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.15] text-balance mb-6">
            {heading}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mb-8">
            {subheading}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveView('shop')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all group"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hi ${storeName}, I would like to explore custom tailoring and WhatsApp orders!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>

        </div>
      </div>

      {/* Trust & Craftsmanship Bar */}
      <div className="relative z-10 border-t border-stone-200/90 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-700">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f5ede4] flex items-center justify-center text-[#8f3e43] shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">100% Handcrafted</p>
                <p className="text-[11px] text-stone-500">Artisan stitches & precision fits</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">WhatsApp Ordering</p>
                <p className="text-[11px] text-stone-500">Direct concierge order confirmation</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f5ede4] flex items-center justify-center text-[#8f3e43] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Custom Sizing</p>
                <p className="text-[11px] text-stone-500">Tailored to your measurements</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">All-India Delivery</p>
                <p className="text-[11px] text-stone-500">Free delivery over {settings?.currency || '₹'}{settings?.freeDeliveryThreshold || 999}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
