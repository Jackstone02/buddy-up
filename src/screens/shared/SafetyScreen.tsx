import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Safety'>;

const SAFETY_KEY = '@buddyup:safetyAccepted';

const RULES = [
  {
    icon: 'people',
    color: Colors.error,
    title: 'Never dive alone',
    desc: 'Always have a trained, attentive buddy present for every dive.',
  },
  {
    icon: 'school',
    color: Colors.primary,
    title: 'Stay within your training',
    desc: 'Do not attempt depths, times, or techniques beyond your current certification.',
  },
  {
    icon: 'phone-portrait-outline',
    color: Colors.accent,
    title: 'This app connects — it does not supervise',
    desc: 'Buddy Up facilitates connections only. We do not monitor dives or provide emergency services.',
  },
  {
    icon: 'heart-outline',
    color: Colors.success,
    title: 'Know emergency protocols',
    desc: 'Always know the nearest emergency contact and how to perform rescue breathing.',
  },
];

export default function SafetyScreen({ navigation, route }: Props) {
  const { nextRoute } = route.params;
  const { setSafetyAccepted } = useAuthStore();

  const handleAccept = async () => {
    await AsyncStorage.setItem(SAFETY_KEY, 'true');
    setSafetyAccepted(true);
    navigation.replace(nextRoute);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.accent} />
        </View>
        <Text style={styles.headerTitle}>Safety First</Text>
        <Text style={styles.headerSub}>
          Please read and accept these safety guidelines before continuing.
        </Text>
      </SafeAreaView>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {RULES.map((r, i) => (
          <View key={i} style={styles.ruleCard}>
            <View style={[styles.ruleIcon, { backgroundColor: r.color + '18' }]}>
              <Ionicons name={r.icon as any} size={22} color={r.color} />
            </View>
            <View style={styles.ruleText}>
              <Text style={styles.ruleTitle}>{r.title}</Text>
              <Text style={styles.ruleDesc}>{r.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            By continuing, you acknowledge that freediving carries inherent risks. You are solely responsible for your own dive planning, safety, and decision-making. Buddy Up provides no guarantee of safety and assumes no liability for incidents that occur during dives arranged through this app.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAccept} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>I Understand — Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  headerSub: { fontSize: FontSize.sm, color: Colors.accentLight, textAlign: 'center', lineHeight: 20 },
  body: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  bodyContent: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  ruleCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleText: { flex: 1 },
  ruleTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  ruleDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  disclaimerBox: {
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700', letterSpacing: 0.5 },
});
