import React from 'react';
import { Pressable, Text, View, useColorScheme, Dimensions } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

interface PublicSafetyActionsProps {
  comments: number;
  likes: number;
  shares: number;
  isLiked: boolean;
  onComment: () => void;
  onLike: () => void;
  onShare: () => void;
}

// Utility function to format numbers with commas
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get device dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PublicSafetyActions({
  comments,
  likes,
  shares,
  isLiked,
  onComment,
  onLike,
  onShare,
}: PublicSafetyActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Background colors for action buttons - matching FeedActionSection
  const likeBgColor = isDark ? '#4B1F1F' : '#FEE2E2';
  const actionBgColor = isDark ? '#2A2A2A' : '#F5F5F5';
  const actionTextColor = isDark ? '#E5E5E5' : '#1F1F1F';

  // Responsive sizing based on device dimensions - matching FeedActionSection
  const baseWidth = 393;
  const scaleFactor = Math.min(SCREEN_WIDTH / baseWidth, 1.2);
  const minScale = 0.8;

  // Responsive dimensions - matching FeedActionSection
  const iconSize = Math.max(16 * scaleFactor, 16 * minScale);
  const fontSize = Math.max(11 * scaleFactor, 11 * minScale);
  const buttonPaddingH = Math.max(8 * scaleFactor, 6 * minScale);
  const buttonPaddingV = Math.max(5 * scaleFactor, 4 * minScale);
  const iconMarginRight = Math.max(5 * scaleFactor, 4 * minScale);
  const buttonSpacing = Math.max(8 * scaleFactor, 6 * minScale);
  const borderRadius = Math.max(18 * scaleFactor, 16 * minScale);

  return (
    <View className="flex-row items-center justify-between mb-0" style={{ flexWrap: 'wrap' }}>
      {/* Primary Actions - Comment and Like */}
      <View className="flex-row items-center" style={{ flexShrink: 1 }}>
        {/* Comments Button */}
        <Pressable
          onPress={onComment}
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
            {formatNumber(comments)}
          </Text>
        </Pressable>

        {/* Likes Button */}
        <Pressable
          onPress={onLike}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: buttonPaddingH,
            paddingVertical: buttonPaddingV,
            borderRadius: borderRadius,
            backgroundColor: isLiked 
              ? (isDark ? '#4B1F1F' : '#FEE2E2') 
              : likeBgColor,
            marginRight: buttonSpacing,
          }}
        >
          <Svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 18 18"
            style={{ marginRight: iconMarginRight }}
          >
            {isLiked ? (
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
              color: isLiked 
                ? '#EF4444' // Red when liked
                : (isDark ? '#FCA5A5' : '#DC2626'), // Red tint when not liked
              includeFontPadding: false,
            }}
          >
            {formatNumber(likes)}
          </Text>
        </Pressable>
      </View>
      
      {/* Secondary Actions - Share */}
      <View className="flex-row items-center" style={{ flexShrink: 1 }}>
        {/* Share Button */}
        <Pressable
          onPress={onShare}
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
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

