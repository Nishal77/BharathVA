import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColorScheme } from 'react-native';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function ProfileUsername() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Display full name if available, otherwise fallback to username
  const displayFullName = user?.fullName || user?.username || 'User';
  const displayUsername = user?.username || 'user';

  return (
    <View style={{ 
      paddingHorizontal: 20, 
      paddingBottom: 8, 
      backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' 
    }}>
      {/* Full Name */}
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        textAlign: 'left', 
        color: isDark ? '#E5E5E5' : '#111827' 
      }}>
        {displayFullName}
      </Text>

      {/* Username + Location */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 16, 
          marginRight: 8, 
          color: isDark ? '#71767B' : '#6B7280' 
        }}>
          @{displayUsername}
        </Text>
        <Ionicons name="pin-outline" size={14} color={isDark ? '#71767B' : '#6B7280'} />
        <Text style={{ 
          fontSize: 14, 
          marginLeft: 4, 
          color: isDark ? '#71767B' : '#6B7280' 
        }}>
          India
        </Text>
      </View>
    </View>
  );
}

