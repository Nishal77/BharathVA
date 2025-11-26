import React from 'react';
import { Text, View, useColorScheme, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

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
  const [fontsLoaded] = useFonts({
    'Chirp-Regular': require('../../../../../../assets/fonts/Chirp-Regular.ttf'),
    'Chirp-Medium': require('../../../../../../assets/fonts/Chirp-Medium.ttf'),
    'Chirp-Bold': require('../../../../../../assets/fonts/Chirp-Bold.ttf'),
  });

  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  if (!fontsLoaded) {
    return (
      <View style={{ paddingTop: 8, paddingBottom: 12, alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

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
              fontFamily: 'Chirp-Medium',
              fontSize: 12,
              color: textColor,
              letterSpacing: 0.05,
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
                fontFamily: 'Chirp-Medium',
                fontSize: 12,
                color: textColor,
                letterSpacing: 0.05,
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

