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
          backgroundColor: tabStyles.background.primary,
          // borderBottomLeftRadius: 28,
          // borderBottomRightRadius: 28,
          borderWidth: 1,
          borderColor: tabStyles.border.color,
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
          backgroundColor: tabStyles.background.secondary,
          // borderBottomLeftRadius: 20,
          // borderBottomRightRadius: 20,
          borderWidth: 1,
          borderColor: tabStyles.border.color,
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
          backgroundColor: tabStyles.background.tertiary,
          // borderBottomLeftRadius: 12,
          // borderBottomRightRadius: 12,
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
              width: 40,
              height: 40,
              borderRadius: 20,
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
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: tabStyles.profile.backgroundColor,
                borderWidth: 2,
                borderColor: tabStyles.profile.borderColor,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
         
              
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&h=256&facepad=2' }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
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
            style={{ 
              width: 64, 
              height: 64,
              tintColor: tabStyles.text.active, // Black for light mode, White for dark mode
            }}
            contentFit="contain"
            placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            onError={() => console.log('India logo failed to load')}
            accessibilityLabel="BharathVA logo"
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
              source={require('../assets/logo/text.png')}
              style={{
                width: 20,
                height: 20,
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
                backgroundColor: '#FF6B35',
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
                shadowColor: '#FF6B35',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 6,
              }}
            >
              <Text 
                style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 12,
                }}
              >
                17
              </Text>
            </View>
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
