import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
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
  
  const bgColor = isDark ? '#000000' : '#FFFFFF';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log('Active tab:', tab);
  };

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
      >
        <ProfileInfo />
        <ProfileUsername />
        <ProfileBio />
        <ProfileStats />
        <ProfileTabs onTabChange={handleTabChange} />
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
