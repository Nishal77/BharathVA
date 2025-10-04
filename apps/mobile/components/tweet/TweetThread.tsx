import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface TweetThreadProps {
  tweets: Tweet[];
  onTweetPress?: (tweetId: string) => void;
}

interface Tweet {
  id: string;
  name: string;
  handle: string;
  time: string;
  avatar: string;
  content: string;
  replies: number;
  retweets: number;
  likes: number;
}

export default function TweetThread({ tweets, onTweetPress }: TweetThreadProps) {
  return (
    <View className="border-l-2 border-gray-200 ml-5">
      {tweets.map((tweet, index) => (
        <Pressable
          key={tweet.id}
          onPress={() => onTweetPress?.(tweet.id)}
          className="pb-4"
          style={({ pressed }) => ({
            opacity: pressed ? 0.95 : 1,
          })}
        >
          <View className="ml-4">
            {/* Thread connector line */}
            {index < tweets.length - 1 && (
              <View className="absolute left-[-17px] top-8 w-2 h-full bg-gray-200" />
            )}
            
            {/* Tweet content */}
            <View className="flex-row mb-2">
              <View className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-sm font-semibold text-black mr-1">
                    {tweet.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    @{tweet.handle} · {tweet.time}
                  </Text>
                </View>
                <Text className="text-sm text-black leading-5 mb-2">
                  {tweet.content}
                </Text>
                
                {/* Tweet stats */}
                <View className="flex-row items-center space-x-4">
                  <Text className="text-xs text-gray-500">{tweet.replies} replies</Text>
                  <Text className="text-xs text-gray-500">{tweet.retweets} retweets</Text>
                  <Text className="text-xs text-gray-500">{tweet.likes} likes</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
