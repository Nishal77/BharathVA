import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';

interface BreakingNewsProps {
  title: string;
  category: string;
  author: string;
  readTime: string;
  imageUrl?: string;
  isBookmarked?: boolean;
  onPress?: () => void;
  onBookmarkPress?: () => void;
}

export default function BreakingNews({
  title,
  category,
  author,
  readTime,
  imageUrl,
  isBookmarked = false,
  onPress,
  onBookmarkPress,
}: BreakingNewsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBgColor = isDark ? '#151515' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB';

  return (
    <View style={{ padding: 16, paddingBottom: 8, marginTop: 22 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: cardBgColor,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: borderColor,
          opacity: pressed ? 0.95 : 1,
          width: '100%',
        })}
      >
        <View
          style={{
            height: 320,
            justifyContent: 'flex-end',
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            borderRadius: 16,
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: undefined,
                height: undefined,
                borderRadius: 16,
              }}
              contentFit="cover"
              transition={200}
              onError={(error) => {
                console.log('Image load error:', error);
              }}
              onLoad={() => {
                console.log('Image loaded successfully');
              }}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              }}
            />
          )}
          
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
            }}
          />
          
          <View style={{ position: 'relative', zIndex: 10 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '700',
                color: '#FFFFFF',
                marginBottom: 16,
                lineHeight: 34,
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
              numberOfLines={3}
            >
              {title}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
              <Text 
                style={{ 
                  fontSize: 14, 
                  color: '#FFFFFF', 
                  marginRight: 10,
                  fontWeight: '500',
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {author}
              </Text>
              <Text 
                style={{ 
                  fontSize: 13, 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  marginRight: 10,
                  fontWeight: '400',
                }}
              >
                {readTime}
              </Text>
            </View>

          </View>
        </View>
      </Pressable>
    </View>
  );
}

