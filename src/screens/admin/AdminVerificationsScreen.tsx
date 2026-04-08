import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function parseCredentialUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [raw];
}

export default function AdminVerificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<{ userId: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  useFocusEffect(
    useCallback(() => {
      fetchPending();
    }, [])
  );

  const fetchPending = async () => {
    setLoading(true);

    // Fetch instructor pending verifications
    const { data: instructorRows } = await supabase
      .from('instructor_profiles')
      .select('*, profile:profiles!id(*)')
      .eq('profiles.verification_status', 'pending');

    // Fetch certified pending verifications
    const { data: certifiedRows } = await supabase
      .from('certified_profiles')
      .select('*, profile:profiles!id(*)')
      .eq('profiles.verification_status', 'pending');

    const combined = [
      ...(instructorRows || []).map((r: any) => ({ ...r, type: 'instructor' })),
      ...(certifiedRows || []).map((r: any) => ({ ...r, type: 'certified' })),
    ].sort(
      (a, b) =>
        new Date(b.profile?.created_at ?? 0).getTime() -
        new Date(a.profile?.created_at ?? 0).getTime()
    );

    setItems(combined);
    setLoading(false);
  };

  const handleApprove = (userId: string, name: string) => {
    showModal({
      type: 'confirm',
      title: 'Approve User',
      message: `Verify ${name}? They will appear in search results.`,
      confirmText: 'Verify',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => applyDecision(userId, 'verified', null),
    });
  };

  const handleReject = (userId: string, name: string) => {
    setRejectReason('');
    setRejectTarget({ userId, name });
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await applyDecision(rejectTarget.userId, 'rejected', rejectReason.trim() || null);
    setRejectTarget(null);
  };

  const applyDecision = async (userId: string, decision: 'verified' | 'rejected', reason: string | null) => {
    const update: any = { verification_status: decision };
    if (decision === 'rejected' && reason) update.rejection_reason = reason;

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId);

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Could not update verification status.' });
      return;
    }

    setItems((prev) => prev.filter((i) => i.profile?.id !== userId));
    showModal({
      type: decision === 'verified' ? 'success' : 'info',
      title: decision === 'verified' ? 'Approved' : 'Rejected',
      message: decision === 'verified'
        ? 'User is now verified and will appear in search.'
        : 'User has been rejected and notified.',
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: any }) => {
    const p = item.profile;
    const isInstructor = p?.role === 'instructor';
    const subProfile = isInstructor ? item.instructor_profile : item.certified_profile;
    const initials = p?.display_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';
    const roleColor = p?.role === 'instructor' ? Colors.purple : p?.role === 'certified' ? Colors.primary : Colors.emerald;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: roleColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.cardHeaderBody}>
            <Text style={styles.cardName}>{p?.display_name ?? 'Unknown'}</Text>
            <Text style={styles.cardMeta}>{p?.city_region || 'No location'}</Text>
            <View style={[styles.rolePill, { backgroundColor: roleColor + '18' }]}>
              <Text style={[styles.rolePillText, { color: roleColor }]}>
                {p?.role ?? ''}
              </Text>
            </View>
          </View>
          <Text style={styles.timeText}>{formatDate(p?.created_at ?? '')}</Text>
        </View>

        {/* Sub-profile details */}
        {subProfile && (
          <View style={styles.detailsBox}>
            {isInstructor ? (
              <>
                <DetailRow icon="location-outline" label="Location" val={subProfile.teaching_location} />
                <DetailRow icon="business-outline" label="Agencies" val={(subProfile.agencies || []).join(', ')} />
                <DetailRow icon="ribbon-outline" label="Certs Offered" val={(subProfile.certs_offered || []).join(', ')} />
                <DetailRow icon="time-outline" label="Years Teaching" val={`${subProfile.years_teaching} years`} />
              </>
            ) : (
              <>
                <DetailRow icon="ribbon-outline" label="Cert Level" val={subProfile.cert_level} />
                <DetailRow icon="business-outline" label="Agency" val={subProfile.agency} />
                <DetailRow icon="time-outline" label="Experience" val={`${subProfile.years_experience} years`} />
                <DetailRow icon="water-outline" label="Disciplines" val={(subProfile.disciplines || []).join(', ')} />
              </>
            )}
          </View>
        )}

        {/* Credentials link */}
        {(() => {
          const urls = parseCredentialUrls(subProfile?.credentials_url || subProfile?.cert_card_url);
          if (urls.length === 0) return null;
          return (
            <TouchableOpacity
              style={styles.credentialsBtn}
              onPress={() => navigation.navigate('AdminUserDetail', { userId: p?.id })}
            >
              <Ionicons name="document-attach-outline" size={16} color={Colors.primary} />
              <Text style={styles.credentialsBtnText}>
                View Credentials ({urls.length} file{urls.length !== 1 ? 's' : ''})
              </Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          );
        })()}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(p?.id, p?.display_name ?? 'this user')}
          >
            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
            <Text style={[styles.actionBtnText, { color: Colors.error }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleApprove(p?.id, p?.display_name ?? 'this user')}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Verifications</Text>
            {items.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{items.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroSub}>Review pending credential submissions</Text>
        </SafeAreaView>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxl }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color={Colors.success} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySub}>No pending verifications.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Rejection reason modal */}
      <Modal
        visible={!!rejectTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectTarget(null)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.rejectModal}>
            <Text style={styles.rejectModalTitle}>Reject {rejectTarget?.name}</Text>
            <Text style={styles.rejectModalSub}>Optionally provide a reason (shown to the user):</Text>
            <TextInput
              style={styles.rejectInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. Credentials unclear, please resubmit"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.rejectModalActions}>
              <TouchableOpacity
                style={styles.rejectModalCancel}
                onPress={() => setRejectTarget(null)}
              >
                <Text style={styles.rejectModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectModalConfirm}
                onPress={confirmReject}
              >
                <Text style={styles.rejectModalConfirmText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppModal
        visible={visible}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...config}
      />
    </View>
  );
}

function DetailRow({ icon, label, val }: { icon: string; label: string; val: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={14} color={Colors.textMuted} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailVal} numberOfLines={1}>{val || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { backgroundColor: Colors.primaryDeep, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.md, paddingBottom: 4 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF' },
  badge: {
    backgroundColor: Colors.warning,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: FontSize.xs, color: Colors.accentLight, paddingBottom: Spacing.sm },
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  cardHeaderBody: { flex: 1, gap: 3 },
  cardName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  cardMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  rolePill: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rolePillText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  timeText: { fontSize: 10, color: Colors.textMuted, textAlign: 'right' },
  detailsBox: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', width: 80 },
  detailVal: { flex: 1, fontSize: FontSize.xs, color: Colors.text },
  credentialsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  credentialsBtnText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingTop: 0 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  rejectBtn: {
    backgroundColor: Colors.error + '12',
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  rejectModal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    gap: Spacing.md,
  },
  rejectModalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  rejectModalSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  rejectInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rejectModalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  rejectModalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rejectModalCancelText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  rejectModalConfirm: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  rejectModalConfirmText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
});
