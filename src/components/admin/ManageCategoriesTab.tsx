import React, { useState } from 'react';
import { FolderTree, Plus, Trash2, FolderPlus, Tag, Check, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../api.ts';

export const ManageCategoriesTab: React.FC = () => {
  const { categories, products, adminToken, refreshCategories } = useStore();
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // In-app Category Delete Modal State
  const [catToDelete, setCatToDelete] = useState<{ id: string; name: string; count: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 3500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !adminToken) return;

    setLoading(true);
    setError('');

    try {
      await api.createCategory({ name: newCatName.trim() }, adminToken);
      await refreshCategories();
      showBanner('success', `Category "${newCatName.trim()}" created successfully.`);
      setNewCatName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const promptDelete = (catId: string, catName: string) => {
    const count = products.filter(p => p.category === catName).length;
    setCatToDelete({ id: catId, name: catName, count });
    setDeleteError('');
  };

  const executeDeleteCategory = async () => {
    if (!catToDelete || !adminToken) return;

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await api.deleteCategory(catToDelete.id, adminToken);
      await refreshCategories();
      const name = catToDelete.name;
      setCatToDelete(null);
      showBanner('success', `Category "${name}" was deleted successfully.`);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="pb-4 border-b border-stone-200">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Manage Categories</h2>
        <p className="text-xs text-stone-500">
          Create collections for your boutique (e.g. Sarees, Lehengas, Kurtis, Bridal, Indo-Western).
        </p>
      </div>

      {banner && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-medium animate-fadeIn ${
            banner.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Add Category Form */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h3 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-[#8f3e43]" />
          <span>Add New Category</span>
        </h3>

        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="Category name (e.g. Festive Silk Kurtis)"
            className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Adding...' : 'Add Category'}</span>
          </button>
        </form>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Current Store Categories ({categories.length})
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <FolderTree className="w-8 h-8 stroke-1 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No categories created yet</p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              Add your custom categories above. Only categories you create will be shown to customers.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {categories.map(cat => {
              const productCount = products.filter(p => p.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 flex items-center justify-between hover:bg-stone-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f5ede4] text-[#8f3e43] flex items-center justify-center">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{cat.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Slug: <code className="font-mono">{cat.slug}</code> · {productCount} product{productCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => promptDelete(cat.id, cat.name)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-app Category Delete Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl relative">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Delete Category?
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Are you sure you want to delete category <strong>"{catToDelete.name}"</strong>?
                  {catToDelete.count > 0 && (
                    <span className="block mt-1 text-amber-700 font-medium">
                      ⚠️ Note: There are currently {catToDelete.count} product(s) assigned to this category.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={executeDeleteCategory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete Category'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
