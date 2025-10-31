import { apiCall, ApiResponse, tokenManager } from './authService';
import { API_CONFIG, ENDPOINTS } from './config';

// Profile data interface matching the database schema
export interface ProfileData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  profileImageUrl?: string | null;
  bio?: string | null;
  gender?: string | null;
}

// Update profile request interface
export interface UpdateProfileRequest {
  fullName?: string;
  username?: string;
  dateOfBirth?: string;
  profileImageUrl?: string | null;
  bio?: string | null;
  gender?: string;
}

// Profile service for handling user profile operations
export const profileService = {
  /**
   * Fetch current user's profile data from Neon database
   */
  getCurrentUserProfile: async (): Promise<ProfileData> => {
    try {
      console.log('🔄 [ProfileService] Fetching user profile from:', ENDPOINTS.AUTH.USER_ME);
      
      const response = await apiCall<ProfileData>(
        ENDPOINTS.AUTH.USER_ME,
        'GET',
        undefined,
        true // Include auth token
      );
      
      console.log('📥 [ProfileService] API Response:', response);
      
      if (!response.success) {
        console.error('❌ [ProfileService] API returned error:', response.message);
        throw new Error(response.message || 'Failed to fetch profile');
      }
      
      console.log('✅ [ProfileService] Profile data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ProfileService] Error fetching user profile:', error);
      throw error;
    }
  },

  /** Upload profile image (multipart/form-data) */
  uploadProfileImage: async (fileUri: string): Promise<{ profileImageUrl: string }> => {
    try {
      console.log('📤 [ProfileService] Uploading profile image:', fileUri);
      
      // Helper function to create FormData (needed for retry)
      const createFormData = () => {
        const form = new FormData();
        const cleanUri = fileUri.replace(/^(file:\/\/|content:\/\/|ph:\/\/)/, '');
        const fileName = cleanUri.split('/').pop() || 'avatar';
        const ext = (fileName.includes('.') ? fileName.split('.').pop() : 'jpg') as string;
        const normalizedExt = ext.toLowerCase();
        const mimeFromExt: Record<string, string> = {
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif', gif: 'image/gif'
        };
        const mimeType = mimeFromExt[normalizedExt] || 'image/jpeg';
        const finalName = fileName.includes('.') ? fileName : `avatar.${normalizedExt}`;
        
        // @ts-ignore - React Native File type
        form.append('file', { 
          uri: fileUri,
          name: finalName,
          type: mimeType
        } as any);
        return form;
      };

      // Helper function to perform upload
      const performUpload = async (token: string, retryCount: number = 0): Promise<Response> => {
        const form = createFormData();
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.USER_UPDATE_PROFILE_IMAGE}`;
        
        if (retryCount === 0) {
          console.log('🌐 [ProfileService] Upload URL:', url);
          console.log('🔑 [ProfileService] Token (first 20 chars):', token.substring(0, 20) + '...');
          console.log('📤 [ProfileService] File URI:', fileUri);
          console.log('📦 [ProfileService] FormData prepared with file');
        } else {
          console.log('🔄 [ProfileService] Retrying upload with refreshed token...');
        }
        
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Do NOT set Content-Type header manually - React Native FormData automatically sets it with boundary
            // Setting it manually will break multipart/form-data uploads
          },
          body: form as any,
        });
        
        return res;
      };

      // Get and validate access token with proactive refresh
      let accessToken = await tokenManager.getAccessToken();
      
      // If no token, try to refresh or get current user
      if (!accessToken) {
        console.warn('⚠️ [ProfileService] No access token found, attempting to get current token...');
        // Try to get token from authService
        const { authService } = await import('./authService');
        const currentUser = await authService.getCurrentUser().catch(() => null);
        if (!currentUser) {
          throw new Error('Authentication required. Please login again.');
        }
        accessToken = await tokenManager.getAccessToken();
        if (!accessToken) {
          throw new Error('Authentication required. Please login again.');
        }
      }

      // Validate token format
      if (!accessToken.startsWith('eyJ')) {
        console.warn('⚠️ [ProfileService] Token format looks invalid, attempting refresh...');
        // Try to refresh token
        const { authService } = await import('./authService');
        const refreshed = await authService.refreshAccessToken().catch(() => false);
        if (refreshed) {
          accessToken = await tokenManager.getAccessToken();
          if (!accessToken || !accessToken.startsWith('eyJ')) {
            throw new Error('Invalid token format. Please login again.');
          }
        } else {
          throw new Error('Invalid token format. Please login again.');
        }
      }


      // Perform initial upload attempt
      let res = await performUpload(accessToken, 0);
      let responseText = await res.text();
      console.log('📥 [ProfileService] Response status:', res.status);
      console.log('📥 [ProfileService] Response headers:', JSON.stringify([...res.headers.entries()]));
      console.log('📥 [ProfileService] Response body:', responseText);
      
      // Handle 401 Unauthorized - try to refresh token and retry once
      if (res.status === 401) {
        console.warn('⚠️ [ProfileService] Received 401 - Attempting to refresh token and retry...');
        const { authService } = await import('./authService');
        const refreshed = await authService.refreshAccessToken().catch(() => false);
        
        if (refreshed) {
          accessToken = await tokenManager.getAccessToken();
          if (accessToken && accessToken.startsWith('eyJ')) {
            // Retry the upload with refreshed token (recreate FormData)
            res = await performUpload(accessToken, 1);
            responseText = await res.text();
            console.log('📥 [ProfileService] Retry response status:', res.status);
            console.log('📥 [ProfileService] Retry response body:', responseText);
          } else {
            throw new Error('Authentication failed. Please logout and login again.');
          }
        } else {
          throw new Error('Authentication failed. Please logout and login again.');
        }
      }
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `Upload failed: ${res.status}` };
        }
        console.error('❌ [ProfileService] Upload error:', errorData);
        
        // Handle 400 Bad Request - file validation issues
        if (res.status === 400) {
          throw new Error(errorData?.message || 'Invalid image file. Please try a different image.');
        }
        
        throw new Error(errorData?.message || `Upload failed: ${res.status}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ [ProfileService] Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }
      
      console.log('✅ [ProfileService] Upload response:', data);
      
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to upload image');
      }
      
      // Backend returns: { success: true, data: { profileImageUrl: "...", oldProfileImageUrl: "..." } }
      const imageUrl = data.data?.profileImageUrl;
      if (!imageUrl) {
        console.error('❌ [ProfileService] No profileImageUrl in response:', data);
        throw new Error('No image URL returned from server');
      }
      
      return { profileImageUrl: imageUrl };
    } catch (error: any) {
      console.error('❌ [ProfileService] Upload error:', error);
      throw error;
    }
  },

  /**
   * Update user's full name
   */
  updateFullName: async (fullName: string): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.USER_UPDATE_FULLNAME,
        'PUT',
        { fullName },
        true // Include auth token
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update full name');
      }
    } catch (error) {
      console.error('Error updating full name:', error);
      throw error;
    }
  },

  /**
   * Update user's username
   */
  updateUsername: async (username: string): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.USER_UPDATE_USERNAME,
        'PUT',
        { username },
        true // Include auth token
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  },

  /**
   * Update user's date of birth
   */
  updateDateOfBirth: async (dateOfBirth: string): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.USER_UPDATE_DATEOFBIRTH,
        'PUT',
        { dateOfBirth },
        true // Include auth token
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update date of birth');
      }
    } catch (error) {
      console.error('Error updating date of birth:', error);
      throw error;
    }
  },

  /**
   * Update multiple profile fields at once
   */
  updateProfile: async (updates: UpdateProfileRequest): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.USER_UPDATE_PROFILE,
        'PUT',
        updates,
        true // Include auth token
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Update user's bio using dedicated endpoint
   */
  updateBio: async (bio: string | null): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.USER_UPDATE_BIO,
        'PUT',
        { bio },
        true
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to update bio');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      throw error;
    }
  }
};
