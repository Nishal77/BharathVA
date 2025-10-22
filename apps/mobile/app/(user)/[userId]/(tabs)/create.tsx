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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost, checkFeedServiceHealth } from '../../../../services/api/feedService';

const { height: screenHeight } = Dimensions.get('window');

export default function CreateScreen() {
  const router = useRouter();
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
  const headerHeight = 44; // Fixed header height
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

      // Create post using industrial-grade service
      const result = await createPost(content.trim());
      
      if (result.success) {
        // Success - clear content and navigate back
        setContent('');
        router.back();
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
    router.back();
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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // Open photo gallery to select images
  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImageUris = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImageUris]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo gallery. Please try again.');
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
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <View
        className={`absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-5 py-1.5 h-11 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
        style={{ marginTop: dynamicMarginTop }}
      >
        <Pressable
          onPress={handleCancel}
          className="py-1 px-1"
          accessibilityRole="button"
          accessibilityLabel="Cancel post creation"
        >
          <Text className={`text-sm font-semibold tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={handlePost}
          disabled={!canPost}
          className={`px-4 py-1.5 rounded-2xl items-center justify-center ${canPost ? (isDark ? 'bg-blue-500' : 'bg-blue-600') : (isDark ? 'bg-gray-700' : 'bg-gray-200')} ${canPost ? 'opacity-100' : 'opacity-60'}`}
          style={{ minWidth: 60 }}
          accessibilityRole="button"
          accessibilityLabel={isPosting ? "Posting..." : "Post content"}
        >
          <Text className={`text-sm font-bold tracking-wide ${canPost ? 'text-white' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
            {isPosting ? 'Posting...' : 'Publish'}
          </Text>
        </Pressable>
      </View>
      
      {/* Main Content */}
      <View 
        className="flex-1"
        style={{ 
          paddingTop: totalHeaderHeight,
        }}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* User Profile Section */}
            <View className="flex-row items-center mb-1">
              <View className="flex-row items-center flex-1">
                <View className="relative mr-3">
                  <Image
                    source={{ 
                      uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80'
                    }}
                    className="w-9 h-9 rounded-full"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                </View>

                {/* Audience Selector */}
                <Pressable
                  className={`flex-row items-center justify-center px-3 py-1.5 rounded-2xl border h-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  style={{
                    minWidth: 90,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Ionicons
                    name="globe-outline"
                    size={14}
                    color={isDark ? '#E0E0E0' : '#606060'}
                  />
                  <Text className={`text-xs font-semibold mx-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Everyone
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={isDark ? '#A9A9A9' : '#A0A0A0'}
                  />
                </Pressable>

                {/* Media Action Icons - Left Side */}
                <View className="flex-row items-center ml-4" style={{ gap: 20 }}>
                  <Pressable
                    className={`w-8 h-8 items-center justify-center bg-transparent rounded-2xl ${pressedStates.gallery ? 'scale-95 bg-black/5' : ''}`}
                    style={{
                      shadowColor: pressedStates.gallery ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: pressedStates.gallery ? 0.1 : 0,
                      shadowRadius: 2,
                      elevation: pressedStates.gallery ? 2 : 0,
                    }}
                    onPress={openGallery}
                    onPressIn={() => handlePressIn('gallery')}
                    onPressOut={() => handlePressOut('gallery')}
                  >
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={isDark ? '#E0E0E0' : '#606060'}
                    />
                  </Pressable>

                  <Pressable
                    className={`w-8 h-8 items-center justify-center bg-transparent rounded-2xl ${pressedStates.camera ? 'scale-95 bg-black/5' : ''}`}
                    style={{
                      shadowColor: pressedStates.camera ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: pressedStates.camera ? 0.1 : 0,
                      shadowRadius: 2,
                      elevation: pressedStates.camera ? 2 : 0,
                    }}
                    onPress={openCamera}
                    onPressIn={() => handlePressIn('camera')}
                    onPressOut={() => handlePressOut('camera')}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={isDark ? '#E0E0E0' : '#606060'}
                    />
                  </Pressable>

                  <Pressable
                    className={`w-8 h-8 items-center justify-center bg-transparent rounded-2xl ${pressedStates.timer ? 'scale-95 bg-black/5' : ''}`}
                    style={{
                      shadowColor: pressedStates.timer ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: pressedStates.timer ? 0.1 : 0,
                      shadowRadius: 2,
                      elevation: pressedStates.timer ? 2 : 0,
                    }}
                    onPressIn={() => handlePressIn('timer')}
                    onPressOut={() => handlePressOut('timer')}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={20}
                      color={isDark ? '#E0E0E0' : '#606060'}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Text Input Area - Aligned with Profile */}
            <View className="mb-6 ml-12">
              <TextInput
                ref={textInputRef}
                className={`text-base p-0 bg-transparent ${isDark ? 'text-gray-300' : 'text-black'}`}
                style={{ 
                  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                  textAlignVertical: 'top',
                  lineHeight: 22,
                  minHeight: 100,
                }}
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
              <View className="flex-row justify-end mt-2">
                <Text className={`text-xs ${content.length > 260 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                  {content.length}/280
                </Text>
              </View>
            </View>

            {/* Selected Images Display */}
            {selectedImages.length > 0 && (
              <View className="mt-4 ml-12">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Selected Images ({selectedImages.length})
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ flexDirection: 'row' }}
                >
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} className="relative mr-3">
                      <Image source={{ uri: imageUri }} className="w-20 h-20 rounded-lg bg-gray-100" />
                      <Pressable
                        className="absolute bg-white rounded-xl"
                        style={{ top: -8, right: -8 }}
                        onPress={() => removeImage(index)}
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