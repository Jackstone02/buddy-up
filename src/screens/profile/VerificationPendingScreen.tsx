import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'VerificationPending'>;

const SAFETY_KEY = '@buddyup:safetyAccepted';

export default function VerificationPendingScreen({ navigation }: Props) {
  const { profile, setProfile, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!profile) return;

    // Poll for verification status change using Supabase realtime
    const channel = supabase
      .channel('verification-watch')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        async (payload) => {
          const updated = payload.new as any;
          if (updated.verification_status === 'verified') {
            setProfile({ ...profile, ...updated });

            const safetyVal = await AsyncStorage.getItem(SAFETY_KEY);
            const safetyOk = safetyVal === 'true';
            const nextRoute = profile.role === 'instructor' ? 'InstructorTabs' : 'CertifiedTabs';

            if (safetyOk) {
              navigation.replace(nextRoute);
            } else {
              navigation.replace('Safety', { nextRoute });
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigation.replace('Welcome');
  };

  const STEPS = [
    { icon: 'cloud-upload-outline', title: 'Documents submitted', done: true },
    { icon: 'search-outline', title: 'Under review', done: false },
    { icon: 'checkmark-circle-outline', title: 'Verification complete', done: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.iconCircle}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
        <Text style={styles.headerTitle}>Verification Pending</Text>
        <Text style={styles.headerSub}>
          Your documents are under review.{'\n'}This helps keep our community safe.
        </Text>
      </SafeAreaView>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What happens next?</Text>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.stepIcon, s.done && styles.stepIconDone]}>
                <Ionicons name={s.icon as any} size={18} color={s.done ? '#fff' : Colors.textMuted} />
              </View>
              <Text style={[styles.stepText, s.done && styles.stepTextDone]}>{s.title}</Text>
              {s.done && <Ionicons name="checkmark" size={16} color={Colors.success} />}
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            You can explore the app while waiting. We'll automatically take you to the app when verified — no need to check back.
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This app connects people only — it does not supervise dives.
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.accentLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: { backgroundColor: Colors.primary },
  stepText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  stepTextDone: { color: Colors.text, fontWeight: '600' },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '12',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 18 },
  disclaimer: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  signOutText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
});
