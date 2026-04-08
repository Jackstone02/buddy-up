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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Discipline } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentCoords } from '../../lib/location';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const CERT_LEVELS = ['AIDA 1', 'AIDA 2', 'AIDA 3', 'AIDA 4', 'SSI Level 1', 'SSI Level 2', 'SSI Level 3', 'PADI Freediver', 'PADI Advanced Freediver', 'Other'];
const DISCIPLINES: { key: Discipline; label: string }[] = [
  { key: 'pool', label: 'Pool' },
  { key: 'depth', label: 'Depth' },
  { key: 'spearfishing', label: 'Spearfishing' },
  { key: 'dynamic', label: 'Dynamic' },
  { key: 'static', label: 'Static' },
  { key: 'line_training', label: 'Line Training' },
];

export default function ProfileSetupCertifiedScreen({ navigation }: Props) {
  const [cityRegion, setCityRegion] = useState('');
  const [bio, setBio] = useState('');
  const [certLevel, setCertLevel] = useState('');
  const [agency, setAgency] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [certCardUri, setCertCardUri] = useState<string | null>(null);
  const [availableToDive, setAvailableToDive] = useState(false);
  const [showCertPicker, setShowCertPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const pickCertCard = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setCertCardUri(result.assets[0].uri);
    }
  };

  const uploadCertCard = async (userId: string): Promise<string | null> => {
    if (!certCardUri) return null;

    const response = await fetch(certCardUri);
    const blob = await response.blob();
    const ext = certCardUri.split('.').pop() || 'jpg';
    const path = `cert-cards/${userId}/cert.${ext}`;

    const { error } = await supabase.storage.from('buddyline').upload(path, blob, { upsert: true });
    if (error) return null;

    const { data } = supabase.storage.from('buddyline').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!cityRegion.trim() || !certLevel || !agency.trim()) {
      showModal({ type: 'error', title: 'Required Fields', message: 'Please fill in city/region, cert level, and agency.' });
      return;
    }
    if (!certCardUri) {
      showModal({ type: 'warning', title: 'Cert Card Required', message: 'Please upload a photo of your certification card.' });
      return;
    }
    if (disciplines.length === 0) {
      showModal({ type: 'warning', title: 'Select Disciplines', message: 'Please select at least one discipline.' });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const certCardUrl = await uploadCertCard(user.id);
    if (!certCardUrl) {
      showModal({ type: 'error', title: 'Upload Failed', message: 'Could not upload cert card. Please try again.' });
      setLoading(false);
      return;
    }

    const coords = await getCurrentCoords();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        city_region: cityRegion.trim(),
        bio: bio.trim(),
        available_to_dive: availableToDive,
        verification_status: 'pending',
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (profileError) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to save profile.' });
      setLoading(false);
      return;
    }

    await supabase.from('certified_profiles').upsert({
      id: user.id,
      cert_level: certLevel,
      agency: agency.trim(),
      years_experience: parseInt(yearsExperience) || 0,
      max_depth_m: parseInt(maxDepth) || null,
      disciplines,
      cert_card_url: certCardUrl,
    });

    setProfile(profile);
    navigation.replace('TermsOfService', { nextRoute: 'VerificationPending' });
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
        <Text style={styles.headerSub}>Verification required for buddy matching</Text>
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
          <Text style={styles.hint}>City/region only — no GPS tracking.</Text>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Certification Level *</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            onPress={() => setShowCertPicker(!showCertPicker)}
          >
            <Ionicons name="ribbon-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <Text style={[styles.input, { color: certLevel ? Colors.text : Colors.textMuted }]}>
              {certLevel || 'Select certification level'}
            </Text>
            <Ionicons name={showCertPicker ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          {showCertPicker && (
            <View style={styles.pickerList}>
              {CERT_LEVELS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pickerItem, certLevel === c && styles.pickerItemSelected]}
                  onPress={() => { setCertLevel(c); setShowCertPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, certLevel === c && styles.pickerItemTextSelected]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Certifying Agency *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="business-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. AIDA, SSI, PADI"
              placeholderTextColor={Colors.textMuted}
              value={agency}
              onChangeText={setAgency}
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Years of Experience</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="time-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              value={yearsExperience}
              onChangeText={setYearsExperience}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Max Depth (m)</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="arrow-down-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 30"
              placeholderTextColor={Colors.textMuted}
              value={maxDepth}
              onChangeText={setMaxDepth}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Disciplines *</Text>
          <View style={styles.chipRow}>
            {DISCIPLINES.map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[styles.chip, disciplines.includes(d.key) && styles.chipSelected]}
                onPress={() => toggleDiscipline(d.key)}
              >
                <Text style={[styles.chipText, disciplines.includes(d.key) && styles.chipTextSelected]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Short Bio (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell other divers about yourself..."
            placeholderTextColor={Colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />

          {/* Cert card upload */}
          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Certification Card Photo *</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickCertCard}>
            {certCardUri ? (
              <Image source={{ uri: certCardUri }} style={styles.uploadPreview} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
                <Text style={styles.uploadText}>Tap to upload cert card</Text>
                <Text style={styles.uploadHint}>Required for verification</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Available to dive toggle */}
          <TouchableOpacity style={styles.toggleRow} onPress={() => setAvailableToDive(!availableToDive)}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Available to dive</Text>
              <Text style={styles.toggleDesc}>Show others you're looking for a buddy</Text>
            </View>
            <View style={[styles.toggle, availableToDive && styles.toggleOn]}>
              <View style={[styles.toggleKnob, availableToDive && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>

          <View style={styles.verificationNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
            <Text style={styles.verificationText}>
              Your cert card will be reviewed. You can explore the app while pending verification.
            </Text>
          </View>

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
                <Text style={styles.buttonText}>Submit for Verification</Text>
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
  pickerList: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerItem: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerItemSelected: { backgroundColor: Colors.primary + '10' },
  pickerItemText: { fontSize: FontSize.md, color: Colors.text },
  pickerItemTextSelected: { color: Colors.primary, fontWeight: '700' },
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
  uploadBox: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    minHeight: 120,
    overflow: 'hidden',
  },
  uploadPreview: { width: '100%', height: 160, borderRadius: Radius.md },
  uploadText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600', marginTop: Spacing.sm },
  uploadHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  toggleRow: {
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
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  toggleDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleOn: { backgroundColor: Colors.primary },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobOn: { alignSelf: 'flex-end' },
  verificationNote: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  verificationText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 18,
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
