import { useTheme } from '../contexts/ThemeContext';

export function useTabStyles() {
  const { isDark } = useTheme();

  const tabStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    text: {
      active: isDark ? '#FFFFFF' : '#000000',
      inactive: isDark ? '#9CA3AF' : '#6B7280',
    },
    background: {
      primary: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.35)',
      secondary: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.25)',
      tertiary: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.4)',
    },
    border: {
      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      bottom: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    profile: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    },
    search: {
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      textColor: isDark ? '#FFFFFF' : '#1F2937',
      placeholderColor: isDark ? '#9CA3AF' : '#6B7280',
    },
  };

  return tabStyles;
}
