import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { SettingsIcon } from '../SettingsIcon';

interface ThemeSelectionProps {
  currentTheme: 'system' | 'light' | 'dark';
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void;
  onBackPress?: () => void;
}

export default function ThemeSelection({
  currentTheme,
  onThemeChange,
  onBackPress,
}: ThemeSelectionProps) {
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

  const handleSelect = (theme: 'system' | 'light' | 'dark') => {
    onThemeChange(theme);
    if (onBackPress) {
      setTimeout(() => onBackPress(), 200);
    }
  };

  const getThemeDescription = (theme: 'system' | 'light' | 'dark') => {
    switch (theme) {
      case 'system':
        return 'Follow your device theme settings';
      case 'light':
        return 'Always use light mode';
      case 'dark':
        return 'Always use dark mode';
      default:
        return '';
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
          Appearance
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Heading Section */}
        <View style={styles.headingSection}>
          <Text style={[styles.headingTitle, { color: colors.primaryText }]}>
            Choose Your Theme
          </Text>
          <Text style={[styles.headingDescription, { color: colors.secondaryText }]}>
            Select how you want BharathVA to appear. You can match your device settings or choose a specific theme.
          </Text>
        </View>

        {/* Options Section */}
        <View style={styles.section}>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
            {/* System Option */}
            <Pressable
              onPress={() => handleSelect('system')}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderBottomColor: colors.border,
                },
                currentTheme === 'system' && {
                  backgroundColor: colors.selectedBackground,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.primaryText }]}>
                    System
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: colors.secondaryText }]}>
                    {getThemeDescription('system')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: currentTheme === 'system' ? colors.accent : colors.border },
                  ]}
                >
                  {currentTheme === 'system' && (
                    <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                  )}
                </View>
              </View>
            </Pressable>

            {/* Light Option */}
            <Pressable
              onPress={() => handleSelect('light')}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderBottomColor: colors.border,
                },
                currentTheme === 'light' && {
                  backgroundColor: colors.selectedBackground,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.primaryText }]}>
                    Light
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: colors.secondaryText }]}>
                    {getThemeDescription('light')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: currentTheme === 'light' ? colors.accent : colors.border },
                  ]}
                >
                  {currentTheme === 'light' && (
                    <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                  )}
                </View>
              </View>
            </Pressable>

            {/* Dark Option */}
            <Pressable
              onPress={() => handleSelect('dark')}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: colors.cardBackground,
                },
                currentTheme === 'dark' && {
                  backgroundColor: colors.selectedBackground,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.primaryText }]}>
                    Dark
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: colors.secondaryText }]}>
                    {getThemeDescription('dark')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: currentTheme === 'dark' ? colors.accent : colors.border },
                  ]}
                >
                  {currentTheme === 'dark' && (
                    <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                  )}
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
    paddingBottom: 100,
  },
  headingSection: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headingDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
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
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
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
    height: 80,
  },
});

