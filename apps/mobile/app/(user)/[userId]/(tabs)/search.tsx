import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import ForYou from '../explore/ForYou';
import SearchHeader from '../explore/header/SearchHeader';

export default function SearchScreen() {
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('For You');

  const handleProfilePress = () => {
    console.log('Profile pressed');
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log('Tab pressed:', tab);
  };

  const handleVideoPress = () => {
    console.log('Video pressed');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'For You':
        return <ForYou onVideoPress={handleVideoPress} />;
      default:
        return (
          <View className="px-5 pt-5">
            <View className="bg-white p-5 mb-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-800">
                {activeTab} Content
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Content for {activeTab} tab will be displayed here.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* New Search Header */}
      <SearchHeader
        onProfilePress={handleProfilePress}
        onSettingsPress={handleSettingsPress}
        onTabPress={handleTabPress}
        activeTab={activeTab}
      />

      {/* Main Content */}
      <View style={{ flex: 1, paddingTop: 130 }}>
        {renderContent()}
      </View>
    </View>
  );
}
