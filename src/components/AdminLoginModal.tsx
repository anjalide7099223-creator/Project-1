import React, { useState } from 'react';
import { X, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { api } from '../api.ts';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginOpen, setIsAdminLoginOpen, loginAdmin, setActiveView } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdminLoginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await api.login(password);
      loginAdmin(token);
      setActiveView('admin');
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAdminLoginOpen(false);
            setError('');
            setPassword('');
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          
          <div className="w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center mb-4 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">
            Store Owner Portal
          </h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Enter your admin password to manage products, categories, orders, and store settings.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
              {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Initial password credential notice */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <div className="inline-block p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-left text-xs text-amber-900">
              <p className="font-semibold mb-0.5">🔑 First time logging in?</p>
              <p className="text-[11px] text-amber-800">
                Default password: <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">admin</code>
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                (You can change this password anytime in Store Settings)
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
