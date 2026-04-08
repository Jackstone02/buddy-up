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
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';
import UserAvatar from '../../components/UserAvatar';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileEdit'>;

const CERT_LEVELS = ['AIDA 1', 'AIDA 2', 'AIDA 3', 'AIDA 4', 'SSI Level 1', 'SSI Level 2', 'SSI Level 3', 'PADI Freediver', 'PADI Advanced Freediver', 'Other'];
const DISCIPLINES: { key: Discipline; label: string }[] = [
  { key: 'pool', label: 'Pool' },
  { key: 'depth', label: 'Depth' },
  { key: 'spearfishing', label: 'Spearfishing' },
  { key: 'dynamic', label: 'Dynamic' },
  { key: 'static', label: 'Static' },
  { key: 'line_training', label: 'Line Training' },
];
const INSTRUCTOR_CERT_OPTIONS = ['AIDA Instructor', 'SSI Instructor', 'PADI Instructor', 'Molchanovs Instructor', 'CMAS Instructor', 'Other'];

/** credentials_url may be a single URL string or a JSON array of URLs */
function parseCredentialUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [raw];
}

export default function ProfileEditScreen({ navigation }: Props) {
  const {
    profile, setProfile,
    certifiedProfile, setCertifiedProfile,
    instructorProfile, setInstructorProfile,
  } = useAuthStore();

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Base fields
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [cityRegion, setCityRegion] = useState(profile?.city_region ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');

  // Certified fields
  const [certLevel, setCertLevel] = useState(certifiedProfile?.cert_level ?? '');
  const [agency, setAgency] = useState(certifiedProfile?.agency ?? '');
  const [yearsExperience, setYearsExperience] = useState(String(certifiedProfile?.years_experience ?? ''));
  const [maxDepth, setMaxDepth] = useState(String(certifiedProfile?.max_depth_m ?? ''));
  const [disciplines, setDisciplines] = useState<Discipline[]>(certifiedProfile?.disciplines ?? []);
  const [showCertPicker, setShowCertPicker] = useState(false);

  // Instructor text fields
  const [instructorAgencies, setInstructorAgencies] = useState((instructorProfile?.agencies ?? []).join(', '));
  const [certsOffered, setCertsOffered] = useState<string[]>(instructorProfile?.certs_offered ?? []);
  const [yearsTeaching, setYearsTeaching] = useState(String(instructorProfile?.years_teaching ?? ''));

  // Instructor credentials — existing saved URLs + newly picked local URIs
  const [existingUrls, setExistingUrls] = useState<string[]>(
    parseCredentialUrls(instructorProfile?.credentials_url)
  );
  const [newUris, setNewUris] = useState<{ uri: string; ext: string }[]>([]);
  const [uploadingCreds, setUploadingCreds] = useState(false);

  const [loading, setLoading] = useState(false);
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  const isCertified = profile?.role === 'certified';
  const isInstructor = profile?.role === 'instructor';
  const totalCount = existingUrls.length + newUris.length;

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const toggleCert = (c: string) => {
    setCertsOffered((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const pickCredential = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop() || 'jpg';
      setNewUris((prev) => [...prev, { uri, ext }]);
    }
  };

  const removeExisting = (url: string) => {
    setExistingUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNew = (uri: string) => {
    setNewUris((prev) => prev.filter((n) => n.uri !== uri));
  };

  const pickAndUploadAvatar = async () => {
    if (!profile) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    setAvatarUploading(true);
    try {
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop() || 'jpg';
      const path = `avatars/${profile.id}/avatar.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage.from('buddyline').upload(path, blob, { upsert: true });
      if (uploadError) {
        showModal({ type: 'error', title: 'Upload Failed', message: 'Could not upload photo. Please try again.' });
        setAvatarUploading(false);
        return;
      }

      const { data } = supabase.storage.from('buddyline').getPublicUrl(path);
      const newUrl = data.publicUrl;

      await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', profile.id);
      setAvatarUrl(newUrl);
      setProfile({ ...profile, avatar_url: newUrl });
    } catch {
      showModal({ type: 'error', title: 'Error', message: 'Failed to update photo. Please try again.' });
    }
    setAvatarUploading(false);
  };

  const handleUploadCredentials = async () => {
    if (!profile) return;

    setUploadingCreds(true);

    const uploadedUrls: string[] = [];
    for (const { uri, ext } of newUris) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const path = `credentials/${profile.id}/cred_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('buddyline').upload(path, blob, { upsert: false });
        if (error) continue;
        const { data } = supabase.storage.from('buddyline').getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      } catch {
        // skip failed uploads
      }
    }

    if (uploadedUrls.length === 0 && newUris.length > 0) {
      showModal({ type: 'error', title: 'Upload Failed', message: 'Could not upload files. Please try again.' });
      setUploadingCreds(false);
      return;
    }

    const combined = [...existingUrls, ...uploadedUrls];
    const credentialsJson = JSON.stringify(combined);

    await Promise.all([
      supabase.from('instructor_profiles').update({ credentials_url: credentialsJson }).eq('id', profile.id),
      supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', profile.id),
    ]);

    if (instructorProfile) {
      setInstructorProfile({ ...instructorProfile, credentials_url: credentialsJson });
    }
    setProfile({ ...profile, verification_status: 'pending' });
    setExistingUrls(combined);
    setNewUris([]);
    setUploadingCreds(false);

    showModal({
      type: 'success',
      title: 'Credentials Updated',
      message: `${uploadedUrls.length} file${uploadedUrls.length !== 1 ? 's' : ''} uploaded. Your profile has been resubmitted for admin verification.`,
    });
  };

  const handleSave = async () => {
    if (!displayName.trim() || !cityRegion.trim()) {
      showModal({ type: 'error', title: 'Required', message: 'Please fill in display name and city/region.' });
      return;
    }
    if (!profile) return;

    setLoading(true);

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), city_region: cityRegion.trim(), bio: bio.trim() })
      .eq('id', profile.id)
      .select('*')
      .single();

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to update profile.' });
      setLoading(false);
      return;
    }

    if (isCertified) {
      const { data: updatedCert } = await supabase
        .from('certified_profiles')
        .upsert({
          id: profile.id,
          cert_level: certLevel,
          agency: agency.trim(),
          years_experience: parseInt(yearsExperience) || 0,
          max_depth_m: parseInt(maxDepth) || null,
          disciplines,
        })
        .select('*')
        .single();
      if (updatedCert) setCertifiedProfile(updatedCert);
    }

    if (isInstructor) {
      const { data: updatedInstructor } = await supabase
        .from('instructor_profiles')
        .update({
          teaching_location: cityRegion.trim(),
          agencies: instructorAgencies.split(',').map((a) => a.trim()).filter(Boolean),
          certs_offered: certsOffered,
          years_teaching: parseInt(yearsTeaching) || 0,
        })
        .eq('id', profile.id)
        .select('*')
        .single();
      if (updatedInstructor) setInstructorProfile(updatedInstructor);
    }

    setProfile(updated);
    navigation.goBack();
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* ── Avatar ── */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrap} onPress={pickAndUploadAvatar} disabled={avatarUploading} activeOpacity={0.8}>
              <UserAvatar avatarUrl={avatarUrl} name={displayName || profile?.display_name || ''} size={88} />
              <View style={styles.cameraOverlay}>
                {avatarUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="camera" size={18} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* ── Base fields ── */}
          <Text style={styles.label}>Display Name *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name or nickname"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>
            {isInstructor ? 'Teaching Location *' : 'City / Region *'}
          </Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={cityRegion}
              onChangeText={setCityRegion}
              placeholder="e.g. Cebu City, Philippines"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Bio (optional)</Text>
          <TextInput
            style={styles.textArea}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />

          {/* ── Certified fields ── */}
          {isCertified && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Certification</Text>

              <Text style={styles.label}>Certification Level</Text>
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

              <Text style={[styles.label, { marginTop: Spacing.md }]}>Certifying Agency</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="business-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={agency}
                  onChangeText={setAgency}
                  placeholder="e.g. AIDA, SSI, PADI"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <Text style={[styles.label, { marginTop: Spacing.md }]}>Years of Experience</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.label, { marginTop: Spacing.md }]}>Max Depth (m)</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="arrow-down-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={maxDepth}
                  onChangeText={setMaxDepth}
                  placeholder="e.g. 30"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.label, { marginTop: Spacing.md }]}>Disciplines</Text>
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
            </>
          )}

          {/* ── Instructor teaching info ── */}
          {isInstructor && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Teaching Info</Text>

              <Text style={styles.label}>Agencies</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="business-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={instructorAgencies}
                  onChangeText={setInstructorAgencies}
                  placeholder="e.g. AIDA, SSI (comma-separated)"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <Text style={[styles.label, { marginTop: Spacing.md }]}>Years Teaching</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={yearsTeaching}
                  onChangeText={setYearsTeaching}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={[styles.label, { marginTop: Spacing.md }]}>Certifications Offered</Text>
              <View style={styles.chipRow}>
                {INSTRUCTOR_CERT_OPTIONS.map((c) => (
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
            </>
          )}

          {/* ── Instructor credentials ── */}
          {isInstructor && (
            <>
              <View style={styles.sectionDivider} />

              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Instructor Credentials</Text>
                  <Text style={styles.sectionSub}>
                    Certificate photos, instructor cards, agency docs.{'\n'}
                    Re-uploading resubmits your profile for admin review.
                  </Text>
                </View>
                {totalCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{totalCount}</Text>
                  </View>
                )}
              </View>

              {existingUrls.map((url, i) => (
                <View key={url} style={styles.fileRow}>
                  <Image source={{ uri: url }} style={styles.fileThumb} />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>Credential {i + 1}</Text>
                    <Text style={styles.fileStatus}>Uploaded</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() =>
                      showModal({
                        type: 'confirm',
                        title: 'Remove File',
                        message: 'Remove this credential?',
                        confirmText: 'Remove',
                        cancelText: 'Cancel',
                        showCancel: true,
                        onConfirm: () => removeExisting(url),
                      })
                    }
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {newUris.map(({ uri }, i) => (
                <View key={uri} style={[styles.fileRow, styles.fileRowNew]}>
                  <Image source={{ uri }} style={styles.fileThumb} />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>New file {i + 1}</Text>
                    <Text style={[styles.fileStatus, { color: Colors.warning }]}>Pending upload</Text>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeNew(uri)}>
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addFileBtn} onPress={pickCredential} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addFileBtnText}>
                  {totalCount === 0 ? 'Add credential file' : 'Add another file'}
                </Text>
              </TouchableOpacity>

              {newUris.length > 0 && (
                <TouchableOpacity
                  style={[styles.uploadBtn, uploadingCreds && styles.uploadBtnDisabled]}
                  onPress={handleUploadCredentials}
                  disabled={uploadingCreds}
                  activeOpacity={0.85}
                >
                  {uploadingCreds ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                      <Text style={styles.uploadBtnText}>
                        Upload {newUris.length} File{newUris.length !== 1 ? 's' : ''}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {profile?.verification_status === 'pending' && newUris.length === 0 && (
                <View style={styles.statusNote}>
                  <Ionicons name="time-outline" size={14} color={Colors.warning} />
                  <Text style={styles.statusNoteText}>Verification pending — admin is reviewing your credentials.</Text>
                </View>
              )}
              {profile?.verification_status === 'verified' && newUris.length === 0 && (
                <View style={[styles.statusNote, styles.statusNoteSuccess]}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
                  <Text style={[styles.statusNoteText, { color: Colors.success }]}>
                    Verified — you appear in instructor search.
                  </Text>
                </View>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFFFFF' },
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
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xl },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17, marginTop: 3 },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '800' },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  fileRowNew: { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '06' },
  fileThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  fileStatus: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  removeBtn: { padding: 4 },
  addFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary + '50',
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
  },
  addFileBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryMid,
    borderRadius: Radius.md,
    paddingVertical: 13,
    marginBottom: Spacing.sm,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.warning + '12',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  statusNoteSuccess: {
    backgroundColor: Colors.success + '12',
    borderColor: Colors.success + '40',
  },
  statusNoteText: { flex: 1, fontSize: FontSize.xs, color: Colors.text, lineHeight: 16 },
  button: {
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
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarWrap: { position: 'relative' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm },
});
