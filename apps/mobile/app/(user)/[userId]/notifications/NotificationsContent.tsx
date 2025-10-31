import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Image } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export default function NotificationsContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    primaryText: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#1F2937' : '#E5E7EB',
    card: isDark ? '#0B1220' : '#F8FAFC',
    accent: '#3B82F6',
    danger: '#EF4444',
  };

  // Theme-aware confirm button background and border (pill style)
  const confirmBg = isDark ? '#1E3A8A' : '#E0ECFF';
  const confirmBorder = isDark ? '#1D4ED8' : '#BFDBFE';

  const Row = ({
    avatar,
    title,
    subtitle,
    right,
  }: {
    avatar: string;
    title: string | React.ReactNode;
    subtitle?: string;
    right?: React.ReactNode;
  }) => (
    <View style={styles.row}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.rowText}>
        {typeof title === 'string' ? (
          <Text style={[styles.rowTitle, { color: colors.primaryText }]}>{title}</Text>
        ) : (
          title
        )}
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  const PrimaryBtn = ({ label }: { label: string }) => (
    <Pressable
      style={({ pressed }) => [
        styles.primaryCta,
        {
          backgroundColor: confirmBg,
          shadowColor: colors.accent,
          borderWidth: 1,
          borderColor: confirmBorder,
        },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.primaryCtaText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        {label}
      </Text>
    </Pressable>
  );

  const SecondaryBtn = ({ label }: { label: string }) => (
    <Pressable style={({ pressed }) => [styles.secondaryCta, { backgroundColor: isDark ? '#111827' : '#E5E7EB' }, pressed && { opacity: 0.9 }]}>
      <Text style={[styles.secondaryCtaText, { color: colors.primaryText }]}>{label}</Text>
    </Pressable>
  );

  const DeleteIconButton = () => (
    <Pressable style={({ pressed }) => [
      styles.deleteIconBtn,
      {
        backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
        borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
      },
      pressed && { opacity: 0.85 }
    ]}>
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Path d="M13.6977 7.75L13.35 14.35C13.294 15.4201 12.416 16.25 11.353 16.25H6.64804C5.58404 16.25 4.70703 15.42 4.65103 14.35L4.30334 7.75" stroke={colors.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M2.75 4.75H15.25" stroke={colors.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M6.75 4.75V2.75C6.75 2.2 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.2 11.25 2.75V4.75" stroke={colors.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </Pressable>
  );

  const FollowingPill = () => (
    <View style={[styles.followingPill, { backgroundColor: isDark ? '#111827' : '#F3F4F6' }]}> 
      <Text style={[styles.followingPillText, { color: colors.primaryText }]}>Following</Text>
    </View>
  );

  const PostPreview = ({ imageUri, text }: { imageUri?: string; text?: string }) => (
    <View style={[styles.postPreview, { borderColor: colors.border, backgroundColor: isDark ? '#0B1220' : '#FFFFFF' }]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.postPreviewImage} />
      ) : (
        <Text style={[styles.postPreviewText, { color: colors.primaryText }]} numberOfLines={3}>{text}</Text>
      )}
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Section: Last 30 days */}
      <Text style={[styles.sectionHeader, { color: colors.primaryText }]}>Last 30 days</Text>

      {/* Info Card removed as per request */}

      {/* Follow requests */}
      <Row
        avatar={`https://i.pravatar.cc/100?u=radhika_kapoor`}
        title={<Text style={{ fontSize: 15, fontWeight: '600', color: '#000000' }}>radhika_kapoor</Text>}
        subtitle="requested to follow you. 3w"
        right={
          <View style={styles.ctaRow}>
            <PrimaryBtn label="Confirm" />
            <DeleteIconButton />
          </View>
        }
      />
      <Row
        avatar={`https://i.pravatar.cc/100?u=pramod_enterprises`}
        title={<Text style={{ fontSize: 15, fontWeight: '600', color: '#000000' }}>pramod_enterprises</Text>}
        subtitle="requested to follow you. 3w"
        right={
          <View style={styles.ctaRow}>
            <PrimaryBtn label="Confirm" />
            <DeleteIconButton />
          </View>
        }
      />

      {/* Section: Older */}
      <Text style={[styles.sectionHeader, { color: colors.primaryText, marginTop: 18 }]}>Older</Text>

      <Row
        avatar={`https://i.pravatar.cc/100?u=aman_trivedi`}
        title={<Text style={{ fontSize: 15 }}><Text style={{ fontWeight: '600', color: '#000000' }}>aman_trivedi </Text><Text style={{ color: colors.primaryText }}>started following you.</Text></Text>}
        right={<FollowingPill />}
      />

      <View style={styles.row}> 
        <Image source={{ uri: `https://i.pravatar.cc/100?u=devesh_poojary` }} style={styles.avatar} />
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.primaryText }]}><Text style={{ fontWeight: '600', color: '#000000' }}>Vishnu Vardhan</Text> liked your story.</Text>
          <Text style={[styles.rowSubtitle, { color: colors.secondaryText }]}>6w</Text>
        </View>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=200&auto=format&fit=crop' }} style={styles.previewThumb} />
      </View>

      {['sanjay_clicks', 'mayur_shetty'].map((name) => (
        <Row
          key={name}
          avatar={`https://i.pravatar.cc/100?u=${name}`}
          title={<Text style={{ fontSize: 15 }}><Text style={{ fontWeight: '600', color: '#000000' }}>{name.replace('_', ' ')} </Text><Text style={{ color: colors.primaryText }}>started following you.</Text></Text>}
          right={<FollowingPill />}
        />
      ))}

      {/* Comment UI with image post preview */}
      <View style={styles.row}>
        <Image source={{ uri: `https://i.pravatar.cc/100?u=ananya_verma` }} style={styles.avatar} />
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.primaryText }]}><Text style={{ fontWeight: '600', color: '#000000' }}>ananya_verma</Text> commented on your post</Text>
          <Text style={[styles.previewText, { color: colors.primaryText, marginTop: 8 }]}>Absolutely love this shot! 🇮🇳✨</Text>
          <PostPreview imageUri={'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop'} />
        </View>
      </View>

      {/* Comment UI with text post preview */}
      <View style={styles.row}>
        <Image source={{ uri: `https://i.pravatar.cc/100?u=rahul_kumar` }} style={styles.avatar} />
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.primaryText }]}><Text style={{ fontWeight: '600', color: '#000000' }}>rahul_kumar</Text> commented on your post</Text>
          <Text style={[styles.previewText, { color: colors.primaryText, marginTop: 8 }]}>Proud moment! Jai Hind! 🇮🇳</Text>
          <PostPreview text={'“When you feel the tricolour flying high, the pride is unmatched.”'} />
        </View>
      </View>

      {/* New post + comment thread UI */}
      <View style={styles.row}>
        <Image source={{ uri: `https://i.pravatar.cc/100?u=riya_sharma` }} style={styles.avatar} />
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.primaryText }]}><Text style={{ fontWeight: '600', color: '#000000' }}>riya_sharma</Text> created a new post</Text>
          <PostPreview imageUri={'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=900&auto=format&fit=crop'} />
          <View style={[styles.commentBubble, { borderColor: colors.border, backgroundColor: isDark ? '#0F172A' : '#F3F4F6' }]}> 
            <Text style={[styles.commentAuthor, { color: colors.primaryText }]}>yash_gupta</Text>
            <Text style={[styles.commentText, { color: colors.primaryText }]}>Looks awesome! Keep it up 👏</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 19,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  infoCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

  },
  primaryCta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryCta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '800',
  },
  deleteIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  followingPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  followingPillText: {
    fontSize: 14,
    fontWeight: '800',
  },
  previewThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 20,
  },
  postPreview: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  postPreviewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  postPreviewText: {
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  commentBubble: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
  },
});


