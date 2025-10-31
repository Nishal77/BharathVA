import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SettingsIcon } from '../SettingsIcon';

interface PrivacyInsightsProps {
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    accent: string;
    success: string;
  };
}

export default function PrivacyInsights({ colors }: PrivacyInsightsProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
        Privacy & Data Protection
      </Text>

      <View style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemLeft}>
              <SettingsIcon
                name="privacyInsights"
                size={24}
                color={colors.primaryText}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.primaryText }]}>
                  Your privacy, our priority
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>
                  Your data, always safe and private.
                </Text>
              </View>
            </View>
            <View style={styles.rightContent}>
              <SettingsIcon
                name="arrow"
                size={16}
                color={colors.secondaryText}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  settingItem: {
    borderBottomWidth: 0,
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
});

