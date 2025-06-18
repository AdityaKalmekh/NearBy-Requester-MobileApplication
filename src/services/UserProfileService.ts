// src/services/UserProfileService.ts
import * as SecureStore from 'expo-secure-store';

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  profilePicture?: string;
  rating: number;
  totalBookings: number;
  completedBookings: number;
  isVerified: boolean;
  joinDate: string;
  location?: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  preferences?: {
    notifications: boolean;
    language: string;
    currency: string;
  };
  statistics?: {
    totalSpent: number;
    favoriteServices: string[];
    lastBookingDate?: string;
  };
}

export interface NotificationCounts {
  requests: number;
  services: number;
  messages: number;
  offers: number;
}

class UserProfileService {
  private static instance: UserProfileService;
  private profileCache: UserProfile | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  /**
   * Get user profile with caching
   */
  async getUserProfile(userId: string, forceRefresh: boolean = false): Promise<UserProfile | null> {
    // Check cache first
    if (!forceRefresh && this.isProfileCacheValid()) {
      console.log('📎 Using cached user profile');
      return this.profileCache;
    }

    try {
      // Try to get from secure storage first
      const cachedProfile = await this.getProfileFromStorage();
      if (cachedProfile && !forceRefresh) {
        this.profileCache = cachedProfile;
        this.cacheTimestamp = Date.now();
        return cachedProfile;
      }

      // Fetch from API
      console.log('🌐 Fetching user profile from API');
      const profile = await this.fetchProfileFromAPI(userId);
      
      if (profile) {
        // Update cache and storage
        this.profileCache = profile;
        this.cacheTimestamp = Date.now();
        await this.saveProfileToStorage(profile);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      
      // Fallback to cached data if available
      if (this.profileCache) {
        return this.profileCache;
      }
      
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('🔄 Updating user profile');
      const updatedProfile = await this.updateProfileAPI(userId, updates);
      
      if (updatedProfile) {
        // Update cache and storage
        this.profileCache = updatedProfile;
        this.cacheTimestamp = Date.now();
        await this.saveProfileToStorage(updatedProfile);
        return updatedProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(userId: string, imageUri: string): Promise<string | null> {
    try {
      console.log('📸 Uploading profile picture');
      
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await fetch(`/users/${userId}/profile-picture`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const profilePictureUrl = result.profilePictureUrl;
        
        // Update profile cache
        if (this.profileCache) {
          this.profileCache.profilePicture = profilePictureUrl;
          await this.saveProfileToStorage(this.profileCache);
        }
        
        return profilePictureUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  }

  /**
   * Get notification counts
   */
  async getNotificationCounts(userId: string): Promise<NotificationCounts> {
    try {
      console.log('🔔 Fetching notification counts');
      
      const response = await fetch(`/users/${userId}/notification-counts`);
      if (response.ok) {
        return await response.json();
      }
      
      // Return default counts
      return {
        requests: 0,
        services: 0,
        messages: 0,
        offers: 0,
      };
    } catch (error) {
      console.error('Failed to get notification counts:', error);
      return {
        requests: 0,
        services: 0,
        messages: 0,
        offers: 0,
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<UserProfile['statistics'] | null> {
    try {
      console.log('📊 Fetching user statistics');
      
      const response = await fetch(`/users/${userId}/statistics`);
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      return null;
    }
  }

  /**
   * Clear profile cache
   */
  clearCache(): void {
    this.profileCache = null;
    this.cacheTimestamp = 0;
    this.clearProfileFromStorage();
  }

  /**
   * Format display name
   */
  getDisplayName(profile: UserProfile | null, fallbackName?: string): string {
    if (profile?.name) return profile.name;
    if (fallbackName) return fallbackName;
    return 'User';
  }

  /**
   * Format phone number
   */
  getFormattedPhone(phoneNumber: string): string {
    // Remove country code if present
    const cleaned = phoneNumber.replace(/^\+91/, '');
    
    // Format as XXX-XXX-XXXX
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phoneNumber;
  }

  /**
   * Get member duration
   */
  getMemberDuration(joinDate: string): string {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Private methods

  private isProfileCacheValid(): boolean {
    return this.profileCache !== null && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  private async fetchProfileFromAPI(userId: string): Promise<UserProfile | null> {
    const response = await fetch(`/users/profile/${userId}`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  private async updateProfileAPI(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const response = await fetch(`/users/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }

  private async saveProfileToStorage(profile: UserProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync('user_profile_cache', JSON.stringify({
        profile,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to save profile to storage:', error);
    }
  }

  private async getProfileFromStorage(): Promise<UserProfile | null> {
    try {
      const cached = await SecureStore.getItemAsync('user_profile_cache');
      if (cached) {
        const { profile, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return profile;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get profile from storage:', error);
      return null;
    }
  }

  private async clearProfileFromStorage(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('user_profile_cache');
    } catch (error) {
      console.error('Failed to clear profile from storage:', error);
    }
  }
}

// Export singleton instance
export const userProfileService = UserProfileService.getInstance();
export default userProfileService;