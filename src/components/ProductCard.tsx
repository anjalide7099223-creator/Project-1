import React, { useState } from 'react';
import { ShoppingBag, Zap, Eye, Check } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { settings, addToCart, initiateBuyNow, setActiveProductModal } = useStore();
  const currency = settings?.currency || '₹';

  // Selected color variation
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0]?.name || ''
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  // If a color is selected and has its own uploaded image, use it! Otherwise fallback to product.images[0]
  const currentColorObj = product.colors?.find(c => c.name === selectedColor);
  const activeImage =
    (currentColorObj?.imageUrl && currentColorObj.imageUrl.trim() !== ''
      ? currentColorObj.imageUrl
      : product.images?.[0]) || '';

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedColor, product.sizes?.[0]);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    initiateBuyNow(product, 1, selectedColor, product.sizes?.[0]);
  };

  return (
    <div
      onClick={() => setActiveProductModal(product)}
      className="group relative bg-white rounded-xl border border-stone-200/90 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container (65-75% visual dominance) */}
      <div className="relative aspect-[4/5] w-full bg-[#f6f2ec] overflow-hidden flex items-center justify-center">
        {activeImage ? (
          <img
            src={activeImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-stone-400">
            <ShoppingBag className="w-8 h-8 stroke-1 text-stone-400 mb-2" />
            <span className="text-xs font-serif italic text-stone-500">Handcrafted Piece</span>
          </div>
        )}

        {/* Featured Tag & Discount Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.isFeatured && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-stone-900 text-white rounded-xs shadow-xs">
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#8f3e43] text-white rounded-xs shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="px-3 py-1 bg-white text-stone-900 text-xs font-bold uppercase tracking-wider rounded-xs">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover Quick View button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveProductModal(product);
            }}
            className="flex-1 py-2 px-3 bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-semibold rounded-md shadow-sm hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Card Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category */}
          <p className="text-[11px] font-semibold tracking-wider uppercase text-stone-400 truncate mb-1">
            {product.category || 'Collection'}
          </p>

          {/* Title */}
          <h4 className="font-serif text-base font-semibold text-stone-900 line-clamp-1 group-hover:text-[#8f3e43] transition-colors">
            {product.name}
          </h4>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-serif text-lg font-bold text-stone-950 tabular-nums">
              {currency}{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                {currency}{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Colour Variations swatches (if product has colors) */}
        {product.colors && product.colors.length > 0 && (
          <div className="pt-1 flex items-center gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
            {product.colors.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                title={color.name}
                aria-label={`Select ${color.name}`}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColor === color.name
                    ? 'border-stone-900 ring-1 ring-stone-900 scale-110'
                    : 'border-stone-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex || '#d1c7bd' }}
              />
            ))}
            <span className="text-[10px] text-stone-500 ml-1 truncate">
              {selectedColor}
            </span>
          </div>
        )}

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="pt-2 grid grid-cols-2 gap-2 border-t border-stone-100" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`py-2 px-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : addedFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          <button
            onClick={handleQuickBuy}
            disabled={isOutOfStock}
            className={`py-2 px-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 text-white transition-colors ${
              isOutOfStock
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#8f3e43] hover:bg-[#7b3539]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
