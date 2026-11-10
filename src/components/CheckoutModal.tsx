import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Copy, Check, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { CartItem, OrderItem } from '../types.ts';
import { generateWhatsAppOrderMessage, buildWhatsAppLink } from '../utils/whatsapp.ts';
import { api } from '../api.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  isBuyNow: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  isBuyNow,
}) => {
  const { settings, clearCart } = useStore();
  const currency = settings?.currency || '₹';
  const deliveryCharge = settings?.deliveryCharge ?? 60;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 999;
  const ownerWhatsApp = settings?.whatsappNumber || '919876543210';
  const storeName = settings?.storeName || 'Stitches of Elegance';

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    sameAsMobile: true,
    address: '',
    city: '',
    state: '',
    pinCode: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderId: string;
    whatsappUrl: string;
    rawMessage: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync whatsappNumber if sameAsMobile
  useEffect(() => {
    if (formData.sameAsMobile) {
      setFormData(prev => ({ ...prev, whatsappNumber: prev.mobileNumber }));
    }
  }, [formData.mobileNumber, formData.sameAsMobile]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setSubmittedOrder(null);
      setCopied(false);
      setFormErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

  if (!isOpen || !items || items.length === 0) return null;

  // Calculate pricing
  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const appliedDelivery = subtotal >= freeThreshold ? 0 : deliveryCharge;
  const total = subtotal + appliedDelivery;

  // Validation
  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (formData.mobileNumber.replace(/\D/g, '').length < 10) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.sameAsMobile && !formData.whatsappNumber.trim()) {
      errors.whatsappNumber = 'WhatsApp number is required';
    }
    if (!formData.address.trim()) errors.address = 'Delivery address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pinCode.trim()) {
      errors.pinCode = 'PIN Code is required';
    } else if (formData.pinCode.replace(/\D/g, '').length < 6) {
      errors.pinCode = 'Enter a valid 6-digit PIN code';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Build order items payload
      const orderItems: OrderItem[] = items.map(item => {
        const price = item.product.discountPrice || item.product.price;
        const colorObj = item.product.colors?.find(c => c.name === item.selectedColor);
        const imageUrl = colorObj?.imageUrl || item.product.images?.[0] || '';

        return {
          productId: item.product.id,
          productName: item.product.name,
          imageUrl,
          color: item.selectedColor,
          size: item.selectedSize,
          quantity: item.quantity,
          price,
          subtotal: price * item.quantity,
        };
      });

      // WhatsApp formatted message
      const message = generateWhatsAppOrderMessage({
        customerName: formData.fullName.trim(),
        customerPhone: formData.mobileNumber.trim(),
        customerWhatsApp: (formData.sameAsMobile ? formData.mobileNumber : formData.whatsappNumber).trim(),
        deliveryAddress: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        notes: formData.notes.trim(),
        items: orderItems,
        subtotal,
        deliveryCharge: appliedDelivery,
        total,
        storeName,
        currency,
        ownerWhatsApp,
      });

      const whatsappUrl = buildWhatsAppLink(ownerWhatsApp, message);

      // Save order to server database
      const savedOrder = await api.createOrder({
        customerName: formData.fullName.trim(),
        customerPhone: formData.mobileNumber.trim(),
        customerWhatsApp: (formData.sameAsMobile ? formData.mobileNumber : formData.whatsappNumber).trim(),
        deliveryAddress: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        notes: formData.notes.trim(),
        items: orderItems,
        subtotal,
        deliveryCharge: appliedDelivery,
        total,
        whatsappUrl,
      });

      // If this was from cart, clear cart
      if (!isBuyNow) {
        clearCart();
      }

      setSubmittedOrder({
        orderId: savedOrder.id,
        whatsappUrl,
        rawMessage: message,
      });

      // Try opening WhatsApp in a new tab if supported
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Direct popup prevented; button ready for customer tap', err);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderMessage = () => {
    if (!submittedOrder) return;
    navigator.clipboard.writeText(submittedOrder.rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {submittedOrder ? 'Complete Your WhatsApp Order' : 'WhatsApp Direct Checkout'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {submittedOrder
                  ? `Order #${submittedOrder.orderId} prepared for WhatsApp submission`
                  : 'No online payment required · Direct artisan confirmation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 2: ORDER SUBMITTED & WHATSAPP ACTION */}
        {submittedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <MessageCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8f3e43]">
                Order #{submittedOrder.orderId}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Complete your order by sending the WhatsApp message
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Your order details have been formatted. Tap the button below to send your order directly to the store owner on WhatsApp to confirm delivery & payment.
              </p>
            </div>

            {/* Prominent WhatsApp Send Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={submittedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Open WhatsApp to Send Order</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={copyOrderMessage}
                className="w-full sm:w-auto px-5 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl border border-stone-300 flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Text'}</span>
              </button>
            </div>

            {/* Note & Explanation */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs text-stone-600 space-y-2">
              <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                What happens next?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-500">
                <li>Your pre-filled message opens in WhatsApp when you tap the button above.</li>
                <li>Send the message to submit your order to <strong>{storeName}</strong>.</li>
                <li>The store owner will personally message you to verify your size, share payment details (UPI/Bank/COD), and arrange shipping.</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4"
            >
              Done / Return to Store
            </button>

          </div>
        ) : (
          /* STEP 1: CUSTOMER INFORMATION FORM */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Order Items Summary Strip */}
            <div className="p-4 bg-[#f9f6f0] rounded-xl border border-stone-200/90 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider">
                <span>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} item{items.length > 1 ? 's' : ''})</span>
                <span className="font-serif text-sm font-bold text-stone-900 tabular-nums">
                  Total: {currency}{total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="divide-y divide-stone-200/60 max-h-36 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-medium text-stone-900 truncate">{item.product.name}</span>
                      <span className="text-stone-500 text-[11px] shrink-0">
                        ({[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || 'Standard'}) × {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-800 tabular-nums shrink-0 ml-2">
                      {currency}{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-stone-500 pt-1 flex justify-between border-t border-stone-200/60">
                <span>Delivery:</span>
                <span>{appliedDelivery === 0 ? <strong className="text-emerald-700">FREE</strong> : `${currency}${appliedDelivery}`}</span>
              </div>
            </div>

            {/* Customer Contact Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f3e43]">
                1. Customer & WhatsApp Contact
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none transition-colors ${
                    formErrors.fullName ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                  }`}
                />
                {formErrors.fullName && <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none transition-colors ${
                      formErrors.mobileNumber ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                    }`}
                  />
                  {formErrors.mobileNumber && <p className="text-[11px] text-red-500 mt-1">{formErrors.mobileNumber}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sameAsMobile}
                        onChange={e => setFormData({ ...formData, sameAsMobile: e.target.checked })}
                        className="rounded border-stone-300 text-stone-900 focus:ring-0"
                      />
                      <span>Same as Mobile</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    disabled={formData.sameAsMobile}
                    value={formData.sameAsMobile ? formData.mobileNumber : formData.whatsappNumber}
                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none transition-colors disabled:bg-stone-50 disabled:text-stone-500 ${
                      formErrors.whatsappNumber ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                    }`}
                  />
                  {formErrors.whatsappNumber && <p className="text-[11px] text-red-500 mt-1">{formErrors.whatsappNumber}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Address Fields */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f3e43]">
                2. Delivery Address
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Delivery Address (House / Street / Area) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Flat 302, Rosewood Apartments, 12th Main, Indiranagar"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none transition-colors ${
                    formErrors.address ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                  }`}
                />
                {formErrors.address && <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-colors ${
                      formErrors.city ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                    }`}
                  />
                  {formErrors.city && <p className="text-[11px] text-red-500 mt-1">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-colors ${
                      formErrors.state ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                    }`}
                  />
                  {formErrors.state && <p className="text-[11px] text-red-500 mt-1">{formErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={e => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 560038"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none transition-colors ${
                      formErrors.pinCode ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-800'
                    }`}
                  />
                  {formErrors.pinCode && <p className="text-[11px] text-red-500 mt-1">{formErrors.pinCode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Notes / Custom Sizing Requests (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Please alter sleeve length to 18 inches, or deliver after 5 PM"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-800 transition-colors"
                />
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-4 border-t border-stone-200">
              {submitError && (
                <div className="p-3 mb-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isSubmitting ? 'Formatting Order...' : 'Submit & Generate WhatsApp Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-stone-500 mt-2">
                Opens the pre-filled message directly in WhatsApp for you to send to the designer.
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
