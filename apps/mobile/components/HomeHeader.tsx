import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useTabStyles } from '../hooks/useTabStyles';

interface HomeHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onProfilePress: () => void;
  tabs: string[];
}

export default function HomeHeader({ 
  activeTab, 
  onTabPress, 
  onProfilePress, 
  tabs 
}: HomeHeaderProps) {
  const tabStyles = useTabStyles();

  return (
    <>
      {/* Status Bar Configuration */}
      <StatusBar 
        barStyle={tabStyles.container.backgroundColor === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      
      <BlurView
        intensity={50}
        tint={tabStyles.container.backgroundColor === '#000000' ? 'dark' : 'light'}
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
          borderBottomColor: tabStyles.border.bottom,
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
        {/* Top Row - Profile, Logo, Empty Space */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
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
            </View>
          </Pressable>

          {/* India Logo - Center with Premium Glassmorphism */}
          <Image
            source={require('../assets/images/india.png')}
            style={{ width: 64, height: 64 }}
            contentFit="contain"
            placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            onError={() => console.log('India logo failed to load')}
            accessibilityLabel="BharathVA logo"
          />

          {/* Empty space for balance - Right */}
          <View style={{ width: 48, height: 48 }} />
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
                  paddingHorizontal: 16,
                  marginLeft: index === 0 ? 0 : 0,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: activeTab === tab ? '#000000' : '#4B5563',
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
