import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import EmojiPickerModal from './EmojiPickerModal';

interface ReactionsPickerProps {
  visible: boolean;
  onClose: () => void;
  onReactionSelect: (emoji: string) => void;
}

// Most useful and popular emojis for quick reactions
const QUICK_REACTIONS = [
  { emoji: '👍', name: 'Like' },
  { emoji: '❤️', name: 'Love' },
  { emoji: '😂', name: 'Laugh' },
  { emoji: '😢', name: 'Sad' },
  { emoji: '😮', name: 'Wow' },
];

export default function ReactionsPicker({
  visible,
  onClose,
  onReactionSelect,
}: ReactionsPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleReactionPress = (emoji: string) => {
    onReactionSelect(emoji);
    onClose();
  };

  const handleEmojiPickerClose = () => {
    setIsEmojiPickerVisible(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    onReactionSelect(emoji);
    setIsEmojiPickerVisible(false);
    onClose();
  };

  const getBackgroundColor = () => {
    return '#ffffff';
  };

  const getBorderColor = () => {
    return 'rgba(0, 0, 0, 0.08)';
  };

  const getTextColor = () => {
    return '#000000';
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-center items-center">
          {/* Backdrop - covers entire screen */}
          <Pressable
            className="absolute inset-0 bg-black/10"
            onPress={onClose}
          />
          
          {/* Reactions Picker Container */}
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              zIndex: 1,
            }}
          >
            <View
              style={{
                backgroundColor: getBackgroundColor(),
                borderRadius: 20,
                borderWidth: 1,
                borderColor: getBorderColor(),
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {/* Quick Reactions */}
              {QUICK_REACTIONS.map((reaction, index) => (
                <TouchableOpacity
                  key={reaction.emoji}
                  onPress={() => handleReactionPress(reaction.emoji)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    marginHorizontal: 2,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 22 }}>{reaction.emoji}</Text>
                </TouchableOpacity>
              ))}

              {/* Divider */}
              <View
                style={{
                  width: 1,
                  height: 24,
                  backgroundColor: getBorderColor(),
                  marginHorizontal: 6,
                }}
              />

              {/* Plus Button */}
              <TouchableOpacity
                onPress={() => setIsEmojiPickerVisible(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderWidth: 1,
                  borderColor: getBorderColor(),
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: getTextColor(),
                    fontWeight: '300',
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Full Emoji Picker Modal */}
      <EmojiPickerModal
        visible={isEmojiPickerVisible}
        onClose={handleEmojiPickerClose}
        onEmojiSelect={handleEmojiSelect}
      />
    </>
  );
}
