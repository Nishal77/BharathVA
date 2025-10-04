import { Image } from 'expo-image';
import { Ellipsis } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTabStyles } from '../../hooks/useTabStyles';

interface TweetHeaderProps {
  name: string;
  handle: string;
  time: string;
  avatar: string;
  verified?: boolean;
}

export default function TweetHeader({ 
  name, 
  handle, 
  time, 
  avatar, 
  verified = false 
}: TweetHeaderProps) {
  const tabStyles = useTabStyles();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {/* Left Section - Profile Picture */}
      <View style={{ 
        width: 48, 
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: 12,
        paddingTop: 2
      }}>
        <Pressable>
          <Image
            source={{ uri: avatar }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
            placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            onError={() => console.log('Image failed to load:', avatar)}
          />
        </Pressable>
      </View>

      {/* Right Section - Name, handle, time, and more options */}
      <View style={{ 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginRight: 12
      }}>
        <View style={{ 
          flex: 1, 
          flexDirection: 'row', 
          alignItems: 'center', 
          flexWrap: 'wrap' 
        }}>
          <Text style={{ 
            fontSize: 15, 
            fontWeight: 'bold', 
            color: tabStyles.text.primary,
            marginRight: 4
          }}>
            {name}
          </Text>
          {verified && (
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/verified-badge.png' }}
              style={{ 
                width: 14, 
                height: 14, 
                marginRight: 4 
              }}
              contentFit="contain"
            />
          )}
          <Text style={{ 
            fontSize: 13, 
            color: tabStyles.text.secondary,
            marginRight: 4
          }}>
            @{handle}
          </Text>
          <Text style={{ 
            fontSize: 13, 
            color: tabStyles.text.secondary,
            marginRight: 8
          }}>
            · {time}
          </Text>
        </View>
        <Pressable style={{ padding: 4 }}>
          <Ellipsis color={tabStyles.text.secondary} size={16} />
        </Pressable>
      </View>
    </View>
  );
}
