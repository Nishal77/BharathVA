import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  useColorScheme,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { profileService } from '../../services/api/profileService';
import { authService } from '../../services/api/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const GENDER_OPTIONS = [
  'male',
  'female',
  'custom',
  'prefer not to say',
];

interface ProfileSetupProps { onComplete?: (args?: { userId?: string }) => void; sessionToken?: string; email?: string; password?: string; }

export default function ProfileSetup({ onComplete, sessionToken, email, password }: ProfileSetupProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { height, width } = Dimensions.get('window');
  const isSmallDevice = height < 700 || width < 360;
  const isLargeDevice = height > 800;
  const router = useRouter();
  const { user } = useAuth();

  const colors = useMemo(
    () => ({
      background: isDark ? '#000000' : '#FFFFFF',
      card: isDark ? '#0B1220' : '#F8FAFC',
      primaryText: isDark ? '#FFFFFF' : '#0F172A',
      secondaryText: isDark ? '#9CA3AF' : '#6B7280',
      border: isDark ? '#1F2937' : '#E5E7EB',
      accent: '#3B82F6',
      muted: isDark ? '#111827' : '#F3F4F6',
      error: '#EF4444',
    }),
    [isDark]
  );

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [gender, setGender] = useState<string>('');
  const [genderOpen, setGenderOpen] = useState(false);
  const formatLabel = (value: string): string => {
    if (!value) return value;
    return value
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };
  const [bio, setBio] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.95,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setAvatarUri(res.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to select image.');
    }
  };

  const removeImage = () => setAvatarUri(null);

  const validate = () => {
    // Gender is required; others optional
    return !!(gender && gender.trim().length > 0);
  };

  const save = async () => {
    if (!validate()) return;
    if (saving) return;
    setSaving(true);
    try {
      await profileService.updateProfile({
        profileImageUrl: avatarUri || null,
        bio: bio?.trim() || null,
        gender,
      } as any);
      Alert.alert('Saved', 'Profile setup saved successfully.');
      onComplete?.();
    } catch (e: any) {
      const status = e?.status || e?.response?.status || e?.data?.status;
      if (status === 401 || status === 403) {
        Alert.alert(
          'Sign in required',
          'Your session is missing or expired. Please sign in again.',
          [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') },
          ]
        );
      } else {
        Alert.alert('Error', e?.message || 'Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (nextLoading) return;
    setNextLoading(true);
    try {
      // Save profile into registration_sessions first
      await authService.saveRegistrationProfile(sessionToken!, {
        profileImageUrl: avatarUri || null,
        bio: bio?.trim() || null,
        gender: gender || 'prefer not to say',
      });
      // Complete registration: move data to users table
      await authService.completeRegistration(sessionToken!);
      // Defer navigation/login to parent to avoid stack conflicts
      onComplete?.();
      setNextLoading(false);
    } catch (e: any) {
      setNextLoading(false);
      const status = e?.status || e?.response?.status || e?.data?.status;
      if (status === 401 || status === 403) {
        Alert.alert(
          'Sign in required',
          'Your session is missing or expired. Please sign in again.',
          [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') },
          ]
        );
      } else {
        Alert.alert('Error', e?.message || 'Failed to save profile. Please try again.');
      }
    }
  };

  const testStore = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile({
        profileImageUrl: avatarUri || null,
        bio: bio?.trim() || null,
        gender: gender || 'Prefer not to say',
      } as any);
      // Read-back to validate persistence
      const user = await authService.getCurrentUserProfile();
      const mismatches: string[] = [];
      if ((user as any)?.gender !== (gender || 'Prefer not to say')) mismatches.push('gender');
      if (((user as any)?.bio || null) !== (bio?.trim() || null)) mismatches.push('bio');
      if (((user as any)?.profileImageUrl || null) !== (avatarUri || null)) mismatches.push('profileImageUrl');

      if (mismatches.length === 0) {
        Alert.alert('DB Test', 'Verified: all fields persisted correctly.');
      } else {
        Alert.alert('DB Test', `Saved but mismatch on: ${mismatches.join(', ')}`);
      }
    } catch (e: any) {
      Alert.alert('DB Test Failed', e?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const StepHeader = () => null;

  const uploadRowStyle = useMemo(() => ({
    backgroundColor: isDark ? '#151515' : '#E5E7EB',
    borderColor: isDark ? '#262626' : '#D1D5DB', // gray-300 for visible border
  }), [isDark]);

  const nextBtnStyle = useMemo(() => ({
    bg: isDark ? '#1F2937' : '#E5E7EB', // slate-800 vs gray-200
    text: isDark ? '#FFFFFF' : '#111827',
    border: isDark ? '#374151' : '#D1D5DB',
  }), [isDark]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: insets.top + (isSmallDevice ? 8 : isLargeDevice ? 28 : 16) }}>
          {/* Step header removed as requested */}

          <Text style={[styles.title, { color: colors.primaryText }]}>Personalize Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Add a photo, pick your gender, and share a short bio.</Text>

          {/* Avatar card */}
          {/*
This outer <View> wraps the profile picture section. Next, we guarantee the upload row always has a gray (bg-gray-50/#F3F4F6) background and thin border.
*/}
          <View style={{ marginTop: 40, alignItems: 'center', justifyContent: 'center' }}>
            {/* Upload box, centered content with avatar above text */}
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                styles.uploadRow,
                uploadRowStyle,
                { alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: 168, height: 168 },
                pressed && { opacity: 0.96, transform: [{ scale: 0.995 }] },
              ]}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.uploadAvatarHolder}>
                  <View style={styles.avatarCircle}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Svg width={42} height={42} viewBox="0 0 24 24">
                          <Path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5Z" fill="#9CA3AF" />
                        </Svg>
                      </View>
                    )}
                  </View>
                </View>
                <Text numberOfLines={1} style={[styles.uploadText, { color: colors.accent, marginTop: 14 }]}>{avatarUri ? 'Change Photo' : '+ Upload Photo'}</Text>
              </View>
            </Pressable>
            {avatarUri ? (
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <Pressable onPress={removeImage} style={({ pressed }) => [styles.removeLink, pressed && { opacity: 0.85 }] }>
                  <Text style={{ color: colors.secondaryText, fontWeight: '600' }}>Remove</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Gender select */}
          <View style={styles.sectionSimple}>
            <Text style={[styles.sectionLabel, { color: colors.primaryText }]}>Select your gender</Text>
            <View
              style={[
                styles.selectInput,
                {
                  borderColor: colors.border,
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6', // gray background
                },
              ]}
            >
              <Text style={[styles.selectText, { color: gender ? colors.primaryText : colors.secondaryText }]}>
                {gender ? formatLabel(gender) : 'Choose an option'}
              </Text>
              <Pressable
                onPress={() => setGenderOpen((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ paddingLeft: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Toggle gender options"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path d="M6 9l6 6 6-6" stroke={colors.secondaryText} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </Pressable>
            </View>

            {genderOpen && (
              <View style={[styles.dropdown, { borderColor: colors.border, backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
                {GENDER_OPTIONS.map((opt, idx) => (
                  <Pressable
                    key={opt}
                    onPress={() => { setGender(opt); setGenderOpen(false); }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor:
                          pressed || gender === opt ? (isDark ? '#111827' : '#F3F4F6') : 'transparent',
                      },
                      idx === GENDER_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${opt}`}
                  >
                    <Text style={[styles.optionText, { color: colors.primaryText }]}>{formatLabel(opt)}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Bio section - no outer background/card, only input box */}
          <View style={styles.sectionSimple}>
            <Text style={[styles.sectionLabel, { color: colors.primaryText }]}>Bio (optional)</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself (up to 300 chars)"
                placeholderTextColor={colors.secondaryText}
                style={[styles.input, { color: colors.primaryText }]}
                maxLength={300}
                multiline
              />
            </View>
            <Text style={{ alignSelf: 'flex-end', color: colors.secondaryText, fontSize: 12 }}>{bio.length}/300</Text>
          </View>

          {/* CTA */}
          <View style={{ marginTop: 16, gap: 12 }}>
            <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.accent }, (pressed || saving) && { opacity: 0.9 }]}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save and Continue</Text>}
            </Pressable>
            <Pressable onPress={testStore} disabled={saving} style={({ pressed }) => [styles.testBtn, { borderColor: colors.border }, pressed && { opacity: 0.9 }]}>
              <Text style={[styles.testBtnText, { color: colors.primaryText }]}>Test: Store in Databasse</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View style={{ height: 72 }} />
      {/* Fixed-bottom Next button */}
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        paddingHorizontal: 22,
        paddingBottom: Math.max(insets.bottom, 18),
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 10,
        elevation: 8,
        zIndex: 20,
      }}>
        <Pressable
          onPress={handleNext}
          disabled={!validate() || nextLoading}
          style={({ pressed }) => [{
            backgroundColor: nextBtnStyle.bg,
            height: 50,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
            borderWidth: 1,
            borderColor: nextBtnStyle.border,
            opacity: (!validate() || nextLoading) ? 0.5 : (pressed ? 0.97 : 1),
          }]}
        >
          {nextLoading ? (
            <ActivityIndicator color={nextBtnStyle.text} />
          ) : (
            <Text style={{ color: nextBtnStyle.text, fontSize: 17, fontWeight: '800' }}>Next</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 6 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden' },
  avatarCircle: { width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', backgroundColor: '#E5E7EB' },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarCtas: { flex: 1, gap: 10 },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minHeight: 70,
    // color will be set below based on theme
  },
  uploadContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  uploadAvatarHolder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginRight: 18
  },
  uploadText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB', // force strong blue for light theme - override runtime as needed
    marginLeft: 0, // fine-tuned (already spaced with margin from avatar)
  },
  removeLink: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '700' },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  // Select styles
  selectInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  selectText: { fontSize: 15 },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionText: { fontSize: 16, fontWeight: '500' },
  inputWrap: { borderWidth: 1, borderRadius: 12, padding: 10 },
  sectionSimple: { marginTop: 16 },
  input: { fontSize: 15, minHeight: 96, textAlignVertical: 'top' },
  saveBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  testBtn: { height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  testBtnText: { fontSize: 14, fontWeight: '700' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepItem: { flex: 1, alignItems: 'center', flexDirection: 'row' },
  stepCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  stepLine: { height: 2, flex: 1, marginHorizontal: 6, borderRadius: 1 },
});


