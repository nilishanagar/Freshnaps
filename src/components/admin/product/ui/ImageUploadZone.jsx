import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { adminService } from '../../../../services';
import toast from 'react-hot-toast';

/**
 * ImageUploadZone with premium aesthetics, drag and drop, cover photo selection, and reordering.
 */
const ImageUploadZone = ({ images = [], onChange, onUploadingChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    onUploadingChange?.(true);

    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('images', file);

        const res = await adminService.uploadImages(formData);
        const uploadedImg = res.data.images?.[0];
        if (!uploadedImg) throw new Error('No image returned from server');
        const imgUrl = uploadedImg.url;
        const publicId = uploadedImg.publicId || '';

        newImages.push({
          url: imgUrl,
          publicId,
          isPrimary: newImages.length === 0,
          sortOrder: newImages.length,
        });
      }
      onChange(newImages);
      toast.success('Images uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      onUploadingChange?.(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFiles(e.target.files);
    }
  };

  const removeImage = async (index, publicId) => {
    const isPrimary = images[index].isPrimary;
    const updated = images.filter((_, i) => i !== index);

    // Re-index sortOrder
    updated.forEach((img, i) => {
      img.sortOrder = i;
    });

    // Handle primary re-assignment
    if (isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    onChange(updated);

    if (publicId) {
      try {
        await adminService.deleteImage(publicId);
      } catch {
        // Silent fail if backend delete fails, we still updated local state
      }
    }
  };

  const setPrimary = (index) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-200 min-h-[160px] ${
          dragActive
            ? 'border-gold-500 bg-gold-50/30 dark:bg-gold-500/5'
            : 'border-gray-200 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/50 hover:bg-gray-50 dark:hover:bg-navy-900'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={loading}
        />
        <div className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
          {loading ? (
            <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          )}
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {loading ? 'Uploading...' : 'Drag & drop your files here, or browse'}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Supports JPEG, PNG, WebP up to 5MB
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              {/* Badges & Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between items-center w-full">
                  <button
                    type="button"
                    onClick={() => removeImage(idx, img.publicId)}
                    className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  {img.isPrimary && (
                    <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-gold-500 rounded-full">
                      Cover
                    </span>
                  )}
                </div>
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="w-full text-center py-1 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
                  >
                    Set Cover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;
