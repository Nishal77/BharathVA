import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export default function NotificationsContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#1F2937',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#1F2937' : '#E5E7EB',
    cardBackground: isDark ? '#0F172A' : '#F9FAFB',
    inputBackground: isDark ? '#1F2937' : '#F3F4F6',
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
    <View style={[styles.badgeContainer, { backgroundColor: '#EC4899' }]}>
      <Svg width={10} height={10} viewBox="0 0 10 10">
        <Path
          d="M5 8.5c-.3 0-.6-.1-.8-.3C3.6 7.5 1.5 5.4 1.5 3.5c0-1.1.9-2 2-2 .6 0 1.2.3 1.5.7.3-.4.9-.7 1.5-.7 1.1 0 2 .9 2 2 0 1.9-2.1 4-2.7 4.7-.2.2-.5.3-.8.3z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
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
      {/* Profile Image with Badge */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <HeartBadge />
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

  // Sample notification data
  const usernames = [
    '@alex_williams',
    '@sophia_martinez',
    '@james_chen',
    '@emma_thompson',
    '@michael_jordan',
    '@olivia_parker',
    '@david_kumar',
    '@isabella_lee',
    '@ryan_anderson',
    '@ava_johnson',
  ];

  const getRandomUsername = () => {
    return usernames[Math.floor(Math.random() * usernames.length)];
  };

  const notifications = [
    {
      id: '1',
      type: 'comment',
      avatar: 'https://i.pravatar.cc/150?img=12',
      timestamp: '8 hours ago',
      projectInfo: getRandomUsername(),
      mainText: 'Ricky commented on the status of Design project',
      commentText: '@themilo have got the latest draft of homepage and mobile version.',
      replyTo: '@billy',
    },
    {
      id: '2',
      type: 'imageComment',
      avatar: 'https://i.pravatar.cc/150?img=18',
      timestamp: '5 hours ago',
      projectInfo: getRandomUsername(),
      mainText: 'Sarah commented on your post',
      commentText: 'This design looks absolutely stunning! Love the color palette and layout. Great work!',
      replyTo: '@sarah',
      imageUri: `https://picsum.photos/400/250?random=${Date.now()}`,
    },
    {
      id: '3',
      type: 'access',
      avatar: 'https://i.pravatar.cc/150?img=15',
      timestamp: '1d ago',
      projectInfo: getRandomUsername(),
      mainText: 'Milo Piróg requested to follow you',
    },
    {
      id: '4',
      type: 'update',
      avatar: 'https://i.pravatar.cc/150?img=20',
      timestamp: '1d ago',
      projectInfo: getRandomUsername(),
      mainText: 'Kamil started following you',
    },
    {
      id: '5',
      type: 'like',
      avatar: 'https://i.pravatar.cc/150?img=25',
      timestamp: '2h ago',
      projectInfo: getRandomUsername(),
      mainText: 'Alex liked your post',
      imageUri: `https://picsum.photos/200/200?random=${Date.now() + 1}`,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {notifications.map((notification) => {
        switch (notification.type) {
          case 'comment':
            return (
              <CommentNotification
                key={notification.id}
                avatar={notification.avatar}
                timestamp={notification.timestamp}
                projectInfo={notification.projectInfo}
                mainText={notification.mainText}
                commentText={notification.commentText || ''}
                replyTo={notification.replyTo || ''}
              />
            );
          case 'imageComment':
            return (
              <ImageCommentNotification
                key={notification.id}
                avatar={notification.avatar}
                timestamp={notification.timestamp}
                projectInfo={notification.projectInfo}
                mainText={notification.mainText}
                commentText={notification.commentText || ''}
                replyTo={notification.replyTo || ''}
                imageUri={notification.imageUri || ''}
              />
            );
          case 'access':
            return (
              <AccessRequestNotificationWithButtons
                key={notification.id}
                avatar={notification.avatar}
                timestamp={notification.timestamp}
                projectInfo={notification.projectInfo}
                mainText={notification.mainText}
              />
            );
          case 'update':
            return (
              <PropertyUpdateNotification
                key={notification.id}
                avatar={notification.avatar}
                timestamp={notification.timestamp}
                projectInfo={notification.projectInfo}
                mainText={notification.mainText}
              />
            );
          case 'like':
            return (
              <LikeNotification
                key={notification.id}
                avatar={notification.avatar}
                timestamp={notification.timestamp}
                projectInfo={notification.projectInfo}
                mainText={notification.mainText}
                imageUri={notification.imageUri || ''}
              />
            );
          default:
            return null;
        }
      })}
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
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
