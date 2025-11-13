import { useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import ForYou from '../explore/ForYou';
import SearchHeader from '../explore/header/SearchHeader';
import UserSearchSuggestions from '../explore/components/UserSearchSuggestions';
import { searchUsersDebounced, cancelSearch, UserSearchResult } from '../../../../services/api/userSearchService';

export default function SearchScreen() {
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('For You');
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const tabStyles = useTabStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabs = ['For You', 'Trending India', 'World News', 'Sports', 'Entertainment', 'Tech', 'Local Buzz', 'Voices'];

  const handleProfilePress = () => {
    console.log('Profile pressed');
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log('Tab pressed:', tab);
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchValue(text);

    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      cancelSearch();
      return;
    }

    setIsSearching(true);
    searchUsersDebounced(text, (response) => {
      setIsSearching(false);
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    });
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleUserPress = useCallback((user: UserSearchResult) => {
    console.log('User pressed:', user.username);
  }, []);

  useEffect(() => {
    return () => {
      cancelSearch();
    };
  }, []);

  const isSearchActive = useMemo(() => searchValue.length > 0, [searchValue]);

  const handleVideoPress = () => {
    console.log('Video pressed');
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    iconColor: isDark ? '#FFFFFF' : '#1c1f21',
  };

  return (
    <View className="flex-1" style={{ backgroundColor: tabStyles.screen.backgroundColor }}>
      {/* Discover Heading - Fixed */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          {/* Settings Icon - Left */}
          <Pressable
            onPress={handleSettingsPress}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Svg width={24} height={24} viewBox="0 0 18 18">
              <Path
                d="M14.5,8.25h-5.067L6.899,3.862c-.207-.359-.667-.481-1.024-.274-.359,.207-.481,.666-.274,1.024l2.534,4.388-2.534,4.389c-.207,.359-.084,.817,.274,1.024,.118,.068,.247,.101,.375,.101,.259,0,.511-.134,.65-.375l2.534-4.389h5.067c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z"
                fill={colors.iconColor}
              />
              <Path
                d="M16.25,8.25h-1.049c-.072-.597-.225-1.169-.453-1.702l.906-.523c.359-.207,.481-.666,.274-1.024-.207-.359-.666-.481-1.024-.274l-.913,.527c-.354-.471-.773-.889-1.243-1.243l.527-.914c.207-.359,.084-.817-.274-1.024-.358-.208-.817-.085-1.024,.274l-.523,.906c-.533-.229-1.105-.381-1.702-.453V1.75c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.049c-.597,.072-1.169,.225-1.702,.453l-.523-.906c-.208-.359-.667-.482-1.024-.274-.359,.207-.481,.666-.274,1.024l.527,.914c-.471,.354-.889,.772-1.243,1.243l-.913-.527c-.357-.207-.817-.085-1.024,.274-.207,.359-.084,.817,.274,1.024l.906,.523c-.228,.533-.381,1.105-.453,1.702H1.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.049c.072,.597,.225,1.169,.453,1.702l-.906,.523c-.359,.207-.481,.666-.274,1.024,.139,.241,.391,.375,.65,.375,.127,0,.256-.032,.375-.101l.913-.527c.354,.471,.773,.889,1.243,1.243l-.527,.914c-.207,.359-.084,.817,.274,1.024,.118,.068,.247,.101,.375,.101,.259,0,.511-.134,.65-.375l.523-.906c.533,.229,1.105,.381,1.702,.453v1.049c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.049c.597-.072,1.169-.225,1.702-.453l.523,.906c.139,.241,.391,.375,.65,.375,.127,0,.256-.032,.375-.101,.359-.207,.481-.666,.274-1.024l-.527-.914c.471-.354,.889-.772,1.243-1.243l.913,.527c.118,.068,.247,.101,.375,.101,.259,0,.511-.134,.65-.375,.207-.359,.084-.817-.274-1.024l-.906-.523c.228-.533,.381-1.105,.453-1.702h1.049c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Zm-7.25,5.5c-2.619,0-4.75-2.131-4.75-4.75s2.131-4.75,4.75-4.75,4.75,2.131,4.75,4.75-2.131,4.75-4.75,4.75Z"
                fill={colors.iconColor}
              />
            </Svg>
          </Pressable>

          {/* Discover Title - Center */}
          <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Discover</Text>

          {/* Filter Icon - Right */}
          <Pressable
            onPress={handleFilterPress}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityLabel="Filter"
            accessibilityRole="button"
          >
            <Svg width={24} height={24} viewBox="0 0 18 18">
              <Path
                d="M16.452 15.487L13.452 7.487C13.342 7.194 13.062 7 12.75 7H12.25C11.938 7 11.658 7.194 11.548 7.487L8.54801 15.487C8.40201 15.875 8.59901 16.307 8.98701 16.452C9.37301 16.597 9.80701 16.401 9.95201 16.013L10.707 14H14.293L15.048 16.013C15.161 16.314 15.446 16.5 15.75 16.5C15.837 16.5 15.927 16.485 16.013 16.452C16.401 16.306 16.597 15.874 16.452 15.487ZM11.269 12.5L12.5 9.219L13.73 12.5H11.269Z"
                fill={colors.iconColor}
              />
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 2.25C7 1.83579 6.66421 1.5 6.25 1.5C5.83579 1.5 5.5 1.83579 5.5 2.25V3.5H2.25C1.83579 3.5 1.5 3.83579 1.5 4.25C1.5 4.66421 1.83579 5 2.25 5H3.56347C3.74676 6.30331 4.29818 7.5017 5.1212 8.47336C4.99411 8.55599 4.86626 8.63202 4.73881 8.70206C4.08978 9.05875 3.44619 9.26069 2.96205 9.37283C2.72124 9.4286 2.52342 9.46135 2.3889 9.47991C2.32574 9.48863 2.26238 9.49654 2.19882 9.50172C1.78615 9.53003 1.47406 9.88721 1.5017 10.3001C1.52938 10.7134 1.88685 11.026 2.30014 10.9983C2.37934 10.9929 2.45639 10.9848 2.59397 10.9658C2.76726 10.9419 3.01006 10.9014 3.30051 10.8341C3.87886 10.7002 4.66028 10.4568 5.46125 10.0166C5.72031 9.87426 5.98087 9.71137 6.23679 9.52556C6.77217 9.92763 7.37103 10.2546 8.01963 10.489C8.40917 10.6299 8.83912 10.4282 8.97994 10.0387C9.12076 9.64915 8.91913 9.21921 8.52959 9.07839C8.1144 8.9283 7.7253 8.72967 7.3682 8.48996C8.10599 7.63626 8.69415 6.5006 8.92126 5H10.25C10.6642 5 11 4.66421 11 4.25C11 3.83579 10.6642 3.5 10.25 3.5C9.16666 3.5 8.08333 3.5 7 3.5V2.25ZM7.40008 5H5.08254C5.25119 5.9298 5.66095 6.78417 6.25228 7.48788C6.77675 6.8725 7.20118 6.06529 7.40008 5Z"
                fill={colors.iconColor}
              />
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* Search Header - Fixed */}
      <SearchHeader
        activeTab={activeTab}
        onTabPress={handleTabPress}
        tabs={tabs}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        topOffset={88}
      />

      {/* Scrollable Content - Hidden when search is active */}
      {!isSearchActive && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingTop: 176, 
            paddingBottom: 100,
            backgroundColor: tabStyles.screen.backgroundColor 
          }}
          showsVerticalScrollIndicator={false}
        >
          <ForYou onVideoPress={handleVideoPress} />
        </ScrollView>
      )}

      {/* Search Results - Show when search is active */}
      {isSearchActive && (
        <View style={{ flex: 1, paddingTop: 176 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <UserSearchSuggestions
              users={searchResults}
              isLoading={isSearching}
              searchQuery={searchValue}
              onUserPress={handleUserPress}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
