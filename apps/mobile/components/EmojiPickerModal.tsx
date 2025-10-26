import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

// Comprehensive emoji data organized by categories
const EMOJI_DATA: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
    ]
  },
  {
    id: 'people',
    name: 'People',
    icon: '👤',
    emojis: [
      '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵',
      '👱', '👱‍♂️', '👱‍♀️', '🧔', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳',
      '👨‍🦲', '👩‍🦲', '🧑‍🦰', '🧑‍🦱', '🧑‍🦳', '🧑‍🦲', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🎓',
      '👩‍🎓', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️', '👨‍🌾', '👩‍🌾',
      '🧑‍🌾', '👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🔧', '👩‍🔧', '🧑‍🔧', '👨‍🏭', '👩‍🏭', '🧑‍🏭',
      '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎤'
    ]
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍',
      '🦧', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🦄', '🐴', '🦓',
      '🦌', '🐂', '🐃', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐',
      '🦏', '🦛', '🐘', '🦣', '🦒', '🐘', '🦏', '🦛', '🐪', '🐫',
      '🦘', '🦥', '🦦', '🦨', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣'
    ]
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍎',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
      '🥒', '🌶️', '🫒', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
      '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞',
      '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
      '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝'
    ]
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀',
      '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁',
      '🏹', '🎣', '🤿', '🎽', '🩱', '🩲', '🩳', '👙', '🩰', '👗',
      '👔', '👕', '👖', '🧥', '🧦', '🧤', '🧣', '👒', '🎩', '👑',
      '🎓', '👟', '👞', '🥾', '🥿', '👠', '👡', '🩴', '👢', '🩹',
      '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹'
    ]
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    emojis: [
      '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶',
      '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🚧', '⛽', '🚨',
      '🚥', '🚦', '🛑', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯',
      '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏔️', '⛰️',
      '🌋', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️',
      '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫'
    ]
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '📱',
    emojis: [
      '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️',
      '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥',
      '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮',
      '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒',
      '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴',
      '💵', '💶', '💷', '💸', '💳', '🧾', '💎', '⚖️', '🧰', '🔧'
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
      '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
      '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️'
    ]
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: '🏁',
    emojis: [
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩',
      '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸',
      '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫',
      '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷',
      '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫',
      '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷'
    ]
  }
];

export default function EmojiPickerModal({
  visible,
  onClose,
  onEmojiSelect,
}: EmojiPickerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  const handleEmojiPick = useCallback(
    (emoji: string) => {
      // Add to recent emojis
      setRecentEmojis(prev => {
        const filtered = prev.filter(e => e !== emoji);
        return [emoji, ...filtered].slice(0, 20); // Keep only 20 recent emojis
      });
      
      onEmojiSelect(emoji);
      onClose();
    },
    [onEmojiSelect, onClose]
  );

  const getBackgroundColor = () => {
    return isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  };

  const getBorderColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
  };

  const getTextColor = () => {
    return isDark ? '#ffffff' : '#000000';
  };

  const getSecondaryTextColor = () => {
    return isDark ? '#cccccc' : '#666666';
  };

  const getSearchBackgroundColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  };

  const getCardBackgroundColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  };

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show all emojis from all categories when no search query
      return EMOJI_DATA.flatMap(category => category.emojis);
    }
    
    // Search across all categories
    const allEmojis = EMOJI_DATA.flatMap(category => category.emojis);
    return allEmojis.filter(emoji => 
      emoji.includes(searchQuery) || 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderEmojiItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleEmojiPick(item)}
      style={{
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 12,
        backgroundColor: 'transparent',
      }}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 28 }}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center">
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0 bg-black/30"
          onPress={onClose}
        />
        
        {/* Emoji Picker Container with Glassmorphism */}
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: getBorderColor(),
            width: Dimensions.get('window').width * 0.9,
            height: Dimensions.get('window').height * 0.6,
            maxHeight: Dimensions.get('window').height * 0.6,
            minHeight: Dimensions.get('window').height * 0.4,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 20,
            },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 25,
          }}
        >
          {/* Inner container for content */}
          <View
            style={{
              flex: 1,
              backgroundColor: getBackgroundColor(),
              borderRadius: 24,
            }}
          >
          {/* Header */}
          <View 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: getBorderColor(),
            }}
          >
            <Text
              style={{ 
                color: getTextColor(),
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              Choose Emoji
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: getSearchBackgroundColor(),
              }}
            >
              <Text
                style={{ 
                  color: getTextColor(),
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <View
              style={{
                backgroundColor: getSearchBackgroundColor(),
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: getBorderColor(),
              }}
            >
              <Text
                style={{ 
                  color: getSecondaryTextColor(),
                  fontSize: 18,
                  marginRight: 8,
                }}
              >
                🔍
              </Text>
              <TextInput
                placeholder="Search emojis..."
                placeholderTextColor={getSecondaryTextColor()}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  color: getTextColor(),
                  flex: 1,
                  fontSize: 16,
                }}
              />
            </View>
          </View>

          {/* Emoji Grid */}
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <FlatList
              data={filteredEmojis}
              renderItem={renderEmojiItem}
              numColumns={6}
              keyExtractor={(item, index) => `${item}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              ListEmptyComponent={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }}>
                  <Text
                    style={{ 
                      color: getSecondaryTextColor(),
                      fontSize: 18,
                    }}
                  >
                    No emojis found
                  </Text>
                </View>
              }
            />
          </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}