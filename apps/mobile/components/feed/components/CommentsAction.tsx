import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Svg, Path, Rect, Circle, Polyline } from 'react-native-svg';

interface CommentsActionProps {
  timestamp: string;
  onBoost?: () => void;
  onReply?: () => void;
  size?: 'default' | 'small';
  initialBoosted?: boolean;
}

export default function CommentsAction({
  timestamp,
  onBoost,
  onReply,
  size = 'default',
  initialBoosted = false,
}: CommentsActionProps) {
  const [isBoosted, setIsBoosted] = useState(initialBoosted);
  
  const boostIconSize = size === 'small' ? 12 : 12;
  const replyIconSize = size === 'small' ? 16 : 18;
  const iconColor = '#6B7280';
  const boostedColor = '#F97316';

  const containerClasses = size === 'small' ? 'mt-3' : 'mt-4';
  const boostIconMarginClasses = size === 'small' ? 'mr-3' : 'mr-4';
  const replyIconMarginClasses = size === 'small' ? 'mr-1.5' : 'mr-2';
  const separatorMarginClasses = size === 'small' ? 'mx-4' : 'mx-[18px]';
  const fontSizeClasses = size === 'small' ? 'text-[13px]' : 'text-sm';
  const separatorSizeClasses = size === 'small' ? 'text-[14px]' : 'text-[15px]';

  const handleBoost = () => {
    setIsBoosted(!isBoosted);
    onBoost?.();
  };

  return (
    <View className={`flex-row items-center w-full ${containerClasses}`}>
      {/* Boost Button */}
      <Pressable
        onPress={handleBoost}
        className="flex-row items-center"
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        {/* Boost Icon - Changes based on state */}
        <Svg 
          width={boostIconSize} 
          height={boostIconSize} 
          viewBox="0 0 12 12"
          className={boostIconMarginClasses}
        >
          {isBoosted ? (
            <>
              <Path
                d="m2.058,12H.75c-.414,0-.75-.336-.75-.75v-1.308c0-.807.475-1.543,1.21-1.875.378-.172.822-.002.992.375.17.378.002.822-.375.992-.199.09-.328.289-.328.508v.558h.558c.219,0,.418-.129.509-.328.171-.377.616-.544.992-.374.377.17.545.615.374.992-.333.735-1.068,1.21-1.875,1.21Z"
                fill={boostedColor}
                strokeWidth="0"
              />
              <Path
                d="m11.78.22c-.156-.156-.375-.239-.595-.217-2.674.23-4.862,1.146-6.437,2.596h-1.315c-.547,0-1.057.245-1.398.673L.164,5.615c-.16.201-.207.469-.124.712.083.243.285.426.535.486l2.16.517,1.934,1.934.517,2.16c.06.25.243.452.486.535.08.027.162.041.244.041.167,0,.333-.056.468-.164l2.343-1.872c.428-.341.673-.851.673-1.398v-1.315c1.449-1.575,2.366-3.763,2.596-6.437.019-.221-.06-.438-.217-.595Zm-3.78,4.78c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z"
                strokeWidth="0"
                fill={boostedColor}
              />
            </>
          ) : (
            <>
              <Path
                d="m4.981,3.405l.032-.056h-1.579c-.316,0-.615.144-.812.391l-1.872,2.344,2.366.566c.329-1.198.951-2.308,1.865-3.245Z"
                strokeWidth="0"
                fill={iconColor}
              />
              <Path
                d="m8.595,7.019l.056-.032v1.579c0,.316-.144.615-.391.812l-2.344,1.872-.566-2.366c1.198-.329,2.308-.951,3.245-1.865Z"
                strokeWidth="0"
                fill={iconColor}
              />
              <Path
                d="m3.25,10.481c-.205.453-.662.769-1.192.769H.75v-1.307c0-.53.315-.987.769-1.192"
                fill="none"
                stroke={iconColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="m5.013,3.349h-1.579c-.316,0-.615.144-.812.391l-1.872,2.344,2.366.566"
                fill="none"
                stroke={iconColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="m8.651,6.987v1.579c0,.316-.144.615-.391.812l-2.344,1.872-.566-2.366"
                fill="none"
                stroke={iconColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Path
                d="m5.351,8.884c2.995-.823,5.491-3.381,5.899-8.134C6.497,1.159,3.939,3.655,3.116,6.649l2.234,2.234Z"
                fill="none"
                stroke={iconColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <Circle
                cx="7.75"
                cy="4.25"
                r=".75"
                fill={iconColor}
                strokeWidth="0"
              />
            </>
          )}
        </Svg>
        <Text
          className={`${fontSizeClasses} ml-1 font-semibold tracking-[0.2px] ${isBoosted ? 'text-[#F97316]' : 'text-[#6B7280]'}`}
          style={{ includeFontPadding: false }}
        >
          {isBoosted ? 'Boosted' : 'Boost'}
        </Text>
      </Pressable>

      {/* Separator Dot */}
      <Text
        className={`${separatorSizeClasses} text-[#6B7280] ${separatorMarginClasses}`}
        style={{ includeFontPadding: false }}
      >
        ·
      </Text>

      {/* Reply Button */}
      <Pressable
        onPress={onReply}
        className="flex-row items-center"
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        {/* Envelope Icon - Updated Lightweight Version */}
        <Svg
          width={12}
          height={12}
          viewBox="0 0 12 12"
          className={replyIconMarginClasses}
        >
          <Polyline
            points="0.75 4.5 6 6.75 11.25 4.5"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <Rect
            x="0.75"
            y="1.75"
            width="10.5"
            height="8.5"
            rx="2"
            ry="2"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </Svg>
        <Text
          className={`${fontSizeClasses} ml-1 font-semibold tracking-[0.2px] text-[#6B7280]`}
          style={{ includeFontPadding: false }}
        >
          Reply
        </Text>
      </Pressable>

      {/* Separator Dot */}
      <Text
        className={`${separatorSizeClasses} text-[#6B7280] ${separatorMarginClasses}`}
        style={{ includeFontPadding: false }}
      >
        ·
      </Text>

      {/* Timestamp */}
      <Text
        className={`${fontSizeClasses} font-semibold tracking-[0.2px] text-[#6B7280]`}
        style={{ includeFontPadding: false }}
      >
        {timestamp}
      </Text>
    </View>
  );
}

