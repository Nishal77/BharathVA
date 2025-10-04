import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Languages } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface SearchHeaderProps {
  onProfilePress: () => void;
  onSettingsPress: () => void;
  onTabPress: (tab: string) => void;
  activeTab: string;
}

export default function SearchHeader({ 
  onProfilePress, 
  onSettingsPress, 
  onTabPress, 
  activeTab 
}: SearchHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['For You', 'Trending India', 'News', 'Sports', 'Entertainment', 'Tech', 'Local Buzz', 'Voices'];

  return (
    <BlurView
      intensity={50}
      tint="light"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: 48,
        paddingBottom: 13,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        // Shadow removed
      }}
    >
      {/* Primary Glassmorphism Background Layer */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.35)',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderBottomWidth: 0,
        }}
      />
      
      {/* Secondary Glass Layer for Enhanced Depth */}
      <View 
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 72,
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          borderBottomWidth: 0,
        }}
      />
      
      {/* Tertiary Glass Layer for Premium Effect */}
      <View 
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      />
      
      {/* Header Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Row - Profile, Search Bar, Settings */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 4 
        }}>
          {/* Profile Button - Left with Glassmorphism */}
          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            })}
            accessibilityLabel="Open profile menu"
            accessibilityRole="button"
          >
            {/* Glassmorphism Border for Profile */}
            <View 
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&h=256&facepad=2' }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
                placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
                onError={() => console.log('Profile image failed to load')}
                accessibilityLabel="Profile picture"
              />
              {/* Notification Dot */}
              <View 
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#3B82F6',
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              />
            </View>
          </Pressable>

          {/* Search Bar - Center */}
          <View 
            style={{
              flex: 1,
              marginHorizontal: 16,
              backgroundColor: '#F3F4F6',
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjUgMTcuNUwxMy44NzUgMTMuODc1TTE1LjgzMzMgOC45MTY2N0MxNS44MzMzIDEyLjU5MzcgMTIuNTkzNyAxNS44MzMzIDguOTE2NjcgMTUuODMzM0M1LjIzOTU4IDE1LjgzMzMgMiAxMi41OTM3IDIgOC45MTY2N0MyIDUuMjM5NTggNS4yMzk1OCAyIDguOTE2NjcgMkMxMi41OTM3IDIgMTUuODMzMyA1LjIzOTU4IDE1LjgzMzMgOC45MTY2N1oiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjY2NjY3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+' }}
              style={{ width: 20, height: 20, marginRight: 8 }}
              contentFit="contain"
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="#6B7280"
              style={{
                flex: 1,
                fontSize: 16,
                color: '#1F2937',
              }}
            />
          </View>

          {/* Settings Button - Right */}
          <Pressable
            onPress={onSettingsPress}
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <Languages size={24} color="#6B7280" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Navigation Tabs - Horizontally Scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingLeft: 0,
            paddingRight: 16,
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', gap: 24 }}>
            {tabs.map((tab, index) => (
              <Pressable
                key={tab}
                onPress={() => onTabPress(tab)}
                style={({ pressed }) => ({
                  position: 'relative',
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  marginLeft: index === 0 ? 0 : 0,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: activeTab === tab ? '700' : '500',
                    color: activeTab === tab ? '#000000' : '#6B7280',
                  }}
                >
                  {tab}
                </Text>
                
                {/* Active Tab Indicator */}
                {activeTab === tab && (
                  <View 
                    style={{
                      position: 'absolute',
                      bottom: -3,
                      left: '8%',
                      right: '8%',
                      height: 3,
                      backgroundColor: '#3B82F6',
                      borderRadius: 2,
                    }}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </BlurView>
  );
}
