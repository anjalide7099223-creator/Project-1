import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Zap, Check, ChevronLeft, ChevronRight, ShieldCheck, Scissors } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Product } from '../types.ts';

export const ProductDetailModal: React.FC = () => {
  const { activeProductModal, setActiveProductModal, settings, addToCart, initiateBuyNow } = useStore();
  const currency = settings?.currency || '₹';

  const product = activeProductModal;

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Initialize or reset when activeProductModal changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setActiveImageIndex(0);
      setAddedSuccess(false);
    }
  }, [product]);

  if (!product) return null;

  // Build full list of gallery images (general images + any color images)
  const allImages = [...(product.images || [])];
  // Check if current selected color has a dedicated image
  const currentColorObj = product.colors?.find(c => c.name === selectedColor);

  const activeDisplayImage =
    currentColorObj?.imageUrl && currentColorObj.imageUrl.trim() !== ''
      ? currentColorObj.imageUrl
      : allImages[activeImageIndex] || allImages[0] || '';

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    // If that color has an image in the gallery, switch to it
    const colorObj = product.colors?.find(c => c.name === colorName);
    if (colorObj?.imageUrl) {
      const idx = allImages.indexOf(colorObj.imageUrl);
      if (idx > -1) {
        setActiveImageIndex(idx);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    initiateBuyNow(product, quantity, selectedColor, selectedSize);
    setActiveProductModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveProductModal(null)}
          aria-label="Close product modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="bg-[#f7f3ed] p-6 flex flex-col justify-between">
            {/* Main Image Display */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white border border-stone-200 flex items-center justify-center">
              {activeDisplayImage ? (
                <img
                  src={activeDisplayImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-stone-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
                  <p className="font-serif italic text-sm text-stone-500">Handcrafted Piece</p>
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase bg-[#8f3e43] text-white rounded-xs shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}

              {/* Gallery Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx && activeDisplayImage === imgUrl
                        ? 'border-[#8f3e43] ring-1 ring-[#8f3e43]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Category & Stock */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="uppercase tracking-widest text-[#8f3e43]">
                  {product.category || 'Atelier Collection'}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${
                  isOutOfStock ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {isOutOfStock ? 'Sold Out' : `In Stock (${product.stock} available)`}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-stone-950 tabular-nums">
                  {currency}{currentPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through tabular-nums">
                    {currency}{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save {currency}{(originalPrice - currentPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="text-stone-600 text-sm leading-relaxed border-t border-b border-stone-100 py-3">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="italic text-stone-400">Handcrafted artisan garment. Custom measurements can be requested directly during WhatsApp order confirmation.</p>
                )}
              </div>

              {/* Colour Variation Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 uppercase tracking-wider">Colour</span>
                    <span className="text-stone-500 font-medium">{selectedColor || 'Choose a colour'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => handleColorSelect(color.name)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                          selectedColor === color.name
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                          style={{ backgroundColor: color.hex || '#cfc2b6' }}
                        />
                        <span>{color.name}</span>
                        {color.imageUrl && (
                          <span className="text-[10px] text-stone-400 group-hover:text-stone-200">
                            (Photo)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 uppercase tracking-wider">Select Size</span>
                    <span className="text-stone-500 font-medium">{selectedSize || 'Choose a size'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[42px] h-9 px-3 rounded-md text-xs font-semibold border transition-all ${
                          selectedSize === size
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-semibold text-stone-900 text-sm tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-stone-500">
                    Total: <strong className="text-stone-900">{currency}{(currentPrice * quantity).toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>

            </div>

            {/* Action Buttons & Assurances */}
            <div className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 text-white shadow-sm transition-all ${
                    isOutOfStock
                      ? 'bg-stone-300 cursor-not-allowed'
                      : 'bg-[#8f3e43] hover:bg-[#7b3539] hover:shadow'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy on WhatsApp</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="pt-2 flex items-center justify-center gap-6 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-stone-400" />
                  Bespoke Customization
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  Direct WhatsApp Confirmation
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
