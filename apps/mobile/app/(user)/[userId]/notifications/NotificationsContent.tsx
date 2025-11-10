import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getNotifications, Notification as NotificationType, markAllAsRead, getUnreadCount } from '../../../../services/api/notificationService';
import { getUserProfileById } from '../../../../services/api/userService';
import { webSocketService, NotificationEvent } from '../../../../services/api/websocketService';
import { useNotificationCount } from '../../../../hooks/useNotificationCount';
import { addComment } from '../../../../services/api/feedService';

export default function NotificationsContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userProfileCache, setUserProfileCache] = useState<Map<string, { username: string; fullName: string; profileImageUrl: string | null }>>(new Map());
  const { count: notificationCount, refresh: refreshNotificationCount, setNotificationsTabActive } = useNotificationCount();
  const hasMarkedAsReadRef = useRef<boolean>(false);
  const isFocusedRef = useRef<boolean>(false);

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#1F2937',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#1F2937' : '#E5E7EB',
    cardBackground: isDark ? '#0F172A' : '#F9FAFB',
    inputBackground: isDark ? '#1F2937' : '#F3F4F6',
  };

  // Format time ago for display
  const formatTimeAgo = (hours: number): string => {
    if (hours < 1) {
      return 'now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (hours < 48) {
      return '1d ago';
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async (pageNum: number = 0, append: boolean = false) => {
    try {
      setLoading(!append);
      console.log('[NotificationsContent] Fetching notifications:', { page: pageNum, append });
      
      const response = await getNotifications(pageNum, 20);
      
      console.log('[NotificationsContent] Notification response:', {
        success: response.success,
        hasData: !!response.data,
        contentLength: response.data?.content?.length || 0,
        totalElements: response.data?.totalElements || 0,
        error: response.error
      });
      
      if (response.success && response.data) {
        const newNotifications = response.data.content || [];
        
        console.log('[NotificationsContent] Received notifications:', {
          count: newNotifications.length,
          types: newNotifications.map(n => n.type),
          ids: newNotifications.map(n => n.id)
        });
        
        // Ensure notifications are sorted by latest first (backend should do this, but double-check)
        const sortedNotifications = [...newNotifications].sort((a, b) => {
          const timeA = a.timeAgoHours || 0;
          const timeB = b.timeAgoHours || 0;
          return timeA - timeB; // Lower timeAgoHours = more recent
        });
        
        // Fetch missing user details for notifications
        const notificationsWithUserDetails = await Promise.all(
          sortedNotifications.map(async (notification) => {
            // Use senderId if available (new schema), otherwise fallback to actorUserId (legacy)
            const userId = notification.senderId || notification.actorUserId;
            
            // If username or fullName is missing, fetch from NeonDB
            if ((!notification.actorUsername || notification.actorUsername.trim() === '' || notification.actorUsername === 'unknown') && userId) {
              // Check cache first
              const cached = userProfileCache.get(userId);
              if (cached) {
                return {
                  ...notification,
                  actorUsername: cached.username,
                  actorFullName: cached.fullName,
                  actorProfileImageUrl: cached.profileImageUrl || notification.actorProfileImageUrl,
                };
              }
              
              try {
                console.log('[NotificationsContent] Fetching user details for userId:', userId);
                const userResponse = await getUserProfileById(userId);
                if (userResponse.success && userResponse.data) {
                  const userData = userResponse.data;
                  // Update cache
                  setUserProfileCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(userId, {
                      username: userData.username || '',
                      fullName: userData.fullName || '',
                      profileImageUrl: userData.profileImageUrl || userData.profilePicture || null,
                    });
                    return newCache;
                  });
                  
                  return {
                    ...notification,
                    actorUsername: userData.username || notification.actorUsername || '',
                    actorFullName: userData.fullName || notification.actorFullName || '',
                    actorProfileImageUrl: userData.profileImageUrl || userData.profilePicture || notification.actorProfileImageUrl,
                  };
                } else if (userResponse.error?.code === 'USER_NOT_FOUND') {
                  // User deleted from NeonDB
                  console.log('[NotificationsContent] User deleted from NeonDB:', userId);
                  const deletedProfile = {
                    username: `[deleted_${userId.substring(0, 8)}]`,
                    fullName: '[Deleted User]',
                    profileImageUrl: null,
                  };
                  
                  setUserProfileCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(userId, deletedProfile);
                    return newCache;
                  });
                  
                  return {
                    ...notification,
                    actorUsername: deletedProfile.username,
                    actorFullName: deletedProfile.fullName,
                    actorProfileImageUrl: null,
                  };
                }
              } catch (error) {
                console.warn('[NotificationsContent] Failed to fetch user details for userId:', userId, error);
                // Check if error indicates user not found
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('not found') || errorMessage.includes('USER_NOT_FOUND')) {
                  const deletedProfile = {
                    username: `[deleted_${userId.substring(0, 8)}]`,
                    fullName: '[Deleted User]',
                    profileImageUrl: null,
                  };
                  
                  setUserProfileCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(userId, deletedProfile);
                    return newCache;
                  });
                  
                  return {
                    ...notification,
                    actorUsername: deletedProfile.username,
                    actorFullName: deletedProfile.fullName,
                    actorProfileImageUrl: null,
                  };
                }
              }
            }
            
            return notification;
          })
        );
        
        if (append) {
          setNotifications(prev => {
            const combined = [...prev, ...notificationsWithUserDetails];
            // Remove duplicates based on ID
            const unique = combined.filter((notif, index, self) => 
              index === self.findIndex(n => n.id === notif.id)
            );
            console.log('[NotificationsContent] Appended notifications. Total:', unique.length);
            return unique;
          });
        } else {
          setNotifications(notificationsWithUserDetails);
          console.log('[NotificationsContent] Set notifications. Count:', notificationsWithUserDetails.length);
        }
        
        setHasMore(!response.data.last && response.data.totalPages > pageNum + 1);
        setPage(pageNum);
      } else {
        console.error('[NotificationsContent] Failed to fetch notifications:', {
          error: response.error,
          code: response.error?.code,
          message: response.error?.message,
          success: response.success,
          hasData: !!response.data
        });
        if (!append) {
          setNotifications([]);
        }
      }
    } catch (error) {
      console.error('[NotificationsContent] Error fetching notifications:', error);
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      
      setNotificationsTabActive(true);
      
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
      
      const markAllNotificationsAsRead = async () => {
        if (hasMarkedAsReadRef.current) {
          return;
        }
        
        hasMarkedAsReadRef.current = true;
        
        try {
          const markResponse = await markAllAsRead();
          
          if (markResponse.success) {
            console.log('All notifications marked as read successfully');
          } else {
            if (markResponse.error?.code === 'HTTP_401' || markResponse.error?.code === 'AUTH_ERROR') {
              console.log('Backend authorization issue (401) - UI already updated optimistically');
            }
          }
        } catch (markError) {
          console.log('Exception while marking all as read (non-critical):', markError);
        } finally {
          setTimeout(() => {
            hasMarkedAsReadRef.current = false;
          }, 3000);
        }
      };
      
      markAllNotificationsAsRead();
      
      return () => {
        isFocusedRef.current = false;
        setNotificationsTabActive(false);
        hasMarkedAsReadRef.current = false;
      };
    }, [setNotificationsTabActive])
  );

  // Initial load and refresh
  useEffect(() => {
    fetchNotifications(0, false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(0, false);
  };

  // Helper function to add a new notification to the list in real-time
  const addNewNotification = useCallback(async (event: NotificationEvent) => {
    try {
      console.log('📥 WebSocket: Processing new notification event:', event);
      
      // Check if full notification data is available in the event (instant display)
      if (event.notification) {
        console.log('✅ Full notification data available in WebSocket event, adding instantly');
        const newNotification = event.notification;
        
        // Fetch user details if needed (only if missing)
        const userId = newNotification.senderId || newNotification.actorUserId;
        let enrichedNotification = { ...newNotification };
        
        if (userId && (!newNotification.actorUsername || newNotification.actorUsername.trim() === '' || newNotification.actorUsername === 'unknown')) {
          // Check cache first
          const cached = userProfileCache.get(userId);
          if (cached) {
            enrichedNotification = {
              ...enrichedNotification,
              actorUsername: cached.username,
              actorFullName: cached.fullName,
              actorProfileImageUrl: cached.profileImageUrl || newNotification.actorProfileImageUrl,
            };
          } else {
            // Fetch user details in background (non-blocking)
            getUserProfileById(userId).then(userResponse => {
              if (userResponse.success && userResponse.data) {
                const userData = userResponse.data;
                setUserProfileCache(prev => {
                  const newCache = new Map(prev);
                  newCache.set(userId, {
                    username: userData.username || '',
                    fullName: userData.fullName || '',
                    profileImageUrl: userData.profileImageUrl || userData.profilePicture || null,
                  });
                  return newCache;
                });
                
                // Update notification with user details
                setNotifications(prev => {
                  const updated = prev.map(n => 
                    n.id === newNotification.id 
                      ? {
                          ...n,
                          actorUsername: userData.username || n.actorUsername || '',
                          actorFullName: userData.fullName || n.actorFullName || '',
                          actorProfileImageUrl: userData.profileImageUrl || userData.profilePicture || n.actorProfileImageUrl,
                        }
                      : n
                  );
                  return updated;
                });
              } else if (userResponse.error?.code === 'USER_NOT_FOUND') {
                // User deleted from NeonDB
                const deletedProfile = {
                  username: `[deleted_${userId.substring(0, 8)}]`,
                  fullName: '[Deleted User]',
                  profileImageUrl: null,
                };
                
                setUserProfileCache(prev => {
                  const newCache = new Map(prev);
                  newCache.set(userId, deletedProfile);
                  return newCache;
                });
                
                // Update notification with deleted user info
                setNotifications(prev => {
                  const updated = prev.map(n => 
                    n.id === newNotification.id 
                      ? {
                          ...n,
                          actorUsername: deletedProfile.username,
                          actorFullName: deletedProfile.fullName,
                          actorProfileImageUrl: null,
                        }
                      : n
                  );
                  return updated;
                });
              }
            }).catch(error => {
              console.warn('[NotificationsContent] Failed to fetch user details for new notification:', error);
              // Check if error indicates user not found
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (errorMessage.includes('not found') || errorMessage.includes('USER_NOT_FOUND')) {
                const deletedProfile = {
                  username: `[deleted_${userId.substring(0, 8)}]`,
                  fullName: '[Deleted User]',
                  profileImageUrl: null,
                };
                
                setUserProfileCache(prev => {
                  const newCache = new Map(prev);
                  newCache.set(userId, deletedProfile);
                  return newCache;
                });
              }
            });
          }
        }
        
        // Add the new notification to the top of the list instantly
        setNotifications(prev => {
          // Check if notification already exists (prevent duplicates)
          const exists = prev.some(n => n.id === newNotification.id);
          if (exists) {
            console.log('⚠️ Notification already exists in list, skipping duplicate');
            return prev;
          }
          
          // Log REPLY notifications specifically for debugging
          if (enrichedNotification.type === 'REPLY') {
            console.log('📬 Adding REPLY notification to list:', {
              id: enrichedNotification.id,
              actorName: enrichedNotification.actorFullName || enrichedNotification.actorUsername,
              replyText: enrichedNotification.commentText,
              originalCommentText: enrichedNotification.originalCommentText,
              postId: enrichedNotification.postId || enrichedNotification.feedId,
            });
          }
          
          // Prepend new notification to the list
          const updated = [enrichedNotification, ...prev];
          console.log('✅ Added new notification to list instantly. Total count:', updated.length, 'Type:', enrichedNotification.type);
          return updated;
        });
        
        return; // Successfully added, no need to fetch
      }
      
      // Fallback: If full notification data not available, fetch it
      if (event.notificationId && event.senderId && event.postId) {
        console.log('🔄 Full notification data not in event, fetching from API...');
        
        // Fetch first page which will include the new notification (sorted by latest first)
        const response = await getNotifications(0, 20);
        
        if (response.success && response.data && response.data.content) {
          const fetchedNotifications = response.data.content;
          
          // Find the new notification in the fetched list
          const newNotification = fetchedNotifications.find(n => n.id === event.notificationId);
          
          if (newNotification) {
            console.log('✅ Found new notification in API response, adding to list:', newNotification.id);
            
            // Fetch user details if needed
            const userId = newNotification.senderId || newNotification.actorUserId;
            let enrichedNotification = { ...newNotification };
            
            if (userId && (!newNotification.actorUsername || newNotification.actorUsername.trim() === '' || newNotification.actorUsername === 'unknown')) {
              // Check cache first
              const cached = userProfileCache.get(userId);
              if (cached) {
                enrichedNotification = {
                  ...enrichedNotification,
                  actorUsername: cached.username,
                  actorFullName: cached.fullName,
                  actorProfileImageUrl: cached.profileImageUrl || newNotification.actorProfileImageUrl,
                };
              } else {
                // Fetch user details
                try {
                  const userResponse = await getUserProfileById(userId);
                  if (userResponse.success && userResponse.data) {
                    const userData = userResponse.data;
                    setUserProfileCache(prev => {
                      const newCache = new Map(prev);
                      newCache.set(userId, {
                        username: userData.username || '',
                        fullName: userData.fullName || '',
                        profileImageUrl: userData.profileImageUrl || userData.profilePicture || null,
                      });
                      return newCache;
                    });
                    
                    enrichedNotification = {
                      ...enrichedNotification,
                      actorUsername: userData.username || newNotification.actorUsername || '',
                      actorFullName: userData.fullName || newNotification.actorFullName || '',
                      actorProfileImageUrl: userData.profileImageUrl || userData.profilePicture || newNotification.actorProfileImageUrl,
                    };
                  } else if (userResponse.error?.code === 'USER_NOT_FOUND') {
                    // User deleted from NeonDB
                    const deletedProfile = {
                      username: `[deleted_${userId.substring(0, 8)}]`,
                      fullName: '[Deleted User]',
                      profileImageUrl: null,
                    };
                    
                    setUserProfileCache(prev => {
                      const newCache = new Map(prev);
                      newCache.set(userId, deletedProfile);
                      return newCache;
                    });
                    
                    enrichedNotification = {
                      ...enrichedNotification,
                      actorUsername: deletedProfile.username,
                      actorFullName: deletedProfile.fullName,
                      actorProfileImageUrl: null,
                    };
                  }
                } catch (error) {
                  console.warn('[NotificationsContent] Failed to fetch user details for new notification:', error);
                  // Check if error indicates user not found
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  if (errorMessage.includes('not found') || errorMessage.includes('USER_NOT_FOUND')) {
                    const deletedProfile = {
                      username: `[deleted_${userId.substring(0, 8)}]`,
                      fullName: '[Deleted User]',
                      profileImageUrl: null,
                    };
                    
                    setUserProfileCache(prev => {
                      const newCache = new Map(prev);
                      newCache.set(userId, deletedProfile);
                      return newCache;
                    });
                    
                    enrichedNotification = {
                      ...enrichedNotification,
                      actorUsername: deletedProfile.username,
                      actorFullName: deletedProfile.fullName,
                      actorProfileImageUrl: null,
                    };
                  }
                }
              }
            }
            
            // Add the new notification to the top of the list
            setNotifications(prev => {
              // Check if notification already exists (prevent duplicates)
              const exists = prev.some(n => n.id === event.notificationId);
              if (exists) {
                console.log('⚠️ Notification already exists in list, skipping duplicate');
                return prev;
              }
              
              // Prepend new notification to the list
              const updated = [enrichedNotification, ...prev];
              console.log('✅ Added new notification to list. Total count:', updated.length);
              return updated;
            });
          } else {
            // If notification not found in first page, do a full refresh as fallback
            console.log('⚠️ New notification not found in first page, doing full refresh');
            await fetchNotifications(0, false);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error adding new notification:', error);
      // Fallback to full refresh on error
      try {
        await fetchNotifications(0, false);
      } catch (refreshError) {
        console.error('❌ Error in fallback refresh:', refreshError);
      }
    }
  }, [userProfileCache, fetchNotifications]);

  // Setup WebSocket listener for real-time notifications
  useEffect(() => {
    const handleNotificationCreated = async (event: NotificationEvent) => {
      console.log('📥 WebSocket: New notification received in real-time:', event);
      
      // Add notification instantly - uses full data from WebSocket if available
      if (event.notificationId) {
        await addNewNotification(event);
      }
    };

    const handleCountUpdated = (event: NotificationEvent) => {
      console.log('📥 WebSocket: Notification count updated:', event.unreadCount);
      // Update the notification count immediately
      if (event.unreadCount !== undefined && event.unreadCount !== null) {
        refreshNotificationCount();
      }
    };

    // Connect to WebSocket immediately with notification callbacks
    // This ensures we receive notifications in real-time
    webSocketService.connect({
      onNotificationCreated: handleNotificationCreated,
      onNotificationCountUpdated: handleCountUpdated,
    });

    // Cleanup is handled by the WebSocket service singleton
    return () => {
      // Note: We don't disconnect as WebSocket is shared across components
    };
  }, [addNewNotification]);

  // Badge Icons
  const CommentBadge = () => null;

  const BellBadge = () => (
    <View style={[styles.badgeContainer, { backgroundColor: '#3B82F6' }]}>
      <Svg width={10} height={10} viewBox="0 0 10 10">
        <Path
          d="M5 2v1M7.5 7.5H2.5c0-1 .5-1.5 1.5-2V5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v.5c1 .5 1.5 1 1.5 2H7.5z"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M5 7.5v1"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );

  const HeartBadge = () => (
    <View style={styles.heartBadgeContainer}>
      <Svg width={10} height={10} viewBox="0 0 24 24" style={styles.heartIcon}>
        <Path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#EC4899"
        />
      </Svg>
    </View>
  );

  // Notification Types
  const NotificationEntry = ({
    avatar,
    badge,
    timestamp,
    projectInfo,
    mainText,
    children,
  }: {
    avatar: string;
    badge: React.ReactNode;
    timestamp: string;
    projectInfo: string;
    mainText: string;
    children?: React.ReactNode;
  }) => (
    <View style={[styles.notificationCard, { borderColor: colors.border }]}>
      {/* Profile Image with Badge */}
      <View style={styles.avatarContainer}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
        {badge}
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Header: Timestamp and Project Info */}
        <View style={styles.headerRow}>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{timestamp}</Text>
          <Text style={[styles.separator, { color: colors.secondaryText }]}>·</Text>
          <Text style={[styles.projectInfo, { color: colors.secondaryText }]}>{projectInfo}</Text>
        </View>

        {/* Main Text */}
        <Text style={[styles.mainText, { color: colors.primaryText }]}>{mainText}</Text>

        {/* Action-Specific Content */}
        {children}
      </View>
    </View>
  );

  // Comment Notification with Reply Input
  const CommentNotification = ({
    avatar,
    timestamp,
    projectInfo,
    mainText,
    commentText,
    replyTo,
    postId,
    commentIndex,
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
    commentText: string;
    replyTo: string;
    postId: string;
    commentIndex?: number;
  }) => {
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendReply = async () => {
      if (!replyText.trim() || !postId || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      const textToSend = replyText.trim();

      try {
        const response = await addComment(postId, textToSend, commentIndex);
        
        if (response.success) {
          setReplyText('');
          console.log('[NotificationsContent] Reply sent successfully');
        } else {
          console.error('[NotificationsContent] Failed to send reply:', response.error);
        }
      } catch (error) {
        console.error('[NotificationsContent] Error sending reply:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <NotificationEntry
        avatar={avatar}
        badge={<CommentBadge />}
        timestamp={timestamp}
        projectInfo={projectInfo}
        mainText={mainText}
      >
        {/* Comment Bubble */}
        <View style={[styles.commentBubble, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.commentText, { color: colors.primaryText }]}>{commentText}</Text>
        </View>

        {/* Reply Input - Classic Premium Design */}
        <View style={[styles.replyInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <TextInput
            placeholder={`Reply ${replyTo}...`}
            placeholderTextColor={colors.secondaryText}
            value={replyText}
            onChangeText={setReplyText}
            style={[styles.replyTextInput, { color: colors.primaryText }]}
            multiline
            maxLength={500}
            editable={!isSubmitting}
          />
          
          {/* Premium Send Icon Button */}
    <Pressable
            onPress={handleSendReply}
            disabled={replyText.trim().length === 0 || isSubmitting}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: replyText.trim().length > 0 
                ? (isDark ? '#FFFFFF' : '#000000')
                : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.7 : (replyText.trim().length > 0 ? 1 : 0.4),
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Path
                d="m11.21,1.8l-2.859,8.893c-.213.661-1.108.759-1.457.159l-2.01-3.447c-.07-.12-.169-.219-.289-.289l-3.447-2.01c-.6-.35-.502-1.245.159-1.457L10.2.79c.622-.2,1.21.388,1.01,1.01Z"
                fill="none"
                stroke={replyText.trim().length > 0 
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M10.961,1.039 L4.82,7.18"
                fill="none"
                stroke={replyText.trim().length > 0 
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
    </Pressable>
        </View>
      </NotificationEntry>
    );
  };

  // Image Comment Notification with Image Preview
  const ImageCommentNotification = ({
    avatar,
    timestamp,
    projectInfo,
    mainText,
    commentText,
    replyTo,
    imageUri,
    postId,
    commentIndex,
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
    commentText: string;
    replyTo: string;
    imageUri: string;
    postId: string;
    commentIndex?: number;
  }) => {
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendReply = async () => {
      if (!replyText.trim() || !postId || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      const textToSend = replyText.trim();

      try {
        const response = await addComment(postId, textToSend, commentIndex);
        
        if (response.success) {
          setReplyText('');
          console.log('[NotificationsContent] Reply sent successfully');
        } else {
          console.error('[NotificationsContent] Failed to send reply:', response.error);
        }
      } catch (error) {
        console.error('[NotificationsContent] Error sending reply:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <NotificationEntry
        avatar={avatar}
        badge={<CommentBadge />}
        timestamp={timestamp}
        projectInfo={projectInfo}
        mainText={mainText}
      >
        {/* Image Preview with Comment */}
        <View style={styles.imageCommentContainer}>
          {/* Image Preview */}
          <Pressable
            style={[styles.imagePreviewContainer, { borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            {/* Subtle overlay gradient for premium feel */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.imageOverlay}
            />
    </Pressable>

          {/* Comment Bubble */}
          <View style={[styles.commentBubble, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.commentText, { color: colors.primaryText }]}>{commentText}</Text>
          </View>
        </View>

        {/* Reply Input - Classic Premium Design */}
        <View style={[styles.replyInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <TextInput
            placeholder={`Reply ${replyTo}...`}
            placeholderTextColor={colors.secondaryText}
            value={replyText}
            onChangeText={setReplyText}
            style={[styles.replyTextInput, { color: colors.primaryText }]}
            multiline
            maxLength={500}
            editable={!isSubmitting}
          />
          
          {/* Premium Send Icon Button */}
          <Pressable
            onPress={handleSendReply}
            disabled={replyText.trim().length === 0 || isSubmitting}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: replyText.trim().length > 0 
                ? (isDark ? '#FFFFFF' : '#000000')
                : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.7 : (replyText.trim().length > 0 ? 1 : 0.4),
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Path
                d="m11.21,1.8l-2.859,8.893c-.213.661-1.108.759-1.457.159l-2.01-3.447c-.07-.12-.169-.219-.289-.289l-3.447-2.01c-.6-.35-.502-1.245.159-1.457L10.2.79c.622-.2,1.21.388,1.01,1.01Z"
                fill="none"
                stroke={replyText.trim().length > 0 
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M10.961,1.039 L4.82,7.18"
                fill="none"
                stroke={replyText.trim().length > 0 
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
      </Svg>
    </Pressable>
        </View>
      </NotificationEntry>
    );
  };

  // Reply Notification - Shows when someone replies to your comment
  // This notification is sent to User2 (the comment author) when User1 replies to their comment
  const ReplyNotification = ({
    avatar,
    timestamp,
    projectInfo,
    mainText,
    originalCommentText,
    replyText,
    imageUri,
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string; // Format: "{User1 name} replied to your comment: {comment message}"
    originalCommentText: string; // The comment that was replied to (User2's original comment)
    replyText: string; // The reply text (User1's reply message)
    imageUri?: string;
  }) => {
    const hasImage = imageUri && imageUri.trim().length > 0;

    return (
      <NotificationEntry
        avatar={avatar}
        badge={<CommentBadge />}
        timestamp={timestamp}
        projectInfo={projectInfo}
        mainText={mainText}
      >
        {hasImage && (
          <View style={styles.imageCommentContainer}>
            {/* Image Preview */}
            <Pressable
              style={[styles.imagePreviewContainer, { borderColor: colors.border }]}
              onPress={() => {}}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.imageOverlay}
              />
            </Pressable>
    </View>
        )}

        {/* Original Comment Bubble - Shows User2's comment that was replied to */}
        {originalCommentText && originalCommentText.trim().length > 0 && (
          <View style={[styles.commentBubble, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            marginTop: hasImage ? 12 : 0,
            borderLeftWidth: 3,
            borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            paddingLeft: 12,
            paddingVertical: 10,
          }]}>
            <Text style={[styles.commentText, { 
              color: colors.secondaryText, 
              fontSize: 12, 
              fontStyle: 'italic',
              marginBottom: 6,
              fontWeight: '500',
            }]}>
              Your comment:
            </Text>
            <Text style={[styles.commentText, { 
              color: colors.primaryText, 
              fontSize: 14,
              fontStyle: 'normal',
              lineHeight: 20,
            }]}>
              "{originalCommentText}"
            </Text>
          </View>
        )}

        {/* Reply Bubble - Shows User1's reply message */}
        <View style={[styles.commentBubble, { 
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)', 
          marginTop: 10,
          borderLeftWidth: 3,
          borderLeftColor: isDark ? '#60A5FA' : '#2563EB',
          paddingLeft: 12,
          paddingVertical: 10,
          minHeight: 40,
        }]}>
          <Text style={[styles.commentText, { 
            color: colors.secondaryText, 
            fontSize: 12, 
            fontStyle: 'italic',
            marginBottom: 6,
            fontWeight: '500',
          }]}>
            Reply:
          </Text>
          {replyText && replyText.trim().length > 0 ? (
            <Text style={[styles.commentText, { 
              color: colors.primaryText, 
              fontSize: 15, 
              lineHeight: 22,
              fontWeight: '400',
            }]}>
              {replyText}
            </Text>
          ) : (
            <Text style={[styles.commentText, { 
              color: colors.secondaryText, 
              fontSize: 14, 
              fontStyle: 'italic' 
            }]}>
              Reply message not available
            </Text>
      )}
    </View>
      </NotificationEntry>
    );
  };

  // Access Request Notification
  const AccessRequestNotificationWithButtons = ({
    avatar,
    timestamp,
    projectInfo,
    mainText,
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
  }) => (
    <View style={[styles.notificationCard, { borderColor: colors.border }]}>
      {/* Profile Image without Badge */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Header: Timestamp and Project Info */}
        <View style={styles.headerRow}>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{timestamp}</Text>
          <Text style={[styles.separator, { color: colors.secondaryText }]}>·</Text>
          <Text style={[styles.projectInfo, { color: colors.secondaryText }]}>{projectInfo}</Text>
    </View>

        {/* Main Text with Bold Name */}
        <Text style={[styles.mainText, { color: colors.primaryText }]}>
          <Text style={{ fontWeight: '700' }}>
            {mainText.split(' requested')[0]}
          </Text>
          <Text style={{ fontWeight: '400' }}> sent you a follow request.</Text>
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.rejectButton, { borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Text style={[styles.rejectButtonText, { color: colors.primaryText }]}>Reject</Text>
          </Pressable>
          <Pressable
            style={styles.approveButton}
            onPress={() => {}}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </Pressable>
          </View>
          </View>
    </View>
  );

  // Like Notification with Image Preview
  const LikeNotification = ({
    avatar,
    timestamp,
    projectInfo,
    mainText,
    imageUri,
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
    imageUri: string;
  }) => (
    <View style={[styles.notificationCard, { borderColor: colors.border }]}>
      {/* Profile Image with Badge Overlay */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        {/* Heart Badge positioned at bottom-right corner of profile image */}
        <View style={styles.heartBadgeOverlay}>
          <HeartBadge />
        </View>
      </View>

      {/* Content Area with Image Preview */}
      <View style={styles.contentArea}>
        <View style={styles.likeNotificationContent}>
          {/* Text Content */}
          <View style={styles.likeTextContainer}>
            {/* Header: Timestamp and Project Info */}
            <View style={[styles.headerRow, { marginBottom: 4 }]}>
              <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{timestamp}</Text>
              <Text style={[styles.separator, { color: colors.secondaryText, marginHorizontal: 3 }]}>·</Text>
              <Text style={[styles.projectInfo, { color: colors.secondaryText }]}>{projectInfo}</Text>
          </View>

            {/* Main Text */}
            <Text style={[styles.mainText, { color: colors.primaryText, marginBottom: 0, lineHeight: 20 }]}>
              <Text style={{ fontWeight: '700' }}>
                {mainText.split(' liked your post')[0]}
              </Text>
              <Text style={{ fontWeight: '400' }}> liked your post</Text>
            </Text>
      </View>

          {/* Small Image Preview - Aligned to top with header */}
          <Pressable
            style={[styles.smallImagePreview, { borderColor: colors.border, marginTop: 2 }]}
            onPress={() => {}}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.smallImage}
              resizeMode="cover"
            />
          </Pressable>
        </View>
      </View>
        </View>
  );

  // Property Update Notification
  const PropertyUpdateNotification = ({
    avatar,
    timestamp,
    projectInfo,
    mainText,
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
  }) => (
    <View style={[styles.notificationCard, { borderColor: colors.border }]}>
      {/* Profile Image without Badge */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Header: Timestamp and Project Info */}
        <View style={styles.headerRow}>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{timestamp}</Text>
          <Text style={[styles.separator, { color: colors.secondaryText }]}>·</Text>
          <Text style={[styles.projectInfo, { color: colors.secondaryText }]}>{projectInfo}</Text>
      </View>

        {/* Main Text with Bold Name */}
        <Text style={[styles.mainText, { color: colors.primaryText, marginBottom: 4, marginTop: 0 }]}>
          <Text style={{ fontWeight: '700' }}>
            {mainText.split(' started following you')[0]}
          </Text>
          <Text style={{ fontWeight: '400' }}> is now following you</Text>
        </Text>

        {/* Following Button */}
        <View style={[styles.actionButtons, { marginTop: 12 }]}>
          <Pressable
            style={[styles.followingButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Text style={[styles.followingButtonText, { color: colors.primaryText }]}>Following</Text>
          </Pressable>
          </View>
        </View>
      </View>
  );

  // Get default avatar if profile image is not available
  const getAvatarUrl = (profileImageUrl: string | null | undefined, userId: string | null | undefined): string => {
    if (profileImageUrl && profileImageUrl.trim().length > 0 && 
        (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://'))) {
      return profileImageUrl.trim();
    }
    // Fallback to placeholder avatar based on user ID hash
    if (userId) {
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `https://i.pravatar.cc/150?img=${(hash % 50) + 1}`;
    }
    return `https://i.pravatar.cc/150?img=1`;
  };

  // Get default feed image if not available
  const getFeedImageUrl = (feedImageUrl: string | null | undefined): string => {
    if (feedImageUrl && feedImageUrl.trim().length > 0 && 
        (feedImageUrl.startsWith('http://') || feedImageUrl.startsWith('https://'))) {
      return feedImageUrl.trim();
    }
    // Fallback to placeholder image
    return `https://picsum.photos/200/200?random=${Date.now()}`;
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#1F2937'} />
          </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? '#FFFFFF' : '#1F2937'}
        />
      }
    >
      {notifications.length === 0 && !loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
          <Text style={{ fontSize: 16, color: colors.secondaryText, textAlign: 'center', marginBottom: 8 }}>
            No notifications yet!!!
          </Text>
        </View>
      ) : notifications.length > 0 ? (
        notifications.map((notification) => {
          // Use senderId if available (new schema), otherwise fallback to actorUserId (legacy)
          const userId = notification.senderId || notification.actorUserId;
          const avatarUrl = getAvatarUrl(notification.actorProfileImageUrl, userId);
          const timestamp = formatTimeAgo(notification.timeAgoHours);
          const username = notification.actorUsername ? `@${notification.actorUsername}` : '@unknown';
          const actorName = notification.actorFullName || notification.actorUsername || 'Someone';

          switch (notification.type) {
            case 'LIKE':
              return (
                <LikeNotification
                  key={notification.id}
                  avatar={avatarUrl}
                  timestamp={timestamp}
                  projectInfo={username}
                  mainText={`${actorName} liked your post`}
                  imageUri={getFeedImageUrl(notification.feedImageUrl)}
                />
              );
            case 'COMMENT':
              // Check if feed has image - use ImageCommentNotification if image exists, otherwise regular CommentNotification
              const hasImage = notification.feedImageUrl && notification.feedImageUrl.trim().length > 0;
              const postId = notification.postId || notification.feedId || '';
              
              // Only render if we have a valid postId
              if (!postId) {
                console.warn('[NotificationsContent] Comment notification missing postId/feedId:', notification.id);
                return null;
              }
              
              if (hasImage) {
                return (
                  <ImageCommentNotification
                    key={notification.id}
                    avatar={avatarUrl}
                    timestamp={timestamp}
                    projectInfo={username}
                    mainText={`${actorName} commented on your post`}
                    commentText={notification.commentText || ''}
                    replyTo={notification.actorUsername || ''}
                    imageUri={getFeedImageUrl(notification.feedImageUrl)}
                    postId={postId}
                  />
                );
              } else {
                return (
                  <CommentNotification
                    key={notification.id}
                    avatar={avatarUrl}
                    timestamp={timestamp}
                    projectInfo={username}
                    mainText={`${actorName} commented on your post`}
                    commentText={notification.commentText || ''}
                    replyTo={notification.actorUsername || ''}
                    postId={postId}
                  />
                );
              }
            case 'REPLY':
              // Reply notification - someone replied to your comment
              // This notification is sent to User2 (the comment author) when User1 replies to their comment
              // Flow: User2 posts a comment -> User1 replies to User2's comment -> User2 gets this notification
              const replyPostId = notification.postId || notification.feedId || '';
              const replyHasImage = notification.feedImageUrl && notification.feedImageUrl.trim().length > 0;
              // originalCommentText = User2's original comment that was replied to
              const originalCommentText = notification.originalCommentText || 'your comment';
              // replyText = User1's reply message (the actual reply text)
              const replyText = notification.commentText || '';
              
              // Build the main notification message
              // Format: "{User1 name} replied to your comment: {comment message}"
              // The backend already generates this in notification.message, but we can also construct it here as fallback
              const notificationMessage = notification.message || 
                (replyText 
                  ? `${actorName} replied to your comment: ${replyText.length > 50 ? replyText.substring(0, 50) + '...' : replyText}`
                  : `${actorName} replied to your comment`);
              
              // Log reply notification details for debugging
              console.log('[NotificationsContent] REPLY notification:', {
                id: notification.id,
                postId: replyPostId,
                actorName: actorName,
                actorUserId: notification.actorUserId,
                receiverUserId: notification.recipientUserId,
                notificationMessage: notificationMessage,
                originalCommentText: originalCommentText,
                replyText: replyText,
                hasImage: replyHasImage,
                notificationData: {
                  message: notification.message,
                  commentText: notification.commentText,
                  originalCommentText: notification.originalCommentText,
                }
              });
              
              // Only render if we have a valid postId
              if (!replyPostId) {
                console.warn('[NotificationsContent] Reply notification missing postId/feedId:', notification.id);
                return null;
              }
              
              // Ensure we have reply text - if not, log warning
              if (!replyText || replyText.trim().length === 0) {
                console.warn('[NotificationsContent] Reply notification missing reply text:', notification.id);
              }
              
              return (
                <ReplyNotification
                  key={notification.id}
                  avatar={avatarUrl}
                  timestamp={timestamp}
                  projectInfo={username}
                  mainText={notificationMessage}
                  originalCommentText={originalCommentText}
                  replyText={replyText}
                  imageUri={replyHasImage ? getFeedImageUrl(notification.feedImageUrl) : undefined}
                />
              );
            case 'FOLLOW':
              return (
                <PropertyUpdateNotification
                  key={notification.id}
                  avatar={avatarUrl}
                  timestamp={timestamp}
                  projectInfo={username}
                  mainText={`${actorName} is now following you`}
                />
              );
            default:
              return null;
          }
        })
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  badgeContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  heartBadgeContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  heartIcon: {
    marginTop: 0.5,
  },
  heartBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '400',
  },
  separator: {
    fontSize: 13,
    marginHorizontal: 6,
  },
  projectInfo: {
    fontSize: 13,
    fontWeight: '400',
  },
  mainText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 12,
  },
  imageCommentContainer: {
    marginBottom: 12,
  },
  imagePreviewContainer: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
  },
  commentBubble: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  replyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  replyTextInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    marginRight: 12,
    paddingVertical: 2,
    lineHeight: 20,
    maxHeight: 100,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  followingButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  followingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    minWidth: 90,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTagActive: {
    backgroundColor: '#F3E8FF',
  },
  statusTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateIcon: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400',
  },
  likeNotificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  likeTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  smallImagePreview: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
});
