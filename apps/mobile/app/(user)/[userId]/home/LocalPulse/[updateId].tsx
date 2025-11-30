import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, View, useColorScheme, Dimensions, Pressable, StatusBar, Platform, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function UpdateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const cardBgColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)';
  const modalBgColor = isDark ? '#1A1A1A' : '#FFFFFF';

  const title = (params.title as string) || 'Update Title';
  const category = (params.category as string) || 'General';
  const author = (params.author as string) || 'Source';
  const timeAgo = (params.timeAgo as string) || 'Recently';
  const imageUrl = params.imageUrl as string | undefined;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const contentParagraphs = [
    `This is a detailed update about the current situation. The information provided here gives you comprehensive insights into what's happening in your area.`,
    `Local authorities are working diligently to address the situation and keep residents informed. It's important to stay updated with the latest developments and follow any official guidance provided.`,
    `The community response has been positive, with many residents taking necessary precautions and staying informed through official channels. We will continue to monitor the situation and provide updates as they become available.`,
    `Remember to check official sources for the most accurate and up-to-date information. Your safety and well-being are our top priorities. Stay connected and stay safe.`,
  ];

  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: fadeAnim,
        }}
      >
        <BlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          style={{
            flex: 1,
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={handleClose}
          />
        </BlurView>
      </Animated.View>

      <Animated.View
        style={{
          flex: 1,
          backgroundColor: modalBgColor,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.3,
          shadowRadius: 24,
          elevation: 24,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={{ flex: 1, backgroundColor: bgColor }}>
          <View
            style={{
              paddingTop: statusBarHeight + 8,
              paddingBottom: 12,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: borderColor,
              backgroundColor: 'transparent',
              zIndex: 10,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: cardBgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <X size={20} color={textColor} strokeWidth={2.5} />
              </Pressable>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    backgroundColor: cardBgColor,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: secondaryTextColor,
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                    }}
                  >
                    {category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {imageUrl && (
              <View style={{ width: screenWidth, height: 360, marginBottom: 0, position: 'relative' }}>
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient
                  colors={['transparent', bgColor]}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                  }}
                />
              </View>
            )}

            <View style={{ paddingHorizontal: 20, paddingTop: imageUrl ? 28 : 36 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 24,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: cardBgColor,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: secondaryTextColor,
                      letterSpacing: 0.2,
                      fontWeight: '600',
                    }}
                  >
                    {timeAgo.toLowerCase()}
                  </Text>
                </View>

                {author && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: cardBgColor,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 22,
                      borderWidth: 1,
                      borderColor: borderColor,
                      gap: 8,
                    }}
                  >
                    <User size={14} color={secondaryTextColor} strokeWidth={2.5} />
                    <Text
                      style={{
                        fontSize: 13,
                        color: secondaryTextColor,
                        letterSpacing: 0.2,
                        fontWeight: '600',
                      }}
                      numberOfLines={1}
                    >
                      {author}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 34,
                  fontWeight: '900',
                  color: textColor,
                  lineHeight: 42,
                  letterSpacing: -1.3,
                  marginBottom: 32,
                  includeFontPadding: false,
                }}
              >
                {title}
              </Text>

              <View style={{ gap: 26 }}>
                {contentParagraphs.map((paragraph, index) => (
                  <Text
                    key={index}
                    style={{
                      fontSize: 18,
                      lineHeight: 30,
                      color: textColor,
                      letterSpacing: 0.15,
                      opacity: 0.95,
                    }}
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>

              <View
                style={{
                  marginTop: 44,
                  padding: 24,
                  backgroundColor: cardBgColor,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: textColor,
                    marginBottom: 10,
                    letterSpacing: 0.2,
                  }}
                >
                  Stay Informed
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 24,
                    color: secondaryTextColor,
                    letterSpacing: 0.1,
                  }}
                >
                  For the latest updates and official announcements, please follow verified sources and official channels. Your safety is our priority.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}
