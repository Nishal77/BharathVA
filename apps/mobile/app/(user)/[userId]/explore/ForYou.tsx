import React, { useState } from "react";
import { View, Pressable, ScrollView, Dimensions } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { useTabStyles } from '../../../../hooks/useTabStyles';
import TodaysNew from './TodaysNew';

const { width } = Dimensions.get('window');

interface ForYouProps {
  onVideoPress?: () => void;
}

export default function ForYou({ onVideoPress }: ForYouProps) {
  const [muted, setMuted] = useState(true);
  const tabStyles = useTabStyles();

  // Create video player with info.mp4
  const player = useVideoPlayer(require('../../../../assets/Videos/info.mp4'), (player) => {
    player.loop = true;
    player.muted = muted;
    player.play();
  });

  const toggleMute = () => {
    setMuted(!muted);
    player.muted = !muted;
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Main Video Section */}
      <View style={{ position: 'relative', backgroundColor: tabStyles.screen.backgroundColor }}>
        {/* Local Video Player */}
        <VideoView
          player={player}
          style={{
            width: width,
            height: width * 0.5625, // 16:9 aspect ratio
            backgroundColor: '#000000',
          }}
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />

        {/* Custom mute/unmute button */}
        <Pressable
          onPress={toggleMute}
          style={{
            position: 'absolute',
            bottom: 32,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={28}
            color="white"
          />
        </Pressable>
      </View>
      
      {/* Today's News Section */}
      <TodaysNew 
        onNewsPress={(newsItem) => {
          console.log('News item pressed:', newsItem.title);
        }}
      />
    </ScrollView>
  );
}
