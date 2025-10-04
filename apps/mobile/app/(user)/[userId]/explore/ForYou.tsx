import * as WebBrowser from 'expo-web-browser';
import { ExternalLink, RefreshCw, Volume2, VolumeX } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTabStyles } from '../../../../hooks/useTabStyles';
import TodaysNew from './TodaysNew';

const { width, height } = Dimensions.get('window');

interface ForYouProps {
  onVideoPress?: () => void;
}

export default function ForYou({ onVideoPress }: ForYouProps) {
  const [isMuted, setIsMuted] = useState(true);
  const tabStyles = useTabStyles();

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoPress = () => {
    onVideoPress?.();
  };

  const openInBrowser = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://www.youtube.com/live/jdJoOhqCipA?si=jz2rkfO9oa23PPgo');
    } catch (error) {
      console.error('Error opening browser:', error);
      Alert.alert('Error', 'Unable to open video in browser');
    }
  };

  // Try multiple video IDs for better compatibility
  const videoIds = [
    'jdJoOhqCipA', // Original video ID
    'dQw4w9WgXcQ', // Fallback video ID (Rick Roll - always available)
    'jNQXAC9IVRw'  // Another fallback
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);

  const retryVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoIds.length);
    setWebViewKey(prev => prev + 1);
    console.log(`Trying video ${currentVideoIndex + 1}: ${videoIds[currentVideoIndex]}`);
  };

  // YouTube embed HTML with improved configuration
  const youtubeEmbedHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #000;
            overflow: hidden;
          }
          .video-container {
            position: relative;
            width: 100%;
            height: 100vh;
            background-color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
            background-color: #000;
          }
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <div class="loading">Loading video...</div>
          <iframe 
            src="https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=https://www.youtube.com" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen
            onload="document.querySelector('.loading').style.display='none'">
          </iframe>
        </div>
        <script>
          // Enhanced video loading
          window.addEventListener('load', function() {
            console.log('Page loaded');
            const iframe = document.querySelector('iframe');
            if (iframe) {
              iframe.addEventListener('load', function() {
                console.log('YouTube iframe loaded successfully');
                const loading = document.querySelector('.loading');
                if (loading) {
                  loading.style.display = 'none';
                }
              });
              
              iframe.addEventListener('error', function() {
                console.log('YouTube iframe failed to load');
                const loading = document.querySelector('.loading');
                if (loading) {
                  loading.textContent = 'Video failed to load';
                  loading.style.color = '#ff4444';
                }
              });
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: tabStyles.screen.backgroundColor }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Main Video Section */}
      <View style={{ position: 'relative', backgroundColor: tabStyles.screen.backgroundColor }}>
        {/* Video Player */}
        <Pressable
          onPress={handleVideoPress}
          style={{ position: 'relative' }}
        >
          <WebView
            key={webViewKey}
            source={{ html: youtubeEmbedHTML }}
            style={{
              width: width,
              height: width * 0.5625, // 16:9 aspect ratio for proper video dimensions
              backgroundColor: '#000000',
            }}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            mixedContentMode="compatibility"
            allowsFullscreenVideo={true}
            allowsProtectedMedia={true}
            allowsBackForwardNavigationGestures={false}
            onShouldStartLoadWithRequest={(request) => {
              console.log('Loading request:', request.url);
              return true;
            }}
            onLoadStart={() => console.log('WebView loading started')}
            onLoadEnd={() => console.log('WebView loading completed')}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('WebView HTTP error: ', nativeEvent);
            }}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
            originWhitelist={['*']}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
          />
        </Pressable>
        
        {/* Mute/Unmute Button - Overlay on Video */}
        <Pressable
          onPress={toggleMute}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {isMuted ? (
            <VolumeX size={18} color="white" strokeWidth={2} />
          ) : (
            <Volume2 size={18} color="white" strokeWidth={2} />
          )}
        </Pressable>

        {/* Watch on YouTube Button - Overlay on Video */}
        <Pressable
          onPress={openInBrowser}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <ExternalLink size={14} color="white" strokeWidth={2} />
          <Text 
            style={{
              color: 'white',
              fontSize: 11,
              fontWeight: '600',
              marginLeft: 4,
            }}
          >
            Watch on YouTube
          </Text>
        </Pressable>

        {/* Retry Button - Overlay on Video */}
        <Pressable
          onPress={retryVideo}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <RefreshCw size={14} color="white" strokeWidth={2} />
          <Text 
            style={{
              color: 'white',
              fontSize: 11,
              fontWeight: '600',
              marginLeft: 4,
            }}
          >
            Retry
          </Text>
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
