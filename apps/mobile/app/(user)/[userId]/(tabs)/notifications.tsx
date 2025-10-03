import { useLocalSearchParams } from 'expo-router';
import { Check, MoreVertical, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function NotificationsScreen() {
  const { userId } = useLocalSearchParams();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Policy Announcement',
      message: 'Government announces new digital infrastructure initiatives',
      time: '2 minutes ago',
      type: 'policy',
      read: false,
      icon: '🏛️',
    },
    {
      id: 2,
      title: 'Voting Reminder',
      message: 'Don\'t forget to participate in upcoming local elections',
      time: '1 hour ago',
      type: 'voting',
      read: false,
      icon: '🗳️',
    },
    {
      id: 3,
      title: 'Community Update',
      message: 'New discussion thread about education reforms is trending',
      time: '3 hours ago',
      type: 'community',
      read: true,
      icon: '💬',
    },
    {
      id: 4,
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM',
      time: '5 hours ago',
      type: 'system',
      read: true,
      icon: '⚙️',
    },
    {
      id: 5,
      title: 'Healthcare Initiative',
      message: 'New healthcare policies for rural areas announced',
      time: '1 day ago',
      type: 'healthcare',
      read: true,
      icon: '🏥',
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-black">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center ml-3">
                <Text className="text-white text-xs font-bold">
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Notifications List */}
        <View className="px-6 py-4">
          {notifications.map((notification) => (
            <View
              key={notification.id}
              className={`bg-white rounded-2xl p-4 mb-3 shadow-sm ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">{notification.icon}</Text>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className={`font-semibold text-base mb-1 ${
                        !notification.read ? 'text-black' : 'text-gray-600'
                      }`}>
                        {notification.title}
                      </Text>
                      <Text className="text-gray-600 text-sm leading-relaxed mb-2">
                        {notification.message}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {notification.time}
                      </Text>
                    </View>
                    
                    {!notification.read && (
                      <View className="w-3 h-3 bg-blue-500 rounded-full ml-2 mt-1" />
                    )}
                  </View>
                  
                  {!notification.read && (
                    <View className="flex-row items-center mt-3">
                      <Pressable
                        onPress={() => markAsRead(notification.id)}
                        className="bg-blue-100 rounded-full px-4 py-2 mr-3"
                      >
                        <View className="flex-row items-center">
                          <Check size={16} color="#3B82F6" strokeWidth={2} />
                          <Text className="text-blue-600 text-sm font-semibold ml-1">
                            Mark as Read
                          </Text>
                        </View>
                      </Pressable>
                      
                      <Pressable
                        onPress={() => deleteNotification(notification.id)}
                        className="bg-gray-100 rounded-full px-4 py-2"
                      >
                        <X size={16} color="#6B7280" strokeWidth={2} />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
