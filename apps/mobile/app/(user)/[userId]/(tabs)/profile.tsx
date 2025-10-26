import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { ScrollView, Text, View, useColorScheme, RefreshControl, Animated } from 'react-native';
import { Svg, Line } from 'react-native-svg';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileBio from '../profile/components/ProfileBio';
import ProfileInfo from '../profile/components/ProfileInfo';
import ProfileStats from '../profile/components/ProfileStats';
import ProfileTabs from '../profile/components/ProfileTabs';
import ProfileUsername from '../profile/components/ProfileUsername';
import Feed from '../profile/tabs/Feed';

export default function ProfileTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('Feed');
  const [refreshing, setRefreshing] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log('Active tab:', tab);
  };

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

    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }, 2000);
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

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <ProfileHeader 
        onBackPress={() => router.back()}
        onMenuPress={() => console.log('Menu pressed')}
      />
      <ScrollView 
        className="flex-1" 
        style={{ backgroundColor: bgColor }}
        showsVerticalScrollIndicator={false}
        refreshControl={<CustomRefreshControl />}
      >
        <ProfileInfo />
        <ProfileUsername />
        <ProfileBio />
        <ProfileStats />
        <ProfileTabs onTabChange={handleTabChange} />
        {refreshing && <CustomLoader />}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
