import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserRole } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleChange'>;

interface RoleOption {
  role: UserRole;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  requiresVerification: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'beginner',
    label: 'Beginner / New Diver',
    subtitle: 'Just starting out, looking for instructors.',
    icon: 'person-outline',
    color: Colors.emerald,
    requiresVerification: false,
  },
  {
    role: 'certified',
    label: 'Certified Freediver',
    subtitle: 'I have a cert card and want to find dive buddies.',
    icon: 'ribbon-outline',
    color: Colors.primary,
    requiresVerification: true,
  },
  {
    role: 'instructor',
    label: 'Freediving Instructor',
    subtitle: 'I teach freediving and want to offer courses.',
    icon: 'school-outline',
    color: Colors.purple,
    requiresVerification: true,
  },
];

export default function RoleChangeScreen({ navigation }: Props) {
  const { profile, setProfile } = useAuthStore();
  const [selected, setSelected] = useState<UserRole>(profile?.role ?? 'beginner');
  const [saving, setSaving] = useState(false);
  const { visible, isLoading: modalLoading, config, showModal, handleConfirm: modalConfirm, handleCancel: modalCancel } = useAppModal();

  const currentRole = profile?.role ?? 'beginner';
  const isUnchanged = selected === currentRole;

  const handleConfirm = async () => {
    if (isUnchanged) {
      navigation.goBack();
      return;
    }

    const option = ROLE_OPTIONS.find((o) => o.role === selected);
    if (!option) return;

    if (option.requiresVerification) {
      showModal({
        type: 'confirm',
        title: 'Role Change',
        message: `Switching to ${option.label} requires you to complete a new profile setup and submit credentials for verification. Continue?`,
        confirmText: 'Continue',
        cancelText: 'Cancel',
        showCancel: true,
        onConfirm: () => applyRoleChange(selected),
      });
    } else {
      await applyRoleChange(selected);
    }
  };

  const applyRoleChange = async (newRole: UserRole) => {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ role: newRole, verification_status: newRole === 'beginner' ? 'none' : 'pending' })
      .eq('id', user.id)
      .select('*')
      .single();

    if (error || !updatedProfile) {
      showModal({ type: 'error', title: 'Error', message: 'Could not update role. Please try again.' });
      setSaving(false);
      return;
    }

    // Delete old role-specific data only after the role update succeeds
    if (currentRole === 'certified') {
      await supabase.from('certified_profiles').delete().eq('id', user.id);
    } else if (currentRole === 'instructor') {
      await supabase.from('instructor_profiles').delete().eq('id', user.id);
    }

    setProfile(updatedProfile);
    setSaving(false);

    if (newRole === 'beginner') {
      navigation.replace('BeginnerTabs');
    } else {
      navigation.replace('ProfileSetup', { role: newRole });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Role</Text>
            <View style={{ width: 42 }} />
          </View>
          <Text style={styles.headerSub}>Select your new role in the community</Text>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.currentLabel}>
          Current role: <Text style={styles.currentValue}>{currentRole}</Text>
        </Text>

        {ROLE_OPTIONS.map((option) => {
          const isActive = selected === option.role;
          const isCurrent = currentRole === option.role;
          return (
            <TouchableOpacity
              key={option.role}
              style={[
                styles.optionCard,
                isActive && { borderColor: option.color, backgroundColor: option.color + '08' },
              ]}
              onPress={() => setSelected(option.role)}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '18' }]}>
                <Ionicons name={option.icon as any} size={26} color={option.color} />
              </View>
              <View style={styles.optionBody}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionLabel, isActive && { color: option.color }]}>
                    {option.label}
                  </Text>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: option.color + '18' }]}>
                      <Text style={[styles.currentBadgeText, { color: option.color }]}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.optionSub}>{option.subtitle}</Text>
                {option.requiresVerification && (
                  <View style={styles.verifyNote}>
                    <Ionicons name="information-circle-outline" size={13} color={Colors.warning} />
                    <Text style={styles.verifyNoteText}>Requires credential verification</Text>
                  </View>
                )}
              </View>
              <View style={[styles.radio, isActive && { borderColor: option.color }]}>
                {isActive && <View style={[styles.radioDot, { backgroundColor: option.color }]} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.warningBox}>
          <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
          <Text style={styles.warningText}>
            Changing your role will reset your verification status. Certified and instructor roles require uploading credentials for review before you appear in search.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, (isUnchanged || saving) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>
                {isUnchanged ? 'No Changes' : 'Confirm Role Change'}
              </Text>
              {!isUnchanged && <Ionicons name="arrow-forward" size={18} color="#fff" />}
            </>
          )}
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
  headerSub: { fontSize: FontSize.sm, color: Colors.accentLight, paddingBottom: Spacing.sm },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    flexGrow: 1,
  },
  currentLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  currentValue: { color: Colors.text, fontWeight: '700', textTransform: 'capitalize' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: { flex: 1, gap: 3 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  optionLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  currentBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '700' },
  optionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
  verifyNote: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifyNoteText: { fontSize: 11, color: Colors.warning, fontWeight: '600' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  warningBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '12',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  warningText: { flex: 1, fontSize: FontSize.xs, color: Colors.text, lineHeight: 17 },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  confirmBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
