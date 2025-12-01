import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  Dimensions,
  StatusBar,
  Platform,
  Share,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Custom Icon Components
const ArrowLeftIcon = ({ size = 24, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m15 6-6 6 6 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronUpIcon = ({ size = 20, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m18 15-6-6-6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDownIcon = ({ size = 20, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 9 6 6 6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BookmarkIcon = ({ size = 24, color = '#000000', filled = false }: { size?: number; color?: string; filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M7.527 20.841C6.861 21.274 6 20.772 6 19.952V3.942c0-.52.336-.942.75-.942h10.5c.414 0 .75.422.75.942v16.01c0 .82-.861 1.322-1.527.89l-3.946-2.562a.96.96 0 0 0-1.054 0z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

const ShareIcon = ({ size = 24, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m14 10-3 3m9.288-9.969a.535.535 0 0 1 .68.681l-5.924 16.93a.535.535 0 0 1-.994.04l-3.219-7.242a.54.54 0 0 0-.271-.271l-7.242-3.22a.535.535 0 0 1 .04-.993z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Comment {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  timeAgo: string;
  content: string;
  score: number;
  replies: number;
  userVote?: 'up' | 'down' | null;
  nestedReplies?: Comment[];
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      name: 'Sufyan Maan',
      handle: 'sufyanmaan',
      avatar: 'https://i.pravatar.cc/150?img=12',
      verified: true,
    },
    timeAgo: '15h',
    content: 'Just a shy of 9.8k to hit $100k, I can see its coming in Dec! This is really exciting progress.',
    score: 124,
    replies: 3,
    userVote: 'up',
    nestedReplies: [
      {
        id: '1-1',
        author: {
          name: 'Tech Enthusiast',
          handle: 'techfan',
          avatar: 'https://i.pravatar.cc/150?img=30',
        },
        timeAgo: '14h',
        content: 'That\'s amazing! Keep pushing forward. The momentum is clearly building.',
        score: 23,
        replies: 0,
      },
      {
        id: '1-2',
        author: {
          name: 'Startup Founder',
          handle: 'founder2024',
          avatar: 'https://i.pravatar.cc/150?img=31',
          verified: true,
        },
        timeAgo: '13h',
        content: 'Congratulations! This is a huge milestone. Wishing you continued success.',
        score: 18,
        replies: 0,
      },
      {
        id: '1-3',
        author: {
          name: 'Business Advisor',
          handle: 'bizadvisor',
          avatar: 'https://i.pravatar.cc/150?img=32',
        },
        timeAgo: '12h',
        content: 'Great progress! The diversification strategy is paying off well.',
        score: 15,
        replies: 0,
      },
    ],
  },
  {
    id: '2',
    author: {
      name: 'Jonathan Sturgeon',
      handle: 'imintomoms',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    timeAgo: '15h',
    content: 'If people are happy buying a dream, then it\'s fair. The market decides what has value. This is a solid perspective on entrepreneurship.',
    score: 89,
    replies: 12,
    nestedReplies: [
      {
        id: '2-1',
        author: {
          name: 'Market Analyst',
          handle: 'analyst_pro',
          avatar: 'https://i.pravatar.cc/150?img=33',
        },
        timeAgo: '14h',
        content: 'Exactly! Market validation is key. If customers are willing to pay, that\'s all that matters.',
        score: 34,
        replies: 0,
      },
      {
        id: '2-2',
        author: {
          name: 'Product Manager',
          handle: 'pm_expert',
          avatar: 'https://i.pravatar.cc/150?img=34',
        },
        timeAgo: '13h',
        content: 'Well said. Value is subjective and determined by the market, not by our assumptions.',
        score: 28,
        replies: 0,
      },
    ],
  },
  {
    id: '3',
    author: {
      name: 'Sarah Chen',
      handle: 'sarahchen',
      avatar: 'https://i.pravatar.cc/150?img=20',
      verified: true,
    },
    timeAgo: '16h',
    content: 'This is inspiring! Building multiple products simultaneously requires incredible focus and execution. Keep up the great work!',
    score: 67,
    replies: 5,
  },
  {
    id: '4',
    author: {
      name: 'Alex Kumar',
      handle: 'alexkumar',
      avatar: 'https://i.pravatar.cc/150?img=25',
    },
    timeAgo: '17h',
    content: 'The diversification strategy is smart. Not putting all eggs in one basket. This approach reduces risk significantly.',
    score: 45,
    replies: 2,
  },
];

export default function NewsDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<'top' | 'latest'>('top');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [commentVotes, setCommentVotes] = useState<Record<string, 'up' | 'down' | null>>(
    mockComments.reduce((acc, comment) => {
      if (comment.userVote) {
        acc[comment.id] = comment.userVote;
      }
      return acc;
    }, {} as Record<string, 'up' | 'down' | null>)
  );
  const [commentScores, setCommentScores] = useState<Record<string, number>>(
    mockComments.reduce((acc, comment) => {
      acc[comment.id] = comment.score;
      return acc;
    }, {} as Record<string, number>)
  );
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{ id: string; handle: string; name: string } | null>(null);
  
  const getDisplayText = () => {
    if (replyingTo) {
      return `Reply to @${replyingTo.handle} ${commentText}`;
    }
    return commentText;
  };
  
  const handleTextChange = (text: string) => {
    if (replyingTo) {
      const prefix = `Reply to @${replyingTo.handle} `;
      if (text.startsWith(prefix)) {
        setCommentText(text.substring(prefix.length));
      } else if (text.length < prefix.length) {
        setReplyingTo(null);
        setCommentText(text);
      }
    } else {
      setCommentText(text);
    }
  };

  const title = (params.title as string) || 'Breaking News Title';
  const description = (params.description as string) || '';
  const imageUrl = (params.imageUrl as string) || '';
  const category = (params.category as string) || 'News';
  const timeAgo = (params.timeAgo as string) || 'Just now';

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const buttonBgColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  const handleBack = () => {
    router.back();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${description || ''}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    const currentVote = commentVotes[commentId];
    const currentScore = commentScores[commentId] || 0;
    
    let newVote: 'up' | 'down' | null = null;
    let scoreChange = 0;
    
    if (currentVote === voteType) {
      newVote = null;
      scoreChange = voteType === 'up' ? -1 : 1;
    } else if (currentVote === null) {
      newVote = voteType;
      scoreChange = voteType === 'up' ? 1 : -1;
    } else {
      newVote = voteType;
      scoreChange = voteType === 'up' ? 2 : -2;
    }
    
    setCommentVotes(prev => ({ ...prev, [commentId]: newVote }));
    setCommentScores(prev => ({ ...prev, [commentId]: currentScore + scoreChange }));
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isNested: boolean = false, level: number = 0) => {
    const currentVote = commentVotes[comment.id] || null;
    const currentScore = commentScores[comment.id] || comment.score;
    const upvoteColor = currentVote === 'up' ? '#FF6B35' : secondaryTextColor;
    const downvoteColor = currentVote === 'down' ? '#6B7280' : secondaryTextColor;
    const scoreColor = currentVote === 'up' ? '#FF6B35' : currentVote === 'down' ? '#6B7280' : textColor;
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.nestedReplies && comment.nestedReplies.length > 0;

      return (
        <View
          key={comment.id}
          style={{
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: isNested ? 4 + (level * 4) : 20,
            borderBottomWidth: isNested ? 0 : 1,
            borderBottomColor: borderColor,
            backgroundColor: 'transparent',
          }}
        >
        {/* Voting Section - Left Side */}
        <View
          style={{
            alignItems: 'center',
            marginRight: 12,
            minWidth: 40,
          }}
        >
          <Pressable
            onPress={() => handleVote(comment.id, 'up')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              padding: 4,
            })}
          >
            <ChevronUpIcon size={20} color={upvoteColor} />
          </Pressable>
          
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: scoreColor,
              marginVertical: 4,
              fontFamily: 'Chirp-Bold',
              minWidth: 24,
              textAlign: 'center',
            }}
          >
            {formatNumber(currentScore)}
          </Text>
          
          <Pressable
            onPress={() => handleVote(comment.id, 'down')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              padding: 4,
            })}
          >
            <ChevronDownIcon size={20} color={downvoteColor} />
          </Pressable>
        </View>

        {/* Comment Content - Right Side */}
        <View style={{ flex: 1 }}>
          {/* User Info */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Image
              source={{ uri: comment.author.avatar }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 10,
              }}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: textColor,
                    marginRight: 6,
                    fontFamily: 'Chirp-Bold',
                  }}
                >
                  {comment.author.name}
                </Text>
                {comment.author.verified && (
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#1DA1F2',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900' }}>✓</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: secondaryTextColor,
                    fontFamily: 'Chirp-Regular',
                    marginRight: 6,
                  }}
                >
                  @{comment.author.handle}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: secondaryTextColor,
                    fontFamily: 'Chirp-Regular',
                  }}
                >
                  · {comment.timeAgo}
                </Text>
              </View>
            </View>
          </View>

          {/* Comment Text */}
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: textColor,
              marginBottom: 12,
              fontFamily: 'Chirp-Regular',
            }}
          >
            {comment.content}
          </Text>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Pressable
              onPress={() => {
                setReplyingTo({
                  id: comment.id,
                  handle: comment.author.handle,
                  name: comment.author.name,
                });
                setCommentText('');
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
                paddingVertical: 4,
                paddingHorizontal: 8,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: secondaryTextColor,
                  fontFamily: 'Chirp-SemiBold',
                }}
              >
                Reply
              </Text>
            </Pressable>
            
            {hasReplies && (
              <Pressable
                onPress={() => toggleReplies(comment.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                })}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#FF6B35',
                    fontFamily: 'Chirp-SemiBold',
                  }}
                >
                  {isExpanded ? 'Hide' : 'View'} {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Nested Replies */}
          {isExpanded && hasReplies && (
            <View style={{ marginTop: 16, paddingLeft: 0 }}>
              {comment.nestedReplies?.map((reply) => (
                <View key={reply.id} style={{ marginBottom: 0 }}>
                  {renderComment(reply, true, level + 1)}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const fullArticleContent = description || `This is a detailed article about the breaking news. The information provided here gives you comprehensive insights into what's happening in your area. Local authorities are working diligently to address the situation and keep residents informed. It's important to stay updated with the latest developments and follow any official guidance provided. The community response has been positive, with many residents taking necessary precautions and staying informed through official channels. We will continue to monitor the situation and provide updates as they become available.

The situation has evolved significantly over the past few hours, with emergency services coordinating efforts to ensure public safety. Multiple agencies are working together to manage the impact and minimize disruption to daily life. Residents are advised to remain calm and follow official instructions from verified sources.

Additional resources have been deployed to handle the situation effectively. Community centers have been set up as information hubs where residents can get real-time updates and assistance. Volunteers are also contributing to the relief efforts, demonstrating the strong community spirit in times of need.

As the situation continues to develop, we will provide regular updates through official channels. It's crucial to stay informed and avoid spreading unverified information. The safety and well-being of all residents remains the top priority for local authorities.`;

  const MAX_PREVIEW_LENGTH = 250;
  const shouldTruncate = fullArticleContent.length > MAX_PREVIEW_LENGTH;
  const articleContent = isTextExpanded || !shouldTruncate 
    ? fullArticleContent 
    : fullArticleContent.substring(0, MAX_PREVIEW_LENGTH) + '...';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View
        style={{
          paddingTop: statusBarHeight + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: bgColor,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <ArrowLeftIcon size={24} color={textColor} />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable
            onPress={handleBookmark}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <BookmarkIcon
              size={24}
              color={isBookmarked ? '#FF6B35' : textColor}
              filled={isBookmarked}
            />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <ShareIcon size={24} color={textColor} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Content */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '900',
              color: textColor,
              lineHeight: 36,
              letterSpacing: -0.8,
              marginBottom: 20,
              fontFamily: 'Chirp-Bold',
            }}
          >
            {title}
          </Text>

          {imageUrl && (
            <View style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden' }}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: SCREEN_WIDTH - 32,
                  height: (SCREEN_WIDTH - 32) * 0.6,
                }}
                contentFit="cover"
                transition={200}
              />
            </View>
          )}

          <View>
            <Text
              style={{
                fontSize: 17,
                lineHeight: 26,
                color: textColor,
                letterSpacing: 0.1,
                marginBottom: 16,
                fontFamily: 'Chirp-Regular',
              }}
            >
              {isTextExpanded ? fullArticleContent : (
                <>
                  {fullArticleContent.substring(0, MAX_PREVIEW_LENGTH)}
                  {shouldTruncate && (
                    <>
                      {'... '}
                      <Text
                        onPress={() => setIsTextExpanded(true)}
                        style={{
                          fontSize: 17,
                          color: '#007AFF',
                          fontWeight: '600',
                          fontFamily: 'Chirp-SemiBold',
                        }}
                      >
                        View more
                      </Text>
                    </>
                  )}
                </>
              )}
              {isTextExpanded && shouldTruncate && (
                <>
                  {' '}
                  <Text
                    onPress={() => setIsTextExpanded(false)}
                    style={{
                      fontSize: 17,
                      color: '#007AFF',
                      fontWeight: '600',
                      fontFamily: 'Chirp-SemiBold',
                    }}
                  >
                    View less
                  </Text>
                </>
              )}
            </Text>
          </View>
        </View>

        {/* Comments Header with Avatars */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              {/* Avatar Stack - Exactly 4 Avatars */}
              {(() => {
                const allReplyAuthors = mockComments
                  .flatMap(comment => comment.nestedReplies || [])
                  .map(reply => reply.author.avatar);
                
                const uniqueAvatars = Array.from(new Set(allReplyAuthors));
                const displayAvatars = uniqueAvatars.length >= 4
                  ? uniqueAvatars.slice(0, 4)
                  : [...uniqueAvatars, ...mockComments.slice(0, 4 - uniqueAvatars.length).map(c => c.author.avatar)].slice(0, 4);
                
                const totalReplies = mockComments.reduce((sum, comment) => sum + (comment.nestedReplies?.length || 0), 0);
                const totalComments = mockComments.length;
                
                return (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {displayAvatars.slice(0, 4).map((avatar, index) => (
                        <View
                          key={index}
                          style={{
                            marginLeft: index > 0 ? -8 : 0,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            zIndex: 4 - index,
                          }}
                        >
                          <Image
                            source={{ uri: avatar }}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 18,
                            }}
                            contentFit="cover"
                          />
                        </View>
                      ))}
                    </View>
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '800',
                          color: textColor,
                          fontFamily: 'Chirp-Bold',
                          letterSpacing: -0.4,
                          marginBottom: 2,
                        }}
                      >
                        {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: secondaryTextColor,
                          fontFamily: 'Chirp-Medium',
                        }}
                      >
                        Join the conversation
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
            
            {/* Sort/Dropdown Button */}
            <Pressable
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: buttonBgColor,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
                marginLeft: 8,
              })}
            >
              <ChevronDownIcon size={18} color={secondaryTextColor} />
            </Pressable>
          </View>
        </View>

        {/* Comments List - Reddit Style */}
        <View style={{ paddingTop: 0 }}>
          {mockComments.map((comment) => renderComment(comment))}
        </View>
      </ScrollView>

      {/* Comment Input Box - Fixed at Bottom */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: borderColor,
          backgroundColor: bgColor,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        }}
      >
        {/* Replying To Header */}
        {replyingTo && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: secondaryTextColor,
                fontFamily: 'Chirp-Regular',
              }}
            >
              Replying to <Text style={{ fontWeight: '600', fontFamily: 'Chirp-SemiBold' }}>@{replyingTo.handle}</Text>
            </Text>
            <Pressable
              onPress={() => {
                setReplyingTo(null);
                setCommentText('');
              }}
              style={{ padding: 4 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: secondaryTextColor,
                  fontFamily: 'Chirp-Regular',
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>
        )}
        
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            minHeight: 48,
          }}
        >
          <TextInput
            value={replyingTo ? `@${replyingTo.handle} ${commentText}` : commentText}
            onChangeText={(text) => {
              if (replyingTo) {
                const prefix = `@${replyingTo.handle} `;
                if (text.startsWith(prefix)) {
                  setCommentText(text.substring(prefix.length));
                } else if (!text.startsWith('@')) {
                  setCommentText(text);
                }
              } else {
                setCommentText(text);
              }
            }}
            placeholder={replyingTo ? '' : 'Add a comment...'}
            placeholderTextColor={secondaryTextColor}
            style={{
              flex: 1,
              fontSize: 15,
              color: textColor,
              fontFamily: 'Chirp-Regular',
              maxHeight: 100,
            }}
            multiline
            textAlignVertical="center"
          />
          {commentText.trim().length > 0 && (
            <Pressable
              onPress={() => {
                setCommentText('');
                setReplyingTo(null);
              }}
              style={({ pressed }) => ({
                marginLeft: 12,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#FF6B35',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <ChevronUpIcon size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}

