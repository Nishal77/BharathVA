import React from 'react';
import { ScrollView, Text, View, useColorScheme, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import BaseModal from '../../../../../../components/ui/BaseModal';

const { width: screenWidth } = Dimensions.get('window');

interface UpdateDetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  imageUrl?: string;
}

export default function UpdateDetailModal({
  visible,
  onClose,
  title,
  category,
  author,
  timeAgo,
  imageUrl,
}: UpdateDetailModalProps) {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';

  const contentParagraphs = [
    `This is a detailed update about the current situation. The information provided here gives you comprehensive insights into what's happening in your area.`,
    `Local authorities are working diligently to address the situation and keep residents informed. It's important to stay updated with the latest developments and follow any official guidance provided.`,
    `The community response has been positive, with many residents taking necessary precautions and staying informed through official channels. We will continue to monitor the situation and provide updates as they become available.`,
    `Remember to check official sources for the most accurate and up-to-date information. Your safety and well-being are our top priorities. Stay connected and stay safe.`,
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      height={Dimensions.get('window').height * 0.9}
      showHandleBar={true}
      showBackdrop={true}
      backdropOpacity={0.7}
      blurIntensity={30}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: 8,
            paddingBottom: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <X size={22} color={textColor} strokeWidth={2.5} />
          </Pressable>

            <Text
              style={{
                fontSize: 11,
                color: secondaryTextColor,
                fontWeight: '500',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              {timeAgo.toLowerCase()}
            </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '600',
                color: textColor,
                lineHeight: 34,
                letterSpacing: -0.5,
                marginBottom: 24,
                includeFontPadding: false,
              }}
            >
              {title}
            </Text>
          </View>

          {imageUrl && (
            <View style={{ marginHorizontal: 20, marginBottom: 28 }}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: screenWidth - 40,
                  height: (screenWidth - 40) * 0.75,
                  borderRadius: 20,
                }}
                contentFit="cover"
                transition={200}
              />
            </View>
          )}

          <View style={{ paddingHorizontal: 20, paddingTop: 0 }}>
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
          </View>
        </ScrollView>
      </View>
    </BaseModal>
  );
}
