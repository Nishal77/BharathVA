import React from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { SettingsIcon } from './SettingsIcon';

interface SettingItemProps {
  iconName: string;
  title: string;
  subtitle?: string;
  valueText?: string;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  toggleOnChange?: (value: boolean) => void;
  isDestructive?: boolean;
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    error: string;
    toggleActive: string;
    toggleInactive: string;
  };
}

export default function SettingItem({
  iconName,
  title,
  subtitle,
  valueText,
  onPress,
  hasToggle = false,
  toggleValue = false,
  toggleOnChange = () => {},
  isDestructive = false,
  colors,
}: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={hasToggle}
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border,
        },
        pressed && !hasToggle && { opacity: 0.7 },
      ]}
    >
      <View style={styles.settingItemContent}>
        <View style={styles.settingItemLeft}>
          <SettingsIcon
            name={iconName}
            size={24}
            color={isDestructive ? colors.error : colors.primaryText}
          />
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingTitle,
                {
                  color: isDestructive ? colors.error : colors.primaryText,
                },
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={toggleOnChange}
            trackColor={{
              false: colors.toggleInactive,
              true: colors.toggleActive,
            }}
            thumbColor={toggleValue ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor={colors.toggleInactive}
          />
        ) : (
          <View style={styles.rightContent}>
            {valueText && (
              <Text style={[styles.valueText, { color: colors.secondaryText }]}>
                {valueText}
              </Text>
            )}
            <SettingsIcon
              name="arrow"
              size={16}
              color={colors.secondaryText}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    borderBottomWidth: 1,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
