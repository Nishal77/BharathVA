import React, { useState, useEffect, useRef } from 'react';
import { Pressable, Text, View, useColorScheme, Dimensions } from 'react-native';
import { Image } from 'expo-image';
// Removed MessageCircle import - using custom SVG
import { Svg, Path, Line } from 'react-native-svg';
import EmojiPickerModal from '../../components/EmojiPickerModal';
import ReactionsPicker from '../../components/ReactionsPicker';
import CommentsModal from './components/CommentsModal';
import { toggleLike } from '../../services/api/feedService';
import { getUserProfileById, getUsernamesBatch, UserProfile } from '../../services/api/userService';
import { webSocketService, FeedEvent } from '../../services/api/websocketService';
import * as SecureStore from 'expo-secure-store';

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
  onCommentAdded?: () => void; // Callback when comment is added to refresh feed list
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
  userLiked: initialUserLiked = false,
  onCommentAdded
}: FeedActionSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isSmileActive, setIsSmileActive] = useState(false);
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);
  const [isSendActive, setIsSendActive] = useState(false);
  // Initialize with initialUserLiked, but will be synced via useEffect
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
  
  // Store authenticated user ID for fallback check
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Track processed WebSocket events to prevent duplicate processing
  const processedEventsRef = useRef<Set<string>>(new Set());
  
  // Get authenticated user ID from token on mount
  useEffect(() => {
    const getAuthenticatedUserId = async () => {
      try {
        // Get token directly from SecureStore
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          // Decode JWT to get user ID
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          const userId = payload.userId || payload.sub || null;
          if (userId) {
            setCurrentUserId(userId);
            console.log('✅ Authenticated user ID extracted:', userId);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not extract authenticated user ID:', error);
      }
    };
    getAuthenticatedUserId();
  }, []);
  
  // DATABASE IS THE SOURCE OF TRUTH - Sync with prop changes from MongoDB
  // This ensures the UI always reflects the actual database state
  useEffect(() => {
    // Priority 1: Use likedByUserIds array from database (most accurate - direct from MongoDB)
    if (likedByUserIds && Array.isArray(likedByUserIds)) {
      const dbLikesCount = likedByUserIds.length;
      const currentLocalArray = localLikedByUserIds || [];
      
      // Check if arrays are different
      const arraysEqual = dbLikesCount === currentLocalArray.length &&
        dbLikesCount > 0 && 
        dbLikesCount === currentLocalArray.filter(id => likedByUserIds.includes(id)).length;
      
      if (!arraysEqual || displayLikes !== dbLikesCount) {
        console.log('🔄 Syncing from database (likedByUserIds):', {
          databaseArray: likedByUserIds,
          databaseLength: dbLikesCount,
          currentLocalArray: currentLocalArray,
          currentLocalLength: currentLocalArray.length,
          currentDisplayLikes: displayLikes,
          willUpdate: true
        });
        
        // Always sync localLikedByUserIds with database state
        setLocalLikedByUserIds([...likedByUserIds]);
        
        // Always sync display count with database array length
        setDisplayLikes(dbLikesCount);
      }
    }
    // Priority 2: Use likes prop if likedByUserIds not available
    else if (likes !== undefined) {
      console.log('🔄 Syncing displayLikes with likes prop (fallback):', likes);
      if (displayLikes !== likes) {
        setDisplayLikes(likes);
      }
    }
    // Priority 3: Reset to 0 if no likes data available
    else {
      if (displayLikes !== 0 || localLikedByUserIds.length > 0) {
        console.log('🔄 Resetting displayLikes to 0 (no likes data from database)');
        setDisplayLikes(0);
        setLocalLikedByUserIds([]);
      }
    }
  }, [likes, likedByUserIds]); // Only depend on props from database, not local state
  
  // Sync comment count with prop changes
  useEffect(() => {
    if (comments !== undefined) {
      setDisplayComments(comments);
    }
  }, [comments]);
  
  // BULLETPROOF: Sync heart active state with userLiked prop changes
  // This ensures the heart state always reflects the backend truth, even after refresh
  useEffect(() => {
    // Priority 1: Use initialUserLiked from backend (most reliable)
    let shouldBeActive = initialUserLiked;
    
    // Priority 2: Fallback - check if current user ID is in likedByUserIds array
    if (shouldBeActive === false && currentUserId && localLikedByUserIds && localLikedByUserIds.length > 0) {
      const isInLikesArray = localLikedByUserIds.includes(currentUserId);
      if (isInLikesArray) {
        shouldBeActive = true;
        console.log('🔍 Fallback check: User ID found in likes array, setting heart active');
      }
    }
    
    // Only update if different to prevent unnecessary re-renders
    if (isHeartActive !== shouldBeActive) {
      console.log('🔄 Syncing isHeartActive with userLiked prop:', {
        feedId,
        initialUserLiked,
        currentUserId,
        shouldBeActive,
        currentIsHeartActive: isHeartActive,
        displayLikes,
        likedByUserIdsLength: localLikedByUserIds?.length || 0,
        isInLikesArray: currentUserId ? localLikedByUserIds?.includes(currentUserId) : false
      });
      setIsHeartActive(shouldBeActive);
    }
  }, [initialUserLiked, feedId, currentUserId, localLikedByUserIds, isHeartActive]);
  
  // Real-time comment count state (starts with prop value)
  const initialComments = comments !== undefined ? comments : 0;
  const [displayComments, setDisplayComments] = useState(initialComments);
  
  // Ref to track if we've already processed a like/unlike event from current user
  // This prevents double-counting when user likes/unlikes (optimistic update + WebSocket)
  const lastProcessedLikeEventRef = useRef<{ userId: string; timestamp: string } | null>(null);
  
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
            
            // CRITICAL: Only show usernames that exist in MongoDB
            // Don't use fallback usernames - if user doesn't exist, don't show them
            if (selectedUsername && typeof selectedUsername === 'string' && selectedUsername.trim().length > 0) {
              // Filter out deleted user markers
              if (!selectedUsername.startsWith('[deleted_') && selectedUsername !== '[Deleted User]') {
                setLikerUsername(selectedUsername.trim());
                console.log('✅ Selected username for display:', selectedUsername);
              } else {
                // User is deleted - try to find another valid user
                const availableUsernames = Object.entries(fetchedUsernameMap)
                  .filter(([_, username]) => 
                    typeof username === 'string' && 
                    username.trim().length > 0 &&
                    !username.startsWith('[deleted_') &&
                    username !== '[Deleted User]'
                  )
                  .map(([_, username]) => username as string);
                
                if (availableUsernames.length > 0) {
                  setLikerUsername(availableUsernames[0]);
                  console.log('✅ Using alternative username (selected user was deleted):', availableUsernames[0]);
                } else {
                  // No valid users found - clear the display
                  setLikerUsername(null);
                  setUsernameMap({});
                  console.log('⚠️ No valid users found in likes (all deleted or not found)');
                }
              }
            } else {
              // Try to find any valid username from the map
              const availableUsernames = Object.values(fetchedUsernameMap).filter(
                (u): u is string => 
                  typeof u === 'string' && 
                  u.trim().length > 0 &&
                  !u.startsWith('[deleted_') &&
                  u !== '[Deleted User]'
              );
              
              if (availableUsernames.length > 0) {
                setLikerUsername(availableUsernames[0]);
                console.log('✅ Using first available username:', availableUsernames[0]);
              } else {
                // No valid users - clear display
                setLikerUsername(null);
                setUsernameMap({});
                console.log('⚠️ No valid usernames found (all users deleted or not found)');
              }
            }
          } else {
            // CRITICAL: If batch fetch failed, don't show fallback usernames
            // Only show users that actually exist in MongoDB
            console.warn('⚠️ Failed to batch fetch usernames - not showing fallback usernames');
            setUsernameMap({});
            setLikerUsername(null);
          }
        } catch (error) {
          console.error('❌ Error batch fetching usernames:', error);
          // CRITICAL: Don't show fallback usernames - only show users that exist
          setUsernameMap({});
          setLikerUsername(null);
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
  // CRITICAL: Only show avatars for users that exist in MongoDB
  const likedByUsers = React.useMemo(() => {
    // Always show avatars if there are likes, even if we don't have localLikedByUserIds yet
    const shouldShowAvatars = displayLikes > 0 || (localLikedByUserIds && localLikedByUserIds.length > 0);
    
    if (!shouldShowAvatars) {
      return [];
    }
    
    // Use localLikedByUserIds if available, otherwise create placeholder avatars based on displayLikes
    if (localLikedByUserIds && localLikedByUserIds.length > 0) {
      // CRITICAL: Filter out deleted users - only show users that exist
      const validUserIds = localLikedByUserIds.filter(userId => {
        const username = usernameMap[userId];
        // Only include users that have a valid username (exist in MongoDB)
        // Exclude deleted users and users without usernames
        return username && 
               typeof username === 'string' && 
               username.trim().length > 0 &&
               !username.startsWith('[deleted_') &&
               username !== '[Deleted User]';
      });
      
      if (validUserIds.length === 0) {
        // No valid users - don't show avatars
        return [];
      }
      
      // Get up to 2 random user IDs from the valid likes array
      const shuffled = [...validUserIds].sort(() => 0.5 - Math.random());
      const selectedUserIds = shuffled.slice(0, Math.min(2, validUserIds.length));
      
      // Use profile images from username map if available
      return selectedUserIds.map((userId, index) => ({
        userId,
        avatar: `https://i.pravatar.cc/150?img=${12 + index}`,
      }));
    } else if (displayLikes > 0) {
      // CRITICAL: Don't show placeholder avatars - only show users that exist
      // If we don't have user IDs, don't show avatars
      return [];
    }
    
    return [];
  }, [localLikedByUserIds, displayLikes, usernameMap]);
  
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
    const previousLikedByUserIds = [...localLikedByUserIds];
    
    // Optimistic UI update
    setIsHeartActive(!previousState);
    
    // Update localLikedByUserIds optimistically
    if (!previousState) {
      // Adding like - add current user to array if not already present
      if (currentUserId && !previousLikedByUserIds.includes(currentUserId)) {
        const optimisticLikes = [...previousLikedByUserIds, currentUserId];
        setLocalLikedByUserIds(optimisticLikes);
        setDisplayLikes(optimisticLikes.length);
      }
    } else {
      // Removing like - remove current user from array
      if (currentUserId) {
        const optimisticLikes = previousLikedByUserIds.filter(id => id !== currentUserId);
        setLocalLikedByUserIds(optimisticLikes);
        setDisplayLikes(optimisticLikes.length);
      }
    }
    
    onLike?.();
    
    // Mark that we're processing a like event from current user to prevent double-counting
    if (currentUserId && feedId) {
      lastProcessedLikeEventRef.current = {
        userId: currentUserId,
        timestamp: new Date().toISOString()
      };
    }
    
    // If feedId is provided, sync with backend (database is source of truth)
    if (feedId && !isLiking) {
      setIsLiking(true);
      try {
        const response = await toggleLike(feedId);
        if (response.success && response.data) {
          // Update with actual backend data - this is the source of truth from MongoDB
          const newLikesCount = response.data.likesCount || 0;
          const newUserLiked = response.data.userLiked !== undefined ? response.data.userLiked : false;
          
          console.log('✅ Like toggle response received from database:', {
            feedId,
            newLikesCount,
            newUserLiked,
            likesArray: response.data.likes,
            likesArrayLength: response.data.likes?.length || 0,
            userLikedFromBackend: response.data.userLiked
          });
          
          // CRITICAL: Always update from backend response (database is source of truth)
          if (response.data.likes && Array.isArray(response.data.likes)) {
            console.log('✅ Syncing likedByUserIds from database:', response.data.likes);
            setLocalLikedByUserIds(response.data.likes);
            // Count should match array length from database
            setDisplayLikes(response.data.likes.length);
          } else {
            // Fallback: use likesCount if array not provided
            console.warn('⚠️ toggleLike response does not include likes array, using likesCount');
            setDisplayLikes(newLikesCount);
          }
          
          // Always sync heart state with backend
          setIsHeartActive(newUserLiked);
          
          // Verify consistency
          if (currentUserId && response.data.likes && Array.isArray(response.data.likes)) {
            const isInArray = response.data.likes.includes(currentUserId);
            if (isInArray !== newUserLiked) {
              console.warn('⚠️ Inconsistency detected: User ID in likes array:', isInArray, 'but userLiked:', newUserLiked);
              // Trust the array over userLiked flag
              setIsHeartActive(isInArray);
            }
          }
        } else {
          // Revert on error - restore previous state
          console.error('❌ Like toggle failed, reverting optimistic update');
          setIsHeartActive(previousState);
          setLocalLikedByUserIds(previousLikedByUserIds);
          setDisplayLikes(previousLikes);
        }
      } catch (error) {
        // Revert on error - restore previous state
        console.error('❌ Error toggling like, reverting optimistic update:', error);
        setIsHeartActive(previousState);
        setLocalLikedByUserIds(previousLikedByUserIds);
        setDisplayLikes(previousLikes);
      } finally {
        setIsLiking(false);
      }
    }
  };
  
  // Setup WebSocket listeners for real-time like and comment updates
  useEffect(() => {
    if (!feedId) {
      return; // Don't setup WebSocket if no feedId
    }
    
    console.log('🔌 Setting up WebSocket listeners for feed:', feedId);
    
    const handleFeedLiked = (event: FeedEvent) => {
      // Only process events for this specific feed
      if (event.feedId !== feedId || !event.userId) {
        return;
      }
      
      // Create unique event ID to prevent duplicate processing
      const eventId = `${event.feedId}-${event.userId}-${event.timestamp}`;
      if (processedEventsRef.current.has(eventId)) {
        console.log('⏭️ Skipping duplicate like event:', eventId);
        return;
      }
      processedEventsRef.current.add(eventId);
      
      // Skip if this is our own like action (already handled optimistically via API response)
      if (currentUserId && event.userId === currentUserId) {
        const eventTime = new Date(event.timestamp).getTime();
        const lastProcessedTime = lastProcessedLikeEventRef.current?.timestamp 
          ? new Date(lastProcessedLikeEventRef.current.timestamp).getTime() 
          : 0;
        
        // If event is within 3 seconds of our last action, skip it (already processed)
        if (lastProcessedTime > 0 && Math.abs(eventTime - lastProcessedTime) < 3000) {
          console.log('⏭️ Skipping own like event (already processed optimistically)');
          processedEventsRef.current.delete(eventId); // Remove so it can be processed later if needed
          return;
        }
      }
      
      console.log('📥 WebSocket: Feed liked event received for feed:', feedId, 'by user:', event.userId);
      
      // CRITICAL: Only increment if this user is NOT already in the likedByUserIds array
      // This prevents double-counting when the same event is received multiple times
      setLocalLikedByUserIds(prev => {
        if (prev.includes(event.userId!)) {
          console.log('⚠️ User already in likes array, not incrementing count. User:', event.userId);
          return prev; // User already liked, don't change
        }
        
        // Add user to the array
        const updated = [...prev, event.userId!];
        console.log('✅ Adding user to likes array. New count:', updated.length);
        
        // Update display count based on array length (source of truth)
        setDisplayLikes(updated.length);
        
        return updated;
      });
    };
    
    const handleFeedUnliked = (event: FeedEvent) => {
      // Only process events for this specific feed
      if (event.feedId !== feedId || !event.userId) {
        return;
      }
      
      // Create unique event ID to prevent duplicate processing
      const eventId = `${event.feedId}-${event.userId}-${event.timestamp}`;
      if (processedEventsRef.current.has(eventId)) {
        console.log('⏭️ Skipping duplicate unlike event:', eventId);
        return;
      }
      processedEventsRef.current.add(eventId);
      
      // Skip if this is our own unlike action (already handled optimistically via API response)
      if (currentUserId && event.userId === currentUserId) {
        const eventTime = new Date(event.timestamp).getTime();
        const lastProcessedTime = lastProcessedLikeEventRef.current?.timestamp 
          ? new Date(lastProcessedLikeEventRef.current.timestamp).getTime() 
          : 0;
        
        // If event is within 3 seconds of our last action, skip it (already processed)
        if (lastProcessedTime > 0 && Math.abs(eventTime - lastProcessedTime) < 3000) {
          console.log('⏭️ Skipping own unlike event (already processed optimistically)');
          processedEventsRef.current.delete(eventId); // Remove so it can be processed later if needed
          return;
        }
      }
      
      console.log('📥 WebSocket: Feed unliked event received for feed:', feedId, 'by user:', event.userId);
      
      // CRITICAL: Only decrement if this user IS in the likedByUserIds array
      // This prevents decrementing when the user wasn't in the count to begin with
      setLocalLikedByUserIds(prev => {
        if (!prev.includes(event.userId!)) {
          console.log('⚠️ User not in likes array, not decrementing count. User:', event.userId);
          return prev; // User wasn't in the list, don't change
        }
        
        // Remove user from the array
        const updated = prev.filter(id => id !== event.userId);
        console.log('✅ Removing user from likes array. New count:', updated.length);
        
        // Update display count based on array length (source of truth)
        setDisplayLikes(Math.max(0, updated.length)); // Ensure count never goes below 0
        
        return updated;
      });
    };
    
    const handleFeedCommented = (event: FeedEvent) => {
      // Only process events for this specific feed
      if (event.feedId !== feedId || !event.userId) {
        return;
      }
      
      // Create unique event ID to prevent duplicate processing
      const eventId = `comment-${event.feedId}-${event.userId}-${event.timestamp}`;
      if (processedEventsRef.current.has(eventId)) {
        console.log('⏭️ Skipping duplicate comment event:', eventId);
        return;
      }
      processedEventsRef.current.add(eventId);
      
      console.log('📥 WebSocket: Feed commented event received for feed:', feedId, 'by user:', event.userId);
      
      // Increment comment count (comments are always additive, no need to check array)
      setDisplayComments(prev => {
        const newCount = prev + 1;
        console.log('✅ Updated comment count via WebSocket:', prev, '->', newCount);
        return newCount;
      });
      
      // Notify parent component that a comment was added (will trigger feed refresh)
      onCommentAdded?.();
    };
    
    const handleCommentDeleted = (event: FeedEvent) => {
      // Only process events for this specific feed
      if (event.feedId !== feedId) {
        return;
      }
      
      // Create unique event ID to prevent duplicate processing
      const eventId = `comment-delete-${event.feedId}-${event.timestamp}`;
      if (processedEventsRef.current.has(eventId)) {
        console.log('⏭️ Skipping duplicate comment deletion event:', eventId);
        return;
      }
      processedEventsRef.current.add(eventId);
      
      console.log('📥 WebSocket: Comment deleted event received for feed:', feedId, 'by user:', event.userId);
      
      // Decrement comment count (ensure it never goes below 0)
      setDisplayComments(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('✅ Updated comment count via WebSocket:', prev, '->', newCount);
        return newCount;
      });
      
      // Notify parent component that a comment was deleted (will trigger feed refresh)
      onCommentAdded?.();
    };
    
    // Connect to WebSocket with feed-specific callbacks
    // This will merge callbacks with existing ones and ensure connection is active
    webSocketService.connect({
      onFeedLiked: handleFeedLiked,
      onFeedUnliked: handleFeedUnliked,
      onFeedCommented: handleFeedCommented,
      onCommentDeleted: handleCommentDeleted,
      onConnectionEstablished: () => {
        console.log('✅ WebSocket connection established for FeedActionSection, feed:', feedId);
      },
      onError: (error) => {
        console.error('❌ WebSocket error in FeedActionSection:', error);
      },
    });
    
    // Ensure WebSocket is connected - check after a short delay
    const checkConnection = setTimeout(() => {
      if (!webSocketService.isWebSocketConnected()) {
        console.warn('⚠️ WebSocket not connected, attempting to reconnect...');
        webSocketService.connect({
          onFeedLiked: handleFeedLiked,
          onFeedUnliked: handleFeedUnliked,
          onFeedCommented: handleFeedCommented,
          onCommentDeleted: handleCommentDeleted,
        });
      }
    }, 1000);
    
    // Cleanup is handled by the WebSocket service singleton
    return () => {
      clearTimeout(checkConnection);
      // Clear processed events for this feed to allow fresh processing on remount
      processedEventsRef.current.clear();
      // Note: We don't disconnect as WebSocket is shared across components
      // The service manages its own lifecycle
      console.log('🧹 Cleaning up WebSocket listeners for feed:', feedId);
    };
  }, [feedId, currentUserId, onCommentAdded]);

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
              {formatNumber(displayComments)}
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
        commentsCount={displayComments}
        postId={feedId}
        onCommentAdded={onCommentAdded}
      />
    </View>
  );
}
