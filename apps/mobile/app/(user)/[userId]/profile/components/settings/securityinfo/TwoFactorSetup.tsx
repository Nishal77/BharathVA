import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { SettingsIcon } from '../SettingsIcon';

interface TwoFactorSetupProps {
  onBackPress?: () => void;
  colors: {
    background: string;
    cardBackground: string;
    primaryText: string;
    secondaryText: string;
    border: string;
    accent: string;
    toggleActive: string;
    toggleInactive: string;
  };
}

export default function TwoFactorSetup({ onBackPress, colors }: TwoFactorSetupProps) {
  const [rememberTrusted, setRememberTrusted] = useState(true);

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {children}
    </View>
  );

  const Row = ({ title, subtitle, onPress }: { title: string; subtitle: string; onPress?: () => void }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { borderColor: colors.border }, pressed && { opacity: 0.85 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.primaryText }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
      </View>
      <SettingsIcon name="arrow" size={18} color={colors.secondaryText} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBackPress} style={styles.backBtn}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <SettingsIcon name="arrow" size={22} color={colors.primaryText} />
          </View>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Two‑Factor Authentication</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Choose Method */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Choose method</Text>
        <SectionCard>
          <Row title="Authenticator App" subtitle="Use TOTP apps like Google Authenticator" onPress={() => {}} />
          <View style={styles.divider} />
          <Row title="SMS" subtitle="Get codes by text message" onPress={() => {}} />
          <View style={styles.divider} />
          <Row title="Email" subtitle="Receive verification codes by email" onPress={() => {}} />
        </SectionCard>
      </View>

      {/* Backup Codes */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Backup Codes</Text>
        <SectionCard>
          <Pressable style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.accent }, pressed && { opacity: 0.9 }]}
            onPress={() => {}}>
            <Text style={styles.primaryBtnText}>Generate Backup Codes</Text>
          </Pressable>
          <Text style={[styles.helperText, { color: colors.secondaryText }]}>Store these codes in a safe place. Each code can be used once.</Text>
        </SectionCard>
      </View>

      {/* Trusted Devices */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Remember Trusted Devices</Text>
        <SectionCard>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.primaryText }]}>Don't require codes on this device</Text>
              <Text style={[styles.rowSubtitle, { color: colors.secondaryText }]}>Turn off anytime from security settings</Text>
            </View>
            <Switch
              value={rememberTrusted}
              onValueChange={setRememberTrusted}
              trackColor={{ false: colors.toggleInactive, true: colors.toggleActive }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor={colors.toggleInactive}
            />
          </View>
        </SectionCard>
      </View>

      <View style={{ height: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    height: 100,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerRight: { width: 40, height: 40 },
  sectionWrap: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, paddingLeft: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  divider: { height: 1, opacity: 0.5, backgroundColor: 'rgba(120,120,120,0.15)' },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  primaryBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  helperText: { fontSize: 12, marginTop: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});


