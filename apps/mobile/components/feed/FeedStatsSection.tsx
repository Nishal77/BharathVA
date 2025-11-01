import React, { useMemo } from 'react';
import { Text, View, useColorScheme, Dimensions } from 'react-native';

interface FeedStatsSectionProps {
  replies?: number;
  likes?: number;
  views?: number;
}

// Get device dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Utility function to format large numbers as 1.2k, 5M, etc.
function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

// Popular reaction emojis
const reactionEmojis = [
  '❤️', '😂', '😮', '😢', '🙏', '🔥', '👍', '👏', 
  '🎉', '💯', '🤔', '✨', '💪', '🎊', '❤️‍🔥', '😍'
];

export default function FeedStatsSection({ 
  replies = 0, 
  likes = 0,
  views,
}: FeedStatsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Responsive sizing
  const baseWidth = 393;
  const scaleFactor = Math.min(SCREEN_WIDTH / baseWidth, 1.2);
  const minScale = 0.8;
  
  // Generate random views if not provided
  const randomViews = useMemo(() => {
    if (views !== undefined && views > 0) {
      return views;
    }
    // Random between 1.5k and 50k
    return Math.floor(Math.random() * 48500) + 1500;
  }, [views]);
  
  // Generate 2-3 random reaction emojis with individual counts
  const reactions = useMemo(() => {
    const numEmojis = Math.floor(Math.random() * 2) + 2; // 2 or 3 emojis
    const availableEmojis = [...reactionEmojis];
    const emojiCounts: Array<{ emoji: string; count: number }> = [];
    
    for (let i = 0; i < numEmojis; i++) {
      const randomIndex = Math.floor(Math.random() * availableEmojis.length);
      const selectedEmoji = availableEmojis[randomIndex];
      availableEmojis.splice(randomIndex, 1); // Remove to avoid duplicates
      
      // Each emoji gets a random count between 2 and 99 (showing individual reaction counts)
      const emojiCount = Math.floor(Math.random() * 98) + 2;
      emojiCounts.push({ emoji: selectedEmoji, count: emojiCount });
    }
    
    // Random additional count between 100 and 500 (shown after the +)
    const additionalCount = Math.floor(Math.random() * 400) + 100;
    
    return { emojiCounts, additionalCount };
  }, []);
  
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const reactionBgColor = isDark ? '#2A2A2A' : '#F5F5F5';
  const reactionTextColor = isDark ? '#E5E5E5' : '#1F1F1F';
  
  // Premium sizing for emoji reactions
  const fontSize = Math.max(11 * scaleFactor, 10 * minScale);
  const emojiSize = Math.max(14 * scaleFactor, 13 * minScale); // Slightly larger for visibility
  const reactionPaddingH = Math.max(9 * scaleFactor, 8 * minScale); // More padding for premium look
  const reactionPaddingV = Math.max(5 * scaleFactor, 4.5 * minScale);
  const reactionSpacing = Math.max(10 * scaleFactor, 8 * minScale);
  const emojiCountGap = 4; // Gap between emoji and its count
  const itemGap = 6; // Gap between each emoji-count pair
  const plusGap = 5; // Gap before the + sign

  return (
    <View className="pb-3 pr-1">
      <View className="flex-row items-center" style={{ flexWrap: 'wrap' }}>
        {/* Reactions Section - Premium Modern Design */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: reactionBgColor,
            paddingHorizontal: reactionPaddingH,
            paddingVertical: reactionPaddingV,
            borderRadius: 16,
            marginRight: reactionSpacing,
          }}
        >
          {reactions.emojiCounts.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: index === reactions.emojiCounts.length - 1 ? plusGap : itemGap,
              }}
            >
              <Text
                style={{
                  fontSize: emojiSize,
                  includeFontPadding: false,
                }}
              >
                {item.emoji}
              </Text>
              <Text
                style={{
                  fontSize: fontSize,
                  fontWeight: '600',
                  color: reactionTextColor,
                  includeFontPadding: false,
                  marginLeft: emojiCountGap,
                  letterSpacing: 0.1,
                }}
              >
                {item.count}
              </Text>
            </View>
          ))}
          <Text
            style={{
              fontSize: fontSize,
              fontWeight: '600',
              color: reactionTextColor,
              includeFontPadding: false,
              marginLeft: 2,
              letterSpacing: 0.2,
            }}
          >
            +
          </Text>
          <Text
            style={{
              fontSize: fontSize,
              fontWeight: '600',
              color: reactionTextColor,
              includeFontPadding: false,
              marginLeft: 4,
              letterSpacing: 0.2,
            }}
          >
            {formatNumber(reactions.additionalCount)}
          </Text>
        </View>
        
        {/* Views Section */}
        <Text 
          style={{ 
            fontSize: fontSize,
            color: secondaryTextColor,
            fontWeight: '500',
          }}
        >
          {formatNumber(randomViews)} {randomViews === 1 ? 'view' : 'views'}
        </Text>
      </View>
    </View>
  );
}

