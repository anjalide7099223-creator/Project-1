import React from 'react';
import { ArrowRight, Sparkles, MessageCircle, Heart, Scissors, Feather, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Hero } from '../Hero.tsx';
import { ProductCard } from '../ProductCard.tsx';
import { EmptyCatalogue } from '../EmptyCatalogue.tsx';

export const HomeView: React.FC = () => {
  const { products, categories, settings, setActiveView, setSelectedCategory } = useStore();

  const featuredProducts = products.filter(p => p.isFeatured && p.isActive);
  const newArrivals = products.filter(p => p.isActive).slice(0, 8);
  const storeName = settings?.storeName || 'Stitches of Elegance';
  const cleanPhone = settings?.whatsappNumber?.replace(/\D/g, '') || '919876543210';

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* Hero Section */}
      <Hero />

      {/* Categories Row (ONLY Admin-Created Categories) */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8f3e43] font-bold">Curated Collections</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Shop by Category
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveView('shop');
              }}
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setActiveView('shop');
                }}
                className="group p-4 bg-white rounded-xl border border-stone-200/90 hover:border-stone-400 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-[#f6eee5] text-[#8f3e43] group-hover:bg-[#8f3e43] group-hover:text-white transition-colors flex items-center justify-center">
                  <Scissors className="w-5 h-5 stroke-1" />
                </div>
                <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#8f3e43] transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#8f3e43] font-bold">Handcrafted Spotlight</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Featured Creations
            </h2>
          </div>
          {featuredProducts.length > 0 && (
            <button
              onClick={() => setActiveView('shop')}
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 group"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* If products exist, render grid. If NO products exist, STRICT REQUIREMENT: display "Products Coming Soon" */}
        {products.length === 0 ? (
          <EmptyCatalogue messageTitle="Products Coming Soon" />
        ) : featuredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white/60 rounded-xl border border-stone-200 text-stone-500 text-sm">
            <p className="font-serif font-bold text-stone-800 text-base mb-1">Our Featured Collection</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
              Browse our complete boutique collection to explore all handcrafted garments.
            </p>
            <button
              onClick={() => setActiveView('shop')}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
            >
              Browse Shop Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Section (Only if products exist) */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8f3e43] font-bold">Latest In The Atelier</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                New Arrivals
              </h2>
            </div>
            <button
              onClick={() => setActiveView('shop')}
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 group"
            >
              <span>View Full Shop</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* About Us / Craftsmanship Story Section */}
      <section id="about-section" className="bg-[#f3ebe1]/70 border-t border-b border-stone-200/90 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-white text-[#8f3e43] border border-stone-300 flex items-center justify-center mx-auto shadow-xs">
            <Feather className="w-6 h-6 stroke-1" />
          </div>

          <span className="text-xs uppercase tracking-widest text-[#8f3e43] font-bold block">
            The Artisan Atelier
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            {settings?.aboutHeading || 'Our Craftsmanship & Heritage'}
          </h2>

          <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto whitespace-pre-line font-light">
            {settings?.aboutStory ||
              'Welcome to Stitches of Elegance. Every creation tells a story of passion, precision, and timeless craftsmanship. From delicate embroidery to bespoke fits, our garments are meticulously handcrafted with love to celebrate your unique elegance.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello ${storeName}, I would love to learn more about your bespoke tailoring and orders!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Atelier on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
