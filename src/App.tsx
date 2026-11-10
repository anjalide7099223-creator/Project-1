/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './components/views/HomeView.tsx';
import { ShopView } from './components/views/ShopView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';

function StoreApp() {
  const { activeView, checkoutPayload, closeCheckout, loading } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-[#f0e4d8] selection:text-[#8f3e43]">
      
      {/* If in admin view, display the comprehensive admin control suite */}
      {activeView === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
          {/* Public Storefront Header */}
          <Header />

          {/* Main View Area */}
          <main className="flex-1">
            {activeView === 'home' && <HomeView />}
            {activeView === 'shop' && <ShopView />}
          </main>

          {/* Public Storefront Footer */}
          <Footer />
        </>
      )}

      {/* Global Interactive Drawers & Modals */}
      <CartDrawer />
      <ProductDetailModal />
      <CheckoutModal
        isOpen={Boolean(checkoutPayload)}
        items={checkoutPayload?.items || []}
        isBuyNow={checkoutPayload?.isBuyNow || false}
        onClose={closeCheckout}
      />
      <AdminLoginModal />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
