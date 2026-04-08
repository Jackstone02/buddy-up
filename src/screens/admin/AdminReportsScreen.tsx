import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
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

type ReportStatus = 'open' | 'resolved';

const STATUS_TABS: { key: ReportStatus; label: string }[] = [
  { key: 'open',     label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
];

const ACTION_OPTIONS = [
  { key: 'no_action',     label: 'No action needed',       icon: 'checkmark-circle-outline' as const },
  { key: 'warned',        label: 'User warned',             icon: 'warning-outline' as const },
  { key: 'content_removed', label: 'Content removed',      icon: 'trash-outline' as const },
  { key: 'banned',        label: 'User banned',             icon: 'ban-outline' as const },
];

export default function AdminReportsScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<ReportStatus>('open');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveTarget, setResolveTarget] = useState<any | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('no_action');
  const [adminNote, setAdminNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [tab])
  );

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id(id, display_name, role, city_region),
        reported:profiles!reported_id(id, display_name, role, city_region)
      `)
      .eq('status', tab)
      .order('created_at', { ascending: false });

    setReports(data || []);
    setLoading(false);
  };

  const openResolveModal = (report: any) => {
    setResolveTarget(report);
    setSelectedAction('no_action');
    setAdminNote('');
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    setResolving(true);

    const { error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        details: resolveTarget.details
          ? `${resolveTarget.details}\n\n[Admin: ${ACTION_OPTIONS.find(a => a.key === selectedAction)?.label}${adminNote ? ` — ${adminNote}` : ''}]`
          : `[Admin: ${ACTION_OPTIONS.find(a => a.key === selectedAction)?.label}${adminNote ? ` — ${adminNote}` : ''}]`,
      })
      .eq('id', resolveTarget.id);

    setResolving(false);
    setResolveTarget(null);

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Could not resolve report. Please try again.' });
      return;
    }

    setReports(prev => prev.filter(r => r.id !== resolveTarget.id));
    showModal({ type: 'success', title: 'Report Resolved', message: 'The report has been marked as resolved.' });
  };

  const handleViewUser = (userId: string) => {
    setResolveTarget(null);
    navigation.navigate('AdminUserDetail', { userId });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderReport = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: Colors.error + '15' }]}>
          <Ionicons name="flag-outline" size={18} color={Colors.error} />
        </View>
        <View style={styles.cardHeaderBody}>
          <Text style={styles.reason}>{item.reason || 'No reason specified'}</Text>
          <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
        </View>
        {tab === 'open' && (
          <View style={styles.openBadge}>
            <Text style={styles.openBadgeText}>Open</Text>
          </View>
        )}
        {tab === 'resolved' && (
          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedBadgeText}>Resolved</Text>
          </View>
        )}
      </View>

      {/* People row */}
      <View style={styles.peopleRow}>
        {/* Reporter */}
        <TouchableOpacity
          style={styles.personCard}
          onPress={() => handleViewUser(item.reporter?.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.personAvatar, { backgroundColor: Colors.primary }]}>
            <Text style={styles.personAvatarText}>
              {item.reporter?.display_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personLabel}>Reporter</Text>
            <Text style={styles.personName} numberOfLines={1}>{item.reporter?.display_name ?? 'Unknown'}</Text>
            <Text style={styles.personRole}>{item.reporter?.role ?? '—'}</Text>
          </View>
        </TouchableOpacity>

        <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />

        {/* Reported */}
        <TouchableOpacity
          style={styles.personCard}
          onPress={() => handleViewUser(item.reported?.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.personAvatar, { backgroundColor: Colors.error }]}>
            <Text style={styles.personAvatarText}>
              {item.reported?.display_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personLabel}>Reported</Text>
            <Text style={styles.personName} numberOfLines={1}>{item.reported?.display_name ?? 'Unknown'}</Text>
            <Text style={styles.personRole}>{item.reported?.role ?? '—'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Details */}
      {item.details ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>{item.details}</Text>
        </View>
      ) : null}

      {/* Resolve button — open only */}
      {tab === 'open' && (
        <TouchableOpacity
          style={styles.resolveBtn}
          onPress={() => openResolveModal(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
          <Text style={styles.resolveBtnText}>Review & Resolve</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Reports</Text>
            {reports.length > 0 && tab === 'open' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{reports.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroSub}>Review and action user reports</Text>
        </SafeAreaView>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {STATUS_TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxl }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="flag-outline" size={40} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No {tab} reports</Text>
              <Text style={styles.emptySub}>
                {tab === 'open' ? 'All reports have been reviewed.' : 'No resolved reports yet.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Resolve modal */}
      <Modal
        visible={!!resolveTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setResolveTarget(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.resolveModal}>
            <View style={styles.resolveModalHeader}>
              <Text style={styles.resolveModalTitle}>Resolve Report</Text>
              <TouchableOpacity onPress={() => setResolveTarget(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.resolveModalSub}>
              Reported user: <Text style={{ fontWeight: '700', color: Colors.text }}>{resolveTarget?.reported?.display_name}</Text>
            </Text>

            <Text style={styles.actionLabel}>Action taken</Text>
            {ACTION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.actionOption, selectedAction === opt.key && styles.actionOptionSelected]}
                onPress={() => setSelectedAction(opt.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={selectedAction === opt.key ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.actionOptionText, selectedAction === opt.key && styles.actionOptionTextSelected]}>
                  {opt.label}
                </Text>
                {selectedAction === opt.key && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.actionLabel, { marginTop: Spacing.md }]}>Admin note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add an internal note about this decision..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <View style={styles.resolveModalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResolveTarget(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, resolving && { opacity: 0.6 }]}
                onPress={handleResolve}
                disabled={resolving}
              >
                {resolving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.confirmBtnText}>Mark Resolved</Text>
                }
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { backgroundColor: Colors.primaryDeep, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.md, paddingBottom: 4 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF' },
  badge: { backgroundColor: Colors.error, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: FontSize.xs, color: Colors.accentLight, paddingBottom: Spacing.sm },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },

  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  cardHeaderBody: { flex: 1 },
  reason: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  timestamp: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  openBadge: { backgroundColor: Colors.error + '15', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.error + '40' },
  openBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.error },
  resolvedBadge: { backgroundColor: Colors.success + '15', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.success + '40' },
  resolvedBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.success },

  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  personCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  personAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  personAvatarText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '800' },
  personInfo: { flex: 1 },
  personLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  personName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  personRole: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'capitalize' },

  detailsBox: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },

  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    marginTop: 0,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  resolveBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },

  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  // Resolve modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  resolveModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  resolveModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  resolveModalTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  resolveModalSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  actionOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  actionOptionText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  actionOptionTextSelected: { color: Colors.primary },
  noteInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  resolveModalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
});
