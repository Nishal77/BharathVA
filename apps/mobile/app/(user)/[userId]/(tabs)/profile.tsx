import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, useColorScheme, RefreshControl, Animated } from 'react-native';
import { Svg, Line } from 'react-native-svg';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileBio from '../profile/components/ProfileBio';
import ProfileInfo from '../profile/components/ProfileInfo';
import ProfileStats, { ProfileStatsRef } from '../profile/components/ProfileStats';
import ProfileTabs from '../profile/components/ProfileTabs';
import ProfileUsername from '../profile/components/ProfileUsername';
import PrivacySecurity from '../profile/components/settings/PrivacySecurity';
import Feed from '../profile/tabs/Feed';

export default function ProfileTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('Feed');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const profileStatsRef = useRef<ProfileStatsRef>(null);
  const autoRefreshCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log('Active tab:', tab);
  };

  const handleBackPress = () => {
    if (showPrivacySettings) {
      setShowPrivacySettings(false);
    } else {
      router.back();
    }
  };

  const handlePrivacyPress = () => {
    setShowPrivacySettings(true);
  };

  const handleMenuPress = () => {
    handlePrivacyPress();
  };

  // Monitor auto-refresh state from ProfileStats
  useEffect(() => {
    autoRefreshCheckInterval.current = setInterval(() => {
      if (profileStatsRef.current) {
        const isAutoRefreshing = profileStatsRef.current.isAutoRefreshing();
        setAutoRefreshing(isAutoRefreshing);
      }
    }, 100);

    return () => {
      if (autoRefreshCheckInterval.current) {
        clearInterval(autoRefreshCheckInterval.current);
      }
    };
  }, []);

  // Silent background refresh when profile tab is focused
  useFocusEffect(
    useCallback(() => {
      // Refresh stats silently in the background when tab is focused
      // User won't feel it - happens seamlessly without any loading indicators
      if (profileStatsRef.current) {
        // Small delay to ensure component is ready
        const timeoutId = setTimeout(() => {
          profileStatsRef.current?.silentRefresh().catch((error) => {
            console.warn('Background refresh failed:', error);
          });
        }, 200);
        
        return () => clearTimeout(timeoutId);
      }
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      // Refresh ProfileStats
      if (profileStatsRef.current) {
        await profileStatsRef.current.refresh();
      }
      
      // Add a small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const CustomRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="transparent"
      colors={[]}
      progressBackgroundColor="transparent"
      style={{ backgroundColor: 'transparent' }}
    />
  );

  const CustomLoader = () => (
    <View className="items-center py-4">
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={24} height={24} viewBox="0 0 18 18">
          <Line
            x1="9"
            y1="1.75"
            x2="9"
            y2="4.25"
            fill="none"
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="14.127"
            y1="3.873"
            x2="12.359"
            y2="5.641"
            fill="none"
            opacity={0.88}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="16.25"
            y1="9"
            x2="13.75"
            y2="9"
            fill="none"
            opacity={0.75}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="14.127"
            y1="14.127"
            x2="12.359"
            y2="12.359"
            fill="none"
            opacity={0.63}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="9"
            y1="16.25"
            x2="9"
            y2="13.75"
            fill="none"
            opacity={0.5}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="3.873"
            y1="14.127"
            x2="5.641"
            y2="12.359"
            fill="none"
            opacity={0.38}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="1.75"
            y1="9"
            x2="4.25"
            y2="9"
            fill="none"
            opacity={0.25}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
          <Line
            x1="3.873"
            y1="3.873"
            x2="5.641"
            y2="5.641"
            fill="none"
            opacity={0.13}
            stroke={isDark ? '#F9FAFB' : '#111827'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Feed':
        return <Feed />;
      case 'Media':
        return (
          <View 
            className="px-5 py-8 items-center" 
            style={{ 
              paddingBottom: 100,
              backgroundColor: bgColor
            }}
          >
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Media content will appear here
            </Text>
          </View>
        );
      case 'Video':
        return (
          <View 
            className="px-5 py-8 items-center" 
            style={{ 
              paddingBottom: 100,
              backgroundColor: bgColor
            }}
          >
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Video content will appear here
            </Text>
          </View>
        );
      case 'Replies':
        return (
          <View 
            className="px-5 py-8 items-center" 
            style={{ 
              paddingBottom: 100,
              backgroundColor: bgColor
            }}
          >
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Replies content will appear here
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Show privacy settings if enabled
  if (showPrivacySettings) {
    return (
      <PrivacySecurity onBackPress={handleBackPress} />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <ProfileHeader 
        onBackPress={handleBackPress}
        onMenuPress={handleMenuPress}
        onPrivacyPress={handlePrivacyPress}
      />
      {/* Auto-refresh loading indicator below header (only for auto-refresh, not manual pull) */}
      {autoRefreshing && !refreshing && (
        <View 
          style={{ 
            height: 2, 
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.8)',
            width: '100%'
          }}
        />
      )}
      <ScrollView 
        className="flex-1" 
        style={{ backgroundColor: bgColor }}
        showsVerticalScrollIndicator={false}
        refreshControl={<CustomRefreshControl />}
      >
        <ProfileInfo />
        <ProfileUsername />
        <ProfileBio />
        <ProfileStats ref={profileStatsRef} />
        <ProfileTabs onTabChange={handleTabChange} />
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
