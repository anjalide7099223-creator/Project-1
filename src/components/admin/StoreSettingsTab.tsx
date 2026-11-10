import React, { useState } from 'react';
import { Check, Upload, MessageCircle, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../api.ts';
import { formatWhatsAppNumber } from '../../utils/whatsapp.ts';

export const StoreSettingsTab: React.FC = () => {
  const { settings, adminToken, refreshSettings } = useStore();

  const [storeName, setStoreName] = useState(settings?.storeName || '');
  const [tagline, setTagline] = useState(settings?.tagline || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber || '');
  const [currency, setCurrency] = useState(settings?.currency || '₹');
  const [email, setEmail] = useState(settings?.email || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagramUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(settings?.facebookUrl || '');
  const [deliveryCharge, setDeliveryCharge] = useState(settings?.deliveryCharge?.toString() || '60');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings?.freeDeliveryThreshold?.toString() || '999');
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // UI state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;

    setUploadingLogo(true);
    try {
      const url = await api.uploadImage(file, adminToken);
      setLogoUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    setSavingSettings(true);
    setErrorMsg('');
    setSettingsSuccess(false);

    try {
      await api.updateSettings(
        {
          storeName: storeName.trim(),
          tagline: tagline.trim(),
          whatsappNumber: whatsappNumber.trim(),
          currency: currency.trim() || '₹',
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          instagramUrl: instagramUrl.trim(),
          facebookUrl: facebookUrl.trim(),
          deliveryCharge: Number(deliveryCharge) || 0,
          freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
          logoUrl,
        },
        adminToken
      );
      await refreshSettings();
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }
    if (newPassword.length < 4) {
      setPassError('Password must be at least 4 characters long');
      return;
    }

    setPassLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword, adminToken);
      setPassSuccess('Admin password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const testWhatsAppUrl = `https://wa.me/${formatWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(
    `Hello from ${storeName || 'Store'}! WhatsApp link test successful.`
  )}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <div className="pb-4 border-b border-stone-200">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Store & WhatsApp Settings</h2>
        <p className="text-xs text-stone-500">
          Configure WhatsApp recipient phone number, delivery fees, branding, and contact channels.
        </p>
      </div>

      {settingsSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: WhatsApp Configuration (Crucial) */}
        <div className="bg-emerald-50/60 p-6 rounded-xl border border-emerald-200/80 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-700" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              WhatsApp Order Recipient Number
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            All customer checkout submissions generate a pre-formatted message sent to this number. Include country code (e.g. <strong>919876543210</strong> for India without '+').
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                WhatsApp Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 bg-white font-mono"
                required
              />
            </div>

            <div>
              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <p className="text-[11px] text-stone-500">
            Current normalized format: <code className="font-mono font-bold">{formatWhatsAppNumber(whatsappNumber)}</code>
          </p>
        </div>

        {/* Section 2: Store Branding */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Store Branding</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Handmade with Love"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Store Logo Image
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-300 shrink-0 bg-white shadow-xs">
                  <img src={logoUrl} alt="Store Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-xs text-stone-400">
                  No Logo
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo from Device'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <p className="text-[11px] text-stone-500">
                  Recommended: Circular or square high-resolution image
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Fees & Currency */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Pricing & Delivery Rules</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Standard Delivery Charge ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={e => setDeliveryCharge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Free Delivery Above ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Contact & Social Info */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Contact & Social Channels</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Store Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Studio / Workshop Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={e => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          {savingSettings ? 'Saving Settings...' : 'Save All Store Settings'}
        </button>

      </form>

      {/* Section 5: Change Admin Password */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#8f3e43]" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Change Admin Password
          </h3>
        </div>
        <p className="text-xs text-stone-500">
          Ensure your dashboard remains private and secure.
        </p>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
            {passError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {passLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};
