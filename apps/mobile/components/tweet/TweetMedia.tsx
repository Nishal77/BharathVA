import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

interface TweetMediaProps {
  type: 'grid' | 'single' | 'carousel';
  items: MediaItem[];
}

interface MediaItem {
  id: string;
  type: 'image' | 'text' | 'profile' | 'card';
  content?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  list?: string[];
}

export default function TweetMedia({ type, items }: TweetMediaProps) {
  const renderGridItem = (item: MediaItem, index: number) => {
    if (item.type === 'image') {
      return (
        <View key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
          <Image
            source={{ uri: item.image }}
            style={{ 
              width: '100%', 
              height: 140,
            }}
            contentFit="cover"
          />
          {item.title && (
            <View className="p-3">
              <Text className="text-sm font-semibold text-black mb-1">{item.title}</Text>
              {item.description && (
                <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>{item.description}</Text>
              )}
              {item.link && (
                <Text className="text-xs text-blue-600">{item.link}</Text>
              )}
            </View>
          )}
        </View>
      );
    }

    if (item.type === 'profile') {
      return (
        <View key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: item.image }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              contentFit="cover"
            />
            <View className="ml-2 flex-1">
              <Text className="text-sm font-semibold text-black">{item.title}</Text>
              <Text className="text-xs text-gray-500">{item.subtitle}</Text>
            </View>
          </View>
          <Text className="text-xs text-gray-600 leading-4 mb-2">{item.description}</Text>
          {item.link && (
            <Text className="text-xs text-blue-600">{item.link}</Text>
          )}
        </View>
      );
    }

    if (item.type === 'text') {
      return (
        <View key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
          {item.title && (
            <Text className="text-sm font-semibold text-black mb-2">{item.title}</Text>
          )}
          <Text className="text-xs text-gray-800 leading-4">{item.content}</Text>
        </View>
      );
    }

    if (item.type === 'card') {
      return (
        <View key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
          {item.title && (
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-purple-500 rounded-full mr-2" />
              <Text className="text-sm font-semibold text-black">{item.title}</Text>
            </View>
          )}
          {item.list && (
            <View>
              {item.list.map((listItem, idx) => (
                <View key={idx} className="flex-row items-center mb-1">
                  <View className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'][idx % 5] }} />
                  <Text className="text-xs text-gray-700">{listItem}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  if (type === 'single') {
    return (
      <View className="mb-4 ml-[52px] mr-4">
        {items.map((item, index) => (
          <View key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <Image
              source={{ uri: item.image }}
              style={{ 
                width: '100%', 
                height: 250,
              }}
              contentFit="cover"
            />
          </View>
        ))}
      </View>
    );
  }

  if (type === 'grid') {
    return (
      <View className="bg-gray-50 rounded-2xl p-3 mb-4">
        <View style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          {items.map((item, index) => (
            <View key={item.id} style={{ 
              width: '48%', 
              marginBottom: 8,
              aspectRatio: 1.2
            }}>
              {renderGridItem(item, index)}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return null;
}
