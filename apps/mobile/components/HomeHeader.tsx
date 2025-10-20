import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';
import { useTabStyles } from '../hooks/useTabStyles';

interface HomeHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onProfilePress: () => void;
  onMessagesPress: () => void;
  tabs: string[];
}

export default function HomeHeader({ 
  activeTab, 
  onTabPress, 
  onProfilePress, 
  onMessagesPress,
  tabs 
}: HomeHeaderProps) {
  const tabStyles = useTabStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BlurView
        intensity={50}
        tint={isDark ? "dark" : "light"}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingTop: 48,
          paddingBottom: 0,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : tabStyles.border.bottom,
          marginHorizontal: 0,
          // Shadow removed
        }}
      >
      {/* Primary Background Layer */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: tabStyles.background.primary,
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
          backgroundColor: tabStyles.background.secondary,
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
          backgroundColor: tabStyles.background.tertiary,
        }}
      />
      
      
      {/* Header Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Row - Profile, Logo, Message Icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
          {/* Profile Button - Left */}
          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => ({
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderRadius: 24,
              padding: 6,
            })}
            accessibilityLabel="Open profile menu"
            accessibilityRole="button"
          >
            <Image
              source={require('../assets/logo/Ada.png')}
              style={{ 
                width: 28, 
                height: 28,
                backgroundColor: 'transparent',
              }}
              contentFit="contain"
              accessibilityLabel="Profile button"
              onError={(error) => console.log('Main logo failed to load:', error)}
              onLoad={() => console.log('Main logo loaded successfully')}
              placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            />
          </Pressable>

          {/* India Logo - Center - Commented out but space preserved */}
          {/* <Image
            source={require('../assets/images/india.png')}
            style={{ 
              width: 64, 
              height: 64,
              tintColor: tabStyles.text.active, // Black for light mode, White for dark mode
            }}
            contentFit="contain"
            placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            onError={() => console.log('India logo failed to load')}
            accessibilityLabel="BharathVA logo"
          /> */}
          
          {/* Placeholder View to maintain layout space */}
          <View 
            style={{ 
              width: 64, 
              height: 64,
            }}
          />

          {/* Text Icon with Message Count - Right */}
          <Pressable
            onPress={onMessagesPress}
            style={({ pressed }) => ({
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              position: 'relative',
            })}
            accessibilityLabel="Open messages"
            accessibilityRole="button"
          >
            <Image
              source={require('../assets/logo/message.png')}
              style={{
                width: 28,
                height: 28,
                tintColor: isDark ? '#FFFFFF' : '#000000'
              }}
              contentFit="contain"
            />
            
            {/* Message Count Badge */}
            <View 
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 18,
                height: 18,
                backgroundColor: '#FF3B30',
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text 
                style={{
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 13,
                }}
              >
                3
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Navigation Tabs - Horizontally Scrollable - Commented out */}
        {/*
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
                    color: activeTab === tab ? tabStyles.text.active : tabStyles.text.inactive,
                  }}
                >
                  {tab}
                </Text>
                
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
        */}
      </View>
    </BlurView>
  );
}
