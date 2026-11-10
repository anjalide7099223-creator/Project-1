import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    settings,
    openCartCheckout,
  } = useStore();

  if (!isCartOpen) return null;

  const currency = settings?.currency || '₹';
  const deliveryCharge = settings?.deliveryCharge ?? 60;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 999;

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const isFreeDelivery = subtotal >= freeThreshold;
  const appliedDeliveryCharge = isFreeDelivery ? 0 : deliveryCharge;
  const finalTotal = subtotal + appliedDeliveryCharge;
  const amountNeededForFree = Math.max(0, freeThreshold - subtotal);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    openCartCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8f3e43]" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Shopping Bag ({cart.reduce((n, i) => n + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Close cart drawer"
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#f5ede4] px-5 py-2.5 text-xs text-stone-700 border-b border-stone-200/60">
            {isFreeDelivery ? (
              <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <span>🎉</span> You have unlocked FREE Pan-India delivery!
              </p>
            ) : (
              <p>
                Add <strong>{currency}{amountNeededForFree.toLocaleString('en-IN')}</strong> more for FREE delivery!
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Explore our handcrafted collection and add your bespoke favourites.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const price = item.product.discountPrice || item.product.price;
                const itemTotal = price * item.quantity;
                // Check if color has image
                const colorObj = item.product.colors?.find(c => c.name === item.selectedColor);
                const displayImg = colorObj?.imageUrl || item.product.images?.[0] || '';

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-stone-50/70 rounded-xl border border-stone-200/80"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded-lg bg-white overflow-hidden border border-stone-200 shrink-0">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                          <ShoppingBag className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove item"
                            className="text-stone-400 hover:text-red-600 transition-colors p-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selected Variations */}
                        <div className="text-[11px] text-stone-500 space-x-2 mt-0.5">
                          {item.selectedColor && (
                            <span>Colour: <strong className="text-stone-700">{item.selectedColor}</strong></span>
                          )}
                          {item.selectedSize && (
                            <span>· Size: <strong className="text-stone-700">{item.selectedSize}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Price & Quantity Stepper */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-stone-300 rounded bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-stone-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-stone-600 hover:bg-stone-100"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif text-sm font-bold text-stone-900 tabular-nums">
                          {currency}{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-[#faf8f5] space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {currency}{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold tabular-nums">
                    {isFreeDelivery ? (
                      <span className="text-emerald-700 font-bold uppercase">Free</span>
                    ) : (
                      `${currency}${appliedDeliveryCharge.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-base font-bold text-stone-900">
                  <span className="font-serif">Total Amount</span>
                  <span className="font-serif text-lg text-stone-950 tabular-nums">
                    {currency}{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all group"
              >
                <span>Proceed to WhatsApp Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Orders are submitted directly on WhatsApp</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
