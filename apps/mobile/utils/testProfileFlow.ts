import { profileService } from '../services/api/profileService';
import { authService } from '../services/api/authService';

// Test function to verify API connection and data flow
export const testProfileDataFlow = async () => {
  console.log('🧪 Testing Profile Data Flow...');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('1️⃣ Checking authentication status...');
    const isAuthenticated = await authService.isAuthenticated();
    console.log('Auth status:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, cannot test profile fetch');
      return;
    }
    
    // Test 2: Get current user data from token manager
    console.log('2️⃣ Getting current user data from token manager...');
    const currentUser = await authService.getCurrentUser();
    console.log('Current user data:', currentUser);
    
    // Test 3: Fetch profile from Neon database
    console.log('3️⃣ Fetching profile from Neon database...');
    const profileData = await profileService.getCurrentUserProfile();
    console.log('Profile data from Neon DB:', profileData);
    
    console.log('✅ All tests passed! Data flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test function to verify API endpoints
export const testApiEndpoints = async () => {
  console.log('🧪 Testing API Endpoints...');
  
  try {
    // Test backend health
    const response = await fetch('http://192.168.0.225:8080/api/auth/register/health');
    const healthData = await response.json();
    console.log('Backend health:', healthData);
    
    // Test user profile endpoint (without auth to see error)
    const profileResponse = await fetch('http://192.168.0.225:8080/api/auth/user/me');
    const profileData = await profileResponse.json();
    console.log('Profile endpoint response:', profileData);
    
  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
  }
};
