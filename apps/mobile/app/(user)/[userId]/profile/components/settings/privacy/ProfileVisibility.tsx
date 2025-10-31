import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { SettingsIcon } from '../SettingsIcon';

interface ProfileVisibilityProps {
  currentVisibility: 'public' | 'private';
  onVisibilityChange: (visibility: 'public' | 'private') => void;
  onBackPress?: () => void;
}

export default function ProfileVisibility({
  currentVisibility,
  onVisibilityChange,
  onBackPress,
}: ProfileVisibilityProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme colors
  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    cardBackground: isDark ? '#1A1A1A' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    accent: '#3B82F6',
    selectedBackground: isDark ? '#1F2937' : '#F3F4F6',
  };

  const handleSelect = (visibility: 'public' | 'private') => {
    onVisibilityChange(visibility);
    if (onBackPress) {
      setTimeout(() => onBackPress(), 200);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backIconContainer}>
            <SettingsIcon
              name="arrow"
              size={24}
              color={colors.primaryText}
            />
          </View>
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
          Profile Visibility
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
            Choose who can see your profile
          </Text>

          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
            {/* Public Option */}
            <Pressable
              onPress={() => handleSelect('public')}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderBottomColor: colors.border,
                },
                currentVisibility === 'public' && {
                  backgroundColor: colors.selectedBackground,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: currentVisibility === 'public' ? colors.accent : colors.border },
                    ]}
                  >
                    {currentVisibility === 'public' && (
                      <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                    )}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.primaryText }]}>
                      Public
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.secondaryText }]}>
                      Anyone can see your profile and posts
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Private Option */}
            <Pressable
              onPress={() => handleSelect('private')}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: colors.cardBackground,
                },
                currentVisibility === 'private' && {
                  backgroundColor: colors.selectedBackground,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: currentVisibility === 'private' ? colors.accent : colors.border },
                    ]}
                  >
                    {currentVisibility === 'private' && (
                      <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                    )}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.primaryText }]}>
                      Private
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.secondaryText }]}>
                      Only approved followers can see your profile and posts
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    height: 100,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconContainer: {
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  footer: {
    height: 40,
  },
});
