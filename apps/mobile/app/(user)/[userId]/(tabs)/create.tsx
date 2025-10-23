import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost, checkFeedServiceHealth, uploadMultipleImages } from '../../../../services/api/feedService';

const { height: screenHeight } = Dimensions.get('window');

// StyleSheet for consistent styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
    height: 44,
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  publishButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    minHeight: 36,
  },
  publishButtonActive: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  publishButtonInactive: {
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  publishText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  publishTextActive: {
    color: '#FFFFFF',
  },
  publishTextInactive: {
    color: '#374151',
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#10B981',
  },
  audienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mediaIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 20,
  },
  mediaIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  mediaIconPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInputContainer: {
    marginBottom: 24,
    marginLeft: 48,
  },
  textInput: {
    fontSize: 18,
    padding: 0,
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
    lineHeight: 22,
    minHeight: 100,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  characterCounter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCounterText: {
    fontSize: 12,
  },
  characterCounterWarning: {
    color: '#DC2626',
  },
  characterCounterNormal: {
    color: '#9CA3AF',
  },
  selectedImagesContainer: {
    marginTop: 24,
    marginLeft: 48,
  },
  selectedImagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedImagesTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearAllButtonDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#DC2626',
  },
  clearAllButtonLight: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  clearAllButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearAllButtonTextDark: {
    color: '#F87171',
  },
  clearAllButtonTextLight: {
    color: '#DC2626',
  },
  imagesScrollView: {
    flexDirection: 'row',
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});

export default function CreateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [pressedStates, setPressedStates] = useState<{[key: string]: boolean}>({});
  const [isPosting, setIsPosting] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Calculate the total header height including status bar
  const dynamicMarginTop = Platform.OS === 'android' 
    ? StatusBar.currentHeight || 0 
    : insets.top || 0;
  const headerHeight = 54; // Fixed header height
  const totalHeaderHeight = dynamicMarginTop + headerHeight;

  const handleContentChange = (text: string) => {
    setContent(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handlePost = async () => {
    if (content.trim().length === 0) {
      Alert.alert('Validation Error', 'Please enter a message before posting.');
      return;
    }

    if (isPosting) {
      return; // Prevent multiple submissions
    }

    setIsPosting(true);

    try {
      // Check service health first
      const isHealthy = await checkFeedServiceHealth();
      if (!isHealthy) {
        Alert.alert('Service Unavailable', 'Feed service is currently unavailable. Please try again later.');
        return;
      }
      
      let imageIds: string[] = [];
      
      // Upload images first if any are selected
      if (selectedImages.length > 0) {
        console.log('Uploading images before creating post...');
        
        try {
          const uploadResult = await uploadMultipleImages(selectedImages);
          
          if (uploadResult.success && uploadResult.images) {
            imageIds = uploadResult.images.map(img => img.imageId);
            console.log(`Successfully uploaded ${imageIds.length} images`);
          } else {
            Alert.alert('Image Upload Error', uploadResult.error || 'Failed to upload images. Please try again.');
            return;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert('Image Upload Error', 'Failed to upload images. Please try again.');
          return;
        }
      }
      
      // Create post with images
      const result = await createPost(content.trim(), imageIds);
      
      if (result.success) {
        // Success - clear content and show success message
        setContent('');
        setSelectedImages([]);
        Alert.alert(
          'Post Published!', 
          `Your post has been successfully published${imageIds.length > 0 ? ` with ${imageIds.length} image${imageIds.length > 1 ? 's' : ''}` : ''}.`,
          [{ text: 'OK' }]
        );
      } else {
        // Handle specific error cases
        const errorCode = result.error?.code;
        const errorMessage = result.error?.message || 'Unknown error occurred';
        
        switch (errorCode) {
          case 'AUTH_ERROR':
            Alert.alert('Authentication Error', 'Please login again to continue.');
            break;
          case 'VALIDATION_ERROR':
            Alert.alert('Validation Error', errorMessage);
            break;
          case 'NETWORK_ERROR':
            Alert.alert('Network Error', 'Please check your internet connection and try again.');
            break;
          case 'HTTP_401':
            Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
            break;
          case 'HTTP_403':
            Alert.alert('Access Denied', 'You do not have permission to perform this action.');
            break;
          case 'HTTP_500':
            Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
            break;
          default:
            Alert.alert('Error', `Failed to create post: ${errorMessage}`);
        }
      }
    } catch (error) {
      // Fallback error handling
      console.error('Unexpected error in handlePost:', error);
      Alert.alert('Unexpected Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setSelectedImages([]);
    console.log('Content cleared, user can switch tabs');
  };

  const canPost = content.trim().length > 0 && content.length <= 280 && !isPosting;

  // Request permissions for camera and media library
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to add images to your post.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Open camera to take a photo
  const openCamera = async () => {
    console.log('Camera button pressed - starting camera functionality');
    
    // Check if we already have maximum images
    if (selectedImages.length >= 4) {
      Alert.alert(
        'Maximum Images Reached',
        'You can only add up to 4 images per post. Please remove some images before taking a new photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Requesting permissions for camera access');
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Permissions denied for camera access');
      return;
    }

    try {
      console.log('Launching camera');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImages(prev => [...prev, result.assets[0].uri]);
        
        console.log('Successfully captured and added photo');
        
        // Show success feedback
        Alert.alert(
          'Photo Captured', 
          'Successfully captured and added a photo to your post.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('Camera was canceled or no photo taken');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Error', 
        'Failed to open camera. Please check your permissions and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Open photo gallery to select images
  const openGallery = async () => {
    console.log('Gallery button pressed - starting gallery functionality');
    
    // Check if we already have maximum images
    if (selectedImages.length >= 4) {
      Alert.alert(
        'Maximum Images Reached',
        'You can only add up to 4 images per post. Please remove some images before adding new ones.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Requesting permissions for gallery access');
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Permissions denied for gallery access');
      return;
    }

    const remainingSlots = 4 - selectedImages.length;
    console.log(`Opening gallery with ${remainingSlots} remaining slots`);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false, // Disable editing for better UX with multiple selection
        quality: 0.8,
        selectionLimit: remainingSlots, // Limit based on remaining slots
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUris = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImageUris]);
        
        console.log(`Successfully added ${result.assets.length} images`);
        
        // Show success feedback
        Alert.alert(
          'Images Added', 
          `Successfully added ${result.assets.length} image${result.assets.length > 1 ? 's' : ''} to your post.`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('Gallery was canceled or no images selected');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(
        'Gallery Error', 
        'Failed to open photo gallery. Please check your permissions and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle press states for interactive elements
  const handlePressIn = (key: string) => {
    setPressedStates(prev => ({ ...prev, [key]: true }));
  };

  const handlePressOut = (key: string) => {
    setPressedStates(prev => ({ ...prev, [key]: false }));
  };


  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={[styles.header, { marginTop: dynamicMarginTop }]}>
        <Pressable
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel post creation"
        >
          <Text style={[styles.cancelText, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={handlePost}
          disabled={!canPost}
          style={[styles.publishButton, !canPost && styles.publishButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={isPosting ? "Posting..." : "Post content"}
        >
          <View style={[
            styles.publishButtonContainer,
            canPost ? styles.publishButtonActive : styles.publishButtonInactive
          ]}>
            <Text style={[
              styles.publishText,
              canPost ? styles.publishTextActive : styles.publishTextInactive
            ]}>
              {isPosting ? 'Posting...' : 'Publish'}
            </Text>
          </View>
        </Pressable>
      </View>
      
      {/* Main Content */}
      <View style={[styles.mainContent, { paddingTop: totalHeaderHeight }]}>
        <KeyboardAvoidingView
          style={styles.scrollContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* User Profile Section */}
            <View style={styles.userProfileSection}>
              <View style={styles.profileContainer}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{ 
                      uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80'
                    }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  <View style={styles.onlineIndicator} />
                </View>

                {/* Audience Selector */}
                <Pressable
                  style={[
                    styles.audienceSelector,
                    {
                      backgroundColor: isDark ? '#151515' : '#F3F4F6',
                      borderColor: isDark ? '#2E2E2E' : '#E5E7EB',
                    }
                  ]}
                >
                  <Ionicons
                    name="globe-outline"
                    size={16}
                    color={isDark ? '#E0E0E0' : '#606060'}
                  />
                  <Text style={[
                    styles.selectedImagesTitle,
                    { color: isDark ? '#D1D5DB' : '#6B7280', marginHorizontal: 4 }
                  ]}>
                    Everyone
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={isDark ? '#A9A9A9' : '#A0A0A0'}
                  />
                </Pressable>

                {/* Media Action Icons - Left Side */}
                <View style={styles.mediaIconsContainer}>
                  <Pressable
                    style={[
                      styles.mediaIcon,
                      pressedStates.gallery && styles.mediaIconPressed
                    ]}
                    onPress={openGallery}
                    onPressIn={() => handlePressIn('gallery')}
                    onPressOut={() => handlePressOut('gallery')}
                  >
                    <Ionicons
                      name="image-outline"
                      size={22}
                      color={isDark ? '#E0E0E0' : '#606060'}
                    />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.mediaIcon,
                      pressedStates.camera && styles.mediaIconPressed
                    ]}
                    onPress={openCamera}
                    onPressIn={() => handlePressIn('camera')}
                    onPressOut={() => handlePressOut('camera')}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={22}
                      color={isDark ? '#E0E0E0' : '#606060'}
                    />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.mediaIcon,
                      pressedStates.timer && styles.mediaIconPressed
                    ]}
                    onPressIn={() => handlePressIn('timer')}
                    onPressOut={() => handlePressOut('timer')}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={22}
                      color={isDark ? '#E0E0E0' : '#606060'}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Text Input Area - Aligned with Profile */}
            <View style={styles.textInputContainer}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  { color: isDark ? '#D1D5DB' : '#000000' }
                ]}
                placeholder="What's on your mind today?"
                placeholderTextColor={isDark ? '#A9A9A9' : '#A0A0A0'}
                value={content}
                onChangeText={handleContentChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                multiline
                maxLength={280}
                accessibilityLabel="Post content input"
              />
              
              {/* Character Counter */}
              <View style={styles.characterCounter}>
                <Text style={[
                  styles.characterCounterText,
                  content.length > 260 ? styles.characterCounterWarning : styles.characterCounterNormal,
                  { color: content.length > 260 ? (isDark ? '#F87171' : '#DC2626') : (isDark ? '#6B7280' : '#9CA3AF') }
                ]}>
                  {content.length}/280
                </Text>
              </View>
            </View>

            {/* Selected Images Display */}
            {selectedImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <View style={styles.selectedImagesHeader}>
                  <Text style={[
                    styles.selectedImagesTitle,
                    { color: isDark ? '#D1D5DB' : '#6B7280' }
                  ]}>
                    Selected Images ({selectedImages.length}/4)
                  </Text>
                  <Pressable
                    onPress={() => setSelectedImages([])}
                    style={[
                      styles.clearAllButton,
                      isDark ? styles.clearAllButtonDark : styles.clearAllButtonLight
                    ]}
                  >
                    <Text style={[
                      styles.clearAllButtonText,
                      isDark ? styles.clearAllButtonTextDark : styles.clearAllButtonTextLight
                    ]}>
                      Clear All
                </Text>
                  </Pressable>
                </View>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesScrollView}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imageItem}>
                      <View style={[
                        styles.imageContainer,
                        { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }
                      ]}>
                        <Image 
                          source={{ uri: imageUri }} 
                          style={styles.selectedImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Pressable
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                        accessibilityLabel="Remove image"
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}