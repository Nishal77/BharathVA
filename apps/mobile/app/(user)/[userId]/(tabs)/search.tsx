import { useLocalSearchParams } from 'expo-router';
import { Clock, Filter, Search, Star, TrendingUp } from 'lucide-react-native';
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

export default function SearchScreen() {
  const { userId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const trendingTopics = [
    { id: 1, title: 'Digital India Initiative', category: 'Technology', trending: true },
    { id: 2, title: 'Education Reforms', category: 'Education', trending: true },
    { id: 3, title: 'Healthcare Policies', category: 'Health', trending: false },
    { id: 4, title: 'Climate Change Action', category: 'Environment', trending: true },
    { id: 5, title: 'Rural Development', category: 'Development', trending: false },
  ];

  const recentSearches = [
    { id: 1, query: 'Government schemes 2024', time: '2 hours ago' },
    { id: 2, query: 'Voting registration process', time: '1 day ago' },
    { id: 3, query: 'Digital payment methods', time: '2 days ago' },
    { id: 4, query: 'Healthcare benefits', time: '3 days ago' },
  ];

  const searchResults = [
    {
      id: 1,
      title: 'New Digital Infrastructure Policy',
      description: 'Government announces comprehensive digital infrastructure development plan',
      category: 'Policy',
      date: '2 days ago',
      relevance: 95,
    },
    {
      id: 2,
      title: 'Citizen Services Portal',
      description: 'Access government services online with improved user experience',
      category: 'Services',
      date: '1 week ago',
      relevance: 88,
    },
    {
      id: 3,
      title: 'Voting System Updates',
      description: 'Enhanced security measures for upcoming elections',
      category: 'Elections',
      date: '3 days ago',
      relevance: 92,
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'policy', label: 'Policy', count: 12 },
    { id: 'services', label: 'Services', count: 8 },
    { id: 'news', label: 'News', count: 15 },
    { id: 'discussions', label: 'Discussions', count: 23 },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-black">
            Search
          </Text>
          <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Filter size={20} color="#6B7280" strokeWidth={2} />
          </Pressable>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Search size={20} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search policies, services, discussions..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-900 text-base"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {searchQuery ? (
          /* Search Results */
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-black mb-4">
              Search Results ({searchResults.length})
            </Text>
            
            {searchResults.map((result) => (
              <Pressable
                key={result.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-black font-semibold text-base flex-1">
                    {result.title}
                  </Text>
                  <View className="flex-row items-center ml-2">
                    <Star size={16} color="#F59E0B" strokeWidth={2} />
                    <Text className="text-gray-600 text-sm ml-1">
                      {result.relevance}%
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-600 text-sm leading-relaxed mb-3">
                  {result.description}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 rounded-full px-3 py-1 mr-2">
                      <Text className="text-blue-600 text-xs font-semibold">
                        {result.category}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs">
                      {result.date}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          /* Default Search View */
          <View className="px-6 py-4">
            {/* Trending Topics */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <TrendingUp size={20} color="#3B82F6" strokeWidth={2} />
                <Text className="text-lg font-semibold text-black ml-2">
                  Trending Topics
                </Text>
              </View>
              
              {trendingTopics.map((topic) => (
                <Pressable
                  key={topic.id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-black font-semibold text-base mb-1">
                        {topic.title}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {topic.category}
                      </Text>
                    </View>
                    {topic.trending && (
                      <View className="bg-red-100 rounded-full px-3 py-1">
                        <Text className="text-red-600 text-xs font-semibold">
                          Trending
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Recent Searches */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Clock size={20} color="#6B7280" strokeWidth={2} />
                <Text className="text-lg font-semibold text-black ml-2">
                  Recent Searches
                </Text>
              </View>
              
              {recentSearches.map((search) => (
                <Pressable
                  key={search.id}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                  onPress={() => setSearchQuery(search.query)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-black font-medium text-base flex-1">
                      {search.query}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {search.time}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Filter Categories */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-black mb-4">
                Browse by Category
              </Text>
              
              <View className="flex-row flex-wrap">
                {filters.map((filter) => (
                  <Pressable
                    key={filter.id}
                    onPress={() => setActiveFilter(filter.id)}
                    className={`rounded-2xl px-4 py-3 mr-3 mb-3 ${
                      activeFilter === filter.id
                        ? 'bg-blue-500'
                        : 'bg-white'
                    }`}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        activeFilter === filter.id
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {filter.label}
                      {filter.count > 0 && (
                        <Text className="text-xs opacity-70">
                          {' '}({filter.count})
                        </Text>
                      )}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
