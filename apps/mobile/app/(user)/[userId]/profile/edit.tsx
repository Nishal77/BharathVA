import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EditProfile from './components/EditProfile';

export default function EditProfilePage() {
  const navigation = useNavigation();
  
  // Only render when navigation context is available
  if (!navigation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }
  
  return <EditProfile />;
}
