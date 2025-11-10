import React, { useState } from 'react';
import { View, Text, Pressable, Modal, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';

interface CommentMenuDropdownProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  isOwnComment: boolean;
}

export default function CommentMenuDropdown({
  visible,
  onClose,
  onDelete,
  isOwnComment,
}: CommentMenuDropdownProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <BlurView
          intensity={90}
          tint={isDark ? 'dark' : 'light'}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            minWidth: 200,
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {isOwnComment && (
              <Pressable
                onPress={handleDelete}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderBottomWidth: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#EF4444',
                    textAlign: 'center',
                  }}
                >
                  Delete
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderTopWidth: isOwnComment ? 1 : 0,
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDark ? '#E5E5E5' : '#1F1F1F',
                  textAlign: 'center',
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </BlurView>
      </Pressable>
    </Modal>
  );
}



