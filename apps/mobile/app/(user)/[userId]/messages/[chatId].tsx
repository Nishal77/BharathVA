import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Send } from 'lucide-react-native';
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

export default function ChatScreen() {
  const { userId, chatId } = useLocalSearchParams();
  const router = useRouter();
  const [messageText, setMessageText] = useState('');

  // Mock chat data
  const chatData = {
    id: chatId,
    name: 'Government Updates',
    username: '@gov_updates',
    avatar: '🏛️',
    isOnline: true,
  };

  const messages = [
    {
      id: 1,
      text: 'Welcome to the official Government Updates channel!',
      timestamp: '10:30 AM',
      isFromUser: false,
    },
    {
      id: 2,
      text: 'Thank you! Looking forward to staying updated.',
      timestamp: '10:32 AM',
      isFromUser: true,
    },
    {
      id: 3,
      text: 'We have some important policy announcements coming up this week.',
      timestamp: '10:35 AM',
      isFromUser: false,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
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
            
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3 relative">
                <Text className="text-lg">{chatData.avatar}</Text>
                {chatData.isOnline && (
                  <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className="text-black font-semibold text-base">
                  {chatData.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {chatData.isOnline ? 'Online' : 'Last seen recently'}
                </Text>
              </View>
            </View>
          </View>
          
          <Pressable 
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${message.isFromUser ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.isFromUser
                  ? 'bg-blue-500 rounded-br-md'
                  : 'bg-white rounded-bl-md shadow-sm'
              }`}
            >
              <Text
                className={`text-base leading-relaxed ${
                  message.isFromUser ? 'text-white' : 'text-gray-900'
                }`}
              >
                {message.text}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1 px-2">
              {message.timestamp}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View className="bg-white px-6 py-4 border-t border-gray-100">
        <View className="flex-row items-center">
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 text-base mr-3"
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSendMessage}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              messageText.trim() ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            disabled={!messageText.trim()}
          >
            <Send size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
