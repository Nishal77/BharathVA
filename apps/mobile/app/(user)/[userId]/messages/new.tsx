import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function NewMessageScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock contacts for new message
  const contacts = [
    {
      id: 1,
      name: 'Government Updates',
      username: '@gov_updates',
      avatar: '🏛️',
      isOnline: true,
    },
    {
      id: 2,
      name: 'Community Discussion',
      username: '@community_disc',
      avatar: '💬',
      isOnline: false,
    },
    {
      id: 3,
      name: 'Policy Updates',
      username: '@policy_updates',
      avatar: '📋',
      isOnline: true,
    },
    {
      id: 4,
      name: 'Citizen Forum',
      username: '@citizen_forum',
      avatar: '🚌',
      isOnline: false,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContactPress = (contactId: number) => {
    router.push(`/(user)/[userId]/messages/${contactId}`);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Pressable 
              onPress={handleBack}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <ArrowLeft size={20} color="#6B7280" strokeWidth={2} />
            </Pressable>
            <Text className="text-2xl font-bold text-black">
              New Message
            </Text>
          </View>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Search size={20} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-900 text-base"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contacts List */}
        <View className="px-6 py-4">
          {filteredContacts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <User size={24} color="#9CA3AF" strokeWidth={2} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
                No Contacts Found
              </Text>
              <Text className="text-gray-500 text-center leading-relaxed">
                Try searching with a different term
              </Text>
            </View>
          ) : (
            filteredContacts.map((contact) => (
              <Pressable
                key={contact.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
                onPress={() => handleContactPress(contact.id)}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4 relative">
                    <Text className="text-2xl">{contact.avatar}</Text>
                    {contact.isOnline && (
                      <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-black font-semibold text-base">
                      {contact.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {contact.username}
                    </Text>
                  </View>
                  
                  <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-sm font-bold">
                      +
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
