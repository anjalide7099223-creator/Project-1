import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, Phone, MapPin, Calendar, Clock, ExternalLink, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Order } from '../../types.ts';
import { api } from '../../api.ts';

interface ManageOrdersTabProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

const STATUS_OPTIONS: Order['status'][] = [
  'Pending',
  'Contacted',
  'Confirmed',
  'Shipped',
  'Completed',
  'Cancelled',
];

export const ManageOrdersTab: React.FC<ManageOrdersTabProps> = ({ orders, onRefreshOrders }) => {
  const { adminToken, settings } = useStore();
  const currency = settings?.currency || '₹';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (!adminToken) return;
    try {
      await api.updateOrderStatus(orderId, newStatus, adminToken);
      onRefreshOrders();
      setStatusNotification(`Order #${orderId} updated to ${newStatus}`);
      setTimeout(() => setStatusNotification(null), 3000);
    } catch (err: any) {
      setStatusNotification(err.message || 'Failed to update order status');
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Confirmed':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Manage Orders</h2>
          <p className="text-xs text-stone-500">
            Audit and track customer checkout submissions. Chat directly with customers on WhatsApp.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white"
          >
            <option value="all">All Orders ({orders.length})</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s} ({orders.filter(o => o.status === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {statusNotification && (
        <div className="p-3 bg-stone-900 text-white text-xs font-medium rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
          <span>{statusNotification}</span>
          <button onClick={() => setStatusNotification(null)} className="text-stone-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
          <ShoppingBag className="w-12 h-12 stroke-1 mx-auto mb-3 text-stone-300" />
          <h3 className="font-serif text-base font-bold text-stone-800 mb-1">
            No WhatsApp Orders Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When shoppers checkout on your website, their orders are logged here and sent straight to your WhatsApp.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-xs">
          No orders with status "{statusFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const customerWhatsApp = order.customerWhatsApp?.replace(/\D/g, '') || order.customerPhone?.replace(/\D/g, '');

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-all"
              >
                {/* Order Summary Strip */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        #{order.id}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900">
                        {order.customerName}
                      </h4>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {order.city}, {order.state} ({order.pinCode})
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <div className="text-right">
                      <span className="font-serif text-lg font-bold text-stone-950 tabular-nums">
                        {currency}{order.total.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-stone-500">
                        Subtotal {currency}{order.subtotal} + Delivery {order.deliveryCharge === 0 ? 'Free' : `${currency}${order.deliveryCharge}`}
                      </p>
                    </div>

                    {/* Direct WhatsApp Chat with Customer */}
                    <a
                      href={`https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(
                        `Hi ${order.customerName}, this is ${settings?.storeName || 'Stitches of Elegance'}. Regarding your order #${order.id}...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                      title="Direct Chat on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-stone-200 p-5 bg-stone-50/70 space-y-6 animate-fadeIn">
                    
                    {/* Status Changer & Quick Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-700">Update Order Status:</span>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className="px-2.5 py-1 text-xs rounded border border-stone-300 font-semibold bg-white"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-xs text-stone-500 flex items-center gap-2">
                        <span>Customer Phone: <strong>{order.customerPhone}</strong></span>
                        {order.customerWhatsApp && order.customerWhatsApp !== order.customerPhone && (
                          <span>· WhatsApp: <strong>{order.customerWhatsApp}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Customer & Delivery Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-stone-200 space-y-1.5 text-xs">
                        <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                          Delivery Information
                        </p>
                        <p className="font-medium text-stone-800">{order.customerName}</p>
                        <p className="text-stone-600 whitespace-pre-line">{order.deliveryAddress}</p>
                        <p className="text-stone-600">{order.city}, {order.state} - {order.pinCode}</p>
                        {order.notes && (
                          <div className="mt-2 pt-2 border-t border-stone-100">
                            <span className="font-semibold text-stone-800">Customer Notes: </span>
                            <span className="italic text-stone-600">"{order.notes}"</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-stone-200 space-y-2 text-xs">
                        <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                          WhatsApp Order Message
                        </p>
                        <p className="text-stone-500 text-[11px]">
                          The customer was directed to send their formatted order via WhatsApp click-to-chat.
                        </p>
                        <a
                          href={order.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View full formatted WhatsApp click-to-chat link</span>
                        </a>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-600">
                          <tr>
                            <th className="py-2.5 px-3">Item</th>
                            <th className="py-2.5 px-3">Colour / Size</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Price</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 flex items-center gap-2">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-8 h-10 object-cover rounded border border-stone-200 shrink-0"
                                  />
                                )}
                                <span className="font-medium text-stone-900">{item.productName}</span>
                              </td>
                              <td className="py-2.5 px-3 text-stone-600">
                                {[item.color, item.size].filter(Boolean).join(' · ') || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold tabular-nums">
                                {item.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-stone-700">
                                {currency}{item.price.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-stone-900">
                                {currency}{item.subtotal.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-stone-50/50 border-t border-stone-200 font-semibold">
                          <tr>
                            <td colSpan={4} className="py-2 px-3 text-right text-stone-600">Subtotal:</td>
                            <td className="py-2 px-3 text-right tabular-nums text-stone-900">{currency}{order.subtotal.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="py-2 px-3 text-right text-stone-600">Delivery:</td>
                            <td className="py-2 px-3 text-right tabular-nums text-stone-900">
                              {order.deliveryCharge === 0 ? 'FREE' : `${currency}${order.deliveryCharge.toLocaleString('en-IN')}`}
                            </td>
                          </tr>
                          <tr className="border-t border-stone-200 text-stone-950 font-bold">
                            <td colSpan={4} className="py-2 px-3 text-right font-serif">Final Total:</td>
                            <td className="py-2 px-3 text-right font-serif text-sm tabular-nums">{currency}{order.total.toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
