import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, Text, View, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { useTabStyles } from '../../../../hooks/useTabStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuggestedProfile {
  id: string;
  name: string;
  username: string;
  location: string;
  profileImage: string;
  isOnline?: boolean;
  statusColor?: string;
}

const suggestedProfiles: SuggestedProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    username: '@priyasharma',
    location: 'Mumbai, Maharashtra, IN',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=facearea&w=120&h=120&facepad=2',
  },
  {
    id: '2',
    name: 'Arjun Patel',
    username: '@arjunpatel',
    location: 'Ahmedabad, Gujarat, IN',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=120&h=120&facepad=2',
    isOnline: true,
    statusColor: '#10B981',
  },
  {
    id: '3',
    name: 'Ananya Reddy',
    username: '@ananyareddy',
    location: 'Hyderabad, Telangana, IN',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=120&h=120&facepad=2',
  },
  {
    id: '4',
    name: 'Rohan Singh',
    username: '@rohansingh',
    location: 'Delhi, Delhi, IN',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&w=120&h=120&facepad=2',
  },
  {
    id: '5',
    name: 'Kavya Nair',
    username: '@kavyanair',
    location: 'Bangalore, Karnataka, IN',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=120&h=120&facepad=2',
    isOnline: true,
    statusColor: '#FF9933',
  },
];

interface TodaysNewProps {
  onProfilePress?: (profile: SuggestedProfile) => void;
}

export default function TodaysNew({ onProfilePress }: TodaysNewProps) {
  const tabStyles = useTabStyles();
  const [followedProfiles, setFollowedProfiles] = useState<Set<string>>(new Set());

  const [fontsLoaded] = useFonts({
    'Satoshi-Medium': require('../../../../assets/fonts/Satoshi-Medium.otf'),
  });

  const handleProfilePress = (profile: SuggestedProfile) => {
    onProfilePress?.(profile);
    console.log('Profile pressed:', profile.name);
  };

  const handleFollowPress = (profileId: string, event: any) => {
    event.stopPropagation();
    setFollowedProfiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
  };

  const isFollowing = (profileId: string) => followedProfiles.has(profileId);

  const isDark = tabStyles.screen.backgroundColor === '#000000';

  return (
    <View className="px-4 py-5" style={{ backgroundColor: tabStyles.screen.backgroundColor }}>
      <View className="mb-5 ml-1">
        <Text 
          className="text-[22px] font-normal leading-7 -tracking-[0.3px] mb-1"
          style={{ color: tabStyles.text.primary, fontFamily: fontsLoaded ? 'Satoshi-Medium' : undefined }}
        >
         Suggested Connections
        </Text>
      </View>
      
      {suggestedProfiles.map((profile, index) => {
        const following = isFollowing(profile.id);
        
        return (
        <Pressable
            key={profile.id}
            onPress={() => handleProfilePress(profile)}
            className={`flex-row items-center py-4 px-1 ml-1 ${index < suggestedProfiles.length - 1 ? 'mb-2' : ''}`}
          style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
          })}
        >
            <View className="flex-row items-center flex-1">
              <View className="relative mr-3.5">
                <View 
                  className="w-14 h-14 rounded-full overflow-hidden border"
                style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  }}
                >
                    <Image
                    source={{ uri: profile.profileImage }}
                    style={{ width: 56, height: 56 }}
                      contentFit="cover"
                    placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
                    />
                  </View>
                {profile.isOnline && profile.statusColor && (
                  <View 
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px]"
                    style={{
                      backgroundColor: profile.statusColor,
                    borderColor: tabStyles.screen.backgroundColor,
                    }} 
                    />
                )}
                  </View>
                  
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Text 
                    className="text-[15px] font-bold -tracking-[0.2px] mr-1.5"
                    style={{ color: tabStyles.text.primary }}
                  >
                    {profile.name}
                  </Text>
                </View>
                <Text 
                  className="text-[13px] font-normal -tracking-[0.1px]"
                  style={{ color: tabStyles.text.secondary }}
                >
                  {profile.username}
                </Text>
              </View>
            </View>
            
            <Pressable
              onPress={(e) => handleFollowPress(profile.id, e)}
              className={`flex-row items-center justify-center flex-shrink-0 rounded-[22px] px-6 py-2.5 w-[110px] ${
                following 
                  ? (isDark ? 'bg-transparent border border-white' : 'bg-transparent border border-[#E5E5E5]')
                  : (isDark ? 'bg-white' : 'bg-black')
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                paddingHorizontal: Math.max(24, SCREEN_WIDTH * 0.045),
                paddingVertical: Math.max(11, SCREEN_WIDTH * 0.027),
                minWidth: Math.max(125, SCREEN_WIDTH * 0.29),
                backgroundColor: following 
                  ? 'transparent' 
                  : (isDark ? '#FFFFFF' : '#000000'),
                borderWidth: following ? 1.5 : 0,
                borderColor: following 
                  ? (isDark ? '#FFFFFF' : '#000000')
                  : 'transparent',
              })}
            >
              <Text 
                className={`text-sm font-semibold tracking-[0.1px] ${
                  following 
                    ? (isDark ? 'text-white' : 'text-black')
                    : (isDark ? 'text-black' : 'text-white')
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.85}
              >
                {following ? 'Connected' : 'Connect'}
              </Text>
            </Pressable>
          </Pressable>
        );
      })}
      
      <Pressable
        className="mt-5 ml-1 items-center py-2.5"
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text className="text-sm font-semibold tracking-[0.1px] text-blue-500">
          View All
                  </Text>
        </Pressable>
    </View>
  );
}
