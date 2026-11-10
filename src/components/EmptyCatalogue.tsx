import React from 'react';
import { MessageCircle, Sparkles, PlusCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface EmptyCatalogueProps {
  messageTitle?: string;
  categoryFilter?: string | null;
}

export const EmptyCatalogue: React.FC<EmptyCatalogueProps> = ({
  messageTitle = 'Products Coming Soon',
  categoryFilter,
}) => {
  const { settings, isAdmin, setActiveView } = useStore();
  const cleanPhone = settings?.whatsappNumber?.replace(/\D/g, '') || '919876543210';
  const storeName = settings?.storeName || 'Stitches of Elegance';

  return (
    <div className="w-full max-w-3xl mx-auto my-12 p-8 sm:p-12 text-center bg-white/70 backdrop-blur-xs rounded-2xl border border-stone-200/90 shadow-xs">
      {/* Decorative Atelier Needle & Spool Emblem */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f4ebe1] text-[#8f3e43] mb-6 border border-[#e5d5c5]">
        <svg
          className="w-10 h-10"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Spool */}
          <path d="M16 10h16v4H16zM16 34h16v4H16z" />
          <path d="M19 14h10v20H19z" fill="#eddcd0" />
          {/* Thread lines */}
          <path d="M19 18h10M19 22h10M19 26h10M19 30h10" stroke="#8f3e43" strokeOpacity="0.7" />
          {/* Needle piercing through */}
          <path d="M35 8l-18 28M35 8c1-1 3-1 4 0s1 3 0 4l-4 4" stroke="#443934" />
          <circle cx="36" cy="10" r="1" fill="#443934" />
        </svg>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-widest text-[#8f3e43] uppercase mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Atelier In Progress</span>
      </div>

      <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight mb-4">
        {categoryFilter ? `No Products in "${categoryFilter}"` : messageTitle}
      </h3>

      <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
        {categoryFilter
          ? `We haven't added any garments to this specific category yet. Browse other collections or contact us directly.`
          : `Our artisan collection is currently in the making. We are meticulously crafting each garment and hand-finishing every detail with love.`}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* WhatsApp Custom Order Inquiries */}
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hi ${storeName}, I saw your collection is coming soon! I would like to inquire about custom tailored pieces.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Inquire on WhatsApp for Custom Orders</span>
        </a>

        {/* Admin Quick Action */}
        {isAdmin && (
          <button
            onClick={() => setActiveView('admin')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Products in Admin</span>
          </button>
        )}
      </div>

      {isAdmin && (
        <p className="mt-4 text-xs text-stone-400">
          💡 As store owner, click <strong>"Admin Panel"</strong> to upload product photos and publish your items.
        </p>
      )}
    </div>
  );
};
