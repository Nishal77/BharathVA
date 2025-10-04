import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import ForYou from '../explore/ForYou';
import SearchHeader from '../explore/header/SearchHeader';

export default function SearchScreen() {
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('For You');
  const [searchValue, setSearchValue] = useState('');
  const tabStyles = useTabStyles();

  const tabs = ['For You', 'Trending India', 'World News', 'Sports', 'Entertainment', 'Tech', 'Local Buzz', 'Voices'];

  const handleProfilePress = () => {
    console.log('Profile pressed');
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log('Tab pressed:', tab);
  };

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    console.log('Search:', text);
  };

  const handleVideoPress = () => {
    console.log('Video pressed');
  };


  return (
    <View className="flex-1" style={{ backgroundColor: tabStyles.screen.backgroundColor }}>
      {/* Search Header */}
      <SearchHeader
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onProfilePress={handleProfilePress}
        tabs={tabs}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      {/* Main Content */}
      <View style={{ flex: 1, paddingTop: 140, backgroundColor: tabStyles.screen.backgroundColor }}>
        <ForYou onVideoPress={handleVideoPress} />
      </View>
    </View>
  );
}
