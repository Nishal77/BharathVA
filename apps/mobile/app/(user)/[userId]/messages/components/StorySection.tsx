import { Image } from 'expo-image';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTabStyles } from '../../../../../hooks/useTabStyles';

interface Story {
  id: string | number;
  type: 'add' | 'story';
  name: string;
  image?: string;
}

interface StorySectionProps {
  onStoryPress?: (story: Story) => void;
  onAddStoryPress?: () => void;
  userProfileImage?: string;
}

export default function StorySection({ 
  onStoryPress, 
  onAddStoryPress,
  userProfileImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80'
}: StorySectionProps) {
  const tabStyles = useTabStyles();
  // Mock story data with Indian names and live Unsplash images
  const stories: Story[] = [
    {
      id: 'add',
      type: 'add',
      name: 'Add story',
    },
    {
      id: 1,
      type: 'story',
      name: 'Arjun',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 2,
      type: 'story',
      name: 'Priya',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 3,
      type: 'story',
      name: 'Rajesh',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 4,
      type: 'story',
      name: 'Kavya',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 5,
      type: 'story',
      name: 'Vikram',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 6,
      type: 'story',
      name: 'Ananya',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 7,
      type: 'story',
      name: 'Suresh',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 8,
      type: 'story',
      name: 'Meera',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 9,
      type: 'story',
      name: 'Rahul',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      id: 10,
      type: 'story',
      name: 'Deepika',
      image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&h=300&q=80',
    },
  ];

  const openGallery = async () => {
    try {
      // Request permission
      const permissionResult = await requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // Handle the selected image
        console.log('Selected image:', result.assets[0].uri);
        onAddStoryPress?.();
        // You can add logic here to upload the image or save it locally
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleStoryPress = (story: Story) => {
    if (story.type === 'add') {
      openGallery();
    } else {
      onStoryPress?.(story);
    }
  };

  const getStoryGradient = (index: number): [string, string, string, string, string, string, string] => {
    // Beautiful 7-color gradient for all stories
    return ['#FF6F00', '#FF9933', '#FFD700', '#138808', '#006400', '#000080', '#800080'];
  };

  const renderStoryItem = (story: Story, index: number) => {
    const gradientColors: [string, string, string, string, string, string, string] = story.type === 'add' ? ['#6B7280', '#9CA3AF', '#6B7280', '#9CA3AF', '#6B7280', '#9CA3AF', '#6B7280'] : getStoryGradient(index - 1);
    
    return (
      <Pressable
        key={story.id}
        onPress={() => handleStoryPress(story)}
        className="items-center mx-2"
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <View className="relative">
          {story.type === 'add' ? (
            // Perfect Add Story Button
            <>
              <View 
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: tabStyles.story.addStoryBorder,
                  backgroundColor: tabStyles.story.addStoryBackground,
                  padding: 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri: userProfileImage }}
                  style={{ 
                    width: 70, 
                    height: 70,
                    borderRadius: 35,
                  }}
                  contentFit="cover"
                />
              </View>
              {/* Perfect Plus icon overlay - outside the main container */}
              <View 
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 24,
                  height: 24,
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: tabStyles.story.addStoryBackground,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Plus size={12} color="white" strokeWidth={2.5} />
              </View>
            </>
          ) : (
            // Beautiful multi-color gradient border story circle
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                padding: 4,
                shadowColor: gradientColors[0],
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <View 
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  overflow: 'hidden',
                  backgroundColor: tabStyles.story.addStoryBackground,
                  padding: 3, // Add padding for white space between gradient and image
                }}
              >
                <Image
                  source={{ uri: story.image }}
                  style={{ 
                    width: 66, // Adjusted for padding (72 - 3*2)
                    height: 66,
                    borderRadius: 33, // Adjusted border radius
                  }}
                  contentFit="cover"
                />
              </View>
            </LinearGradient>
          )}
        </View>
        
        {/* Name Label */}
        <Text style={{
          fontSize: 12,
          fontWeight: '500',
          color: tabStyles.story.nameText,
          marginTop: 8,
          textAlign: 'center',
          maxWidth: 64,
        }} numberOfLines={1}>
          {story.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ backgroundColor: tabStyles.story.backgroundColor, paddingVertical: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 4,
        }}
        style={{ flexDirection: 'row' }}
      >
        {stories.map((story, index) => renderStoryItem(story, index))}
      </ScrollView>
    </View>
  );
}
