/**
 * UserSearchSuggestions Component
 * Displays user search suggestions similar to Instagram/Twitter
 * Located in explore folder for search tab functionality
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTabStyles } from '../../../../../hooks/useTabStyles';
import { UserSearchResult } from '../../../../../services/api/userSearchService';

interface UserSearchSuggestionsProps {
  users: UserSearchResult[];
  isLoading?: boolean;
  searchQuery?: string;
  onUserPress?: (user: UserSearchResult) => void;
}

export default function UserSearchSuggestions({
  users,
  isLoading = false,
  searchQuery = '',
  onUserPress,
}: UserSearchSuggestionsProps) {
  const router = useRouter();
  const tabStyles = useTabStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleUserPress = (user: UserSearchResult) => {
    if (onUserPress) {
      onUserPress(user);
    } else {
      router.push(`/(user)/${user.id}/(tabs)/profile`);
    }
  };

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://'));
  };

  const normalizeImageUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.length === 0) return null;
    
    if (trimmed.startsWith('http://res.cloudinary.com')) {
      return trimmed.replace('http://', 'https://');
    }
    
    if (trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return trimmed.replace('http://', 'https://');
    }
    
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    
    return null;
  };

  const renderUserItem = (user: UserSearchResult, index: number) => {
    const rawImageUrl = user.profileImageUrl;
    const profileImageUrl = normalizeImageUrl(rawImageUrl);
    const hasValidImage = isValidImageUrl(profileImageUrl);
    const isLast = index === users.length - 1;

    return (
      <View
        key={user.id}
        style={[
          styles.userItemWrapper,
          {
            marginBottom: isLast ? 0 : 12,
          },
        ]}
      >
        <Pressable
          onPress={() => handleUserPress(user)}
          style={({ pressed }) => [
            styles.userItem,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          accessibilityLabel={`View profile of ${user.fullName}`}
          accessibilityRole="button"
        >
          <View style={styles.userItemContent}>
            <View style={styles.avatarContainer}>
              {hasValidImage ? (
                <Image
                  source={{ uri: profileImageUrl! }}
                  style={styles.avatar}
                  onError={(error) => {
                    console.log('Failed to load profile image:', profileImageUrl, error);
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatar}>
                  <View style={[
                    styles.defaultAvatarContainer,
                    { backgroundColor: isDark ? '#374151' : '#D1D5DB' }
                  ]}>
                    <Svg width={48} height={48} viewBox="0 0 24 24">
                      <Circle cx="12" cy="8" r="4" fill={isDark ? '#6B7280' : '#9CA3AF'} />
                      <Path
                        d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill={isDark ? '#6B7280' : '#9CA3AF'}
                      />
                    </Svg>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text
                  style={[styles.fullName, { color: tabStyles.text.active }]}
                  numberOfLines={1}
                >
                  {user.fullName}
                </Text>
              </View>
              <Text
                style={[styles.username, { color: tabStyles.text.inactive }]}
                numberOfLines={1}
              >
                @{user.username}
              </Text>
              {user.bio && (
                <Text
                  style={[styles.bio, { color: tabStyles.text.inactive }]}
                  numberOfLines={1}
                >
                  {user.bio}
                </Text>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={tabStyles.text.active}
          />
          <Text
            style={[styles.loadingText, { color: tabStyles.text.inactive }]}
          >
            Searching...
          </Text>
        </View>
      </View>
    );
  }

  if (users.length === 0 && searchQuery.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: tabStyles.text.inactive }]}
          >
            No users found for "{searchQuery}"
          </Text>
        </View>
      </View>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#2a2a2a' : '#e5e5e5',
          marginTop: 8,
        },
      ]}
    >
      {users.map((user, index) => renderUserItem(user, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  userItemWrapper: {
    width: '100%',
  },
  userItem: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    marginLeft: 16,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e5e5',
    overflow: 'hidden',
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  username: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  bio: {
    fontSize: 13,
    fontWeight: '400',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

