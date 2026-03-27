import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
// DEMO MODE — remove these imports when Supabase is live
import { DEMO_IDS, DEMO_PROFILES, DEMO_CERTIFIED_PROFILE, DEMO_INSTRUCTOR_PROFILE } from '../../lib/mockData';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  // DEMO MODE — remove this block when Supabase is live
  const { setProfile, setCertifiedProfile, setInstructorProfile, setDemoMode } = useAuthStore();
  const handleDemoLogin = (role: 'beginner' | 'certified' | 'instructor' | 'admin') => {
    if (role === 'admin') {
      setProfile(DEMO_PROFILES[DEMO_IDS.admin]);
      setDemoMode(true);
      navigation.replace('AdminTabs');
      return;
    }
    setProfile(DEMO_PROFILES[DEMO_IDS[role]]);
    if (role === 'certified') setCertifiedProfile(DEMO_CERTIFIED_PROFILE);
    if (role === 'instructor') setInstructorProfile(DEMO_INSTRUCTOR_PROFILE);
    setDemoMode(true);
    if (role === 'beginner') navigation.replace('BeginnerTabs');
    else if (role === 'certified') navigation.replace('CertifiedTabs');
    else navigation.replace('InstructorTabs');
  };
  // END DEMO MODE

  return (
    <View style={styles.container}>
      {/* Hero */}
      <SafeAreaView style={styles.hero} edges={['top']}>
        <View style={styles.heroRing} />
        <View style={styles.heroContent}>
          <View style={styles.logoBadge}>
            <Ionicons name="water" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Buddy Up</Text>
          <Text style={styles.heroTagline}>NEVER DIVE ALONE</Text>
          <Text style={styles.heroCopy}>
            Connect with verified freedivers and certified instructors near you.
          </Text>
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text style={styles.signInBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>

        {/* DEMO MODE — remove this section when Supabase is live */}
        <View style={styles.demoSection}>
          <View style={styles.demoDividerRow}>
            <View style={styles.demoDividerLine} />
            <Text style={styles.demoDividerLabel}>DEMO MODE</Text>
            <View style={styles.demoDividerLine} />
          </View>
          <Text style={styles.demoHint}>Explore without signing up</Text>
          <View style={styles.demoRow}>
            {([
              { role: 'beginner' as const,   label: 'Beginner',   color: Colors.emerald },
              { role: 'certified' as const,  label: 'Certified',  color: Colors.primary },
              { role: 'instructor' as const, label: 'Instructor', color: Colors.purple },
              { role: 'admin' as const,      label: 'Admin',      color: Colors.error },
            ]).map(({ role, label, color }) => (
              <TouchableOpacity
                key={role}
                style={[styles.demoBtn, { borderColor: color }]}
                onPress={() => handleDemoLogin(role)}
                activeOpacity={0.8}
              >
                <Text style={[styles.demoBtnText, { color }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* END DEMO MODE */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroRing: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  heroContent: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FFFFFF40',
  },
  heroTitle: {
    fontSize: FontSize.xxxl + 4,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  heroTagline: {
    fontSize: 11,
    color: Colors.accent,
    letterSpacing: 4,
    marginTop: 10,
    fontWeight: '600',
  },
  heroCopy: {
    fontSize: FontSize.sm,
    color: '#FFFFFFAA',
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 20,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700', letterSpacing: 0.5 },
  signInBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  signInText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  signInBold: { color: Colors.primary, fontWeight: '700' },
  // DEMO MODE styles
  demoSection: { marginTop: Spacing.xs },
  demoDividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  demoDividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  demoDividerLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2 },
  demoHint: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.sm },
  demoRow: { flexDirection: 'row', gap: Spacing.sm },
  demoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  demoBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
});
