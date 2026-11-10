import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  FolderTree,
  ShoppingCart,
  Palette,
  Settings,
  LogOut,
  Eye,
  Store,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Order } from '../../types.ts';
import { api } from '../../api.ts';
import { DashboardOverviewTab } from './DashboardOverviewTab.tsx';
import { AddProductTab } from './AddProductTab.tsx';
import { ManageProductsTab } from './ManageProductsTab.tsx';
import { ManageCategoriesTab } from './ManageCategoriesTab.tsx';
import { ManageOrdersTab } from './ManageOrdersTab.tsx';
import { HomepageCustomizationTab } from './HomepageCustomizationTab.tsx';
import { StoreSettingsTab } from './StoreSettingsTab.tsx';

export const AdminDashboard: React.FC = () => {
  const { adminToken, logoutAdmin, setActiveView, settings } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async () => {
    if (!adminToken) return;
    setOrdersLoading(true);
    try {
      const data = await api.getOrders(adminToken);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [adminToken]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'manage-products', label: 'Manage Products', icon: Package },
    { id: 'manage-categories', label: 'Categories', icon: FolderTree },
    { id: 'manage-orders', label: 'Orders', icon: ShoppingCart, badge: orders.filter(o => o.status === 'Pending').length },
    { id: 'homepage', label: 'Homepage', icon: Palette },
    { id: 'store-settings', label: 'Settings & WhatsApp', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-stone-900 flex flex-col">
      
      {/* Top Admin Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2d2522] text-[#e8ded3] flex items-center justify-center font-serif font-bold text-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-stone-900 block leading-tight">
                {settings?.storeName || 'Stitches of Elegance'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8f3e43] font-bold">
                Admin Control Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('shop')}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Store</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#8f3e43] text-white' : 'bg-[#8f3e43] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DashboardOverviewTab orders={orders} onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'add-product' && (
          <AddProductTab onSuccessNavigate={() => setActiveTab('manage-products')} />
        )}
        {activeTab === 'manage-products' && (
          <ManageProductsTab onAddNewProduct={() => setActiveTab('add-product')} />
        )}
        {activeTab === 'manage-categories' && (
          <ManageCategoriesTab />
        )}
        {activeTab === 'manage-orders' && (
          <ManageOrdersTab orders={orders} onRefreshOrders={fetchOrders} />
        )}
        {activeTab === 'homepage' && (
          <HomepageCustomizationTab />
        )}
        {activeTab === 'store-settings' && (
          <StoreSettingsTab />
        )}
      </main>

    </div>
  );
};
