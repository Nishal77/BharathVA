import React, { useState, useRef, useEffect } from 'react';
import { Image, Pressable, Text, View, useColorScheme, Modal, Animated, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { MoreHorizontal, Trash2, Edit, X, ChevronUp, Users } from 'lucide-react-native';
import { Svg, Path, Line, Circle } from 'react-native-svg';
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
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const ellipsisRef = useRef<View>(null);

  // Reset error state when userData profile image changes
  useEffect(() => {
    const currentImageUrl = userData?.profileImageUrl || userData?.profilePicture;
    if (currentImageUrl) {
      setProfileImageError(false);
    }
  }, [userData?.profileImageUrl, userData?.profilePicture]);

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

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleComment = () => {
    setIsCommented(!isCommented);
  };

  const toggleShare = () => {
    setIsShared(!isShared);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <View className="border-b relative border-gray-200 dark:border-[#2B2B2B]">
      {/* Two Column Layout */}
      <View className="flex-row px-4 py-3">
        {/* Left Column - Profile Picture and Vertical Line */}
        <View className="w-12 items-center pt-0 relative mr-3">
          {/* Profile Picture */}
          <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {(() => {
              const neonDbImageUrl = userData?.profileImageUrl || userData?.profilePicture;
              
              // Show NeonDB image if available, otherwise show SVG placeholder
              if (neonDbImageUrl && !profileImageError) {
                // Try to load NeonDB image
                return (
                  <Image
                    source={{ uri: neonDbImageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={() => {
                      console.log('Profile image from NeonDB failed to load');
                      setProfileImageError(true);
                    }}
                  />
                );
              } else {
                // No NeonDB image or failed to load, show SVG placeholder
                return (
                  <View className="w-full h-full items-center justify-center">
                    <Svg width={24} height={24} viewBox="0 0 24 24">
                      <Circle cx="12" cy="8" r="4" fill={isDark ? '#6B7280' : '#9CA3AF'} />
                      <Path
                        d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill={isDark ? '#6B7280' : '#9CA3AF'}
                      />
                    </Svg>
                  </View>
                );
              }
            })()}
          </View>
          
          {/* Vertical Line - Connecting Main Profile to Follower Avatars */}
          <View
            className="absolute w-px bg-black/15 dark:bg-[#2B2B2B]"
            style={{
              left: 19, // Centered on the profile images
              top: 44, // Below the main profile image with small gap (40px height + 8px space)
              bottom: 40, // Above the follower avatars
            }}
          />
          
          {/* Three Follower Avatars in Horizontal Row Formation - Aligned with Stats */}
          {/* Left Avatar */}
          <View
            className="absolute"
            style={{
              left: 3, // Leftmost position
              bottom: 12, // Same spacing as pb-3 (12px) from stats text
            }}
          >
            <View className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-gray-800">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Center Avatar */}
          <View
            className="absolute"
            style={{
              left: 11, // Center position with slight overlap
              bottom: 12, // Same spacing as pb-3 (12px) from stats text
            }}
          >
            <View className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-gray-800">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Right Avatar */}
          <View
            className="absolute"
            style={{
              left: 19, // Rightmost position with slight overlap
              bottom: 12, // Same spacing as pb-3 (12px) from stats text
            }}
          >
            <View className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-gray-800">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }}
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
              <Text className="text-base font-bold mr-1 text-gray-900 dark:text-[#E5E5E5]">
                {userData?.fullName || 'User'}
              </Text>
              <Text className="text-sm mr-2 text-gray-500 dark:text-[#71767B]">
                @{userData?.username || 'username'}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#71767B]">
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
                  ? (isDark ? 'rgba(236, 9, 9, 0.1)' : 'rgba(0, 0, 0, 0.05)')
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
            <Text className="text-base leading-5 text-gray-900 dark:text-[#E5E5E5]">
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
              <Pressable className="p-1" onPress={toggleLike}>
                <Svg width={24} height={24} viewBox="0 0 18 18">
                  <Path
                    d={isLiked 
                      ? "M12.164,2c-1.195,.015-2.324,.49-3.164,1.306-.84-.815-1.972-1.291-3.178-1.306-2.53,.015-4.582,2.084-4.572,4.609,0,5.253,5.306,8.429,6.932,9.278,.256,.133,.537,.2,.818,.2s.562-.067,.817-.2c1.626-.848,6.933-4.024,6.933-9.275,.009-2.528-2.042-4.597-4.586-4.612Z"
                      : "M8.529,15.222c.297,.155,.644,.155,.941,0,1.57-.819,6.529-3.787,6.529-8.613,.008-2.12-1.704-3.846-3.826-3.859-1.277,.016-2.464,.66-3.173,1.72-.71-1.06-1.897-1.704-3.173-1.72-2.123,.013-3.834,1.739-3.826,3.859,0,4.826,4.959,7.794,6.529,8.613Z"
                    }
                    fill={isLiked ? '#EF4444' : 'none'}
                    stroke={isLiked ? 'none' : (isDark ? '#F9FAFB' : '#111827')}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                </Svg>
              </Pressable>
              <Pressable className="p-1" onPress={toggleComment}>
                <Svg width={24} height={24} viewBox="0 0 18 18">
                  {isCommented ? (
                    <Path
                      d="M9,1C4.589,1,1,4.589,1,9c0,1.397,.371,2.778,1.062,3.971,.238,.446-.095,2.002-.842,2.749-.209,.209-.276,.522-.17,.798,.105,.276,.364,.465,.659,.481,.079,.004,.16,.006,.242,.006,1.145,0,2.534-.407,3.44-.871,.675,.343,1.39,.587,2.131,.727,.484,.092,.981,.138,1.478,.138,4.411,0,8-3.589,8-8S13.411,1,9,1Zm3.529,11.538c-.944,.943-2.198,1.462-3.529,1.462s-2.593-.522-3.539-1.47c-.292-.293-.292-.768,0-1.061,.294-.293,.77-.292,1.062,0,1.322,1.326,3.621,1.328,4.947,.006,.293-.294,.768-.292,1.061,0,.292,.293,.292,.768-.002,1.061Z"
                      fill={isDark ? '#F9FAFB' : '#111827'}
                    />
                  ) : (
                    <>
                      <Path
                        d="M9,1.75C4.996,1.75,1.75,4.996,1.75,9c0,1.319,.358,2.552,.973,3.617,.43,.806-.053,2.712-.973,3.633,1.25,.068,2.897-.497,3.633-.973,.489,.282,1.264,.656,2.279,.848,.433,.082,.881,.125,1.338,.125,4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75Z"
                        fill="none"
                        stroke={isDark ? '#F9FAFB' : '#111827'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                      <Path
                        d="M5.992,12c.77,.772,1.834,1.25,3.008,1.25s2.231-.475,3-1.242"
                        fill="none"
                        stroke={isDark ? '#F9FAFB' : '#111827'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                    </>
                  )}
                </Svg>
              </Pressable>
              <Pressable className="p-1" onPress={toggleShare}>
                <Svg width={24} height={24} viewBox="0 0 18 18">
                  {isShared ? (
                    <Path
                      d="M16.345,1.654c-.344-.344-.845-.463-1.305-.315L2.117,5.493c-.491,.158-.831,.574-.887,1.087-.056,.512,.187,.992,.632,1.251l4.576,2.669,3.953-3.954c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-3.954,3.954,2.669,4.576c.235,.402,.65,.639,1.107,.639,.048,0,.097-.003,.146-.008,.512-.056,.929-.396,1.086-.886L16.661,2.96h0c.148-.463,.027-.963-.316-1.306Z"
                      fill={isDark ? '#F9FAFB' : '#111827'}
                    />
                  ) : (
                    <>
                      <Line
                        x1="15.813"
                        y1="2.187"
                        x2="7.657"
                        y2="10.343"
                        fill="none"
                        stroke={isDark ? '#F9FAFB' : '#111827'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                      <Path
                        d="M15.947,2.73l-4.154,12.923c-.142,.443-.743,.509-.977,.106l-3.159-5.416L2.241,7.184c-.402-.235-.337-.835,.106-.977L15.27,2.053c.417-.134,.811,.26,.677,.677Z"
                        fill="none"
                        stroke={isDark ? '#F9FAFB' : '#111827'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                    </>
                  )}
                </Svg>
              </Pressable>
            </View>
            
            <Pressable className="p-1" onPress={toggleBookmark}>
              <Svg width={24} height={24} viewBox="0 0 18 18">
                {isBookmarked ? (
                  <>
                    <Path
                      d="M9,17c-.414,0-.75-.336-.75-.75v-4c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v4c0,.414-.336,.75-.75,.75Z"
                      fill={isDark ? '#F9FAFB' : '#111827'}
                    />
                    <Path
                      d="M13.929,8.997c-.266-.456-.578-.888-.929-1.288V3.75c0-1.517-1.233-2.75-2.75-2.75h-2.5c-1.517,0-2.75,1.233-2.75,2.75v3.959c-.352,.4-.663,.832-.929,1.288-.563,.965-.921,2.027-1.065,3.158-.027,.214,.039,.429,.181,.59,.143,.162,.348,.254,.563,.254H14.25c.215,0,.42-.093,.563-.254,.142-.162,.208-.376,.181-.59-.144-1.131-.502-2.193-1.065-3.158Z"
                      fill={isDark ? '#F9FAFB' : '#111827'}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      x1="9"
                      y1="16.25"
                      x2="9"
                      y2="12.25"
                      fill="none"
                      stroke={isDark ? '#F9FAFB' : '#111827'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                    <Path
                      d="M14.25,12.25c-.089-.699-.318-1.76-.969-2.875-.335-.574-.703-1.028-1.031-1.375V3.75c0-1.105-.895-2-2-2h-2.5c-1.105,0-2,.895-2,2v4.25c-.329,.347-.697,.801-1.031,1.375-.65,1.115-.88,2.176-.969,2.875H14.25Z"
                      fill="none"
                      stroke={isDark ? '#F9FAFB' : '#111827'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                  </>
                )}
              </Svg>
            </Pressable>
          </View>

          {/* Engagement Stats - Aligned with Bottom of Triangle */}
          <View className="pb-3">
            <View className="flex-row items-end">
              <Text className="text-sm mr-4 text-gray-500 dark:text-[#71767B]">
                0 replies
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#B8B8B8]">
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
                    <Svg width={20} height={20} viewBox="0 0 18 18">
                      <Line
                        x1="9"
                        y1="16.25"
                        x2="9"
                        y2="12.25"
                        fill="none"
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                      <Path
                        d="M14.25,12.25c-.089-.699-.318-1.76-.969-2.875-.335-.574-.703-1.028-1.031-1.375V3.75c0-1.105-.895-2-2-2h-2.5c-1.105,0-2,.895-2,2v4.25c-.329,.347-.697,.801-1.031,1.375-.65,1.115-.88,2.176-.969,2.875H14.25Z"
                        fill="none"
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                    </Svg>
                  </Pressable>

                  {/* Horizontal Separator Line */}
                  <View className="h-px bg-gray-200 dark:bg-white/5 mx-4" />

          

                  {/* View Analytics Option */}
                  {/* <Pressable
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
                  </Pressable> */}

                  {/* Horizontal Separator Line */}
                  <View className="h-px bg-gray-200 dark:bg-white/5 mx-4" />

                  {/* Report Post Option
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
                  </Pressable> */}
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
