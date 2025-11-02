import React, { useState, useEffect } from 'react';
import { Pressable, Text, View, useColorScheme, Dimensions } from 'react-native';
import { Image } from 'expo-image';
// Removed MessageCircle import - using custom SVG
import { Svg, Path, Line } from 'react-native-svg';
import EmojiPickerModal from '../../components/EmojiPickerModal';
import ReactionsPicker from '../../components/ReactionsPicker';
import CommentsModal from './components/CommentsModal';
import { toggleLike } from '../../services/api/feedService';
import { getUserProfileById, getUsernamesBatch, UserProfile } from '../../services/api/userService';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedActionSectionProps {
  feedId?: string;
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEmojiSelect?: (emoji: string) => void;
  likes?: number;
  likedByUserIds?: string[]; // Array of user IDs who liked the post
  comments?: number;
  shares?: number;
  userLiked?: boolean;
}

// Utility function to format numbers with commas
function formatNumber(num: number): string {
  // Add commas for thousands separator
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function FeedActionSection({ 
  feedId,
  onLike, 
  onReply, 
  onShare, 
  onBookmark,
  onEmojiSelect,
  likes,
  likedByUserIds = [],
  comments,
  shares = 23,
  userLiked: initialUserLiked = false
}: FeedActionSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isSmileActive, setIsSmileActive] = useState(false);
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);
  const [isSendActive, setIsSendActive] = useState(false);
  const [isHeartActive, setIsHeartActive] = useState(initialUserLiked);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isReactionsPickerVisible, setIsReactionsPickerVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  // Use provided values or default to 0
  // Also consider likedByUserIds length if likes is not provided
  const initialLikes = likes !== undefined ? likes : (likedByUserIds?.length || 0);
  const [displayLikes, setDisplayLikes] = useState(initialLikes);
  
  // State for "Liked by" section
  const [likerUsername, setLikerUsername] = useState<string | null>(null);
  const [usernameMap, setUsernameMap] = useState<Record<string, string>>({});
  const [isLoadingLikerProfile, setIsLoadingLikerProfile] = useState(false);
  
  // Local state for likedByUserIds to handle immediate updates from toggleLike response
  const [localLikedByUserIds, setLocalLikedByUserIds] = useState<string[]>(likedByUserIds || []);
  
  // Sync local state with prop - always update when prop changes
  useEffect(() => {
    const newValue = likedByUserIds || [];
    console.log('🔄 Syncing likedByUserIds prop:', {
      propValue: likedByUserIds,
      propLength: likedByUserIds?.length || 0,
      newValueLength: newValue.length,
      newValue: newValue
    });
    setLocalLikedByUserIds(newValue);
  }, [likedByUserIds]);
  
  // Sync with prop changes
  useEffect(() => {
    if (likes !== undefined) {
      setDisplayLikes(likes);
    } else if (likedByUserIds && likedByUserIds.length > 0) {
      // If likes prop is not provided, use likedByUserIds length
      setDisplayLikes(likedByUserIds.length);
    }
  }, [likes, likedByUserIds]);
  
  // Sync heart active state with userLiked prop changes
  useEffect(() => {
    setIsHeartActive(initialUserLiked);
  }, [initialUserLiked]);
  
  const randomComments = React.useMemo(() => {
    if (comments !== undefined && comments > 0) {
      return comments;
    }
    // Generate random number between 10 and 510 for realistic testing
    return Math.floor(Math.random() * 500) + 10;
  }, [comments]);
  
  const randomShares = React.useMemo(() => {
    if (shares !== undefined && shares > 0) {
      return shares;
    }
    // Generate random number between 5 and 305 for realistic testing
    return Math.floor(Math.random() * 300) + 5;
  }, [shares]);
  
  // Theme-aware colors: white in dark mode, black in light mode
  const textColor = isDark ? '#FFFFFF' : '#000000';
  
  // Fetch usernames in batch when localLikedByUserIds changes or displayLikes changes
  useEffect(() => {
    const fetchUsernames = async () => {
      console.log('🔍 Fetch usernames effect triggered:', {
        displayLikes,
        localLikedByUserIdsLength: localLikedByUserIds?.length || 0,
        localLikedByUserIds: localLikedByUserIds
      });
      
      // Don't fetch if there are no likes
      if (displayLikes === 0 && (!localLikedByUserIds || localLikedByUserIds.length === 0)) {
        console.log('⚠️ No likes to fetch usernames for');
        setLikerUsername(null);
        setUsernameMap({});
        return;
      }
      
      // If we have localLikedByUserIds, batch fetch all usernames
      if (localLikedByUserIds && localLikedByUserIds.length > 0) {
        // Filter out placeholder user IDs
        const validUserIds = localLikedByUserIds.filter(id => id && !id.startsWith('placeholder_'));
        
        if (validUserIds.length === 0) {
          setLikerUsername(null);
          setUsernameMap({});
          return;
        }
        
        setIsLoadingLikerProfile(true);
        try {
          console.log('🔍 Batch fetching usernames from NeonDB for user IDs:', validUserIds);
          
          // Fetch all usernames in one batch call
          const response = await getUsernamesBatch(validUserIds);
          
          if (response.success && response.data) {
            const fetchedUsernameMap = response.data;
            
            // Verify we have a valid username map (object with string keys and string values)
            if (!fetchedUsernameMap || typeof fetchedUsernameMap !== 'object' || Array.isArray(fetchedUsernameMap)) {
              console.error('❌ Invalid username map structure:', fetchedUsernameMap);
              throw new Error('Invalid username map structure');
            }
            
            console.log('✅ Usernames fetched successfully from NeonDB:', {
              requestedCount: validUserIds.length,
              fetchedCount: Object.keys(fetchedUsernameMap).length,
              usernameMap: fetchedUsernameMap,
              validUserIds: validUserIds
            });
            
            setUsernameMap(fetchedUsernameMap);
            
            // Select username to display:
            // For single like, use the first (and only) user's username
            // For multiple likes, pick a random user's username
            const selectedUserId = displayLikes === 1 
              ? validUserIds[0] 
              : validUserIds[Math.floor(Math.random() * validUserIds.length)];
            
            console.log('🔍 Selecting username:', {
              selectedUserId,
              displayLikes,
              availableKeys: Object.keys(fetchedUsernameMap),
              selectedUsername: fetchedUsernameMap[selectedUserId]
            });
            
            const selectedUsername = fetchedUsernameMap[selectedUserId];
            
            if (selectedUsername && typeof selectedUsername === 'string' && selectedUsername.trim().length > 0) {
              setLikerUsername(selectedUsername.trim());
              console.log('✅ Selected username for display:', selectedUsername);
            } else {
              // Fallback: use first available username from the map
              const availableUsernames = Object.values(fetchedUsernameMap).filter(
                (u): u is string => typeof u === 'string' && u.trim().length > 0
              );
              
              if (availableUsernames.length > 0) {
                const firstAvailableUsername = availableUsernames[0];
                setLikerUsername(firstAvailableUsername);
                console.log('⚠️ Selected userId not found in map, using first available username:', firstAvailableUsername);
              } else {
                // Last resort: generate from userId
                setLikerUsername(`user_${selectedUserId.substring(0, 8)}`);
                console.warn('⚠️ No usernames available in map, using generated fallback');
              }
            }
          } else {
            console.warn('⚠️ Failed to batch fetch usernames, using fallback');
            // Fallback: create usernames from user IDs
            const fallbackUsernameMap: Record<string, string> = {};
            validUserIds.forEach(userId => {
              fallbackUsernameMap[userId] = `user_${userId.substring(0, 8)}`;
            });
            setUsernameMap(fallbackUsernameMap);
            
            const selectedUserId = displayLikes === 1 
              ? validUserIds[0] 
              : validUserIds[Math.floor(Math.random() * validUserIds.length)];
            setLikerUsername(fallbackUsernameMap[selectedUserId]);
          }
        } catch (error) {
          console.error('❌ Error batch fetching usernames:', error);
          // Fallback: create usernames from user IDs
          const fallbackUsernameMap: Record<string, string> = {};
          validUserIds.forEach(userId => {
            fallbackUsernameMap[userId] = `user_${userId.substring(0, 8)}`;
          });
          setUsernameMap(fallbackUsernameMap);
          
          const selectedUserId = displayLikes === 1 
            ? validUserIds[0] 
            : validUserIds[Math.floor(Math.random() * validUserIds.length)];
          setLikerUsername(fallbackUsernameMap[selectedUserId]);
        } finally {
          setIsLoadingLikerProfile(false);
        }
      } else if (displayLikes > 0) {
        // We have likes but no likedByUserIds yet - keep showing "Liked by..."
        // This allows parent component time to pass the likedByUserIds prop
        console.warn('⚠️ Has likes but no likedByUserIds - waiting for prop', {
          displayLikes,
          localLikedByUserIds,
          localLikedByUserIdsLength: localLikedByUserIds?.length || 0,
          feedId
        });
        // Keep loading state so UI shows "Liked by..." instead of "1 person"
        // Don't clear loading state - let parent component update the prop
        setIsLoadingLikerProfile(true);
      } else {
        console.log('⚠️ No displayLikes, clearing username');
        setLikerUsername(null);
        setUsernameMap({});
        setIsLoadingLikerProfile(false);
      }
    };
    
    fetchUsernames();
  }, [localLikedByUserIds, displayLikes]);
  
  // Generate avatar URLs for "Liked by" section (up to 2 avatars from actual likers)
  const likedByUsers = React.useMemo(() => {
    // Always show avatars if there are likes, even if we don't have localLikedByUserIds yet
    const shouldShowAvatars = displayLikes > 0 || (localLikedByUserIds && localLikedByUserIds.length > 0);
    
    if (!shouldShowAvatars) {
      return [];
    }
    
    // Use localLikedByUserIds if available, otherwise create placeholder avatars based on displayLikes
    if (localLikedByUserIds && localLikedByUserIds.length > 0) {
      // Get up to 2 random user IDs from the likes array
      const shuffled = [...localLikedByUserIds].sort(() => 0.5 - Math.random());
      const selectedUserIds = shuffled.slice(0, Math.min(2, localLikedByUserIds.length));
      
      // Use profile images from username map if available
      return selectedUserIds.map((userId, index) => ({
        userId,
        avatar        : `https://i.pravatar.cc/150?img=${12 + index}`,
      }));
    } else if (displayLikes > 0) {
      // Fallback: create placeholder avatars when we have likes count but no user IDs
      const avatarCount = Math.min(2, displayLikes);
      return Array.from({ length: avatarCount }, (_, index) => ({
        userId: `placeholder_${index}`,
        avatar: `https://i.pravatar.cc/150?img=${12 + index}`,
      }));
    }
    
    return [];
  }, [localLikedByUserIds, displayLikes]);
  
  // Background colors for action buttons
  const likeBgColor = isDark ? '#4B1F1F' : '#FEE2E2';
  const actionBgColor = isDark ? '#2A2A2A' : '#F5F5F5';
  const actionTextColor = isDark ? '#E5E5E5' : '#1F1F1F';
  
  // Responsive sizing based on device dimensions
  // Calculate scale factor based on screen width (using iPhone 14 Pro as reference: 393px)
  const baseWidth = 393;
  const scaleFactor = Math.min(SCREEN_WIDTH / baseWidth, 1.2); // Max scale 1.2x for tablets
  const minScale = 0.8; // Minimum scale for very small devices
  
  // Responsive dimensions
  const iconSize = Math.max(16 * scaleFactor, 16 * minScale); // Icon size: 16-19.2px
  const fontSize = Math.max(11 * scaleFactor, 11 * minScale); // Font size: 11-13.2px
  const buttonPaddingH = Math.max(8 * scaleFactor, 6 * minScale); // Horizontal padding: 6-9.6px
  const buttonPaddingV = Math.max(5 * scaleFactor, 4 * minScale); // Vertical padding: 4-6px
  const iconMarginRight = Math.max(5 * scaleFactor, 4 * minScale); // Icon-text spacing: 4-6px
  const buttonSpacing = Math.max(8 * scaleFactor, 6 * minScale); // Button spacing: 6-9.6px
  const borderRadius = Math.max(18 * scaleFactor, 16 * minScale); // Border radius: 16-21.6px

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect?.(emoji);
    setIsEmojiPickerVisible(false);
  };
  
  const handleLike = async () => {
    // Optimistic update
    const previousState = isHeartActive;
    const previousLikes = displayLikes;
    
    setIsHeartActive(!previousState);
    setDisplayLikes(previousState ? previousLikes - 1 : previousLikes + 1);
    onLike?.();
    
    // If feedId is provided, sync with backend
    if (feedId && !isLiking) {
      setIsLiking(true);
      try {
        const response = await toggleLike(feedId);
        if (response.success && response.data) {
          // Update with actual backend data
          const newLikesCount = response.data.likesCount || 0;
          setDisplayLikes(newLikesCount);
          setIsHeartActive(response.data.userLiked || false);
          
          // If response includes the likes array, update immediately
          // This allows us to fetch the username right away without waiting for parent refresh
          if (response.data.likes && Array.isArray(response.data.likes)) {
            console.log('✅ Updating likedByUserIds from toggleLike response:', response.data.likes);
            setLocalLikedByUserIds(response.data.likes);
          } else {
            console.warn('⚠️ toggleLike response does not include likes array. Response:', response.data);
            // Even if response doesn't have likes, we'll wait for parent to update the prop
          }
        } else {
          // Revert on error
          setIsHeartActive(previousState);
          setDisplayLikes(previousLikes);
        }
      } catch (error) {
        // Revert on error
        setIsHeartActive(previousState);
        setDisplayLikes(previousLikes);
        console.error('Error toggling like:', error);
      } finally {
        setIsLiking(false);
      }
    }
  };

  // Only show "Liked by" section if there are actual likes
  // Show if either displayLikes > 0 OR localLikedByUserIds has items
  const hasLikes = displayLikes > 0 || (localLikedByUserIds && localLikedByUserIds.length > 0);

  return (
    <View className="mb-3 pr-0">
      {/* Liked by Section - Only show if there are likes */}
      {hasLikes && (
        <View className="flex-row items-center mb-3">
          {/* Avatars - Show up to 2 avatars */}
          {likedByUsers.length > 0 && (
            <View className="flex-row items-center -mr-2">
              {likedByUsers.map((user, index) => (
                <View
                  key={`${user.userId}-${index}`}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: isDark ? '#1F1F1F' : '#FFFFFF',
                    marginLeft: index === 0 ? 0 : -8,
                    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    zIndex: likedByUsers.length - index,
                  }}
                >
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                    }}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
          )}
          <Text
            className="text-sm ml-2"
            style={{
              color: isDark ? '#E5E5E5' : '#1F1F1F',
              fontWeight: '500',
              flexShrink: 1,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isLoadingLikerProfile ? (
              'Liked by...'
            ) : likerUsername ? (
              <>
                Liked by <Text style={{ fontWeight: '600' }}>{likerUsername}</Text>
                {displayLikes > 1 ? ' and others' : ''}
              </>
            ) : displayLikes > 0 ? (
              // If we have likes but no username yet, keep showing loading
              // This handles the case where we have likes but likedByUserIds prop hasn't arrived yet
              'Liked by...'
            ) : (
              ''
            )}
          </Text>
        </View>
      )}

      {/* Professional Action Buttons with Rounded Boxes */}
      <View className="flex-row items-center justify-between mb-0" style={{ flexWrap: 'wrap' }}>
        {/* Primary Actions - Most Used */}
        <View className="flex-row items-center" style={{ flexShrink: 1 }}>
          {/* Comments Button */}
          <Pressable
            onPress={() => {
              setIsCommentsModalVisible(true);
              onReply?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
              style={{ marginRight: iconMarginRight }}
            >
              <Path
                d="M9,1.75C4.996,1.75,1.75,4.996,1.75,9c0,1.319,.358,2.552,.973,3.617,.43,.806-.053,2.712-.973,3.633,1.25,.068,2.897-.497,3.633-.973,.489,.282,1.264,.656,2.279,.848,.433,.082,.881,.125,1.338,.125,4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75Z"
                fill="none"
                stroke={actionTextColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="M5.992,12c.77,.772,1.834,1.25,3.008,1.25s2.231-.475,3-1.242"
                fill="none"
                stroke={actionTextColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </Svg>
            <Text
              style={{
                fontSize: fontSize,
                fontWeight: '600',
                color: actionTextColor,
                includeFontPadding: false,
              }}
            >
              {formatNumber(randomComments)}
            </Text>
          </Pressable>

          {/* Likes Button */}
          <Pressable
            onPress={handleLike}
            disabled={isLiking}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: isHeartActive 
                ? (isDark ? '#4B1F1F' : '#FEE2E2') 
                : likeBgColor,
              marginRight: buttonSpacing,
              opacity: isLiking ? 0.6 : 1,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
              style={{ marginRight: iconMarginRight }}
            >
              {isHeartActive ? (
                // Filled red heart when liked
                <Path
                  d="M12.164,2c-1.195,.015-2.324,.49-3.164,1.306-.84-.815-1.972-1.291-3.178-1.306-2.53,.015-4.582,2.084-4.572,4.609,0,5.253,5.306,8.429,6.932,9.278,.256,.133,.537,.2,.818,.2s.562-.067,.817-.2c1.626-.848,6.933-4.024,6.933-9.275,.009-2.528-2.042-4.597-4.586-4.612Z"
                  fill="#EF4444"
                  stroke="#DC2626"
                  strokeWidth="0.5"
                />
              ) : (
                // Outline heart when not liked
                <Path
                  d="M8.529,15.222c.297,.155,.644,.155,.941,0,1.57-.819,6.529-3.787,6.529-8.613,.008-2.12-1.704-3.846-3.826-3.859-1.277,.016-2.464,.66-3.173,1.72-.71-1.06-1.897-1.704-3.173-1.72-2.123,.013-3.834,1.739-3.826,3.859,0,4.826,4.959,7.794,6.529,8.613Z"
                  fill="none"
                  stroke={isDark ? '#FCA5A5' : '#DC2626'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              )}
            </Svg>
            <Text
              style={{
                fontSize: fontSize,
                fontWeight: '600',
                color: isHeartActive 
                  ? '#EF4444' // Red when liked
                  : (isDark ? '#FCA5A5' : '#DC2626'), // Red tint when not liked
                includeFontPadding: false,
              }}
            >
              {formatNumber(displayLikes)}
            </Text>
          </Pressable>
        </View>
        
        {/* Secondary Actions - Less Frequent */}
        <View className="flex-row items-center" style={{ flexShrink: 1 }}>
          {/* Reactions Button */}
          <Pressable
            onPress={() => setIsReactionsPickerVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
            >
              {isSmileActive ? (
                <>
                  <Path
                    d="M16.786,7.192c-.358,.77-1.133,1.308-2.036,1.308-1.241,0-2.25-1.009-2.25-2.25v-.25h-.25c-1.241,0-2.25-1.009-2.25-2.25,0-1.108,.807-2.027,1.864-2.211-.891-.343-1.854-.539-2.864-.539C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8c0-.623-.079-1.226-.214-1.808Zm-11.786,1.808c0-.552,.448-1,1-1s1,.448,1,1-.448,1-1,1-1-.448-1-1Zm6.884,3.16c-.631,.996-1.709,1.59-2.884,1.59s-2.253-.595-2.884-1.59c-.222-.35-.117-.813,.232-1.035,.349-.221,.813-.118,1.035,.232,.354,.559,.958,.893,1.616,.893s1.262-.334,1.616-.893c.222-.35,.684-.454,1.035-.232,.35,.222,.454,.685,.232,1.035Zm.116-2.16c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z"
                    fill={actionTextColor}
                  />
                  <Path
                    d="M17.25,3h-1.75V1.25c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.75h-1.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.75v1.75c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.75h1.75c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z"
                    fill={actionTextColor}
                  />
                </>
              ) : (
                <>
                  <Path
                    d="M11.251 11.758C10.779 12.504 9.94698 13 9.00098 13C8.05498 13 7.22298 12.504 6.75098 11.758"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M6.00098 10C6.55298 10 7.00098 9.5523 7.00098 9C7.00098 8.4477 6.55298 8 6.00098 8C5.44898 8 5.00098 8.4477 5.00098 9C5.00098 9.5523 5.44898 10 6.00098 10Z"
                    fill={actionTextColor}
                  />
                  <Path
                    d="M12.001 10C12.553 10 13.001 9.5523 13.001 9C13.001 8.4477 12.553 8 12.001 8C11.449 8 11.001 8.4477 11.001 9C11.001 9.5523 11.449 10 12.001 10Z"
                    fill={actionTextColor}
                  />
                  <Path
                    d="M14.751 1.25V6.25"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M17.251 3.75H12.251"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M9.95866 1.8155C9.64536 1.7729 9.32598 1.75 9.00098 1.75C4.99698 1.75 1.75098 4.996 1.75098 9C1.75098 13.004 4.99698 16.25 9.00098 16.25C13.005 16.25 16.251 13.004 16.251 9C16.251 8.9496 16.2505 8.8992 16.2494 8.849"
                    stroke={actionTextColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              )}
            </Svg>
          </Pressable>

          {/* Share Button - No number */}
          <Pressable
            onPress={() => {
            setIsSendActive(!isSendActive);
            onShare?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
              marginRight: buttonSpacing,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
            >
              {isSendActive ? (
                <Path
                  d="M16.345,1.654c-.344-.344-.845-.463-1.305-.315L2.117,5.493c-.491,.158-.831,.574-.887,1.087-.056,.512,.187,.992,.632,1.251l4.576,2.669,3.953-3.954c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-3.954,3.954,2.669,4.576c.235,.402,.65,.639,1.107,.639,.048,0,.097-.003,.146-.008,.512-.056,.929-.396,1.086-.886L16.661,2.96h0c.148-.463,.027-.963-.316-1.306Z"
                  fill={actionTextColor}
                />
              ) : (
                <>
                  <Line
                    x1="15.813"
                    y1="2.187"
                    x2="7.657"
                    y2="10.343"
                    fill="none"
                    stroke={actionTextColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M15.947,2.73l-4.154,12.923c-.142,.443-.743,.509-.977,.106l-3.159-5.416L2.241,7.184c-.402-.235-.337-.835,.106-.977L15.27,2.053c.417-.134,.811,.26,.677,.677Z"
                    fill="none"
                    stroke={actionTextColor}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </Svg>
          </Pressable>

          {/* Bookmark Button */}
          <Pressable
            onPress={() => {
            setIsBookmarkActive(!isBookmarkActive);
            onBookmark?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: buttonPaddingH,
              paddingVertical: buttonPaddingV,
              borderRadius: borderRadius,
              backgroundColor: actionBgColor,
            }}
          >
            <Svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 18 18"
            >
              {isBookmarkActive ? (
                <Path
                  d="M12.25,1H5.75c-1.517,0-2.75,1.233-2.75,2.75v12.5c0,.276,.152,.531,.396,.661,.244,.131,.54,.117,.77-.037l4.834-3.223,4.834,3.223c.125,.083,.271,.126,.416,.126,.122,0,.243-.029,.354-.089,.244-.13,.396-.385,.396-.661V3.75c0-1.517-1.233-2.75-2.75-2.75Z"
                  fill={actionTextColor}
                />
              ) : (
                <Path
                  d="M14.25,16.25l-5.25-3.5-5.25,3.5V3.75c0-1.105,.895-2,2-2h6.5c1.105,0,2,.895,2,2v12.5Z"
                  fill="none"
                  stroke={actionTextColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              )}
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* Reactions Picker */}
      <ReactionsPicker
        visible={isReactionsPickerVisible}
        onClose={() => setIsReactionsPickerVisible(false)}
        onReactionSelect={handleEmojiSelect}
      />

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        visible={isEmojiPickerVisible}
        onClose={() => setIsEmojiPickerVisible(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      {/* Comments Modal */}
      <CommentsModal
        visible={isCommentsModalVisible}
        onClose={() => setIsCommentsModalVisible(false)}
        commentsCount={randomComments}
      />
    </View>
  );
}
