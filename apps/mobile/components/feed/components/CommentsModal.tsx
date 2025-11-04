import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Svg, Path } from 'react-native-svg';
import { Ellipsis } from 'lucide-react-native';
import CommentsAction from './CommentsAction';
import { addComment, getAllFeeds, getFeedById } from '../../../services/api/feedService';
import { getUserProfileById } from '../../../services/api/userService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Comment {
  id: string;
  name?: string;
  username: string;
  avatar: string;
  comment: string;
  timestamp: string;
  edited?: boolean;
  pronouns?: string;
  claps: number;
  replies: number;
  isClapped: boolean;
  repliesList?: Comment[];
  showReplies?: boolean;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId?: string;
  commentsCount?: number;
  onCommentAdded?: () => void; // Callback to refresh parent feed list
}


const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 1) {
    return '<1m';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 12) {
    return `${diffHours}h`;
  } else if (diffHours < 24) {
    return `${diffHours}hr`;
  } else if (diffDays < 7) {
    return `${diffDays}day`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}week`;
  } else if (diffMonths < 12) {
    return `${diffMonths}month`;
  } else {
    return `${diffYears}year`;
  }
};

export default function CommentsModal({
  visible,
  onClose,
  postId,
  commentsCount = 0,
  onCommentAdded,
}: CommentsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [clappedComments, setClappedComments] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Theme-compatible color for "Show replies" text - works in both light and dark
  const showRepliesColor = isDark ? '#60A5FA' : '#2563EB';

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Fetch comments from backend when modal opens
  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    } else if (visible && !postId) {
      // If no postId, initialize with empty array
      setComments([]);
    }
  }, [visible, postId]);

  const fetchComments = async () => {
    if (!postId) {
      console.log('[CommentsModal] No postId provided, skipping fetch');
      setComments([]);
      return;
    }
    
    setIsLoadingComments(true);
    console.log('[CommentsModal] Fetching comments for postId:', postId);
    
    try {
      // Fetch the specific feed by ID (more efficient than fetching all feeds)
      const response = await getFeedById(postId);
      console.log('[CommentsModal] getFeedById response:', {
        success: response.success,
        hasData: !!response.data,
        feedId: response.data?.id,
        commentsCount: response.data?.comments?.length || 0,
        comments: response.data?.comments
      });
      
      if (response.success && response.data) {
        const feed = response.data;
        
        console.log('[CommentsModal] Feed data:', {
          feedId: feed.id,
          commentsCountFromBackend: feed.commentsCount,
          commentsArrayLength: feed.comments?.length || 0,
          commentsArray: feed.comments
        });
        
        // Always process comments if they exist - check both comments array and commentsCount
        const hasComments = feed.comments && Array.isArray(feed.comments) && feed.comments.length > 0;
        const hasCommentsCount = feed.commentsCount && feed.commentsCount > 0;
        
        console.log('[CommentsModal] Comment check:', {
          hasComments,
          hasCommentsCount,
          commentsArrayLength: feed.comments?.length || 0,
          commentsCount: feed.commentsCount,
          commentsArray: feed.comments
        });
        
        if (hasComments) {
          console.log('[CommentsModal] Processing', feed.comments.length, 'comments from array');
          
          // Fetch user profiles for all comment authors
          const userIds = [...new Set(feed.comments.map(c => c.userId))];
          console.log('[CommentsModal] Unique user IDs:', userIds);
          
          const userProfiles = new Map<string, { username: string; fullName: string; profileImageUrl?: string | null }>();
          
          // Batch fetch user profiles using Promise.all for parallel requests
          const profilePromises = userIds.map(async (userId) => {
            try {
              const userResponse = await getUserProfileById(userId);
              if (userResponse.success && userResponse.data) {
                return {
                  userId,
                  profile: {
                    username: userResponse.data.username || `user_${userId.substring(0, 8)}`,
                    fullName: userResponse.data.fullName || `User ${userId.substring(0, 8)}`,
                    profileImageUrl: userResponse.data.profileImageUrl || userResponse.data.profilePicture || null,
                  }
                };
              }
            } catch (error) {
              console.error(`[CommentsModal] Failed to fetch user profile for ${userId}:`, error);
            }
            return {
              userId,
              profile: {
                username: `user_${userId.substring(0, 8)}`,
                fullName: `User ${userId.substring(0, 8)}`,
                profileImageUrl: null,
              }
            };
          });
          
          const profileResults = await Promise.all(profilePromises);
          profileResults.forEach(({ userId, profile }) => {
            userProfiles.set(userId, profile);
          });
          
          console.log('[CommentsModal] Fetched user profiles:', userProfiles.size);
          
          // Convert backend comments to frontend Comment format
          // Ensure we process ALL comments - don't filter or limit
          console.log('[CommentsModal] Mapping comments:', feed.comments.length, 'total comments');
          const formattedComments: Comment[] = feed.comments
            .map((comment, index) => {
              console.log('[CommentsModal] Mapping comment', index, ':', {
                userId: comment.userId,
                text: comment.text,
                createdAt: comment.createdAt
              });
              const userProfile = userProfiles.get(comment.userId) || {
                username: `user_${comment.userId.substring(0, 8)}`,
                fullName: `User ${comment.userId.substring(0, 8)}`,
                profileImageUrl: null,
              };
              
              const createdAt = new Date(comment.createdAt);
              const timestamp = formatRelativeTime(createdAt);
              
              // Generate unique ID using feed ID, user ID, timestamp (full ISO string), index, and text hash
              // This ensures uniqueness even if same user comments multiple times
              // Use full ISO timestamp string to ensure millisecond precision
              const timestampStr = new Date(comment.createdAt).getTime().toString();
              const textHash = comment.text.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
              // Include index to ensure uniqueness even if timestamps match
              const uniqueId = `comment_${postId}_${comment.userId}_${timestampStr}_${index}_${textHash}`;
              
              console.log('[CommentsModal] Generated comment ID:', uniqueId, {
                index,
                text: comment.text.substring(0, 20),
                timestamp: comment.createdAt,
                userId: comment.userId.substring(0, 8)
              });
              
              return {
                id: uniqueId,
                name: userProfile.fullName,
                username: userProfile.username,
                avatar: userProfile.profileImageUrl || `https://i.pravatar.cc/150?img=${index + 1}`,
                comment: comment.text,
                timestamp,
                claps: 0,
                replies: 0,
                isClapped: false,
                showReplies: false,
              };
            })
            .reverse(); // Show newest first
          
          // Verify we have all comments before setting state
          console.log('[CommentsModal] Formatted comments:', formattedComments.length, 'out of', feed.comments.length, 'original');
          console.log('[CommentsModal] Comment details:', formattedComments.map((c, idx) => ({
            index: idx,
            id: c.id,
            text: c.comment,
            username: c.username,
            name: c.name
          })));
          
          // Verify count matches
          if (formattedComments.length !== feed.comments.length) {
            console.error('[CommentsModal] ERROR: Comment count mismatch!', {
              expected: feed.comments.length,
              actual: formattedComments.length,
              commentsCount: feed.commentsCount,
              feedComments: feed.comments.map((c, i) => ({ index: i, text: c.text, userId: c.userId }))
            });
          }
          
          setComments(formattedComments);
        } else {
          // Check if commentsCount suggests there should be comments
          if (feed.commentsCount && feed.commentsCount > 0) {
            console.warn('[CommentsModal] WARNING: Feed has commentsCount =', feed.commentsCount, 'but comments array is empty or missing');
          }
          console.log('[CommentsModal] No comments to display - comments array is empty or missing');
          setComments([]);
        }
      } else {
        console.warn('[CommentsModal] Failed to fetch feeds or no data:', response.error);
        setComments([]);
      }
    } catch (error) {
      console.error('[CommentsModal] Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (visible) {
      
      // Animate modal in with premium spring animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal out smoothly
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClap = (commentId: string) => {
    setClappedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, claps: Math.max(0, comment.claps - 1), isClapped: false };
            }
            if (comment.repliesList) {
              const updatedReplies = comment.repliesList.map((reply) =>
                reply.id === commentId ? { ...reply, claps: Math.max(0, reply.claps - 1), isClapped: false } : reply
              );
              return { ...comment, repliesList: updatedReplies };
            }
            return comment;
          })
        );
      } else {
        newSet.add(commentId);
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, claps: comment.claps + 1, isClapped: true };
            }
            if (comment.repliesList) {
              const updatedReplies = comment.repliesList.map((reply) =>
                reply.id === commentId ? { ...reply, claps: reply.claps + 1, isClapped: true } : reply
              );
              return { ...comment, repliesList: updatedReplies };
            }
            return comment;
          })
        );
      }
      return newSet;
    });
  };

  const toggleShowReplies = (commentId: string) => {
    setShowReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSendComment = async () => {
    if (!inputText.trim() || !postId || isSubmittingComment) {
      return;
    }
    
    setIsSubmittingComment(true);
    const commentText = inputText.trim();
    
    try {
      // Optimistic update - add comment immediately
      const now = new Date();
      const timestamp = formatRelativeTime(now);
      
      // Get current user profile for optimistic comment
      // For now, use placeholder - will be updated after API call
      const optimisticComment: Comment = {
        id: `temp_${Date.now()}`,
        name: 'You',
        username: 'you',
        avatar: 'https://i.pravatar.cc/150?img=1',
        comment: commentText,
        timestamp,
        claps: 0,
        replies: 0,
        isClapped: false,
        showReplies: false,
      };
      
      setComments((prev) => [optimisticComment, ...prev]);
      setInputText('');
      
      // Submit comment to backend
      const response = await addComment(postId, commentText);
      
      if (response.success && response.data) {
        console.log('[CommentsModal] Comment added successfully, refreshing comments:', {
          responseCommentsCount: response.data.commentsCount,
          responseCommentsLength: response.data.comments?.length || 0
        });
        // Refresh comments to get all comments including the new one
        await fetchComments();
        // Notify parent to refresh feed list to update comment count
        onCommentAdded?.();
      } else {
        // Remove optimistic comment on error
        setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
        console.error('Failed to add comment:', response.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Remove optimistic comment on error
      setComments((prev) => prev.filter(c => !c.id.startsWith('temp_')));
    } finally {
      setIsSubmittingComment(false);
    }
  };


  // Use all comments - no filtering needed
  const filteredComments = comments;
  
  // Log for debugging
  React.useEffect(() => {
    if (comments.length > 0) {
      console.log('[CommentsModal] Comments state updated:', {
        count: comments.length,
        commentTexts: comments.map(c => c.comment),
        commentIds: comments.map(c => c.id)
      });
    }
  }, [comments]);

  // Theme colors - Premium white background
  const backgroundColor = '#FFFFFF';
  const modalBgColor = '#FFFFFF';
  const textColor = '#000000';
  const secondaryTextColor = '#6B7280';
  const borderColor = 'rgba(0, 0, 0, 0.08)';
  const inputBgColor = '#F5F5F5';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Backdrop */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: opacityAnim,
            }}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={onClose}
            />
          </Animated.View>

          {/* Modal Content */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: SCREEN_HEIGHT * 0.75,
              maxHeight: SCREEN_HEIGHT * 0.85,
              backgroundColor: modalBgColor,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 24,
              overflow: 'hidden',
            }}
          >
            {/* Unified Header with Glassmorphism (Drag Handle + Title) */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                overflow: 'hidden',
              }}
            >
              <BlurView
                intensity={85}
                tint="light"
                style={{
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  {/* Drag Handle */}
                  <View
                    style={{
                      alignItems: 'center',
                      paddingTop: 12,
                      paddingBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </View>

                  {/* Responses Header - Modern Horizontal Layout */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 16,
                      paddingBottom: 16,
                      paddingTop: 8,
                    }}
                  >
                    {/* 3 Avatars */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      {comments.slice(0, 3).map((comment, index) => (
                        <View
                          key={comment.id}
                          style={{
                            marginLeft: index > 0 ? -6 : 0,
                            borderWidth: 1.5,
                            borderColor: '#FFFFFF',
                            borderRadius: 12,
                            zIndex: 3 - index,
                          }}
                        >
                          <Image
                            source={{ uri: comment.avatar }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 10.5,
                            }}
                            contentFit="cover"
                          />
                        </View>
                      ))}
                    </View>

                    {/* Comment Count and Responses Text */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: textColor,
                        letterSpacing: 0.2,
                        marginLeft: 10,
                      }}
                    >
                      {comments.length > 0 ? comments.length : (commentsCount > 0 ? commentsCount : 0)} Responses
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Comments List with padding for fixed header */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingTop: 120,
                paddingBottom: 120,
              }}
              showsVerticalScrollIndicator={false}
            >
              {isLoadingComments ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 60,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: secondaryTextColor,
                      textAlign: 'center',
                    }}
                  >
                    Loading comments...
                  </Text>
                </View>
              ) : filteredComments.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 60,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: secondaryTextColor,
                      textAlign: 'center',
                    }}
                  >
                    No comments yet
                  </Text>
                </View>
              ) : (
                <View>
                  {filteredComments.map((comment, index) => {
                    // Use the comment's ID directly - it should be unique
                    // Add index as fallback only if ID is missing
                    const stableKey = comment.id || `comment_fallback_${postId}_${index}_${comment.timestamp}`;
                    
                    // Log for debugging - ensure all comments are being rendered
                    if (index < 5) { // Only log first 5 to avoid spam
                      console.log('[CommentsModal] Rendering comment at index:', index, {
                        key: stableKey,
                        text: comment.comment?.substring(0, 30),
                        username: comment.username,
                        id: comment.id,
                        totalComments: filteredComments.length
                      });
                    }
                    
                    const isClapped = clappedComments.has(comment.id) || comment.isClapped;
                    const currentClaps = isClapped && !comment.isClapped && !clappedComments.has(comment.id)
                      ? comment.claps
                      : (isClapped ? comment.claps + 1 : comment.claps);
                    const repliesVisible = showReplies.has(comment.id);
                    const hasReplies = comment.repliesList && comment.repliesList.length > 0;

                    return (
                      <View key={stableKey}>
                        {/* Main Comment */}
                        <View
                          style={{
                            paddingVertical: 20,
                            paddingHorizontal: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(0, 0, 0, 0.05)',
                            position: 'relative',
                          }}
                        >
                          {/* Profile Section - Single Flex View */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                            {/* Profile Avatar with Golden Star Badge */}
                            <View style={{ position: 'relative', marginRight: 10, zIndex: 3 }}>
                              <Image
                                source={{ uri: comment.avatar }}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                }}
                                contentFit="cover"
                              />
                              {/* Golden Star Badge */}
                              <View
                                style={{
                                  position: 'absolute',
                                  top: -1,
                                  right: -1,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: '#FFD700',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1.5,
                                  borderColor: '#FFFFFF',
                                  shadowColor: '#FFD700',
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 2,
                                  elevation: 3,
                                }}
                              >
                                <Svg width={7} height={7} viewBox="0 0 24 24">
                                  <Path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    fill="#FFFFFF"
                                  />
                                </Svg>
                              </View>
                            </View>

                            {/* Name and Username - Inline with Profile */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                              {comment.name && (
                                <>
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      fontWeight: '700',
                                      color: textColor,
                                      letterSpacing: 0.2,
                                      marginRight: 8,
                                    }}
                                  >
                                    {comment.name}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      fontWeight: '400',
                                      color: secondaryTextColor,
                                      letterSpacing: 0.1,
                                    }}
                                  >
                                    {comment.username}
                                  </Text>
                                </>
                              )}
                              {!comment.name && (
                                <Text
                                  style={{
                                    fontSize: 15,
                                    fontWeight: '700',
                                    color: textColor,
                                    letterSpacing: 0.2,
                                  }}
                                >
                                  {comment.username}
                                </Text>
                              )}
                              {comment.pronouns && (
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: secondaryTextColor,
                                    fontWeight: '400',
                                    marginLeft: 8,
                                    letterSpacing: 0.1,
                                  }}
                                >
                                  {comment.pronouns}
                                </Text>
                              )}
                            </View>

                            {/* Ellipsis Icon - End of Profile Line */}
                            <Pressable>
                              <Ellipsis size={20} color={secondaryTextColor} />
                            </Pressable>
                          </View>

                          {/* Comment Text - Starts Below Profile */}
                          <Text
                            style={{
                              fontSize: 15,
                              color: textColor,
                              lineHeight: 24,
                              marginTop: 0,
                              marginBottom: expandedComments.has(comment.id) ? 0 : 0,
                              letterSpacing: 0.1,
                              fontWeight: '400',
                            }}
                            numberOfLines={expandedComments.has(comment.id) ? undefined : 4}
                          >
                            {comment.comment}
                          </Text>
                            {comment.comment.length > 150 && !expandedComments.has(comment.id) && (
                              <Pressable
                                onPress={() => setExpandedComments((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.add(comment.id);
                                  return newSet;
                                })}
                                style={{ marginTop: 4 }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#10B981',
                                    fontWeight: '500',
                                    marginBottom: 10,
                                  }}
                                >
                                  Read more...
                                </Text>
                              </Pressable>
                            )}

                            {/* Action Bar - Using CommentsAction Component */}
                            <CommentsAction
                              timestamp={comment.timestamp}
                              onBoost={() => {}}
                              onReply={() => {}}
                            />
                          </View>

                        {/* Nested Replies */}
                        {hasReplies && repliesVisible && (
                          <View style={{ paddingLeft: 12, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                            {comment.repliesList?.map((reply, replyIndex) => {
                              const isReplyClapped = clappedComments.has(reply.id) || reply.isClapped;
                              const currentReplyClaps = isReplyClapped && !reply.isClapped && !clappedComments.has(reply.id)
                                ? reply.claps
                                : (isReplyClapped ? reply.claps + 1 : reply.claps);

                              return (
                                <View
                                  key={reply.id}
                                  style={{
                                    paddingVertical: 14,
                                    paddingHorizontal: 16,
                                    borderBottomWidth: replyIndex < (comment.repliesList?.length || 0) - 1 ? 1 : 0,
                                    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
                                  }}
                                >
                                  {/* Profile Section - Single Flex View */}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                                    {/* Reply Avatar with Golden Star */}
                                    <View style={{ marginRight: 10, position: 'relative' }}>
                                      <Image
                                        source={{ uri: reply.avatar }}
                                        style={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: 16,
                                        }}
                                        contentFit="cover"
                                      />
                                      <View
                                        style={{
                                          position: 'absolute',
                                          top: -1,
                                          right: -1,
                                          width: 12,
                                          height: 12,
                                          borderRadius: 6,
                                          backgroundColor: '#FFD700',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          borderWidth: 1.5,
                                          borderColor: '#FFFFFF',
                                        }}
                                      >
                                        <Svg width={7} height={7} viewBox="0 0 24 24">
                                          <Path
                                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                            fill="#FFFFFF"
                                          />
                                        </Svg>
                                      </View>
                                    </View>

                                    {/* Name and Username - Inline with Profile */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                      {reply.name && (
                                        <>
                                          <Text
                                            style={{
                                              fontSize: 14,
                                              fontWeight: '700',
                                              color: textColor,
                                              letterSpacing: 0.2,
                                              marginRight: 8,
                                            }}
                                          >
                                            {reply.name}
                                          </Text>
                                          <Text
                                            style={{
                                              fontSize: 14,
                                              fontWeight: '400',
                                              color: secondaryTextColor,
                                              letterSpacing: 0.1,
                                            }}
                                          >
                                            {reply.username}
                                          </Text>
                                        </>
                                      )}
                                      {!reply.name && (
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            fontWeight: '700',
                                            color: textColor,
                                            letterSpacing: 0.2,
                                          }}
                                        >
                                          {reply.username}
                                        </Text>
                                      )}
                                      {reply.pronouns && (
                                        <Text
                                          style={{
                                            fontSize: 12,
                                            color: secondaryTextColor,
                                            fontWeight: '400',
                                            marginLeft: 8,
                                          }}
                                        >
                                          {reply.pronouns}
                                        </Text>
                                      )}
                                    </View>

                                    {/* Ellipsis Icon - End of Profile Line */}
                                    <Pressable>
                                      <Ellipsis size={18} color={secondaryTextColor} />
                                    </Pressable>
                                  </View>

                                  {/* Reply Text - Starts Below Profile */}
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      color: textColor,
                                      lineHeight: 22,
                                      marginTop: 0,
                                      marginBottom: 10,
                                      letterSpacing: 0.1,
                                      fontWeight: '400',
                                    }}
                                    numberOfLines={3}
                                  >
                                    {reply.comment}
                                  </Text>
                                  {reply.comment.length > 120 && (
                                    <Pressable>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          color: '#10B981',
                                          fontWeight: '500',
                                          marginBottom: 10,
                                        }}
                                      >
                                        Read more...
                                      </Text>
                                    </Pressable>
                                  )}

                                  {/* Action Bar - Using CommentsAction Component (Small Size) */}
                                  <CommentsAction
                                    timestamp={reply.timestamp}
                                    onBoost={() => {}}
                                    onReply={() => {}}
                                    size="small"
                                  />
                                </View>
                              );
                            })}

                            {/* See More Replies Link */}
                            {comment.replies && comment.replies > (comment.repliesList?.length || 0) && (
                              <Pressable
                                style={{
                                  paddingLeft: 68,
                                  paddingVertical: 12,
                                  paddingRight: 16,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#10B981',
                                    fontWeight: '500',
                                  }}
                                >
                                  See more replies ({comment.replies - (comment.repliesList?.length || 0)})
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Input Section with Glassmorphism */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                overflow: 'hidden',
              }}
            >
              <BlurView
                intensity={90}
                tint="light"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    paddingTop: 18,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
                    paddingHorizontal: 20,
                  }}
                >
              {/* Premium Pill-Shaped Input Field with Integrated Circular Send Button */}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F5F5F5',
                  borderRadius: 30,
                  paddingLeft: 20,
                  paddingRight: 6,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  minHeight: 52,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <TextInput
                  placeholder="Share your thoughts..."
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={inputText}
                  onChangeText={setInputText}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: textColor,
                    padding: 0,
                    marginRight: 6,
                    paddingVertical: 2,
                  }}
                  multiline
                  maxLength={500}
                />
                
                {/* Integrated Circular Send Button */}
                <Pressable
                  onPress={inputText.trim().length > 0 && !isSubmittingComment ? handleSendComment : undefined}
                  disabled={inputText.trim().length === 0 || isSubmittingComment}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: inputText.trim().length > 0 
                      ? '#000000'
                      : 'rgba(0, 0, 0, 0.06)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : (inputText.trim().length > 0 ? 1 : 0.6),
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24">
                    <Path
                      d="M5,12H19M19,12L12,5M19,12L12,19"
                      stroke={inputText.trim().length > 0 ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </Pressable>
              </View>
                </View>
              </BlurView>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

