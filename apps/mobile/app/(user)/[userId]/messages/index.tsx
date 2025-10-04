import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, List, Minus, Search, Settings, SquarePen } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import StorySection from './components/StorySection';

const { width, height } = Dimensions.get('window');

export default function MessagesIndexScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample conversation data based on the image
  const conversations = [
    {
      id: '1',
      name: 'Arlene McCoy',
      lastMessage: "Yo, got any plans tonight? Let's hit that new sushi place downtown!",
      timestamp: '12 min ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '2',
      name: 'Mike Robertson',
      lastMessage: 'Omg, just found a rooftop party for Friday...',
      timestamp: '1 day ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: true,
      status: 'away', // away, online, busy
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Charlie Hawkins',
      lastMessage: "Hey bestie, there's a TikTok meetup happ...",
      timestamp: '3 day ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: true,
      status: 'online',
      unreadCount: 2,
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      lastMessage: 'Can you send me the photos from yesterday?',
      timestamp: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: true,
      status: 'online',
      unreadCount: 1,
    },
    {
      id: '5',
      name: 'David Chen',
      lastMessage: 'Thanks for the help with the project!',
      timestamp: '4 hours ago',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '6',
      name: 'Emma Wilson',
      lastMessage: 'Are we still meeting for coffee tomorrow?',
      timestamp: '6 hours ago',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: true,
      status: 'away',
      unreadCount: 0,
    },
    {
      id: '7',
      name: 'Alex Rodriguez',
      lastMessage: 'The movie was amazing! You should definitely watch it',
      timestamp: '1 day ago',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '8',
      name: 'Lisa Park',
      lastMessage: 'Happy birthday! Hope you have an amazing day 🎉',
      timestamp: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: true,
      status: 'online',
      unreadCount: 3,
    },
    {
      id: '9',
      name: 'James Miller',
      lastMessage: 'See you at the gym later!',
      timestamp: '3 days ago',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: false,
      unreadCount: 0,
    },
    {
      id: '10',
      name: 'Maria Garcia',
      lastMessage: 'The weather is perfect for a walk today',
      timestamp: '4 days ago',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&h=300&q=80',
      isOnline: true,
      status: 'away',
      unreadCount: 0,
    },
  ];

  const handleNewMessage = () => {
    router.push(`/(user)/[userId]/messages/new`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleStoryPress = (story: any) => {
    console.log('View story:', story.name);
    // Navigate to story view or handle story press
  };

  const handleAddStoryPress = () => {
    console.log('Add new story');
    // Handle add story functionality
  };

  return (
    <View className="flex-1 bg-white">
      {/* Fixed Header with Enhanced Glassmorphism */}
      <BlurView
        intensity={80}
        tint="light"
        className="absolute top-0 left-0 right-0 z-50 pt-16 pb-6 px-6"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        <View className="flex-row items-center justify-between mb-4 mt-4">
          <View className="flex-row items-center">
  
            <Text className="text-3xl font-bold text-black ml-2">
              Chats
            </Text>
          </View>
          <View className="flex-row items-center space-x-3">
          <Pressable
              onPress={handleNewMessage}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Settings size={20} color="#000" strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={handleNewMessage}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <SquarePen size={20} color="#000" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Enhanced Search Bar with Glassmorphism */}
        <View className="flex-row items-center rounded-2xl px-5 py-3 border border-black/10 shadow-lg shadow-black/10">
          <Search size={20} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-white text-base"
          />
        </View>
      </BlurView>

      {/* Scrollable Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 160 }}
      >
        {/* Stories Section with Enhanced Spacing */}
        <View className="pt-6">
          <StorySection
            onStoryPress={handleStoryPress}
            onAddStoryPress={handleAddStoryPress}
          />
        </View>

        {/* All Messages Section Header */}
        <View className="bg-white px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <List size={20} color="#374151" strokeWidth={2} />
              <Text className="text-lg font-bold text-gray-900 ml-3">
                All messages
              </Text>
            </View>
            <Pressable
              className="w-8 h-8 items-center justify-center"
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Minus size={16} color="#374151" strokeWidth={3} />
            </Pressable>
          </View>
        </View>

        {conversations.length === 0 ? (
          // Empty State
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Image
                source={{ uri: 'https://unpkg.com/@mynaui/icons/icons/folder.svg' }}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
              No Chats Yet
            </Text>
            <Text className="text-gray-500 text-center mb-6 leading-relaxed">
              Start a conversation by tapping the compose button
            </Text>
            <Pressable
              onPress={handleNewMessage}
              className="bg-blue-500 px-6 py-3 rounded-2xl"
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text className="text-white font-semibold text-base">
                Start New Chat
              </Text>
            </Pressable>
          </View>
        ) : (
          // Beautiful Conversation List - WhatsApp Style
          <View className="bg-white">
            {conversations.map((conversation, index) => (
              <Pressable
                key={conversation.id}
                className="bg-white"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
                onPress={() => router.push(`/(user)/[userId]/messages/${conversation.id}`)}
              >
                <View className="flex-row items-center px-4 py-3">
                  {/* Profile Picture with Online Status */}
                  <View className="relative mr-3">
                    <Image
                      source={{ uri: conversation.avatar }}
                      style={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: 25 
                      }}
                      contentFit="cover"
                    />
                    {/* Online Status Indicator */}
                    {conversation.isOnline && (
                      <View 
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: conversation.status === 'online' ? '#10B981' : '#F59E0B',
                          borderWidth: 2,
                          borderColor: 'white',
                        }}
                      />
                    )}
                  </View>
                  
                  {/* Conversation Details */}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text 
                        className="font-semibold text-base flex-1"
                        style={{ color: '#1F2937' }}
                        numberOfLines={1}
                      >
                        {conversation.name}
                      </Text>
                      <Text 
                        className="text-sm"
                        style={{ 
                          color: conversation.timestamp === '12 min ago' ? '#3B82F6' : '#6B7280' 
                        }}
                      >
                        {conversation.timestamp}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center justify-between">
                      <Text 
                        className="text-sm flex-1"
                        style={{ color: '#6B7280' }}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                      {/* Unread Count - Same line as message */}
                      {conversation.unreadCount > 0 && (
                        <View 
                          className="rounded-full items-center justify-center ml-2"
                          style={{
                            backgroundColor: '#3B82F6',
                            minWidth: 20,
                            height: 20,
                            paddingHorizontal: 6,
                          }}
                        >
                          <Text className="text-white text-xs font-bold">
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                
                {/* Separator Line */}
                {index < conversations.length - 1 && (
                  <View 
                    className="h-px ml-20"
                    style={{ backgroundColor: '#F3F4F6' }}
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
