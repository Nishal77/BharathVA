import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  ActionSheetIOS,
  Platform,
  Modal,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileService, ProfileData } from '../../../../../services/api/profileService';
import { useAuth } from '../../../../../contexts/AuthContext';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ProfileFormData {
  name: string;
  username: string;
  bio: string;
  birthDate: string;
  gender: string;
  pronouns: string;
}

// ============================================================================
// RESPONSIVE TEXT SIZING LOGIC
// ============================================================================

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calculate responsive text sizes based on device dimensions
const getResponsiveTextSize = () => {
  const baseWidth = 375; // iPhone X base width
  const baseHeight = 812; // iPhone X base height
  
  // Calculate scale factors
  const widthScale = screenWidth / baseWidth;
  const heightScale = screenHeight / baseHeight;
  
  // Use the smaller scale to ensure text fits on smaller devices
  const scale = Math.min(widthScale, heightScale);
  
  // Clamp scale between 0.8 and 1.4 for reasonable bounds
  const clampedScale = Math.max(0.8, Math.min(1.4, scale));
  
  return {
    // Header text sizes
    headerTitle: Math.round(16 * clampedScale),
    
    // Profile text sizes
    profileName: Math.round(18 * clampedScale),
    profileUsername: Math.round(14 * clampedScale),
    
    // Form text sizes
    sectionTitle: Math.round(14 * clampedScale),
    fieldLabel: Math.round(14 * clampedScale),
    fieldValue: Math.round(14 * clampedScale),
    
    // Button text sizes
    buttonText: Math.round(12 * clampedScale),
    
    // Small text sizes
    smallText: Math.round(12 * clampedScale),
    extraSmallText: Math.round(10 * clampedScale),
    
    // Scale factor for other elements
    scale: clampedScale
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EditProfile() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    username: '',
    bio: '',
    birthDate: '',
    gender: '',
    pronouns: ''
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileFormData>({
    name: '',
    username: '',
    bio: '',
    birthDate: '',
    gender: '',
    pronouns: ''
  });
  const [activeField, setActiveField] = useState<keyof ProfileFormData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [originalAvatarUri, setOriginalAvatarUri] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
  const hasChanges =
    JSON.stringify(profileData) !== JSON.stringify(originalProfileData) ||
    avatarUri !== originalAvatarUri;
  
  // Get responsive text sizes
  const textSizes = getResponsiveTextSize();

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    if (navigation && router) {
      setIsNavigationReady(true);
    }
  }, [navigation, router]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================
  
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userProfile = await profileService.getCurrentUserProfile();
      
      // Map database fields to form fields
      const formatGender = (g?: string | null) => {
        if (!g) return '';
        const normalized = g.toLowerCase();
        if (normalized === 'male') return 'Male';
        if (normalized === 'female') return 'Female';
        if (normalized === 'custom') return 'Custom';
        if (normalized === 'prefer not to say') return 'Prefer not to say';
        return g;
      };

      const formData: ProfileFormData = {
        name: userProfile.fullName || '',
        username: userProfile.username || '',
        bio: (userProfile as any).bio || '',
        birthDate: userProfile.dateOfBirth ? formatDateForDisplay(userProfile.dateOfBirth) : '',
        gender: formatGender((userProfile as any).gender || ''),
        pronouns: ''
      };
      
      setProfileData(formData);
      setOriginalProfileData(formData);
      // If backend returns an avatar URL, hydrate preview (optional)
      if ((userProfile as any)?.profileImageUrl) {
        const url = (userProfile as any).profileImageUrl as string;
        setAvatarUri(url);
        setOriginalAvatarUri(url);
      } else {
        setOriginalAvatarUri(null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load profile data');
      
      // Show fallback data if user is available
      if (user) {
        const fallbackData: ProfileFormData = {
          name: user.fullName || '',
          username: user.username || '',
          bio: '',
          birthDate: '',
          gender: '',
          pronouns: ''
        };
        setProfileData(fallbackData);
        setOriginalProfileData(fallbackData);
      } else {
        // If no user data available, show empty form with placeholders
        const emptyData: ProfileFormData = {
          name: '',
          username: '',
          bio: '',
          birthDate: '',
          gender: '',
          pronouns: ''
        };
        setProfileData(emptyData);
        setOriginalProfileData(emptyData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Edit button -> show options: Choose from gallery / Delete photo
  const handleEditPress = () => {
    const choose = () => handlePickImage();
    const remove = () => {
      Alert.alert('Remove photo?', 'This will remove your profile photo.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAvatarUri(null);
            setPreviewUri(null); // Clear preview as well
            setIsPreviewVisible(false); // Hide preview modal if open
          },
        },
      ]);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Choose from Gallery', 'Delete Photo', 'Cancel'],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        (idx) => {
          if (idx === 0) choose();
          else if (idx === 1) remove();
        }
      );
    } else {
      Alert.alert('Edit photo', undefined, [
        { text: 'Choose from Gallery', onPress: choose },
        { text: 'Delete Photo', style: 'destructive', onPress: remove },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // Format date from database (YYYY-MM-DD) to display format (DD MMM YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format date from display format to database format (YYYY-MM-DD)
  const formatDateForDatabase = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Update field value
  const updateField = (field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle date picker
  const openDatePicker = () => {
    // For now, we'll use a simple text input approach
    // In production, you would install @react-native-community/datetimepicker
    Alert.prompt(
      'Enter Birth Date',
      'Please enter your birth date in DD/MM/YYYY format',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: (dateText: string | undefined) => {
            if (dateText) {
              try {
                const date = new Date(dateText);
                if (!isNaN(date.getTime())) {
                  const formattedDate = formatDateForDisplay(date.toISOString().split('T')[0]);
                  updateField('birthDate', formattedDate);
                } else {
                  Alert.alert('Invalid Date', 'Please enter a valid date');
                }
              } catch {
                Alert.alert('Invalid Date', 'Please enter a valid date');
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // Handle option selection for Gender and Pronouns
  const handleOptionSelection = (field: 'gender' | 'pronouns') => {
    const options = {
      gender: ['Male', 'Female', 'Custom', 'Prefer not to say'],
      pronouns: ['He/Him', 'She/Her', 'They/Them', 'Custom', 'Prefer not to say']
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...options[field], 'Cancel'],
          cancelButtonIndex: options[field].length,
          title: `Select ${field === 'gender' ? 'Gender' : 'Pronouns'}`
        },
        (buttonIndex) => {
          if (buttonIndex < options[field].length) {
            updateField(field, options[field][buttonIndex]);
          }
        }
      );
    } else {
      // For Android, show an alert with options
      const buttons = options[field].map(option => ({
        text: option,
        onPress: () => updateField(field, option)
      }));
      
      Alert.alert(
        `Select ${field === 'gender' ? 'Gender' : 'Pronouns'}`,
        '',
        [
          ...buttons,
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // Pick profile image using Expo ImagePicker
  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to change your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.95,
        allowsMultipleSelection: false,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // We rely on allowsEditing + aspect 1:1 to deliver a perfect square.
        // Show circular preview modal so user sees exactly how it appears as an avatar
        setPreviewUri(asset.uri);
        setIsPreviewVisible(true);
      }
    } catch (e) {
      console.error('Image pick error:', e);
      Alert.alert('Error', 'Unable to select image. Please try again.');
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // Check if avatar is a local file (not a remote URL)
      const isLocalFile = avatarUri && 
        (avatarUri.startsWith('file://') || 
         avatarUri.startsWith('content://') || 
         avatarUri.startsWith('ph://') ||
         (!avatarUri.startsWith('http://') && !avatarUri.startsWith('https://')));
      
      // If avatar changed and is a local file, upload to backend (Cloudinary)
      if (avatarUri && avatarUri !== originalAvatarUri && isLocalFile) {
        try {
          console.log('📤 [EditProfile] Uploading local image:', avatarUri);
          const result = await profileService.uploadProfileImage(avatarUri);
          console.log('✅ [EditProfile] Upload successful:', result.profileImageUrl);
          setAvatarUri(result.profileImageUrl);
          setOriginalAvatarUri(result.profileImageUrl);
        } catch (e: any) {
          console.error('❌ [EditProfile] Upload error:', e);
          throw new Error(e?.message || 'Failed to upload profile image');
        }
      }

      // Prepare updates for the API
      const updates: any = {};
      // If user cleared avatar
      if (!avatarUri && originalAvatarUri) {
        updates.profileImageUrl = null;
      }
      
      if (profileData.name !== originalProfileData.name) {
        updates.fullName = profileData.name;
      }
      
      if (profileData.username !== originalProfileData.username) {
        updates.username = profileData.username;
      }
      
      if (profileData.birthDate !== originalProfileData.birthDate) {
        updates.dateOfBirth = formatDateForDatabase(profileData.birthDate);
      }

      if (profileData.gender !== originalProfileData.gender) {
        const normalizedGender = (profileData.gender || '').trim().toLowerCase();
        if (normalizedGender) {
          updates.gender = normalizedGender;
        }
      }

      if (profileData.bio !== originalProfileData.bio) {
        const trimmedBio = (profileData.bio || '').trim();
        updates.bio = trimmedBio.length > 0 ? trimmedBio : null;
      }
      
      // If only bio is being updated and backend expects gender, include current gender value
      if (Object.keys(updates).length === 1 && Object.prototype.hasOwnProperty.call(updates, 'bio')) {
        const currentGender = (profileData.gender || '').trim().toLowerCase();
        if (currentGender) {
          updates.gender = currentGender;
        }
      }

      // If only bio is changed, use dedicated endpoint to minimize server-side complexity
      const onlyBioChanged = Object.keys(updates).length === 1 && Object.prototype.hasOwnProperty.call(updates, 'bio');
      if (onlyBioChanged) {
        await profileService.updateBio(updates.bio ?? null);
      } else {
        await profileService.updateProfile(updates);
      }
      
      // Update the original data to reflect changes
      setOriginalProfileData({ ...profileData });
      setOriginalAvatarUri(avatarUri);
      
      Alert.alert('Success', 'Profile updated successfully!');
      
      // Refresh profile data after successful update
      await loadUserProfile();
    } catch (error: any) {
      console.error('❌ [EditProfile] Update error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Provide user-friendly error messages
      if (errorMessage.toLowerCase().includes('authentication') || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('token')) {
        errorMessage = 'Authentication failed. Please logout and login again.';
      } else if (errorMessage.toLowerCase().includes('network') || 
                 errorMessage.toLowerCase().includes('connection')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.toLowerCase().includes('unexpected error')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setProfileData(originalProfileData);
    setActiveField(null);
    setError(null);
  };

  // ============================================================================
  // COMPONENTS
  // ============================================================================
  
  const FieldRow = ({
    label,
    value,
    placeholder,
    fieldKey, 
    showChevron = false,
    isEditable = true,
    isLast = false
  }: {
    label: string;
    value: string;
    placeholder?: string;
    fieldKey: keyof ProfileFormData;
    showChevron?: boolean;
    isEditable?: boolean;
    isLast?: boolean;
  }) => {
    const isActive = activeField === fieldKey;
    const isPlaceholder = value === placeholder;
    const isOptionField = fieldKey === 'gender' || fieldKey === 'pronouns';
    const isDateField = fieldKey === 'birthDate';
    const dividerColor = isDark ? '#2A2A2A' : '#EAEAEA';
    
    const handlePress = () => {
      if (isDateField) {
        openDatePicker();
      } else if (isOptionField) {
        handleOptionSelection(fieldKey as 'gender' | 'pronouns');
      } else if (isEditable) {
        setActiveField(fieldKey);
      }
    };
    
    return (
      <Pressable 
        className={`flex-row items-center py-3 px-3 ${!isLast ? 'border-b border-gray-100 dark:border-white/5' : ''} ${isActive ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
        onPress={handlePress}
        style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: dividerColor }}
      >
        <Text 
          className="font-normal text-gray-600 dark:text-gray-400 mr-1 w-24"
          style={{ fontSize: textSizes.fieldLabel }}
        >
          {label}
        </Text>
        
        {/* Vertical Separator */}
        <View className="w-[1px] h-full bg-gray-300 dark:bg-white/5 mx-1" />
        
        <View className="flex-row items-center flex-1 ml-2">
            {isActive && !isOptionField && !isDateField ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#1F1F1F' : '#F5F5F5',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 0,
                }}
              >
                <TextInput
                  value={value}
                  onChangeText={(text) => updateField(fieldKey, text)}
                  onBlur={() => setActiveField(null)}
                  className={`flex-1 ${fieldKey === 'bio' ? 'min-h-[60px]' : ''} text-gray-900 dark:text-white`}
                  style={{ 
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: textSizes.fieldValue
                  }}
                  placeholder={placeholder}
                  placeholderTextColor={isDark ? "#666666" : "#999999"}
                  autoFocus
                  multiline={fieldKey === 'bio'}
                  numberOfLines={fieldKey === 'bio' ? 4 : 1}
                  maxLength={fieldKey === 'bio' ? 150 : undefined}
                />
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#1F1F1F' : '#F5F5F5',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 0,
                }}
              >
                <Text 
                  className="flex-1"
                  style={{ 
                    color: isPlaceholder ? (isDark ? '#A1A1A1' : '#6B7280') : (isDark ? '#FFFFFF' : '#000000'),
                    fontWeight: '500',
                    fontSize: textSizes.fieldValue
                  }}
                  numberOfLines={fieldKey === 'bio' ? 3 : 1}
                >
                  {value || placeholder}
                </Text>
              </View>
            )}
          
            {showChevron && (
              <View className="ml-3">
                {isDateField ? (
                  <Svg width={18} height={18} viewBox="0 0 18 18">
                    <Path
                      d="M5.75 2.75L5.75 0.75"
                      fill="none"
                      stroke={isDark ? "#9CA3AF" : "#999999"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <Path
                      d="M12.25 2.75L12.25 0.75"
                      fill="none"
                      stroke={isDark ? "#9CA3AF" : "#999999"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <Path
                      d="M2.25 2.75H15.75C16.3023 2.75 16.75 3.19772 16.75 3.75V15.25C16.75 15.8023 16.3023 16.25 15.75 16.25H2.25C1.69772 16.25 1.25 15.8023 1.25 15.25V3.75C1.25 3.19772 1.69772 2.75 2.25 2.75Z"
                      fill="none"
                      stroke={isDark ? "#9CA3AF" : "#999999"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <Path
                      d="M1.25 6.25H16.75"
                      fill="none"
                      stroke={isDark ? "#9CA3AF" : "#999999"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <Circle cx="9" cy="8.25" r="1" fill={isDark ? "#9CA3AF" : "#999999"} />
                    <Circle cx="12.5" cy="10.25" r="1" fill={isDark ? "#9CA3AF" : "#999999"} />
                    <Circle cx="9" cy="11.25" r="1" fill={isDark ? "#9CA3AF" : "#999999"} />
                    <Circle cx="5.5" cy="11.25" r="1" fill={isDark ? "#9CA3AF" : "#999999"} />
                    <Circle cx="12.5" cy="11.25" r="1" fill={isDark ? "#9CA3AF" : "#999999"} />
                  </Svg>
                ) : (
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path
                      d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                      fill={isDark ? "#9CA3AF" : "#999999"}
                    />
                  </Svg>
                )}
              </View>
            )}
        </View>
      </Pressable>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (isLoading || !isNavigationReady) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text className="text-lg text-gray-600 mt-4">Loading profile</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* HEADER */}
      <View 
        className="flex-row items-center px-4 py-1 bg-white dark:bg-black"
        style={{ paddingTop: insets.top + 12 }}
      >
        {/* Left Container - Back Button */}
        <View className="w-[70px] items-start">
          <Pressable 
            className={`rounded-full items-center justify-center bg-gray-50 dark:bg-[#151515]`}
            style={{
              width: Math.round(32 * textSizes.scale),
              height: Math.round(32 * textSizes.scale),
            }}
            onPress={() => router.push('/(user)/[userId]/(tabs)/profile')}
          >
            <Svg 
              width={Math.round(18 * textSizes.scale)} 
              height={Math.round(18 * textSizes.scale)} 
              viewBox="0 0 24 24"
            >
              <Path
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                fill={isDark ? '#FFFFFF' : '#374151'}
              />
            </Svg>
          </Pressable>
        </View>

        {/* Center Container - Title */}
        <View className="flex-1 items-center">
          <Text 
            className="font-semibold text-gray-900 dark:text-white"
            style={{ fontSize: textSizes.headerTitle }}
          >
            Update Profile
          </Text>
        </View>

        {/* Right Container - Update Button */}
        <View className="w-[70px] items-end">
          <Pressable
            className={`px-3 py-1.5 rounded-md active:opacity-70 flex-row items-center justify-center min-w-[70px] min-h-[32px] ${hasChanges ? 'bg-[#F7931A]' : 'bg-[#E5E5E5] dark:bg-[#2E2E2E]'}`}
            onPress={handleSave}
            disabled={!hasChanges || isUpdating}
          >
          {isUpdating ? (
            <Svg width={14} height={14} viewBox="0 0 18 18">
              <Path
                d="M9,1.75c4.004,0,7.25,3.246,7.25,7.25s-3.246,7.25-7.25,7.25"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="M5.75 9.25L8 11.75L12.25 6.25"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Circle cx="3.873" cy="14.127" r=".75" fill="white" />
              <Circle cx="1.75" cy="9" r=".75" fill="white" />
              <Circle cx="3.873" cy="3.873" r=".75" fill="white" />
              <Circle cx="6.226" cy="15.698" r=".75" fill="white" />
              <Circle cx="2.302" cy="11.774" r=".75" fill="white" />
              <Circle cx="2.302" cy="6.226" r=".75" fill="white" />
              <Circle cx="6.226" cy="2.302" r=".75" fill="white" />
            </Svg>
          ) : (
              <Text 
                className={`font-semibold ${hasChanges ? 'text-white' : 'text-[#A1A1A1] dark:text-[#7A7A7A]'}`}
                style={{ fontSize: textSizes.buttonText }}
              >
                Save
              </Text>
          )}
        </Pressable>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ERROR MESSAGE */}
        {error && (
          <View className="mx-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-400 text-sm">{error}</Text>
          </View>
        )}

        {/* PROFILE PICTURE SECTION */}
        <View className="items-center py-4 bg-white dark:bg-black">
          <View className="relative">
            <View className="w-36 h-36 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 border-4 border-white dark:border-black"
              style={{
                shadowColor: 'transparent',
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                  <Svg width={48} height={48} viewBox="0 0 24 24">
                    <Path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill={isDark ? '#6B7280' : '#9CA3AF'}
                    />
                  </Svg>
                </View>
              )}
            </View>
            
            {/* Edit Chip centered below avatar */}
            <View className="absolute -bottom-1 left-0 right-0 items-center">
              <Pressable className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 flex-row items-center"
                onPress={handleEditPress}
              >
                <Svg width={16} height={16} viewBox="0 0 18 18" style={{ marginRight: 6 }}>
                  <Path d="M12.439 2.439L15.561 5.561" fill="none" stroke={isDark ? '#93C5FD' : '#3B82F6'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M3.75 11.75L11.5 4L14.5 7L6.75 14.75H3.75V11.75Z" fill="none" stroke={isDark ? '#93C5FD' : '#3B82F6'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text className="font-semibold" style={{ color: isDark ? '#E5E7EB' : '#111827', fontSize: 13 }}>Edit</Text>
              </Pressable>
            </View>
          </View>
          
          {/* Circular Avatar Preview Modal */}
          <Modal visible={isPreviewVisible} transparent animationType="fade" onRequestClose={() => setIsPreviewVisible(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <View style={{ width: 280, height: 280, borderRadius: 140, overflow: 'hidden', backgroundColor: '#111' }}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <Pressable onPress={() => { setIsPreviewVisible(false); setPreviewUri(null); setTimeout(() => { handlePickImage(); }, 200); }}
                  style={({ pressed }) => [{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: pressed ? '#E5E7EB' : '#F3F4F6' }]}
                >
                  <Text style={{ color: '#111827', fontWeight: '600' }}>Retake</Text>
                </Pressable>
                <Pressable onPress={() => { if (previewUri) setAvatarUri(previewUri); setIsPreviewVisible(false); }}
                  style={({ pressed }) => [{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: pressed ? '#2563EB' : '#3B82F6' }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Choose</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Profile Info */}
          <View className="items-center mt-4">
            <Text 
              className="font-bold text-gray-900 dark:text-white mb-1"
              style={{ fontSize: textSizes.profileName }}
            >
              {profileData.name || 'Your Name'}
            </Text>
            <Text 
              className="text-gray-600 dark:text-gray-300 mb-2"
              style={{ fontSize: textSizes.profileUsername }}
            >
              @{profileData.username || 'username'}
            </Text>

          </View>
        </View>

        {/* FORM CONTENT */}
        <View className="px-6 pt-6">
          {/* BASIC INFO */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text 
                className="font-bold text-gray-900 dark:text-white"
                style={{ fontSize: textSizes.sectionTitle }}
              >
                BASIC INFO
              </Text>
            </View>
            
            <View className="rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1F1F1F' : '#F5F5F5',
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.35 : 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 2,
              }}
            >
              {/* Name Field */}
              <FieldRow
                label="Name"
                value={profileData.name}
                placeholder="Enter your full name"
                fieldKey="name"
              />

              {/* Username removed from editable fields as requested */}

              {/* Bio Field */}
              <FieldRow
                label="Bio"
                value={profileData.bio}
                placeholder="Add a short bio..."
                fieldKey="bio"
                isLast={true}
              />
            </View>
          </View>

          {/* PERSONAL INFO */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text 
                className="font-bold text-gray-900 dark:text-white"
                style={{ fontSize: textSizes.sectionTitle }}
              >
                PERSONAL INFO
              </Text>
            </View>
            
            <View className="rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1F1F1F' : '#F5F5F5',
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.35 : 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 2,
              }}
            >
              {/* Birth Date Field */}
              <FieldRow
                label="Birth Date"
                value={profileData.birthDate}
                placeholder="Select your birth date"
                fieldKey="birthDate"
                showChevron={true}
              />

              {/* Gender Field */}
              <FieldRow
                label="Gender"
                value={profileData.gender}
                placeholder="Select your gender"
                fieldKey="gender"
                showChevron={true}
              />

              {/* Pronouns Field */}
              <FieldRow
                label="Pronouns"
                value={profileData.pronouns}
                placeholder="Select your pronouns"
                fieldKey="pronouns"
                showChevron={true}
                isLast={true}
              />
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}