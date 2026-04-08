import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminUserDetail'>;

function parseCredentialUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [raw];
}

const STATUS_COLORS: Record<string, string> = {
  none:     Colors.textMuted,
  pending:  Colors.warning,
  verified: Colors.success,
  rejected: Colors.error,
};

export default function AdminUserDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { profile: adminProfile } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [subProfile, setSubProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { visible, isLoading: modalLoading, config, showModal, handleConfirm: modalConfirm, handleCancel: modalCancel } = useAppModal();

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setUser(profileData);

    if (profileData?.role === 'instructor') {
      const { data } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setSubProfile(data);
    } else if (profileData?.role === 'certified') {
      const { data } = await supabase
        .from('certified_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setSubProfile(data);
    }

    setLoading(false);
  };

  const updateStatus = async (status: 'verified' | 'rejected') => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: status })
      .eq('id', userId);

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Could not update status.' });
    } else {
      setUser((prev: any) => ({ ...prev, verification_status: status }));
      showModal({ type: 'success', title: 'Updated', message: `User status set to ${status}.` });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <Text style={{ color: Colors.text }}>User not found.</Text>
      </SafeAreaView>
    );
  }

  const ROLE_COLORS: Record<string, string> = {
    beginner:   Colors.emerald,
    certified:  Colors.primary,
    instructor: Colors.purple,
    admin:      Colors.error,
  };
  const initials = user.display_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  const roleColor = ROLE_COLORS[user.role] ?? Colors.primary;
  const statusColor = STATUS_COLORS[user.verification_status] ?? Colors.textMuted;
  const credentialUrls = parseCredentialUrls(subProfile?.credentials_url || subProfile?.cert_card_url);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Detail</Text>
            <View style={{ width: 42 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.identityCard}>
          <View style={[styles.avatar, { backgroundColor: roleColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user.display_name}</Text>
          <Text style={styles.userRegion}>{user.city_region || 'No location'}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '18', borderColor: roleColor + '50' }]}>
              <Text style={[styles.roleBadgeText, { color: roleColor }]}>{user.role}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '18', borderColor: statusColor + '50' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{user.verification_status}</Text>
            </View>
          </View>
        </View>

        {/* Profile details */}
        {subProfile && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {user.role === 'instructor' ? 'Instructor Details' : 'Certification Details'}
            </Text>
            {user.role === 'instructor' ? (
              <>
                <InfoRow icon="location-outline" label="Teaching Location" val={subProfile.teaching_location} />
                <InfoRow icon="business-outline" label="Agencies" val={(subProfile.agencies || []).join(', ')} />
                <InfoRow icon="ribbon-outline" label="Certs Offered" val={(subProfile.certs_offered || []).join(', ')} />
                <InfoRow icon="time-outline" label="Years Teaching" val={`${subProfile.years_teaching} yrs`} />
              </>
            ) : (
              <>
                <InfoRow icon="ribbon-outline" label="Cert Level" val={subProfile.cert_level} />
                <InfoRow icon="business-outline" label="Agency" val={subProfile.agency} />
                <InfoRow icon="time-outline" label="Experience" val={`${subProfile.years_experience} yrs`} />
                <InfoRow icon="water-outline" label="Disciplines" val={(subProfile.disciplines || []).join(', ')} />
              </>
            )}
          </View>
        )}

        {/* Credentials documents */}
        {credentialUrls.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Uploaded Credentials ({credentialUrls.length})
            </Text>
            {credentialUrls.map((url, i) => (
              <View key={url}>
                <Text style={styles.credentialLabel}>File {i + 1}</Text>
                <Image source={{ uri: url }} style={styles.credentialsImage} resizeMode="cover" />
              </View>
            ))}
          </View>
        )}

        {/* Admin actions */}
        {user.verification_status === 'pending' && (
          <View style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Verification Decision</Text>
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() =>
                  showModal({
                    type: 'confirm',
                    title: 'Reject User',
                    message: 'This will reject and notify the user.',
                    confirmText: 'Reject',
                    cancelText: 'Cancel',
                    showCancel: true,
                    onConfirm: () => updateStatus('rejected'),
                  })
                }
                disabled={saving}
              >
                <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                <Text style={[styles.actionBtnText, { color: Colors.error }]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() =>
                  showModal({
                    type: 'confirm',
                    title: 'Approve User',
                    message: 'This will verify the user.',
                    confirmText: 'Approve',
                    cancelText: 'Cancel',
                    showCancel: true,
                    onConfirm: () => updateStatus('verified'),
                  })
                }
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {user.verification_status === 'verified' && (
          <TouchableOpacity
            style={styles.revokeBtn}
            onPress={() =>
              showModal({
                type: 'confirm',
                title: 'Revoke Verification',
                message: 'Set this user back to pending?',
                confirmText: 'Revoke',
                cancelText: 'Cancel',
                showCancel: true,
                onConfirm: () => updateStatus('rejected'),
              })
            }
          >
            <Ionicons name="shield-outline" size={16} color={Colors.error} />
            <Text style={styles.revokeBtnText}>Revoke Verification</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <AppModal
        visible={visible}
        isLoading={modalLoading}
        onConfirm={modalConfirm}
        onCancel={modalCancel}
        {...config}
      />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, val }: { icon: string; label: string; val: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoVal}>{val || '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryDeep },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  identityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  avatarText: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  userRegion: { fontSize: FontSize.sm, color: Colors.textMuted },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  roleBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  roleBadgeText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  infoText: { flex: 1 },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  infoVal: { fontSize: FontSize.sm, color: Colors.text, marginTop: 1 },
  credentialLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginBottom: 4 },
  credentialsImage: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  actionBtnRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  rejectBtn: {
    backgroundColor: Colors.error + '12',
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  approveBtn: { backgroundColor: Colors.success },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.error + '40',
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  revokeBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.error },
});
