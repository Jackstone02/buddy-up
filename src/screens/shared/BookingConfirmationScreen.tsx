import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BookingConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();

  const goHome = () => {
    if (profile?.role === 'certified') navigation.navigate('CertifiedTabs');
    else navigation.navigate('BeginnerTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
        </View>
        <Text style={styles.title}>Booking Requested!</Text>
        <Text style={styles.sub}>
          Your booking is pending confirmation. The instructor will review your request and get back to you shortly.
        </Text>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            You will receive a message once the instructor confirms or declines your session.
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={goHome}
        >
          <Text style={styles.primaryBtnText}>View My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={goHome}
        >
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.primary,
    lineHeight: 20,
  },
  actions: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
});
