import { useLocalSearchParams } from 'expo-router';
import { MoreVertical, Search, Send } from 'lucide-react-native';
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

export default function MessagesScreen() {
  const { userId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const messages = [
    {
      id: 1,
      name: 'Government Updates',
      lastMessage: 'New policy announcement regarding digital infrastructure',
      time: '2m ago',
      unread: 3,
      avatar: '🏛️',
    },
    {
      id: 2,
      name: 'Community Discussion',
      lastMessage: 'Education reform discussion is trending',
      time: '15m ago',
      unread: 0,
      avatar: '💬',
    },
    {
      id: 3,
      name: 'Voting Reminders',
      lastMessage: 'Don\'t forget to participate in upcoming polls',
      time: '1h ago',
      unread: 1,
      avatar: '🗳️',
    },
    {
      id: 4,
      name: 'Policy Updates',
      lastMessage: 'Healthcare initiatives announced',
      time: '2h ago',
      unread: 0,
      avatar: '📋',
    },
    {
      id: 5,
      name: 'Citizen Forum',
      lastMessage: 'Transportation improvements in your area',
      time: '3h ago',
      unread: 2,
      avatar: '🚌',
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-black">
            Messages
          </Text>
          <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
          </Pressable>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Search size={20} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-900 text-base"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Messages List */}
        <View className="px-6 py-4">
          {messages.map((message) => (
            <Pressable
              key={message.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">{message.avatar}</Text>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-black font-semibold text-base">
                      {message.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {message.time}
                    </Text>
                  </View>
                  
                  <Text className="text-gray-600 text-sm leading-relaxed">
                    {message.lastMessage}
                  </Text>
                </View>
                
                {message.unread > 0 && (
                  <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">
                      {message.unread}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable className="absolute bottom-20 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg">
        <Send size={24} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </View>
  );
}
