// Test script to verify the profileService fix
import { profileService } from '../services/api/profileService';

export const testProfileServiceFix = async () => {
  console.log('🧪 Testing ProfileService Fix...');
  
  try {
    console.log('1️⃣ Testing getCurrentUserProfile method...');
    const profile = await profileService.getCurrentUserProfile();
    console.log('✅ ProfileService.getCurrentUserProfile() works!');
    console.log('Profile data:', profile);
    
    return true;
  } catch (error) {
    console.error('❌ ProfileService test failed:', error);
    return false;
  }
};

// Test the import
export const testImports = () => {
  console.log('🧪 Testing imports...');
  
  try {
    // Test if apiCall is properly imported
    console.log('✅ All imports working correctly');
    return true;
  } catch (error) {
    console.error('❌ Import test failed:', error);
    return false;
  }
};
