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
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Svg, Path } from 'react-native-svg';
import { Ellipsis } from 'lucide-react-native';
import CommentsAction from './CommentsAction';
import CommentMenuDropdown from './CommentMenuDropdown';
import { addComment, getAllFeeds, getFeedById, deleteComment } from '../../../services/api/feedService';
import { getUserProfileById } from '../../../services/api/userService';
import * as SecureStore from 'expo-secure-store';
import webSocketService from '../../../services/api/websocketService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Comment {
  id: string;
  userId: string; // Add userId to track comment ownership
  originalIndex: number; // Track original index from backend for deletion
  replyToCommentIndex?: number | null; // Index of parent comment (for replies)
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
  const [databaseCommentsCount, setDatabaseCommentsCount] = useState<number>(0); // Database is source of truth for count
  const [inputText, setInputText] = useState('');
  const [clappedComments, setClappedComments] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [menuVisibleForComment, setMenuVisibleForComment] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null); // Track which comment is being replied to

  // Theme-compatible color for "Show replies" text - works in both light and dark
  const showRepliesColor = isDark ? '#60A5FA' : '#2563EB';

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get authenticated user ID from token on mount
  useEffect(() => {
    const getAuthenticatedUserId = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
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
            console.log('[CommentsModal] ✅ Authenticated user ID extracted:', userId);
          }
        }
      } catch (error) {
        console.warn('[CommentsModal] ⚠️ Could not extract authenticated user ID:', error);
      }
    };
    getAuthenticatedUserId();
  }, []);

  // Setup WebSocket listener for comment deletion
  useEffect(() => {
    if (!visible || !postId) return;

    const setupWebSocket = () => {
      webSocketService.connect({
        onCommentDeleted: (event: any) => {
          if (event.feedId === postId && event.message) {
            console.log('[CommentsModal] 📥 Received comment deletion event:', event);
            const deletedOriginalIndex = parseInt(event.message, 10);
            if (!isNaN(deletedOriginalIndex)) {
              // Optimistically remove comment by originalIndex
              setComments((prevComments) =>
                prevComments.filter((c) => c.originalIndex !== deletedOriginalIndex)
              );
              // Refresh comments from backend to ensure consistency and update count
              fetchComments();
              // Notify parent to refresh feed list and count
              onCommentAdded?.();
            } else {
              console.warn('[CommentsModal] Received COMMENT_DELETED event with invalid originalIndex:', event.message);
              // Fallback: sync with database (database is source of truth)
              console.log('[CommentsModal] 🔄 Syncing with database after deletion event');
              fetchComments();
              onCommentAdded?.();
            }
          } else if (event.feedId === postId) {
            // Fallback: sync with database if no message/index provided
            console.log('[CommentsModal] 📥 Received comment deletion event without index, syncing with database');
            fetchComments();
            onCommentAdded?.();
          }
        },
      });
    };

    setupWebSocket();

    return () => {
      // Cleanup handled by singleton
    };
  }, [visible, postId]);

  // Fetch comments from backend when modal opens - ALWAYS sync with database
  useEffect(() => {
    if (visible && postId) {
      console.log('[CommentsModal] Modal opened, fetching fresh comments from database for postId:', postId);
      fetchComments();
    } else if (visible && !postId) {
      // If no postId, initialize with empty array
      setComments([]);
      setDatabaseCommentsCount(0);
    }
  }, [visible, postId]);
  
  // Sync with database periodically when modal is open (similar to likes sync)
  useEffect(() => {
    if (!visible || !postId) return;
    
    // Sync with database every 5 seconds when modal is open
    const syncInterval = setInterval(() => {
      console.log('[CommentsModal] Periodic sync: Fetching fresh comments from database');
      fetchComments();
    }, 5000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [visible, postId]);

  const fetchComments = async () => {
    if (!postId) {
      console.log('[CommentsModal] No postId provided, skipping fetch');
      setComments([]);
      setDatabaseCommentsCount(0);
      return;
    }
    
    setIsLoadingComments(true);
    console.log('[CommentsModal] 🔄 Fetching fresh comments from database for postId:', postId);
    
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
        
        // CRITICAL: Database is the source of truth - always use database values
        const dbCommentsCount = feed.commentsCount || 0;
        const dbCommentsArray = feed.comments || [];
        
        console.log('[CommentsModal] 🔄 Syncing from database:', {
          feedId: feed.id,
          databaseCommentsCount: dbCommentsCount,
          databaseCommentsArrayLength: dbCommentsArray.length,
          currentLocalCommentsCount: comments.length,
          willUpdate: dbCommentsArray.length !== comments.length || dbCommentsCount !== databaseCommentsCount
        });
        
        // Always update database count (source of truth)
        setDatabaseCommentsCount(dbCommentsCount);
        
        // Always process comments from database - database is source of truth
        const hasComments = dbCommentsArray && Array.isArray(dbCommentsArray) && dbCommentsArray.length > 0;
        
        console.log('[CommentsModal] Database sync check:', {
          hasComments,
          databaseCommentsCount: dbCommentsCount,
          databaseCommentsArrayLength: dbCommentsArray.length,
          previousLocalCount: comments.length
        });
        
        if (hasComments) {
          console.log('[CommentsModal] Processing', dbCommentsArray.length, 'comments from database array');
          
          // Fetch user profiles for all comment authors
          const userIds = [...new Set(dbCommentsArray.map(c => c.userId))];
          console.log('[CommentsModal] Unique user IDs from database:', userIds);
          
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
              } else if (userResponse.error?.code === 'USER_NOT_FOUND') {
                // User deleted from NeonDB - mark as deleted
                console.log(`[CommentsModal] User ${userId} deleted from NeonDB`);
                return {
                  userId,
                  profile: {
                    username: `[deleted_${userId.substring(0, 8)}]`,
                    fullName: `[Deleted User]`,
                    profileImageUrl: null,
                    isDeleted: true,
                  }
                };
              }
            } catch (error) {
              console.error(`[CommentsModal] Failed to fetch user profile for ${userId}:`, error);
              // Check if error indicates user not found
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (errorMessage.includes('not found') || errorMessage.includes('USER_NOT_FOUND')) {
                return {
                  userId,
                  profile: {
                    username: `[deleted_${userId.substring(0, 8)}]`,
                    fullName: `[Deleted User]`,
                    profileImageUrl: null,
                    isDeleted: true,
                  }
                };
              }
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
          console.log('[CommentsModal] Mapping comments:', dbCommentsArray.length, 'total comments from database');
          
          // Note: Comments are stored in chronological order (oldest first) in backend
          // We reverse them to show newest first, but need to track original index
          // CRITICAL: Always use database array - database is source of truth
          const commentsArray = [...dbCommentsArray];
          const formattedComments: Comment[] = commentsArray
            .map((comment, originalIndex) => {
              // CRITICAL: Extract replyToCommentIndex from backend comment
              const replyToIndex = (comment as any).replyToCommentIndex ?? null;
              const isReply = replyToIndex !== null && replyToIndex !== undefined;
              
              console.log('[CommentsModal] Mapping comment', originalIndex, ':', {
                userId: comment.userId,
                text: comment.text,
                createdAt: comment.createdAt,
                replyToCommentIndex: replyToIndex,
                isReply: isReply
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
              const uniqueId = `comment_${postId}_${comment.userId}_${timestampStr}_${originalIndex}_${textHash}`;
              
              console.log('[CommentsModal] Generated comment ID:', uniqueId, {
                originalIndex,
                text: comment.text.substring(0, 20),
                timestamp: comment.createdAt,
                userId: comment.userId.substring(0, 8),
                replyToIndex: replyToIndex,
                isReply: isReply
              });
              
              return {
                id: uniqueId,
                userId: comment.userId, // Store userId for ownership check
                originalIndex, // Store original index for deletion
                replyToCommentIndex: replyToIndex, // Store reply relationship
                name: userProfile.fullName,
                username: userProfile.username,
                avatar: userProfile.profileImageUrl || `https://i.pravatar.cc/150?img=${originalIndex + 1}`,
                comment: comment.text,
                timestamp,
                claps: 0,
                replies: 0,
                isClapped: false,
                showReplies: false,
              };
            });
          
          // CRITICAL: Organize comments into parent-child structure
          // Separate top-level comments from replies
          const topLevelComments: Comment[] = [];
          const replyMap = new Map<number, Comment[]>(); // Map parent index -> replies
          
          formattedComments.forEach(comment => {
            if (comment.replyToCommentIndex !== null && comment.replyToCommentIndex !== undefined) {
              // This is a reply - add it to the reply map
              const parentIndex = comment.replyToCommentIndex;
              if (!replyMap.has(parentIndex)) {
                replyMap.set(parentIndex, []);
              }
              replyMap.get(parentIndex)!.push(comment);
              console.log('[CommentsModal] Added reply to parent index', parentIndex, ':', comment.comment.substring(0, 20));
            } else {
              // This is a top-level comment
              topLevelComments.push(comment);
            }
          });
          
          // Attach replies to their parent comments
          topLevelComments.forEach(parentComment => {
            const replies = replyMap.get(parentComment.originalIndex) || [];
            if (replies.length > 0) {
              parentComment.repliesList = replies;
              parentComment.replies = replies.length;
              parentComment.showReplies = true; // Auto-expand if has replies
              console.log('[CommentsModal] Attached', replies.length, 'replies to parent comment at index', parentComment.originalIndex);
            }
          });
          
          // Reverse to show newest first
          const organizedComments = topLevelComments.reverse();
          
          // Verify we have all comments before setting state
          console.log('[CommentsModal] ✅ Synced from database:', {
            databaseCommentsCount: dbCommentsCount,
            databaseArrayLength: dbCommentsArray.length,
            formattedCommentsLength: formattedComments.length,
            previousLocalCount: comments.length,
            synced: formattedComments.length === dbCommentsArray.length
          });
          
          // CRITICAL: Always set comments from database - database is source of truth
          // Only display comments that exist in the database array
          setComments(organizedComments);
          
          // CRITICAL: Always use database array length as the count (database is source of truth)
          // This ensures the count matches exactly what's stored in MongoDB
          const actualDatabaseCount = dbCommentsArray.length;
          setDatabaseCommentsCount(actualDatabaseCount);
          
          // Log organization results
          const totalReplies = Array.from(replyMap.values()).reduce((sum, replies) => sum + replies.length, 0);
          console.log('[CommentsModal] ✅ Comment organization:', {
            databaseArrayLength: actualDatabaseCount,
            topLevelComments: organizedComments.length,
            totalReplies: totalReplies,
            organizedCommentsWithReplies: organizedComments.filter(c => c.repliesList && c.repliesList.length > 0).length,
            match: organizedComments.length + totalReplies === actualDatabaseCount
          });
          
          // Verify all comments are accounted for
          if (organizedComments.length + totalReplies !== actualDatabaseCount) {
            console.warn('[CommentsModal] ⚠️ Comment count mismatch after organization:', {
              databaseArrayLength: actualDatabaseCount,
              topLevelComments: organizedComments.length,
              totalReplies: totalReplies,
              total: organizedComments.length + totalReplies
            });
          }
        } else {
          // No comments in database - clear local state
          console.log('[CommentsModal] ✅ Database has no comments - clearing local state');
          setComments([]);
          setDatabaseCommentsCount(0);
          
          // Warn if there's a mismatch
          if (dbCommentsCount > 0) {
            console.warn('[CommentsModal] ⚠️ Database commentsCount =', dbCommentsCount, 'but comments array is empty');
          }
        }
      } else {
        console.warn('[CommentsModal] Failed to fetch feeds or no data:', response.error);
        setComments([]);
        setDatabaseCommentsCount(0);
      }
    } catch (error) {
      console.error('[CommentsModal] Failed to fetch comments:', error);
      setComments([]);
      setDatabaseCommentsCount(0);
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
    const replyToIndex = replyingToComment?.originalIndex; // Get the original index of the comment being replied to
    
    try {
      // Optimistic update - add comment immediately
      const now = new Date();
      const timestamp = formatRelativeTime(now);
      
      // Get current user profile for optimistic comment
      // For now, use placeholder - will be updated after API call
      const optimisticComment: Comment = {
        id: `temp_${Date.now()}`,
        userId: currentUserId || 'unknown',
        originalIndex: -1, // Will be updated after fetch
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
      setReplyingToComment(null); // Clear reply state
      
      // Submit comment to backend (with optional replyToCommentIndex)
      const response = await addComment(postId, commentText, replyToIndex);
      
      if (response.success && response.data) {
        console.log('[CommentsModal] Comment added successfully, syncing with database:', {
          responseCommentsCount: response.data.commentsCount,
          responseCommentsLength: response.data.comments?.length || 0,
          isReply: replyToIndex !== undefined && replyToIndex !== null
        });
        // CRITICAL: Always refresh from database after adding comment (database is source of truth)
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
  
  const handleReplyToComment = (comment: Comment) => {
    setReplyingToComment(comment);
    // Focus on input field (if needed, you can add a ref)
  };
  
  const handleCancelReply = () => {
    setReplyingToComment(null);
  };

  const handleDeleteComment = async (comment: Comment) => {
    console.log('[CommentsModal] handleDeleteComment called:', {
      postId,
      commentId: comment.id,
      originalIndex: comment.originalIndex,
      userId: comment.userId,
      currentUserId,
      commentText: comment.comment.substring(0, 30),
    });

    if (!postId || !comment) {
      console.error('[CommentsModal] Cannot delete comment: missing postId or comment');
      Alert.alert('Error', 'Cannot delete comment: missing information');
      return;
    }

    if (comment.originalIndex < 0) {
      console.error('[CommentsModal] Cannot delete comment: invalid originalIndex:', comment.originalIndex);
      Alert.alert('Error', 'Cannot delete comment: invalid comment index');
      return;
    }

    if (comment.userId !== currentUserId) {
      console.warn('[CommentsModal] User attempted to delete someone else\'s comment');
      Alert.alert('Error', 'You can only delete your own comments');
      return;
    }

    // Close menu immediately
    setMenuVisibleForComment(null);
    setIsDeletingComment(comment.id);

    try {
      console.log('[CommentsModal] Deleting comment from backend:', {
        feedId: postId,
        commentIndex: comment.originalIndex,
      });

      // Optimistic update - remove comment immediately from UI
      const previousComments = [...comments];
      setComments((prev) => {
        const filtered = prev.filter(c => c.id !== comment.id);
        console.log('[CommentsModal] Optimistic update: removed comment, remaining:', filtered.length);
        return filtered;
      });

      // Delete comment from backend database
      const response = await deleteComment(postId, comment.originalIndex);

      if (response.success && response.data) {
        console.log('[CommentsModal] ✅ Comment deleted successfully from database');
        console.log('[CommentsModal] Database comment count after deletion:', response.data.commentsCount);
        
        // CRITICAL: Always refresh from database after deletion (database is source of truth)
        await fetchComments();
        
        // Notify parent to refresh feed list to update comment count
        onCommentAdded?.();
        
        console.log('[CommentsModal] ✅ Comment deletion complete - UI synced with database');
      } else {
        // Revert optimistic update on error
        console.error('[CommentsModal] ❌ Failed to delete comment from backend:', response.error);
        setComments(previousComments);
        Alert.alert('Error', response.error?.message || 'Failed to delete comment. Please try again.');
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('[CommentsModal] ❌ Exception while deleting comment:', error);
      setComments((prev) => {
        const commentExists = prev.find(c => c.id === comment.id);
        if (!commentExists) {
          console.log('[CommentsModal] Reverting optimistic update - restoring comment');
          return [...prev, comment];
        }
        return prev;
      });
      Alert.alert('Error', 'An error occurred while deleting the comment. Please try again.');
    } finally {
      setIsDeletingComment(null);
      setMenuVisibleForComment(null);
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
                      {databaseCommentsCount} Responses
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, position: 'relative' }}>
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

                            {/* 3-Dot Menu Icon - Top Right - Only show for own comments */}
                            {currentUserId && comment.userId === currentUserId && (
                              <Pressable
                                onPress={() => {
                                  console.log('[CommentsModal] Opening menu for comment:', comment.id, 'originalIndex:', comment.originalIndex);
                                  setMenuVisibleForComment(comment.id);
                                }}
                                disabled={isDeletingComment === comment.id}
                                style={{ 
                                  opacity: isDeletingComment === comment.id ? 0.5 : 1,
                                  padding: 4,
                                  marginLeft: 8,
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              >
                                <Ellipsis size={20} color={secondaryTextColor} />
                              </Pressable>
                            )}
                            
                            {/* Comment Menu Dropdown */}
                            <CommentMenuDropdown
                              visible={menuVisibleForComment === comment.id}
                              onClose={() => {
                                console.log('[CommentsModal] Closing menu for comment:', comment.id);
                                setMenuVisibleForComment(null);
                              }}
                              onDelete={() => {
                                console.log('[CommentsModal] Delete button clicked for comment:', comment.id, 'originalIndex:', comment.originalIndex);
                                handleDeleteComment(comment);
                              }}
                              isOwnComment={currentUserId === comment.userId}
                            />
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
                              onReply={() => handleReplyToComment(comment)}
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
              {/* Classic Premium Input Field with Send Icon */}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 24,
                  paddingLeft: 20,
                  paddingRight: 12,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  minHeight: 48,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {replyingToComment && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -40,
                      left: 0,
                      right: 0,
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 8,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: secondaryTextColor,
                        flex: 1,
                      }}
                    >
                      Replying to <Text style={{ fontWeight: '600', color: textColor }}>{replyingToComment.username}</Text>
                    </Text>
                    <Pressable
                      onPress={handleCancelReply}
                      style={{
                        padding: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#EF4444',
                          fontWeight: '600',
                        }}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                )}
                <TextInput
                  placeholder={replyingToComment ? `Reply ${replyingToComment.username}...` : "Share your thoughts..."}
                  placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                  value={inputText}
                  onChangeText={setInputText}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: textColor,
                    padding: 0,
                    marginRight: 12,
                    paddingVertical: 2,
                    lineHeight: 20,
                  }}
                  multiline
                  maxLength={500}
                />
                
                {/* Premium Send Icon Button */}
                <Pressable
                  onPress={inputText.trim().length > 0 && !isSubmittingComment ? handleSendComment : undefined}
                  disabled={inputText.trim().length === 0 || isSubmittingComment}
                  style={({ pressed }) => ({
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: inputText.trim().length > 0 
                      ? (isDark ? '#FFFFFF' : '#000000')
                      : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: pressed ? 0.7 : (inputText.trim().length > 0 ? 1 : 0.4),
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Svg width={12} height={12} viewBox="0 0 12 12">
                    <Path
                      d="m11.21,1.8l-2.859,8.893c-.213.661-1.108.759-1.457.159l-2.01-3.447c-.07-.12-.169-.219-.289-.289l-3.447-2.01c-.6-.35-.502-1.245.159-1.457L10.2.79c.622-.2,1.21.388,1.01,1.01Z"
                      fill="none"
                      stroke={inputText.trim().length > 0 
                        ? (isDark ? '#000000' : '#FFFFFF')
                        : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M10.961,1.039 L4.82,7.18"
                      fill="none"
                      stroke={inputText.trim().length > 0 
                        ? (isDark ? '#000000' : '#FFFFFF')
                        : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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

