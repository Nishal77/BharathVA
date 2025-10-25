import React, { useState, useRef, useEffect } from 'react';
import { Image, Pressable, Text, View, useColorScheme, Modal, Animated, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Star, Heart, MessageCircle, MoreHorizontal, Share, Trash2, Edit, X, ChevronUp, Users } from 'lucide-react-native';
import { FeedItem as FeedItemType } from '../../services/api/feedService';
import { useTimeAgo } from '../../hooks/useTimeAgo';

interface FeedItemProps {
  feed: FeedItemType;
  userData: any;
  onImageError?: (error: any) => void;
  onDeletePost?: (feedId: string) => void;
  onEditPost?: (feed: FeedItemType) => void;
}

export default function FeedItem({ feed, userData, onImageError, onDeletePost, onEditPost }: FeedItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State for dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'up' | 'down'>('down');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const ellipsisRef = useRef<View>(null);

  // Use real-time time ago hook
  const timeAgo = useTimeAgo(feed.createdAt);

  const getImageUrl = (imageUrl: string) => {
    // Use Cloudinary URL directly
    return imageUrl;
  };

  // Calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (ellipsisRef.current) {
      ellipsisRef.current.measure((x, y, width, height, pageX, pageY) => {
        const screenHeight = Dimensions.get('window').height;
        const dropdownHeight = 240; // Reduced height for more compact options
        const spaceBelow = screenHeight - pageY - height;
        const spaceAbove = pageY;
        
        // If there's not enough space below but enough space above, position upward
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition('up');
        } else {
          setDropdownPosition('down');
        }
      });
    }
  };

  // Dropdown menu handlers
  const toggleDropdown = () => {
    if (showDropdown) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    calculateDropdownPosition();
    setShowDropdown(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDropdown = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDropdown(false);
    });
  };

  const handleEditPost = () => {
    closeDropdown();
    if (onEditPost) {
      onEditPost(feed);
    }
  };

  const handleDeletePost = () => {
    closeDropdown();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteModal(false);
    
    try {
      if (onDeletePost) {
        await onDeletePost(feed.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <View className="border-b relative border-gray-200 dark:border-white/10">
      {/* Two Column Layout */}
      <View className="flex-row px-4 py-3">
        {/* Left Column - Profile Picture and Vertical Line */}
        <View className="w-12 items-center pt-0 relative mr-3">
          {/* Profile Picture */}
          <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
            <Image
              source={{ 
                uri: userData?.profilePicture || 
                     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' 
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          
          {/* Vertical Line - Connecting Main Profile to Top Avatar */}
          <View
            className="absolute w-px bg-black/15 dark:bg-[#0A0A0A]"
            style={{
              left: 19, // Centered on the profile images
              top: 44, // Below the main profile image with small gap (40px height + 8px space)
              bottom: 40, // Above the top small avatar (20px from bottom + 20px avatar height)
            }}
          />
          
          {/* Three Images in Horizontal Row Formation - Aligned with Stats */}
          {/* Left Image */}
          <View
            className="absolute"
            style={{
              left: 3, // Leftmost position
              bottom: 12, // Same spacing as pb-3 (12px) from stats text
            }}
          >
            <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
              <Image
                source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Center Image */}
          <View
            className="absolute"
            style={{
              left: 11, // Center position with slight overlap
              bottom: 12, // Same spacing as pb-3 (12px) from stats text
            }}
          >
            <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
              <Image
                source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Right Image */}
          <View
            className="absolute"
            style={{
              left: 19, // Rightmost position with slight overlap
              bottom: 12, // Same spacing as pb-3 (12px) from stats text
            }}
          >
            <View className="w-5 h-5 rounded-full overflow-hidden border-1 border-white">
              <Image
                source={{ uri: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Right Column - All Content */}
        <View className="flex-1">
          {/* Header Row - Name, @Username, Time, 3 Dots */}
          <View className="flex-row items-center justify-between pr-2">
            <View className="flex-row items-center flex-1">
              <Text className="text-base font-bold mr-1 text-gray-900 dark:text-gray-100">
                {userData?.fullName || 'User'}
              </Text>
              <Text className="text-sm mr-2 text-gray-500 dark:text-gray-400">
                @{userData?.username || 'username'}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                · {timeAgo}
              </Text>
            </View>
            <Pressable 
              ref={ellipsisRef}
              onPress={toggleDropdown}
              className={`p-2 rounded-full ${
                showDropdown 
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-transparent'
              }`}
              style={({ pressed }) => ({
                backgroundColor: pressed 
                  ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                  : undefined,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <MoreHorizontal 
                size={20} 
                color={showDropdown ? (isDark ? '#F9FAFB' : '#111827') : (isDark ? '#9CA3AF' : '#6B7280')} 
                strokeWidth={showDropdown ? 2 : 1.5}
              />
            </Pressable>
          </View>

          {/* Caption */}
          <View className="mb-3">
            <Text className="text-base leading-5 text-gray-900 dark:text-gray-100">
              {feed.message}
            </Text>
          </View>

          {/* Main Image - Display if feed has images */}
          {feed.imageUrls && feed.imageUrls.length > 0 && (
            <View className="aspect-square rounded-xl overflow-hidden mb-3">
              <Image
                source={{ uri: getImageUrl(feed.imageUrls[0]) }}
                className="w-full h-full"
                resizeMode="cover"
                onError={onImageError}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center space-x-4">
              <Pressable className="p-1">
                <Heart size={24} color={isDark ? '#F9FAFB' : '#111827'} strokeWidth={1.5} />
              </Pressable>
              <Pressable className="p-1">
                <MessageCircle size={24} color={isDark ? '#F9FAFB' : '#111827'} strokeWidth={1.5} />
              </Pressable>
              <Pressable className="p-1">
                <Share size={24} color={isDark ? '#F9FAFB' : '#111827'} strokeWidth={1.5} />
              </Pressable>
            </View>
            
            <Pressable className="p-1">
              <Star size={24} color={isDark ? '#F9FAFB' : '#111827'} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* Engagement Stats - Aligned with Bottom of Triangle */}
          <View className="pb-3">
            <View className="flex-row items-end">
              <Text className="text-sm mr-4 text-gray-500 dark:text-gray-400">
                0 replies
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                0 likes
              </Text>
            </View>
          </View>
        </View>
      </View>

            {/* Dropdown Menu - Dynamic positioning based on available space */}
            {showDropdown && (
              <View 
                className={`absolute right-4 z-50 ${
                  dropdownPosition === 'up' ? 'bottom-16' : 'top-16'
                }`}
              >
                {/* Arrow pointer - Border */}
                <View
                  className={`
                    absolute right-6 z-50 w-0 h-0
                    ${dropdownPosition === 'up' ? 'bottom-2' : '-top-2'}
                    border-l-8 border-r-8 border-l-transparent border-r-transparent
                    ${dropdownPosition === 'up' 
                      ? `border-t-8 border-b-0 ${isDark ? 'border-t-white/5' : 'border-t-gray-200'}`
                      : `border-b-8 border-t-0 ${isDark ? 'border-b-white/5' : 'border-b-gray-200'}`
                    }
                  `}
                />
                {/* Arrow pointer - Fill */}
                <View
                  className={`
                    absolute right-6 z-50 w-0 h-0
                    ${dropdownPosition === 'up' ? 'bottom-1.5' : '-top-1.5'}
                    border-l-8 border-r-8 border-l-transparent border-r-transparent
                    ${dropdownPosition === 'up' 
                      ? `border-t-8 border-b-0 ${isDark ? 'border-t-[#151515]' : 'border-t-white'}`
                      : `border-b-8 border-t-0 ${isDark ? 'border-b-[#151515]' : 'border-b-white'}`
                    }
                  `}
                />
          
                <Animated.View
                  className="bg-white dark:bg-[#0B0B0B] rounded-2xl border border-gray-200 dark:border-white/5 w-64 p-0"
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  }}
                >
                  {/* Delete Post Option */}
                  <Pressable
                    onPress={handleDeletePost}
                    disabled={isDeleting}
                    className="flex-row items-center justify-between px-4 py-2.5"
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? (isDark ? '#374151' : '#F9FAFB') : 'transparent',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    })}
                  >
                    <Text className="text-red-500 text-base font-medium">
                      {isDeleting ? 'Deleting...' : 'Delete post'}
                    </Text>
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Trash2 size={20} color="#EF4444" strokeWidth={2} />
                    )}
                  </Pressable>

                  {/* Horizontal Separator Line */}
                  <View className="h-px bg-gray-200 dark:bg-white/5 mx-4" />

                  {/* Edit Post Option */}
                  <Pressable
                    onPress={handleEditPost}
                    className="flex-row items-center justify-between px-4 py-2.5"
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? (isDark ? '#374151' : '#F9FAFB') : 'transparent',
                    })}
                  >
                    <Text className="text-gray-900 dark:text-gray-100 text-base font-medium">
                      Edit post
                    </Text>
                    <Edit size={20} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2} />
                  </Pressable>

                  {/* Horizontal Separator Line */}
                  <View className="h-px bg-gray-200 dark:bg-white/5 mx-4" />

                  {/* Pin to Profile Option */}
                  <Pressable
                    onPress={() => Alert.alert('Pin Post', 'Pin to profile functionality will be implemented soon!')}
                    className="flex-row items-center justify-between px-4 py-2.5"
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? (isDark ? '#374151' : '#F9FAFB') : 'transparent',
                    })}
                  >
                    <Text className="text-gray-900 dark:text-gray-100 text-base font-medium">
                      Pin to profile
                    </Text>
                    <Star size={20} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2} />
                  </Pressable>

                  {/* Horizontal Separator Line */}
                  <View className="h-px bg-gray-200 dark:bg-white/5 mx-4" />

          

                  {/* View Analytics Option */}
                  <Pressable
                    onPress={() => Alert.alert('Analytics', 'View analytics functionality will be implemented soon!')}
                    className="flex-row items-center justify-between px-4 py-2.5"
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? (isDark ? '#374151' : '#F9FAFB') : 'transparent',
                    })}
                  >
                    <Text className="text-gray-900 dark:text-gray-100 text-base font-medium">
                      View analytics
                    </Text>
                    <Users size={20} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2} />
                  </Pressable>

                  {/* Horizontal Separator Line */}
                  <View className="h-px bg-gray-200 dark:bg-white/5 mx-4" />

                  {/* Report Post Option */}
                  <Pressable
                    onPress={() => Alert.alert('Report Post', 'Report post functionality will be implemented soon!')}
                    className="flex-row items-center justify-between px-4 py-2.5"
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? (isDark ? '#374151' : '#F9FAFB') : 'transparent',
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    })}
                  >
                    <Text className="text-gray-900 dark:text-gray-100 text-base font-medium">
                      Report post
                    </Text>
                    <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} strokeWidth={2} />
                  </Pressable>
          </Animated.View>
        </View>
      )}

      {/* Backdrop for closing dropdown */}
      {showDropdown && (
        <Pressable
          className="absolute inset-0 z-40"
          onPress={closeDropdown}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-gray-800 rounded-xl p-6 w-full max-w-xs shadow-2xl border border-gray-700">
            {/* Modal Title */}
            <Text className="text-white text-xl font-bold text-center mb-4">
              Delete post
            </Text>

            {/* Modal Content */}
            <Text className="text-gray-300 text-sm text-center leading-5 mb-6">
              Are you sure you want to delete this post?
            </Text>

            {/* Modal Actions */}
            <View className="flex-row justify-center gap-6">
              <Pressable
                onPress={cancelDelete}
                className="py-2.5 px-4 rounded-lg"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text className="text-blue-400 text-base font-medium">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-lg"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  opacity: isDeleting ? 0.7 : (pressed ? 0.8 : 1),
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Text className="text-red-500 text-base font-medium">
                    Delete
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
