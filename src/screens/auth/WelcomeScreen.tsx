import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Hero */}
      <SafeAreaView style={styles.hero} edges={['top']}>
        <View style={styles.heroRing} />
        <View style={styles.heroContent}>
          <View style={styles.logoBadge}>
            <Ionicons name="water" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Buddyline</Text>
          <Text style={styles.heroTagline}>NEVER DIVE ALONE</Text>
          <Text style={styles.heroCopy}>
            Find trusted freediving buddies near you — fast, simple, and safe.
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
});
