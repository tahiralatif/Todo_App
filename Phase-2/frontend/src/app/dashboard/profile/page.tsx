'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, Upload, Trash2, X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Profile } from '@/types';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data as Profile);
      setFormData({
        name: (data as Profile).name || '',
        first_name: (data as Profile).first_name || '',
        last_name: (data as Profile).last_name || '',
        phone: (data as Profile).phone || '',
        date_of_birth: (data as Profile).date_of_birth || '',
        gender: (data as Profile).gender || '',
        address: (data as Profile).address || '',
        city: (data as Profile).city || '',
        country: (data as Profile).country || '',
        bio: (data as Profile).bio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.updateProfile(formData);
      await refreshUser();
      await loadProfile();
      showToast('Profile updated successfully!', 'success');
      // Notify dashboard to refresh
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setShowCropModal(true);
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      
      if (!canvas || !image) {
        reject(new Error('Canvas or image not found'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to desired output size
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Save context state
      ctx.save();

      // Move to center
      ctx.translate(size / 2, size / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply zoom and draw image centered
      const scaledWidth = image.naturalWidth * zoom;
      const scaledHeight = image.naturalHeight * zoom;
      ctx.drawImage(
        image,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      // Restore context state
      ctx.restore();

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create blob'));
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropAndUpload = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImage();
      const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      
      await api.uploadProfilePhoto(file);
      await loadProfile();
      showToast('Profile photo uploaded successfully!', 'success');
      setShowCropModal(false);
      setSelectedImage(null);
      // Notify dashboard to refresh
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error('Failed to upload photo:', error);
      showToast('Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return;

    try {
      await api.deleteProfilePhoto();
      await loadProfile();
      showToast('Profile photo deleted successfully!', 'success');
      // Notify dashboard to refresh
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error('Failed to delete photo:', error);
      showToast('Failed to delete photo', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-slate-400">Manage your account information</p>
      </div>

      {/* Profile Photo */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            {profile?.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt="Profile"
                className="w-32 h-32 rounded-2xl object-cover border-2 border-teal-500 shadow-lg shadow-teal-500/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-teal-500/20 flex items-center justify-center border-2 border-teal-500/30">
                <User className="w-16 h-16 text-teal-400" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-3">
              Click on the photo to upload and crop. JPG, PNG, WebP or GIF. Max size 5MB.
            </p>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all cursor-pointer">
                <Upload className="w-5 h-5" />
                Upload New Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {profile?.profile_photo_url && (
                <button
                  onClick={handleDeletePhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && setShowCropModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Crop & Adjust Photo
                </h3>
                <button
                  onClick={() => !uploading && setShowCropModal(false)}
                  disabled={uploading}
                  className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Preview Area */}
              <div className="relative bg-slate-800/50 rounded-2xl p-8 mb-6 overflow-hidden">
                <div className="relative w-full h-96 flex items-center justify-center">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out'
                    }}
                  />
                </div>
                {/* Hidden canvas for cropping */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls */}
              <div className="space-y-4 mb-6">
                {/* Zoom Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <ZoomIn className="w-4 h-4" />
                      Zoom
                    </label>
                    <span className="text-sm text-slate-400">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Rotation Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      Rotation
                    </label>
                    <span className="text-sm text-slate-400">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => !uploading && setShowCropModal(false)}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropAndUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Photo
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Karachi"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Pakistan"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio (Max 3 lines)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                if (lines.length <= 3) {
                  setFormData({ ...formData, bio: e.target.value });
                } else {
                  // Limit to 3 lines
                  setFormData({ ...formData, bio: lines.slice(0, 3).join('\n') });
                }
              }}
              placeholder="Tell us about yourself... (Maximum 3 lines)"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              {formData.bio.split('\n').length}/3 lines • {formData.bio.length}/200 characters
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
