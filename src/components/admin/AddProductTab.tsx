import React, { useState, useRef } from 'react';
import { Upload, X, Plus, Trash2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { ProductColor } from '../../types.ts';
import { api } from '../../api.ts';

interface AddProductTabProps {
  onSuccessNavigate?: () => void;
}

export const AddProductTab: React.FC<AddProductTabProps> = ({ onSuccessNavigate }) => {
  const { categories, adminToken, refreshProducts, settings } = useStore();
  const currency = settings?.currency || '₹';

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Apparel');
  const [newCatInput, setNewCatInput] = useState('');
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Sizes
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Colours (each can have its own name, hex, and dedicated image upload!)
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8f3e43');
  const [colorUploadingIdx, setColorUploadingIdx] = useState<number | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Gallery Image Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !adminToken) return;

    setIsUploadingGallery(true);
    setErrorMsg('');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await api.uploadImage(file, adminToken);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload image(s)');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Sizes management
  const addSize = (sizeToAdd: string) => {
    const clean = sizeToAdd.trim();
    if (clean && !sizes.includes(clean)) {
      setSizes(prev => [...prev, clean]);
    }
    setCustomSizeInput('');
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes(prev => prev.filter(s => s !== sizeToRemove));
  };

  // Colours management
  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors(prev => [
      ...prev,
      {
        name: newColorName.trim(),
        hex: newColorHex,
        imageUrl: '',
      },
    ]);
    setNewColorName('');
  };

  const removeColor = (index: number) => {
    setColors(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleColorImageUpload = async (index: number, file: File) => {
    if (!adminToken) return;
    setColorUploadingIdx(index);
    try {
      const url = await api.uploadImage(file, adminToken);
      setColors(prev => {
        const next = [...prev];
        next[index] = { ...next[index], imageUrl: url };
        return next;
      });
      // Also add to gallery if not present
      if (!images.includes(url)) {
        setImages(prev => [...prev, url]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload colour variation photo');
    } finally {
      setColorUploadingIdx(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Please upload at least one product photo from your device');
      return;
    }
    if (!adminToken) {
      setErrorMsg('Admin session expired. Please re-login.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const targetCategory = newCatInput.trim() ? newCatInput.trim() : category;

      await api.createProduct(
        {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : null,
          category: targetCategory,
          stock: Number(stock) || 0,
          images,
          colors,
          sizes,
          isFeatured,
          isActive,
        },
        adminToken
      );

      await refreshProducts();

      setSuccessMsg(`"${name}" was created and saved to the database successfully!`);
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setImages([]);
      setColors([]);
      setNewCatInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Add New Product</h2>
          <p className="text-xs text-stone-500">
            Upload images from your device, configure pricing in {currency}, and assign colour/size variations.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          {onSuccessNavigate && (
            <button
              onClick={onSuccessNavigate}
              className="text-xs font-bold underline text-emerald-800 ml-4 hover:text-emerald-950"
            >
              View in Manage Products →
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
          <X className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Product Images Upload */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#8f3e43]" />
                <span>Product Images (From Your Device)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Upload real photos of your garment. First image becomes the primary thumbnail.
              </p>
            </div>
            <span className="text-xs font-medium text-stone-500">
              {images.length} photo{images.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => galleryFileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-xl p-8 text-center bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <input
              type="file"
              ref={galleryFileInputRef}
              onChange={handleGalleryUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#f4ebe1] text-[#8f3e43] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-900">
              {isUploadingGallery ? 'Uploading photos to server...' : 'Click to select & upload photos from your device'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Supports PNG, JPG, JPEG, WebP up to 15MB each
            </p>
          </div>

          {/* Uploaded Thumbnails Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group bg-stone-100">
                  <img src={url} alt={`Preview ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-stone-900/80 text-white text-[9px] font-bold rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Basic Details */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Basic Details</h3>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Embroidered Organza Silk Kurti Set"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                {categories.length === 0 && <option value="General">General Collection</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Or Type New Category
              </label>
              <input
                type="text"
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                placeholder="e.g. Kurtis, Lehengas"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Regular Price ({currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 2499"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Discounted / Offer Price ({currency}) (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={discountPrice}
                onChange={e => setDiscountPrice(e.target.value)}
                placeholder="e.g. 1999"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description & Craftsmanship Details
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the fabric, embroidery technique, fit, wash care, and styling advice..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        {/* Section 3: Colour Variations with Specific Image Upload */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Colour Variations & Dedicated Colour Images</span>
            </h3>
            <p className="text-xs text-stone-500">
              When a customer clicks a colour in your store, the displayed image will automatically switch to that colour's photo!
            </p>
          </div>

          {/* Add Colour Strip */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <input
              type="text"
              value={newColorName}
              onChange={e => setNewColorName(e.target.value)}
              placeholder="Colour name (e.g. Rose Gold, Emerald Green)"
              className="flex-1 min-w-[200px] px-3 py-1.5 text-sm rounded border border-stone-300 bg-white"
            />
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-stone-500">Swatch:</label>
              <input
                type="color"
                value={newColorHex}
                onChange={e => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0.5"
              />
            </div>
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Colour</span>
            </button>
          </div>

          {/* Existing Colours List */}
          {colors.length > 0 && (
            <div className="space-y-3 pt-2">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50/70 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-stone-400 shrink-0"
                      style={{ backgroundColor: color.hex || '#ccc' }}
                    />
                    <span className="text-sm font-semibold text-stone-800">{color.name}</span>
                  </div>

                  {/* Upload photo for this colour */}
                  <div className="flex items-center gap-3">
                    {color.imageUrl ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={color.imageUrl}
                          alt={color.name}
                          className="w-10 h-10 rounded object-cover border border-stone-300"
                        />
                        <span className="text-[11px] text-emerald-700 font-medium">✓ Photo linked</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400">No specific photo</span>
                    )}

                    <label className="px-3 py-1 text-xs bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded cursor-pointer font-medium">
                      {colorUploadingIdx === idx ? 'Uploading...' : 'Upload Colour Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            handleColorImageUpload(idx, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="text-stone-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Sizes */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Available Sizes</h3>
          <p className="text-xs text-stone-500">
            Customers will choose their size before ordering on WhatsApp.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {sizes.map(size => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-md border border-stone-200"
              >
                <span>{size}</span>
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="text-stone-400 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="text"
              value={customSizeInput}
              onChange={e => setCustomSizeInput(e.target.value)}
              placeholder="Add size (e.g. XXL, Free Size, 32, 34)"
              className="px-3 py-1.5 text-xs rounded border border-stone-300 bg-white flex-1"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSize(customSizeInput);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addSize(customSizeInput)}
              className="px-3 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded hover:bg-stone-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 5: Visibility & Featured */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900">Publishing Options</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-stone-900"
              />
              <div>
                <span className="text-xs font-bold text-stone-900">Mark as Featured Product</span>
                <p className="text-[11px] text-stone-500">Highlights this garment in the homepage Featured collection</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-stone-900"
              />
              <div>
                <span className="text-xs font-bold text-stone-900">Active (Visible in Public Store)</span>
                <p className="text-[11px] text-stone-500">Uncheck to hide without deleting from your dashboard</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-[#8f3e43] hover:bg-[#7b3539] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Saving Product to Database...' : 'Save & Publish Product'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
