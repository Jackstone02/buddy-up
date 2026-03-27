import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

const REASONS = [
  { key: 'fake_certification', label: 'Fake Certification', icon: 'ribbon-outline' },
  { key: 'harassment', label: 'Harassment', icon: 'hand-left-outline' },
  { key: 'unsafe_behavior', label: 'Unsafe Behavior', icon: 'warning-outline' },
  { key: 'inappropriate', label: 'Inappropriate Content', icon: 'alert-circle-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function ReportScreen({ navigation, route }: Props) {
  const { reportedId, reportedName } = route.params;
  const { profile } = useAuthStore();
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [blockUser, setBlockUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel: modalCancel } = useAppModal();

  const handleSubmit = async () => {
    if (!selectedReason) {
      showModal({ type: 'info', title: 'Select a Reason', message: 'Please choose a reason for your report.' });
      return;
    }
    if (!profile) return;

    setLoading(true);

    await supabase.from('reports').insert({
      reporter_id: profile.id,
      reported_id: reportedId,
      reason: selectedReason,
      details: details.trim() || null,
      status: 'open',
    });

    if (blockUser) {
      await supabase.from('blocks').upsert({
        blocker_id: profile.id,
        blocked_id: reportedId,
      });
    }

    setLoading(false);

    showModal({
      type: 'success',
      title: 'Report Submitted',
      message: blockUser
        ? `Thank you. ${reportedName} has been reported and blocked.`
        : `Thank you. We'll review your report shortly.`,
      onConfirm: () => navigation.goBack(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report User</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSub}>Reporting: {reportedName}</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>What is the issue?</Text>

        {REASONS.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.reasonCard, selectedReason === r.key && styles.reasonCardSelected]}
            onPress={() => setSelectedReason(r.key)}
          >
            <View style={[styles.reasonIcon, selectedReason === r.key && styles.reasonIconSelected]}>
              <Ionicons name={r.icon as any} size={20} color={selectedReason === r.key ? Colors.primary : Colors.textMuted} />
            </View>
            <Text style={[styles.reasonText, selectedReason === r.key && styles.reasonTextSelected]}>
              {r.label}
            </Text>
            <View style={[styles.radio, selectedReason === r.key && styles.radioSelected]}>
              {selectedReason === r.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Additional details (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Provide any additional context..."
          placeholderTextColor={Colors.textMuted}
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={3}
        />

        {/* Block option */}
        <TouchableOpacity
          style={styles.blockRow}
          onPress={() => setBlockUser(!blockUser)}
        >
          <View style={[styles.checkbox, blockUser && styles.checkboxChecked]}>
            {blockUser && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.blockInfo}>
            <Text style={styles.blockTitle}>Block this user</Text>
            <Text style={styles.blockDesc}>They will no longer appear in your searches</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (!selectedReason || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selectedReason || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="flag" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={visible}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={modalCancel}
        {...config}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.sm, color: Colors.accentLight },
  body: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    gap: Spacing.md,
  },
  reasonCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonIconSelected: { backgroundColor: Colors.primary + '18' },
  reasonText: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  reasonTextSelected: { fontWeight: '700', color: Colors.primaryDeep },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.error, borderColor: Colors.error },
  blockInfo: { flex: 1 },
  blockTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  blockDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
