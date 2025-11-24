import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

interface PublicSafetyStatsProps {
  responses?: number;
  views?: number;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export default function PublicSafetyStats({
  responses = 0,
  views = 0,
}: PublicSafetyStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      {/* Stats Text */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {responses > 0 && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: textColor,
            }}
          >
            {formatNumber(responses)} response{responses !== 1 ? 's' : ''}
          </Text>
        )}
        {views > 0 && (
          <>
            {responses > 0 && (
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: textColor,
                  opacity: 0.4,
                }}
              />
            )}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: textColor,
              }}
            >
              {formatNumber(views)} views
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

