import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { ProductCard } from '../ProductCard.tsx';
import { EmptyCatalogue } from '../EmptyCatalogue.tsx';

export const ShopView: React.FC = () => {
  const { products, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, settings } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-low' | 'price-high'>('featured');

  // Filter products by active status (for public view), search query, and category
  const filteredProducts = products.filter(p => {
    if (!p.isActive) return false;
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // Default 'featured'
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Shop Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8f3e43] font-bold">
          The Atelier Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Shop Handcrafted Garments
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
          Select your favourite handcrafted silhouettes. Submit your order directly via WhatsApp for personal customization and confirmation.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search our collection..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-300 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Categories Pills (Only admin-created categories) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-white focus:outline-none text-stone-800"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Main Grid or Empty State */}
      {products.length === 0 ? (
        /* STRICT REQUIREMENT: If 0 products, show attractive empty state "Products Coming Soon" */
        <EmptyCatalogue messageTitle="Products Coming Soon" />
      ) : sortedProducts.length === 0 ? (
        <EmptyCatalogue
          messageTitle="No Products Found"
          categoryFilter={selectedCategory || searchQuery}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 pb-4">
            <span>
              Showing {sortedProducts.length} handcrafted piece{sortedProducts.length !== 1 ? 's' : ''}
              {selectedCategory ? ` in "${selectedCategory}"` : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
