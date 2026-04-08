import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ROLE_COLORS: Record<string, string> = {
  beginner:   Colors.emerald,
  certified:  Colors.primary,
  instructor: Colors.purple,
  admin:      Colors.error,
};

const STATUS_COLORS: Record<string, string> = {
  none:     Colors.textMuted,
  pending:  Colors.warning,
  verified: Colors.success,
  rejected: Colors.error,
};

export default function AdminOverviewScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [openReportCount, setOpenReportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [profile])
  );

  const fetchUsers = async () => {
    if (!profile) return;
    setLoading(true);

    const [{ data: profilesData }, { count: reportCount }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    setUsers(profilesData || []);
    setOpenReportCount(reportCount ?? 0);
    setLoading(false);
  };

  const pendingCount = users.filter((u) => u.verification_status === 'pending').length;
  const totalInstructors = users.filter((u) => u.role === 'instructor').length;
  const totalCertified = users.filter((u) => u.role === 'certified').length;
  const totalBeginner = users.filter((u) => u.role === 'beginner').length;

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.city_region?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleSignOut = () => {
    showModal({
      type: 'confirm',
      title: 'Sign Out',
      message: 'Sign out of admin account?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        await supabase.auth.signOut();
        useAuthStore.getState().clearAuth();
        navigation.replace('Welcome');
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Admin Panel</Text>
              <Text style={styles.heroSub}>Buddyline Management</Text>
            </View>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={Colors.accentLight} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '0D' }]}>
            <Text style={[styles.statNum, { color: Colors.warning }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: Colors.warning }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderColor: Colors.purple + '60', backgroundColor: Colors.purple + '0D' }]}>
            <Text style={[styles.statNum, { color: Colors.purple }]}>{totalInstructors}</Text>
            <Text style={[styles.statLabel, { color: Colors.purple }]}>Instructors</Text>
          </View>
          <View style={[styles.statCard, { borderColor: Colors.primary + '60', backgroundColor: Colors.primary + '0D' }]}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>{totalCertified}</Text>
            <Text style={[styles.statLabel, { color: Colors.primary }]}>Certified</Text>
          </View>
          <View style={[styles.statCard, { borderColor: Colors.emerald + '60', backgroundColor: Colors.emerald + '0D' }]}>
            <Text style={[styles.statNum, { color: Colors.emerald }]}>{totalBeginner}</Text>
            <Text style={[styles.statLabel, { color: Colors.emerald }]}>Beginners</Text>
          </View>
          <View style={[styles.statCard, { borderColor: Colors.error + '60', backgroundColor: Colors.error + '0D', width: '100%' }]}>
            <Text style={[styles.statNum, { color: Colors.error }]}>{openReportCount}</Text>
            <Text style={[styles.statLabel, { color: Colors.error }]}>Open Reports</Text>
          </View>
        </View>

        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() => navigation.navigate('AdminTabs')}
            activeOpacity={0.85}
          >
            <Ionicons name="time-outline" size={20} color={Colors.warning} />
            <Text style={styles.pendingBannerText}>
              {pendingCount} verification{pendingCount > 1 ? 's' : ''} awaiting review
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
          </TouchableOpacity>
        )}

        {openReportCount > 0 && (
          <TouchableOpacity
            style={[styles.pendingBanner, { backgroundColor: Colors.error + '18', borderColor: Colors.error + '50' }]}
            onPress={() => navigation.navigate('AdminTabs')}
            activeOpacity={0.85}
          >
            <Ionicons name="flag-outline" size={20} color={Colors.error} />
            <Text style={[styles.pendingBannerText, { color: Colors.error }]}>
              {openReportCount} open report{openReportCount > 1 ? 's' : ''} need review
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.error} />
          </TouchableOpacity>
        )}

        {/* User list */}
        <Text style={styles.sectionTitle}>All Users</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          filtered.map((u) => {
            const roleColor = ROLE_COLORS[u.role] ?? Colors.textMuted;
            const statusColor = STATUS_COLORS[u.verification_status] ?? Colors.textMuted;
            return (
              <TouchableOpacity
                key={u.id}
                style={styles.userCard}
                onPress={() => navigation.navigate('AdminUserDetail', { userId: u.id })}
                activeOpacity={0.85}
              >
                <View style={[styles.userAvatar, { backgroundColor: roleColor }]}>
                  <Text style={styles.userAvatarText}>
                    {u.display_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'}
                  </Text>
                </View>
                <View style={styles.userBody}>
                  <Text style={styles.userName}>{u.display_name}</Text>
                  <Text style={styles.userRegion}>{u.city_region || 'No location'}</Text>
                </View>
                <View style={styles.userMeta}>
                  <View style={[styles.pill, { backgroundColor: roleColor + '18', borderColor: roleColor + '50' }]}>
                    <Text style={[styles.pillText, { color: roleColor }]}>{u.role}</Text>
                  </View>
                  {u.verification_status !== 'none' && (
                    <View style={[styles.pill, { backgroundColor: statusColor + '18', borderColor: statusColor + '50' }]}>
                      <Text style={[styles.pillText, { color: statusColor }]}>{u.verification_status}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

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
  hero: { backgroundColor: Colors.primaryDeep, paddingBottom: Spacing.lg },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: FontSize.xs, color: Colors.accentLight, marginTop: 3 },
  signOutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    gap: 2,
  },
  statNum: { fontSize: FontSize.xxl, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '18',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '50',
  },
  pendingBannerText: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: Colors.warning },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  userBody: { flex: 1 },
  userName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  userRegion: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  userMeta: { alignItems: 'flex-end', gap: 4 },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});
