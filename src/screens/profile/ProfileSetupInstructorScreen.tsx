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
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const CERT_OPTIONS = ['AIDA Instructor', 'SSI Instructor', 'PADI Instructor', 'Molchanovs Instructor', 'CMAS Instructor', 'Other'];

export default function ProfileSetupInstructorScreen({ navigation }: Props) {
  const [teachingLocation, setTeachingLocation] = useState('');
  const [bio, setBio] = useState('');
  const [agencies, setAgencies] = useState('');
  const [certsOffered, setCertsOffered] = useState<string[]>([]);
  const [yearsTeaching, setYearsTeaching] = useState('');
  const [credentialsUri, setCredentialsUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  const toggleCert = (c: string) => {
    setCertsOffered((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const pickCredentials = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setCredentialsUri(result.assets[0].uri);
    }
  };

  const uploadCredentials = async (userId: string): Promise<string | null> => {
    if (!credentialsUri) return null;

    const response = await fetch(credentialsUri);
    const blob = await response.blob();
    const ext = credentialsUri.split('.').pop() || 'jpg';
    const path = `credentials/${userId}/credentials.${ext}`;

    const { error } = await supabase.storage.from('buddy-up').upload(path, blob, { upsert: true });
    if (error) return null;

    const { data } = supabase.storage.from('buddy-up').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!teachingLocation.trim() || !agencies.trim()) {
      showModal({ type: 'error', title: 'Required Fields', message: 'Please fill in teaching location and agency.' });
      return;
    }
    if (!credentialsUri) {
      showModal({ type: 'warning', title: 'Credentials Required', message: 'Please upload your instructor credentials.' });
      return;
    }
    if (certsOffered.length === 0) {
      showModal({ type: 'warning', title: 'Select Certifications', message: 'Please select at least one certification you offer.' });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const credentialsUrl = await uploadCredentials(user.id);
    if (!credentialsUrl) {
      showModal({ type: 'error', title: 'Upload Failed', message: 'Could not upload credentials. Please try again.' });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        city_region: teachingLocation.trim(),
        bio: bio.trim(),
        verification_status: 'pending',
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (profileError) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to save profile.' });
      setLoading(false);
      return;
    }

    await supabase.from('instructor_profiles').upsert({
      id: user.id,
      teaching_location: teachingLocation.trim(),
      agencies: agencies.split(',').map((a) => a.trim()).filter(Boolean),
      certs_offered: certsOffered,
      years_teaching: parseInt(yearsTeaching) || 0,
      credentials_url: credentialsUrl,
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
        <Text style={styles.headerTitle}>Instructor Profile</Text>
        <Text style={styles.headerSub}>Verification required to appear in search</Text>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>Teaching Location *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Cebu City, Philippines"
              placeholderTextColor={Colors.textMuted}
              value={teachingLocation}
              onChangeText={setTeachingLocation}
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Agencies *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="business-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. AIDA, SSI (comma-separated)"
              placeholderTextColor={Colors.textMuted}
              value={agencies}
              onChangeText={setAgencies}
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Years Teaching</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="time-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              value={yearsTeaching}
              onChangeText={setYearsTeaching}
              keyboardType="number-pad"
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Certifications Offered *</Text>
          <View style={styles.chipRow}>
            {CERT_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, certsOffered.includes(c) && styles.chipSelected]}
                onPress={() => toggleCert(c)}
              >
                <Text style={[styles.chipText, certsOffered.includes(c) && styles.chipTextSelected]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Bio (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell students about your teaching style and experience..."
            placeholderTextColor={Colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Instructor Credentials *</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickCredentials}>
            {credentialsUri ? (
              <Image source={{ uri: credentialsUri }} style={styles.uploadPreview} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
                <Text style={styles.uploadText}>Tap to upload credentials</Text>
                <Text style={styles.uploadHint}>Instructor card / certificate required</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.verificationNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
            <Text style={styles.verificationText}>
              Your profile will be reviewed before appearing in instructor search. This typically takes 24-48 hours.
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
    minHeight: 90,
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
  verificationText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 18 },
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
