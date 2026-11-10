import React from 'react';
import { Package, FolderTree, ShoppingCart, Eye, PlusCircle, Settings, MessageSquare, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Order } from '../../types.ts';

interface DashboardOverviewProps {
  orders: Order[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewProps> = ({ orders, onNavigateTab }) => {
  const { products, categories, settings, setActiveView } = useStore();
  const currency = settings?.currency || '₹';

  const activeProducts = products.filter(p => p.isActive).length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-[#2d2522] text-[#f5ede4] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#d8c5b5] font-semibold">Store Manager</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            {settings?.storeName || 'Stitches of Elegance'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            WhatsApp Storefront is online · WhatsApp recipient: <strong>{settings?.whatsappNumber}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('shop')}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Store</span>
          </button>
          <button
            onClick={() => onNavigateTab('add-product')}
            className="px-4 py-2 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Products</span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold text-stone-900 tabular-nums">{products.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">{activeProducts} published / active</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Categories</span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold text-stone-900 tabular-nums">{categories.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">Admin-created collections</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">WhatsApp Orders</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold text-stone-900 tabular-nums">{orders.length}</p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">{pendingOrders} pending inquiry</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Order Volume</span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <span className="font-bold font-serif text-stone-700 text-sm">{currency}</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold text-stone-900 tabular-nums">
              {currency}{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Submitted via WhatsApp</p>
          </div>
        </div>

      </div>

      {/* Quick Actions & Recent Orders Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent WhatsApp Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Recent WhatsApp Orders
            </h3>
            <button
              onClick={() => onNavigateTab('manage-orders')}
              className="text-xs font-semibold text-[#8f3e43] hover:underline flex items-center gap-1"
            >
              <span>View all ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <ShoppingCart className="w-8 h-8 stroke-1 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">No orders logged yet</p>
              <p className="text-xs text-stone-400 mt-1">
                When customers checkout, orders are registered here and sent to your WhatsApp.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900 font-mono">#{order.id}</span>
                      <span className="text-xs font-medium text-stone-800">{order.customerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : order.status === 'Pending'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} · {order.city}, {order.state} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-sm font-bold text-stone-900 tabular-nums">
                      {currency}{order.total.toLocaleString('en-IN')}
                    </span>
                    <div>
                      <a
                        href={`https://wa.me/${order.customerWhatsApp?.replace(/\D/g, '') || order.customerPhone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 hover:underline flex items-center justify-end gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Setup & Store Status */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Quick Actions
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('add-product')}
              className="w-full p-3 text-left rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-stone-900">Add New Product</p>
                <p className="text-[11px] text-stone-500">Upload photos, set prices & colors</p>
              </div>
              <PlusCircle className="w-4 h-4 text-[#8f3e43]" />
            </button>

            <button
              onClick={() => onNavigateTab('manage-categories')}
              className="w-full p-3 text-left rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-stone-900">Manage Categories</p>
                <p className="text-[11px] text-stone-500">Create custom store collections</p>
              </div>
              <FolderTree className="w-4 h-4 text-stone-600" />
            </button>

            <button
              onClick={() => onNavigateTab('store-settings')}
              className="w-full p-3 text-left rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-stone-900">WhatsApp & Settings</p>
                <p className="text-[11px] text-stone-500">Update phone, fees & store info</p>
              </div>
              <Settings className="w-4 h-4 text-stone-600" />
            </button>

            <button
              onClick={() => onNavigateTab('homepage')}
              className="w-full p-3 text-left rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-stone-900">Customize Homepage</p>
                <p className="text-[11px] text-stone-500">Hero banners, headlines & story</p>
              </div>
              <Eye className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          <div className="pt-4 border-t border-stone-100 text-xs text-stone-500">
            <p className="font-semibold text-stone-800 mb-1">Catalog Status</p>
            {products.length === 0 ? (
              <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200/80">
                ⚠️ Store catalog is completely empty. The public website displays <strong>"Products Coming Soon"</strong>.
              </p>
            ) : (
              <p className="text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200/80">
                ✅ {products.length} product{products.length > 1 ? 's' : ''} live in your catalog.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
