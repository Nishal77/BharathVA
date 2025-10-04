import { useTheme } from '../contexts/ThemeContext';

export function useTabStyles() {
  const { isDark } = useTheme();

  const tabStyles = {
    // Main container backgrounds
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    // Screen backgrounds
    screen: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    // Content backgrounds
    content: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    // Secondary backgrounds (cards, etc.)
    secondary: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
    },
    // Text colors
    text: {
      primary: isDark ? '#FFFFFF' : '#000000',
      secondary: isDark ? '#D1D5DB' : '#6B7280',
      tertiary: isDark ? '#9CA3AF' : '#9CA3AF',
      active: isDark ? '#FFFFFF' : '#000000',
      inactive: isDark ? '#9CA3AF' : '#6B7280',
    },
    // Header glassmorphism backgrounds
    background: {
      primary: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.35)',
      secondary: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.25)',
      tertiary: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.4)',
    },
    // Border colors
    border: {
      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      bottom: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      card: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    // Profile styling
    profile: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    },
    // Search styling
    search: {
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      textColor: isDark ? '#FFFFFF' : '#1F2937',
      placeholderColor: isDark ? '#9CA3AF' : '#6B7280',
    },
    // Card styling
    card: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      shadowColor: isDark ? '#000000' : '#000000',
    },
    // Story section
    story: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      addStoryBorder: isDark ? '#4B5563' : '#D1D5DB',
      addStoryBackground: isDark ? '#000000' : '#FFFFFF',
      nameText: isDark ? '#FFFFFF' : '#000000',
    },
  };

  return tabStyles;
}
