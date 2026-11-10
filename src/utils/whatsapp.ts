import { OrderItem } from '../types.ts';

export interface WhatsAppOrderPayload {
  customerName: string;
  customerPhone: string;
  customerWhatsApp: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  storeName: string;
  currency: string;
  ownerWhatsApp: string;
}

/**
 * Normalizes phone number into international format without '+' or spaces.
 * Defaults to prepending '91' if a standard 10-digit Indian number is provided.
 */
export function formatWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (!digitsOnly) return '919876543210';
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Builds a clean, professional, readable WhatsApp order message.
 */
export function generateWhatsAppOrderMessage(payload: WhatsAppOrderPayload): string {
  const {
    customerName,
    customerPhone,
    customerWhatsApp,
    deliveryAddress,
    city,
    state,
    pinCode,
    notes,
    items,
    subtotal,
    deliveryCharge,
    total,
    storeName,
    currency,
  } = payload;

  const itemLines = items
    .map((item, idx) => {
      const parts = [`${idx + 1}. *${item.productName}*`];
      if (item.color) parts.push(`   • Colour: ${item.color}`);
      if (item.size) parts.push(`   • Size: ${item.size}`);
      parts.push(`   • Qty: ${item.quantity} × ${currency}${item.price.toLocaleString('en-IN')}`);
      parts.push(`   • Subtotal: ${currency}${item.subtotal.toLocaleString('en-IN')}`);
      if (item.imageUrl) {
        // If image is a local path, add host URL when possible
        const fullImg = item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `${typeof window !== 'undefined' ? window.location.origin : ''}${item.imageUrl}`;
        parts.push(`   • Image: ${fullImg}`);
      }
      return parts.join('\n');
    })
    .join('\n\n');

  const lines = [
    `🛍️ *NEW ORDER REQUEST - ${storeName.toUpperCase()}*`,
    `══════════════════════════`,
    `👤 *CUSTOMER DETAILS*`,
    `• Name: ${customerName}`,
    `• Mobile: ${customerPhone}`,
    customerWhatsApp && customerWhatsApp !== customerPhone ? `• WhatsApp: ${customerWhatsApp}` : null,
    ``,
    `📍 *DELIVERY ADDRESS*`,
    `• Address: ${deliveryAddress}`,
    `• City: ${city}`,
    `• State: ${state}`,
    `• PIN Code: ${pinCode}`,
    notes ? `• Additional Notes: ${notes}` : null,
    ``,
    `📦 *ORDER ITEMS*`,
    itemLines,
    ``,
    `══════════════════════════`,
    `💰 *PAYMENT SUMMARY*`,
    `• Subtotal: ${currency}${subtotal.toLocaleString('en-IN')}`,
    `• Delivery: ${deliveryCharge === 0 ? 'FREE' : `${currency}${deliveryCharge.toLocaleString('en-IN')}`}`,
    `• *FINAL TOTAL AMOUNT: ${currency}${total.toLocaleString('en-IN')}*`,
    `══════════════════════════`,
    ``,
    `💬 *Kindly confirm my order and share payment/delivery schedule.* Thank you!`,
  ].filter(line => line !== null);

  return lines.join('\n');
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanNumber = formatWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
