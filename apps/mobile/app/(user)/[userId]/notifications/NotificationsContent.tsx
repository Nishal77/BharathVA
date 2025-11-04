import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getNotifications, Notification } from '../../../../services/api/notificationService';
import { getUserProfileById } from '../../../../services/api/userService';

export default function NotificationsContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userProfileCache, setUserProfileCache] = useState<Map<string, { username: string; fullName: string; profileImageUrl: string | null }>>(new Map());

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
                }
              } catch (error) {
                console.warn('[NotificationsContent] Failed to fetch user details for userId:', userId, error);
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

  // Initial load and refresh
  useEffect(() => {
    fetchNotifications(0, false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(0, false);
  };

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
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
    commentText: string;
    replyTo: string;
  }) => {
    const [replyText, setReplyText] = useState('');

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

        {/* Reply Input */}
        <Pressable style={[styles.replyInput, { backgroundColor: colors.inputBackground }]}>
          <View style={styles.replyInputLeft}>
            <Text style={[styles.replyPlaceholder, { color: colors.secondaryText }]}>
              Reply {replyTo}
      </Text>
          </View>
          <View style={styles.replyIcons}>
            <Svg width={18} height={18} viewBox="0 0 18 18" style={styles.replyIcon}>
              <Circle cx="9" cy="9" r="8" fill="none" stroke={colors.secondaryText} strokeWidth="1" />
              <Circle cx="6.5" cy="8.5" r="0.8" fill={colors.secondaryText} />
              <Path
                d="M11.5 8.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"
                fill="none"
                stroke={colors.secondaryText}
                strokeWidth="1"
                strokeLinecap="round"
              />
              <Path
                d="M7.5 10.5c.5.5 1.3.8 2 .8s1.5-.3 2-.8"
                fill="none"
                stroke={colors.secondaryText}
                strokeWidth="1"
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.keyboardShortcutContainer}>
              <Svg width={16} height={16} viewBox="0 0 16 16" style={styles.keyboardIcon}>
                <Rect x="2" y="4" width="12" height="10" rx="1" fill="none" stroke={colors.secondaryText} strokeWidth="1" />
                <Path d="M2 8h12" stroke={colors.secondaryText} strokeWidth="1" />
                <Rect x="4" y="2" width="2" height="1.5" rx="0.3" fill={colors.secondaryText} />
              </Svg>
              <Text style={[styles.keyboardShortcut, { color: colors.secondaryText }]}>⌘/</Text>
            </View>
          </View>
    </Pressable>
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
  }: {
    avatar: string;
    timestamp: string;
    projectInfo: string;
    mainText: string;
    commentText: string;
    replyTo: string;
    imageUri: string;
  }) => {
    const [replyText, setReplyText] = useState('');

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

        {/* Reply Input */}
        <Pressable style={[styles.replyInput, { backgroundColor: colors.inputBackground }]}>
          <View style={styles.replyInputLeft}>
            <Text style={[styles.replyPlaceholder, { color: colors.secondaryText }]}>
              Reply {replyTo}
            </Text>
          </View>
          <View style={styles.replyIcons}>
            <Svg width={18} height={18} viewBox="0 0 18 18" style={styles.replyIcon}>
              <Circle cx="9" cy="9" r="8" fill="none" stroke={colors.secondaryText} strokeWidth="1" />
              <Circle cx="6.5" cy="8.5" r="0.8" fill={colors.secondaryText} />
              <Path
                d="M11.5 8.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"
                fill="none"
                stroke={colors.secondaryText}
                strokeWidth="1"
                strokeLinecap="round"
              />
              <Path
                d="M7.5 10.5c.5.5 1.3.8 2 .8s1.5-.3 2-.8"
                fill="none"
                stroke={colors.secondaryText}
                strokeWidth="1"
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.keyboardShortcutContainer}>
              <Svg width={16} height={16} viewBox="0 0 16 16" style={styles.keyboardIcon}>
                <Rect x="2" y="4" width="12" height="10" rx="1" fill="none" stroke={colors.secondaryText} strokeWidth="1" />
                <Path d="M2 8h12" stroke={colors.secondaryText} strokeWidth="1" />
                <Rect x="4" y="2" width="2" height="1.5" rx="0.3" fill={colors.secondaryText} />
      </Svg>
              <Text style={[styles.keyboardShortcut, { color: colors.secondaryText }]}>⌘/</Text>
            </View>
          </View>
    </Pressable>
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
            No notifications yet
          </Text>
          <Text style={{ fontSize: 14, color: colors.secondaryText, textAlign: 'center', opacity: 0.7 }}>
            When someone likes or comments on your posts, you'll see them here
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
                  />
                );
              }
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
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
  },
  replyInputLeft: {
    flex: 1,
  },
  replyPlaceholder: {
    fontSize: 14,
    fontWeight: '400',
  },
  replyIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  replyIcon: {
    width: 18,
    height: 18,
  },
  keyboardShortcutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  keyboardIcon: {
    width: 16,
    height: 16,
  },
  keyboardShortcut: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
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
