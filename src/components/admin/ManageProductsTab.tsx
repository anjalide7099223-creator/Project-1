import React, { useState } from 'react';
import { Search, Edit, Trash2, Check, X, Star, Eye, EyeOff, PlusCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Product } from '../../types.ts';
import { api } from '../../api.ts';

interface ManageProductsTabProps {
  onAddNewProduct: () => void;
}

export const ManageProductsTab: React.FC<ManageProductsTabProps> = ({ onAddNewProduct }) => {
  const { products, categories, adminToken, refreshProducts, settings } = useStore();
  const currency = settings?.currency || '₹';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Deletion Modal State (In-app modal instead of browser window.confirm)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStock, setEditStock] = useState('10');
  const [editDescription, setEditDescription] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Status & Notification Banners
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const showNotification = (type: 'success' | 'error', text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => {
      setBannerMessage(null);
    }, 4000);
  };

  const handleToggleActive = async (p: Product) => {
    if (!adminToken) {
      showNotification('error', 'Admin session expired. Please re-login.');
      return;
    }
    try {
      await api.updateProduct(p.id, { isActive: !p.isActive }, adminToken);
      await refreshProducts();
      showNotification('success', `Product is now ${!p.isActive ? 'Active (visible)' : 'Hidden'}.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update product visibility');
    }
  };

  const handleToggleFeatured = async (p: Product) => {
    if (!adminToken) {
      showNotification('error', 'Admin session expired. Please re-login.');
      return;
    }
    try {
      await api.updateProduct(p.id, { isFeatured: !p.isFeatured }, adminToken);
      await refreshProducts();
      showNotification('success', p.isFeatured ? 'Removed from Featured' : 'Marked as Featured');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update featured status');
    }
  };

  // Safe in-app delete execution
  const executeDelete = async () => {
    if (!productToDelete) return;
    if (!adminToken) {
      setDeleteError('Admin session expired. Please re-login from the top right.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await api.deleteProduct(productToDelete.id, adminToken);
      await refreshProducts();
      const deletedName = productToDelete.name;
      setProductToDelete(null);
      showNotification('success', `"${deletedName}" was permanently deleted.`);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete product from database');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditPrice(p.price.toString());
    setEditDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
    setEditCategory(p.category);
    setEditStock(p.stock.toString());
    setEditDescription(p.description || '');
    setEditIsFeatured(p.isFeatured);
    setEditIsActive(p.isActive);
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!adminToken) {
      setEditError('Admin session expired. Please re-login.');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      await api.updateProduct(
        editingProduct.id,
        {
          name: editName.trim(),
          price: Number(editPrice),
          discountPrice: editDiscountPrice ? Number(editDiscountPrice) : null,
          category: editCategory,
          stock: Number(editStock),
          description: editDescription.trim(),
          isFeatured: editIsFeatured,
          isActive: editIsActive,
        },
        adminToken
      );
      await refreshProducts();
      setEditingProduct(null);
      showNotification('success', `"${editName.trim()}" updated successfully.`);
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Manage Products</h2>
          <p className="text-xs text-stone-500">
            Total products: {products.length} · Showing {filteredProducts.length} filtered
          </p>
        </div>
        <button
          onClick={onAddNewProduct}
          className="px-4 py-2.5 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* In-app Notification Banner */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm transition-all animate-fadeIn ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="p-1 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-800"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none text-stone-700"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none text-stone-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="font-serif text-lg font-bold text-stone-800 mb-2">No products added yet</p>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
            Your store catalogue is completely clean and empty as requested. Start uploading your handcrafted garments, photos, and prices.
          </p>
          <button
            onClick={onAddNewProduct}
            className="px-5 py-2.5 bg-[#8f3e43] text-white text-xs font-semibold rounded-lg hover:bg-[#7b3539] transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-xs">
          No products match the selected filters or search terms.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map(product => {
                  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                  return (
                    <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                —
                              </div>
                            )}
                          </div>
                          <div className="max-w-[200px] truncate">
                            <p className="font-semibold text-stone-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-stone-400">
                              {product.colors?.length || 0} colors · {product.sizes?.length || 0} sizes
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 tabular-nums">
                        <span className="font-semibold text-stone-900">
                          {currency}{(product.discountPrice || product.price).toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-stone-400 line-through block">
                            {currency}{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 tabular-nums font-medium">
                        <span className={product.stock <= 0 ? 'text-red-600 font-bold' : 'text-stone-700'}>
                          {product.stock}
                        </span>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product)}
                          title={product.isFeatured ? 'Featured on Homepage (Click to unfeature)' : 'Click to feature on homepage'}
                          className={`p-1.5 rounded transition-colors ${
                            product.isFeatured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            product.isActive
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {product.isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            aria-label="Edit product"
                            className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError('');
                              setProductToDelete(product);
                            }}
                            aria-label="Delete product"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR DELETING PRODUCT */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl relative">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Delete Product?
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete this product? This will remove it from your store and database immediately.
                </p>
              </div>
            </div>

            {/* Product Card Preview */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="w-12 h-14 rounded bg-stone-200 overflow-hidden shrink-0 border border-stone-300">
                {productToDelete.images?.[0] ? (
                  <img
                    src={productToDelete.images[0]}
                    alt={productToDelete.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="truncate">
                <p className="font-semibold text-stone-900 text-xs truncate">
                  {productToDelete.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  Category: {productToDelete.category} · Price: {currency}{(productToDelete.discountPrice || productToDelete.price).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {deleteError}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">Edit Product Details</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-stone-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Regular Price ({currency})</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Discount Price ({currency})</label>
                  <input
                    type="number"
                    value={editDiscountPrice}
                    onChange={e => setEditDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value={editCategory}>{editCategory}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={e => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-stone-300"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={e => setEditIsFeatured(e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <span>Mark as Featured</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={e => setEditIsActive(e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <span>Active (Visible in Store)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-xs font-semibold rounded-lg"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
