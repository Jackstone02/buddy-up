import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const GOALS = ['Learn freediving', 'Spearfishing', 'Depth training', 'Pool training', 'General fitness'];

export default function ProfileSetupBeginnerScreen({ navigation }: Props) {
  const [cityRegion, setCityRegion] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  const toggleGoal = (g: string) => {
    setSelectedGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSave = async () => {
    if (!cityRegion.trim()) {
      showModal({ type: 'error', title: 'Required', message: 'Please enter your city or region.' });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ city_region: cityRegion.trim(), bio: bio.trim() })
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to save profile.' });
      setLoading(false);
      return;
    }

    setProfile(profile);
    navigation.replace('TermsOfService', { nextRoute: 'BeginnerTabs' });
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotDone]} />
        </View>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.headerTitle}>Set Up Your Profile</Text>
        <Text style={styles.headerSub}>Tell the community a bit about yourself</Text>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>City / Region *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Cebu City, Philippines"
              placeholderTextColor={Colors.textMuted}
              value={cityRegion}
              onChangeText={setCityRegion}
            />
          </View>
          <Text style={styles.hint}>We use city/region only — no GPS tracking.</Text>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>My Goals</Text>
          <View style={styles.chipRow}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, selectedGoals.includes(g) && styles.chipSelected]}
                onPress={() => toggleGoal(g)}
              >
                <Text style={[styles.chipText, selectedGoals.includes(g) && styles.chipTextSelected]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Short Bio (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell others about yourself..."
            placeholderTextColor={Colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={visible}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...config}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    overflow: 'hidden',
  },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepDotDone: { backgroundColor: Colors.accent },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', maxWidth: 28 },
  stepLineDone: { backgroundColor: Colors.accent },
  stepLabel: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '700', marginBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSub: { fontSize: FontSize.sm, color: Colors.accentLight, marginTop: 4 },
  form: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: FontSize.md, color: Colors.text },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700', letterSpacing: 0.5 },
});
