import React from 'react';
import { Image, View, useColorScheme } from 'react-native';

interface FeedMediaSectionProps {
  media?: {
    type: 'grid' | 'single' | 'carousel';
    items: Array<{
      id: string;
      type: string;
      image?: string;
      url?: string;
    }>;
  };
}

export default function FeedMediaSection({ media }: FeedMediaSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Only show media if there are actual images from MongoDB
  if (!media || !media.items || media.items.length === 0) {
    return null; // Don't render anything if no images
  }

  // Get image URL from media items - check for both 'image' and 'url' properties
  const getImageUrl = (): string | null => {
    if (media && media.items && media.items.length > 0) {
      const firstItem = media.items[0];
      // Check for 'image' property first (from sample data), then 'url' property
      if (typeof firstItem.image === 'string') return firstItem.image;
      if (typeof firstItem.url === 'string') return firstItem.url;
      if (typeof firstItem === 'string') return firstItem;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  
  // If no valid image URL, don't render
  if (!imageUrl) {
    return null;
  }

  return (
    <View 
      className="pr-0"
      style={{
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 6,
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
        onError={(error) => {
          console.log('Media image failed to load:', imageUrl, error);
        }}
      />
    </View>
  );
}
