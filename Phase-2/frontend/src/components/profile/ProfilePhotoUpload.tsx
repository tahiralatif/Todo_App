'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api-client';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ProfilePhotoUpload: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setSuccess('');
    setIsUploading(true);

    try {
      const response = await apiClient.uploadProfilePhoto(file);
      await updateProfile({ profile_photo_url: response.url || response.photo_url });
      setSuccess('Profile photo updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    setError('');
    setSuccess('');
    setIsUploading(true);

    try {
      await apiClient.deleteProfilePhoto();
      await updateProfile({ profile_photo_url: null });
      setSuccess('Profile photo removed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to remove profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Profile Photo</h3>

      <div className="flex items-center space-x-6">
        {/* Current Profile Photo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center overflow-hidden">
            {user?.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-3">
            <motion.button
              onClick={handleUploadClick}
              disabled={isUploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </motion.button>

            {user?.profile_photo_url && (
              <motion.button
                onClick={handleRemovePhoto}
                disabled={isUploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </motion.button>
            )}
          </div>

          <p className="text-sm text-gray-400">
            Recommended: Square image, at least 200x200px. Max size: 5MB
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm"
        >
          {success}
        </motion.div>
      )}
    </GlassCard>
  );
};

export default ProfilePhotoUpload;