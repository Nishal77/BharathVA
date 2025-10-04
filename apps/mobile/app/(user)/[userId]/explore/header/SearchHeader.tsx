import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Languages, Search } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTabStyles } from '../../../../../hooks/useTabStyles';

interface SearchHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onProfilePress: () => void;
  tabs: string[];
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

export default function SearchHeader({ 
  activeTab, 
  onTabPress, 
  onProfilePress, 
  tabs,
  searchValue = '',
  onSearchChange = () => {}
}: SearchHeaderProps) {
  const tabStyles = useTabStyles();

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
          paddingBottom: 8,
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
        }}
      />
      
      
      {/* Header Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Row - Profile, Search Bar, Settings */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 }}>
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

          {/* Amazing Search Bar - Center with Premium Design */}
          <View
            className="flex-1 flex-row items-center rounded-full bg-gray-100"
            style={{
              height: 44, // Increased to match home header better
              paddingHorizontal: 16,
              marginHorizontal: 12,
              marginTop: 4, // Added top margin for better spacing
            }}
          >
            {/* Search Icon */}
            <Search
              size={20} // Adjusted back to 20 for better proportion with 44px height
              color={tabStyles.text.inactive}
              style={{ marginRight: 12 }}
            />

            {/* Search Input */}
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Search..."
              placeholderTextColor={tabStyles.text.inactive}
              className="flex-1 text-base font-medium"
              style={{
                color: tabStyles.text.active,
                height: '100%',
              }}
              accessibilityLabel="Search input"
            />
          </View>

          {/* Languages Icon - Right */}
          <Pressable
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            })}
            accessibilityLabel="Change language"
            accessibilityRole="button"
          >
            <Languages 
              size={24} 
              color={tabStyles.text.active} 
            />
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
          <View style={{ flexDirection: 'row', gap: 17 }}>
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