import React, { useEffect, useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { useAuth } from '../../../../../contexts/AuthContext';
import { profileService } from '../../../../../services/api/profileService';

export default function ProfileBio() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [bio, setBio] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!user) return;
        const me = await profileService.getCurrentUserProfile();
        if (!cancelled) setBio((me as any)?.bio || null);
      } catch {
        if (!cancelled) setBio(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  // Hide section when no bio is set
  if (!bio || bio.trim().length === 0) {
    return null;
  }

  return (
    <View className="px-5 pt-1 pb-4 dark:bg-[#000000] bg-white">
      <Text className="leading-5 text-left text-black dark:text-[#E7E9EA]">
        {bio}
      </Text>
    </View>
  );
}
