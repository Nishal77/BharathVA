import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileInfo from '../profile/components/ProfileInfo';
import ProfileUsername from '../profile/components/ProfileUsername';

export default function ProfileTab() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <ProfileHeader 
        username="@sarah.johnson"
        onBackPress={() => router.back()}
        onMenuPress={() => console.log('Menu pressed')}
      />
      <ScrollView className="flex-1">
        <ProfileInfo />
        <ProfileUsername />
        {/* Content area for future tabs */}
      </ScrollView>
    </View>
  );
}
