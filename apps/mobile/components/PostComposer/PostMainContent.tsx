import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PostMainContentProps {
  onContentChange: (content: string) => void;
  isDark: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function PostMainContent({ onContentChange, isDark }: PostMainContentProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const handleContentChange = (text: string) => {
    setContent(text);
    onContentChange(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const characterCount = content.length;
  const maxCharacters = 350;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          }
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80'
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View
              style={[
                styles.onlineIndicator,
                { backgroundColor: '#00C851' }
              ]}
            />
          </View>

          {/* Audience Selector */}
            <Pressable
              style={[
                styles.audienceButton,
                {
                  backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA',
                  borderColor: isDark ? '#333333' : '#E1E5E9',
                }
              ]}
            >
              <Ionicons
                name="globe-outline"
                size={14}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
              <Text
                style={[
                  styles.audienceText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}
              >
                Everyone
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={isDark ? '#999999' : '#666666'}
              />
            </Pressable>
        </View>

        {/* Text Input Area - Aligned with Profile */}
        <View style={styles.inputSection}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              {
                color: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            placeholder="What's on your mind today?"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            value={content}
            onChangeText={handleContentChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline
            textAlignVertical="top"
            maxLength={maxCharacters + 50} // Allow some overflow for better UX
            accessibilityLabel="Post content input"
          />

          {/* Character Count */}
          <View style={styles.characterCountContainer}>
            <Text
              style={[
                styles.characterCount,
                {
                  color: isOverLimit
                    ? '#FF3B30'
                    : isDark ? '#666666' : '#999999',
                }
              ]}
            >
              {characterCount}/{maxCharacters}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? '#333333' : '#E1E5E9',
              }
            ]}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color="#1DA1F2"
            />
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? '#333333' : '#E1E5E9',
              }
            ]}
          >
            <Ionicons
              name="videocam-outline"
              size={18}
              color="#1DA1F2"
            />
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? '#333333' : '#E1E5E9',
              }
            ]}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color="#1DA1F2"
            />
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? '#333333' : '#E1E5E9',
              }
            ]}
          >
            <Ionicons
              name="happy-outline"
              size={18}
              color="#1DA1F2"
            />
          </Pressable>
        </View>

        {/* Reply Settings */}
        <View style={styles.replySettingsContainer}>
          <View style={[
            styles.replySettings,
            {
              backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA',
              borderColor: isDark ? '#333333' : '#E1E5E9',
            }
          ]}>
            <Ionicons
              name="globe-outline"
              size={14}
              color={isDark ? '#999999' : '#666666'}
            />
            <Text
              style={[
                styles.replyText,
                { color: isDark ? '#999999' : '#666666' }
              ]}
            >
              Everyone can reply
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  audienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  audienceText: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  inputSection: {
    marginBottom: 24,
    marginLeft: 48, // Avatar width (36) + margin (12) = 48
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 100,
    padding: 0,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    backgroundColor: 'transparent',
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginRight: 20,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  replySettingsContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  replySettings: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  replyText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
});
