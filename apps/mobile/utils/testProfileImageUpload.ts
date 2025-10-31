// Test script for Profile Image Upload functionality
// Run this in your React Native app to test the profile image upload feature

import { profileService } from '../services/api/profileService';
import { authService } from '../services/api/authService';

/**
 * Test profile image upload functionality
 * This test requires:
 * 1. User to be logged in
 * 2. A valid image file URI
 */
export const testProfileImageUpload = async (testImageUri?: string) => {
  console.log('🧪 Testing Profile Image Upload...');
  console.log('====================================');
  
  try {
    // Test 1: Check authentication
    console.log('\n1️⃣ Checking authentication status...');
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      console.error('❌ User not authenticated. Please login first.');
      return {
        success: false,
        error: 'User not authenticated',
      };
    }
    console.log('✅ User is authenticated');
    
    // Test 2: Get current profile
    console.log('\n2️⃣ Fetching current profile...');
    const currentProfile = await profileService.getCurrentUserProfile();
    console.log('✅ Current profile fetched');
    console.log('Profile data:', {
      fullName: currentProfile.fullName,
      username: currentProfile.username,
      currentImageUrl: currentProfile.profileImageUrl || 'No image',
      bio: currentProfile.bio || 'No bio',
      gender: currentProfile.gender || 'No gender',
    });
    
    // Test 3: Test image upload (if URI provided)
    if (testImageUri) {
      console.log('\n3️⃣ Testing image upload...');
      console.log('Image URI:', testImageUri);
      
      try {
        const uploadResult = await profileService.uploadProfileImage(testImageUri);
        console.log('✅ Image upload successful!');
        console.log('Uploaded image URL:', uploadResult.profileImageUrl);
        
        // Test 4: Verify profile was updated
        console.log('\n4️⃣ Verifying profile update...');
        const updatedProfile = await profileService.getCurrentUserProfile();
        console.log('✅ Profile updated successfully');
        console.log('Updated profile image URL:', updatedProfile.profileImageUrl);
        
        if (updatedProfile.profileImageUrl === uploadResult.profileImageUrl) {
          console.log('✅ Image URL matches in database!');
        } else {
          console.warn('⚠️  Image URL mismatch');
        }
        
        // Verify it's a Cloudinary URL
        if (
          uploadResult.profileImageUrl.includes('cloudinary.com') ||
          uploadResult.profileImageUrl.includes('res.cloudinary.com')
        ) {
          console.log('✅ Image is stored in Cloudinary');
        } else {
          console.warn('⚠️  Image URL does not appear to be from Cloudinary');
        }
        
        return {
          success: true,
          data: {
            uploadedUrl: uploadResult.profileImageUrl,
            savedUrl: updatedProfile.profileImageUrl,
            matches: updatedProfile.profileImageUrl === uploadResult.profileImageUrl,
          },
        };
      } catch (uploadError: any) {
        console.error('❌ Image upload failed:', uploadError);
        return {
          success: false,
          error: uploadError.message || 'Upload failed',
          details: uploadError,
        };
      }
    } else {
      console.log('\n3️⃣ Skipping image upload (no image URI provided)');
      console.log('To test upload, provide a valid image URI:');
      console.log('  testProfileImageUpload("file:///path/to/image.jpg")');
      
      return {
        success: true,
        message: 'Profile fetch successful, upload test skipped',
        currentProfile: {
          profileImageUrl: currentProfile.profileImageUrl,
        },
      };
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message || 'Test failed',
      details: error,
    };
  }
};

/**
 * Test profile update with image
 * This tests the full flow: upload image + update profile
 */
export const testProfileUpdateWithImage = async (testImageUri: string) => {
  console.log('🧪 Testing Profile Update with Image...');
  console.log('========================================');
  
  try {
    // First upload the image
    const uploadResult = await testProfileImageUpload(testImageUri);
    
    if (!uploadResult.success) {
      return uploadResult;
    }
    
    // Then update profile with the new image URL
    console.log('\n5️⃣ Testing profile update with image URL...');
    const imageUrl = uploadResult.data?.uploadedUrl;
    
    if (imageUrl) {
      try {
        await profileService.updateProfile({
          profileImageUrl: imageUrl,
        });
        console.log('✅ Profile updated with image URL');
        
        // Verify
        const finalProfile = await profileService.getCurrentUserProfile();
        if (finalProfile.profileImageUrl === imageUrl) {
          console.log('✅ Profile image URL persisted correctly');
        }
        
        return {
          success: true,
          message: 'Profile update with image successful',
        };
      } catch (updateError: any) {
        console.error('❌ Profile update failed:', updateError);
        return {
          success: false,
          error: updateError.message || 'Profile update failed',
        };
      }
    }
    
    return uploadResult;
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message || 'Test failed',
    };
  }
};

/**
 * Test error handling for invalid image uploads
 */
export const testImageUploadErrorHandling = async () => {
  console.log('🧪 Testing Image Upload Error Handling...');
  console.log('==========================================');
  
  const testCases = [
    {
      name: 'Invalid URI',
      uri: 'invalid-uri',
      expectedError: true,
    },
    {
      name: 'Non-existent file',
      uri: 'file:///nonexistent/path/image.jpg',
      expectedError: true,
    },
    {
      name: 'Empty string',
      uri: '',
      expectedError: true,
    },
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    try {
      await profileService.uploadProfileImage(testCase.uri);
      if (testCase.expectedError) {
        console.error(`❌ Expected error but upload succeeded for: ${testCase.name}`);
      } else {
        console.log(`✅ Upload succeeded for: ${testCase.name}`);
      }
    } catch (error: any) {
      if (testCase.expectedError) {
        console.log(`✅ Correctly handled error for: ${testCase.name}`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.error(`❌ Unexpected error for: ${testCase.name}`);
        console.error(`   Error: ${error.message}`);
      }
    }
  }
  
  return {
    success: true,
    message: 'Error handling tests completed',
  };
};

// Example usage:
// import { testProfileImageUpload } from './utils/testProfileImageUpload';
// 
// // Test with a real image from device
// const result = await testProfileImageUpload('file:///path/to/image.jpg');
// console.log('Test result:', result);

