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
}

// Sample comments data - in production, this would come from API
const generateSampleComments = (): Comment[] => {
  const names = [
    'Anshu Kumar', 'Nancy Sharma', 'Arjun Patel', 'Priya Reddy', 'Rohan Singh',
    'Kavya Malhotra', 'Disha Kapoor', 'Raj Gupta', 'Sneha Jain', 'Vikram Agarwal',
    'Meera Bansal', 'Akash Verma', 'Divya Tiwari', 'Nikhil Das', 'Tara Shah',
    'Aman Reddy', 'Isha Kumar', 'Kunal Patel', 'Aditi Sharma', 'Rahul Malhotra',
    'Sonia Gupta', 'Neeraj Singh', 'Puja Jain', 'Harsh Agarwal', 'Kiara Bansal',
    'Varun Verma', 'Ananya Tiwari', 'Rishabh Das', 'Tanvi Shah', 'Ravi Kumar'
  ];
  
  const usernames = [
    'anshu_avail', 'nancybabyworld11', 'video_call01k', 'arjun_01', 'priya_sharma',
    'rohan_patel', 'kavya_reddy', 'disha_kapoor', 'raj_malhotra', 'sneha_gupta',
    'vikram_singh', 'meera_jain', 'akash_kumar', 'divya_sharma', 'nikhil_agarwal',
    'tara_bansal', 'aman_verma', 'isha_reddy', 'kunal_shah', 'aditi_patel',
    'rahul_tiwari', 'sonia_kapoor', 'neeraj_singh', 'puja_das', 'harsh_malik',
    'kiara_sharma', 'varun_jain', 'ananya_mehta', 'rishabh_chopra', 'tanvi_shah'
  ];

  const shortComments = [
    '🔥', '❤️', '🙌', 'Amazing!', 'Wow!', 'Perfect!', 'Love this!', 'So good!',
    'Incredible!', 'Epic!', 'Brilliant!', 'Stunning!', 'Fantastic!', 'Outstanding!',
    'Mind-blowing!', 'Phenomenal!', 'Exceptional!', 'Remarkable!', 'Impressive!',
    'Extraordinary!', 'Magnificent!', 'Spectacular!', 'Incredible work!', 'So inspiring!',
    'Pure excellence!', 'Absolute perfection!', 'Legendary performance!', 'Pure magic!'
  ];

  const longComments = [
    'I agree with you about this topic. I remember when this first came up, and it\'s amazing to see how far we\'ve come. This new approach just makes so much more sense.',
    'Absolutely fantastic! This is exactly what I needed to see today. The attention to detail is remarkable and the execution is flawless. Truly inspiring work!',
    'This is incredible! The amount of effort and thought that went into this is truly commendable. I\'ve been following this for a while now and I must say, this is by far the best implementation I\'ve seen.',
    'Wow, this really resonates with me. I\'ve been thinking about something similar for a while, but seeing it executed so beautifully here is truly inspiring. Can\'t wait to see where this goes next!',
    'This is absolutely mind-blowing! The creativity and innovation on display here is unmatched. I\'ve shared this with my entire team and everyone is equally impressed. This sets a new standard!',
    'I completely understand what you mean. The nuances in this approach really show a deep understanding of the subject matter. It\'s refreshing to see such thoughtful and well-executed work.',
    'This is exactly the kind of quality content I love to see. The presentation is top-notch, the information is valuable, and the overall execution is flawless. Thank you for sharing this!',
    'Incredible work! The way this tackles the problem from multiple angles while maintaining such high quality is truly impressive. I\'ve learned so much from this and I\'m genuinely grateful.',
    'This is phenomenal! Every single detail has been carefully considered and beautifully executed. It\'s clear that a lot of passion and expertise went into creating this. Absolutely brilliant!',
    'This resonates so deeply with me. The approach here is thoughtful, comprehensive, and genuinely innovative. It\'s rare to see something that checks all these boxes so perfectly.',
    'I remember when this topic first came up, and it\'s amazing to see how far we\'ve come. This new approach just makes so much more sense and addresses all the concerns we had before.',
    'This is exactly what I needed! The clarity of thought, the precision of execution, and the overall quality are just outstanding. This has completely changed my perspective on the matter.',
    'What an incredible achievement! The level of sophistication and attention to detail here is truly remarkable. This represents some of the finest work I\'ve seen in this space.',
    'I\'ve been waiting for something like this for a long time. The way you\'ve approached this challenge shows real innovation and creativity. This is going to make such a difference.',
    'This is mind-blowing! Every aspect of this has been executed with such precision and care. It\'s rare to see something that combines innovation with such high quality execution.'
  ];

  const allComments = [...shortComments, ...longComments];

  const pronouns = ['he/him', 'she/her', 'they/them', 'he/they', 'she/they'];

  const generateTimestamp = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const edited = Math.random() > 0.7;
    const relativeTime = formatRelativeTime(date);
    return edited ? `${relativeTime} (edited)` : relativeTime;
  };

  const generateNestedReplies = (parentId: string, count: number): Comment[] => {
    return Array.from({ length: count }, (_, index) => {
      const nameIndex = Math.floor(Math.random() * names.length);
      const randomName = names[nameIndex];
      const randomUsername = usernames[nameIndex];
      const randomComment = allComments[Math.floor(Math.random() * allComments.length)];
      const randomClaps = Math.floor(Math.random() * 100);
      const randomIsClapped = Math.random() > 0.7;
      const randomAvatar = Math.floor(Math.random() * 70) + 1;
      const hasPronouns = Math.random() > 0.6;

      const replyDate = new Date();
      const replyDaysAgo = Math.floor(Math.random() * 30);
      replyDate.setDate(replyDate.getDate() - replyDaysAgo);
      const replyRelativeTime = formatRelativeTime(replyDate);

      return {
        id: `reply_${parentId}_${index + 1}_${Date.now()}`,
        name: randomName,
        username: randomUsername,
        avatar: `https://i.pravatar.cc/150?img=${randomAvatar}`,
        comment: randomComment,
        timestamp: replyRelativeTime,
        pronouns: hasPronouns ? pronouns[Math.floor(Math.random() * pronouns.length)] : undefined,
        claps: randomClaps,
        replies: 0,
        isClapped: randomIsClapped,
        showReplies: false,
      };
    });
  };

  const sampleComments: Comment[] = Array.from({ length: 15 }, (_, index) => {
    const nameIndex = Math.floor(Math.random() * names.length);
    const randomName = names[nameIndex];
    const randomUsername = usernames[nameIndex];
    const randomComment = allComments[Math.floor(Math.random() * allComments.length)];
    const randomClaps = Math.floor(Math.random() * 1000);
    const randomIsClapped = Math.random() > 0.7;
    const randomReplies = Math.floor(Math.random() * 8);
    const randomAvatar = Math.floor(Math.random() * 70) + 1;
    const hasReplies = randomReplies > 0;

    return {
      id: `comment_${index + 1}_${Date.now()}_${Math.random()}`,
      name: randomName,
      username: randomUsername,
      avatar: `https://i.pravatar.cc/150?img=${randomAvatar}`,
      comment: randomComment,
      timestamp: generateTimestamp(),
      claps: randomClaps,
      replies: randomReplies,
      isClapped: randomIsClapped,
      showReplies: false,
      repliesList: hasReplies ? generateNestedReplies(`comment_${index + 1}`, randomReplies) : undefined,
    };
  });

  return sampleComments;
};

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
  commentsCount = 0,
}: CommentsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [clappedComments, setClappedComments] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

  // Theme-compatible color for "Show replies" text - works in both light and dark
  const showRepliesColor = isDark ? '#60A5FA' : '#2563EB';

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;


  useEffect(() => {
    if (visible) {
      // Load comments when modal opens
      setComments(generateSampleComments());
      
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

  const handleSendComment = () => {
    if (inputText.trim()) {
      const now = new Date();
      const timestamp = formatRelativeTime(now);
      
      const newComment: Comment = {
        id: Date.now().toString(),
        name: 'You',
        username: 'you',
        avatar: 'https://i.pravatar.cc/150?img=1',
        comment: inputText,
        timestamp,
        claps: 0,
        replies: 0,
        isClapped: false,
        showReplies: false,
      };
      setComments((prev) => [newComment, ...prev]);
      setInputText('');
    }
  };


  const filteredComments = comments;

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
                      {comments.length} Responses
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
              {filteredComments.length === 0 ? (
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
                    No comments found
                  </Text>
                </View>
              ) : (
                <View>
                  {filteredComments.map((comment) => {
                    const isClapped = clappedComments.has(comment.id) || comment.isClapped;
                    const currentClaps = isClapped && !comment.isClapped && !clappedComments.has(comment.id)
                      ? comment.claps
                      : (isClapped ? comment.claps + 1 : comment.claps);
                    const repliesVisible = showReplies.has(comment.id);
                    const hasReplies = comment.repliesList && comment.repliesList.length > 0;

                    return (
                      <View key={comment.id}>
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
                  onPress={inputText.trim().length > 0 ? handleSendComment : undefined}
                  disabled={inputText.trim().length === 0}
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

