import React, { useState } from 'react';
import { Upload, Check, Image as ImageIcon, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../api.ts';

export const HomepageCustomizationTab: React.FC = () => {
  const { settings, adminToken, refreshSettings } = useStore();

  const [heroHeading, setHeroHeading] = useState(settings?.heroHeading || '');
  const [heroSubheading, setHeroSubheading] = useState(settings?.heroSubheading || '');
  const [heroButtonText, setHeroButtonText] = useState(settings?.heroButtonText || 'Explore Collection');
  const [bannerUrl, setBannerUrl] = useState(settings?.bannerUrl || '');
  
  const [aboutHeading, setAboutHeading] = useState(settings?.aboutHeading || '');
  const [aboutStory, setAboutStory] = useState(settings?.aboutStory || '');

  const [announcementBarText, setAnnouncementBarText] = useState(settings?.announcementBarText || '');
  const [showAnnouncement, setShowAnnouncement] = useState(settings?.showAnnouncement ?? true);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;

    setUploadingBanner(true);
    setError('');
    try {
      const url = await api.uploadImage(file, adminToken);
      setBannerUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await api.updateSettings(
        {
          heroHeading,
          heroSubheading,
          heroButtonText,
          bannerUrl,
          aboutHeading,
          aboutStory,
          announcementBarText,
          showAnnouncement,
        },
        adminToken
      );
      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save homepage settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="pb-4 border-b border-stone-200">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Homepage Customization</h2>
        <p className="text-xs text-stone-500">
          Personalize hero banners, headlines, craftsmanship narrative, and promotional announcements.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Homepage content updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Top Announcement Bar */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-stone-900">Top Announcement Ribbon</h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnnouncement}
                onChange={e => setShowAnnouncement(e.target.checked)}
                className="rounded border-stone-300 text-stone-900"
              />
              <span>Show Banner</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementBarText}
              onChange={e => setAnnouncementBarText(e.target.value)}
              placeholder="e.g. ✨ Handcrafted with love · Seamless ordering directly on WhatsApp · Nationwide Delivery"
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 bg-white"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Hero Section</h3>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hero Heading
            </label>
            <input
              type="text"
              value={heroHeading}
              onChange={e => setHeroHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hero Subheading
            </label>
            <textarea
              rows={2}
              value={heroSubheading}
              onChange={e => setHeroSubheading(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Primary Button Label
              </label>
              <input
                type="text"
                value={heroButtonText}
                onChange={e => setHeroButtonText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hero Background Banner
              </label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBanner ? 'Uploading...' : 'Upload Banner Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                </label>
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={() => setBannerUrl('')}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {bannerUrl && (
            <div className="relative aspect-[16/6] rounded-lg overflow-hidden border border-stone-200 mt-2">
              <img src={bannerUrl} alt="Banner Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">About Us / Craftsmanship Story</h3>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={aboutHeading}
              onChange={e => setAboutHeading(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Your Brand Story Narrative
            </label>
            <textarea
              rows={4}
              value={aboutStory}
              onChange={e => setAboutStory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-stone-300 leading-relaxed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-[#8f3e43] hover:bg-[#7b3539] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Homepage Customization'}
        </button>

      </form>
    </div>
  );
};
