// src/hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { userProfileService, UserProfile, NotificationCounts } from '../services/UserProfileService';
import { useAuth } from './useAuth';

interface UseUserProfileReturn {
  // Profile data
  profile: UserProfile | null;
  notificationCounts: NotificationCounts;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isUploadingImage: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  refreshProfile: (forceRefresh?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  uploadProfilePicture: (imageUri: string) => Promise<boolean>;
  refreshNotificationCounts: () => Promise<void>;
  clearError: () => void;
  
  // Computed values
  displayName: string;
  formattedPhone: string;
  memberDuration: string;
  userInitials: string;
  totalNotifications: number;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { authState } = useAuth();
  
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    requests: 0,
    services: 0,
    messages: 0,
    offers: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("AuthState value ================> ", authState.user);
  
  // Auto-fetch profile when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id) {
      refreshProfile();
      refreshNotificationCounts();
    } else {
      // Clear profile when user logs out
      setProfile(null);
      setNotificationCounts({
        requests: 0,
        services: 0,
        messages: 0,
        offers: 0,
      });
    }
  }, [authState.isAuthenticated, authState.user?.id]);

  // Refresh profile data
  const refreshProfile = useCallback(async (forceRefresh: boolean = false) => {
    if (!authState.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await userProfileService.getUserProfile(
        authState.user.id,
        forceRefresh
      );

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback to auth data if no profile found
        setProfile({
          id: authState.user.id,
          name: authState.user.fullName || 'User',
          phoneNumber: authState.user.phoneNo,
          email: authState.user.email,
          rating: 5.0,
          totalBookings: 0,
          completedBookings: 0,
          isVerified: authState.user.isVerified,
          joinDate: authState.user.createdAt,
        });
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [authState.user]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!authState.user?.id) return false;

    setIsUpdating(true);
    setError(null);

    try {
      const updatedProfile = await userProfileService.updateUserProfile(
        authState.user.id,
        updates
      );

      if (updatedProfile) {
        setProfile(updatedProfile);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [authState.user?.id]);

  // Upload profile picture
  const uploadProfilePicture = useCallback(async (imageUri: string): Promise<boolean> => {
    if (!authState.user?.id) return false;

    setIsUploadingImage(true);
    setError(null);

    try {
      const profilePictureUrl = await userProfileService.uploadProfilePicture(
        authState.user.id,
        imageUri
      );

      if (profilePictureUrl && profile) {
        setProfile({
          ...profile,
          profilePicture: profilePictureUrl,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return false;
    } finally {
      setIsUploadingImage(false);
    }
  }, [authState.user?.id, profile]);

  // Refresh notification counts
  const refreshNotificationCounts = useCallback(async () => {
    if (!authState.user?.id) return;

    try {
      const counts = await userProfileService.getNotificationCounts(authState.user.id);
      setNotificationCounts(counts);
    } catch (err) {
      console.error('Failed to refresh notification counts:', err);
      // Don't set error for notification counts as it's not critical
    }
  }, [authState.user?.id]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const displayName = userProfileService.getDisplayName(profile, authState.user?.fullName);
  
  const formattedPhone = profile?.phoneNumber 
    ? userProfileService.getFormattedPhone(profile.phoneNumber)
    : authState.user?.phoneNo || '+91 XXXXXXXXXX';
  
  const memberDuration = profile?.joinDate 
    ? userProfileService.getMemberDuration(profile.joinDate)
    : authState.user?.createdAt 
      ? userProfileService.getMemberDuration(authState.user.createdAt)
      : '';
  
  let userInitials = '';
  if (authState.user?.fullName){
    userInitials = userProfileService.getUserInitials(authState.user?.fullName);
  }
  
  const totalNotifications = Object.values(notificationCounts).reduce((sum, count) => sum + count, 0);

  return {
    // Profile data
    profile,
    notificationCounts,
    
    // Loading states
    isLoading,
    isUpdating,
    isUploadingImage,
    
    // Error state
    error,
    
    // Actions
    refreshProfile,
    updateProfile,
    uploadProfilePicture,
    refreshNotificationCounts,
    clearError,
    
    // Computed values
    displayName,
    formattedPhone,
    memberDuration,
    userInitials,
    totalNotifications,
  };
};

export default useUserProfile;