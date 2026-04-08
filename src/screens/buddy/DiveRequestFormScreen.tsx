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
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Discipline } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'DiveRequestForm'>;

const DISCIPLINES: { key: Discipline; label: string }[] = [
  { key: 'pool', label: 'Pool' },
  { key: 'depth', label: 'Depth' },
  { key: 'dynamic', label: 'Dynamic' },
  { key: 'static', label: 'Static' },
  { key: 'spearfishing', label: 'Spearfishing' },
  { key: 'line_training', label: 'Line Training' },
];

function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function DiveRequestFormScreen({ navigation, route }: Props) {
  const { buddyId, buddyName } = route.params;
  const { profile } = useAuthStore();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const onDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleSend = async () => {
    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showModal({ type: 'error', title: 'Invalid Date', message: 'Please select a future date.' });
      return;
    }
    if (!locationName.trim()) {
      showModal({ type: 'error', title: 'Location Required', message: 'Please enter a dive location.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('dive_requests').insert({
      requester_id: profile.id,
      buddy_id: buddyId,
      requested_date: toDateString(selectedDate),
      location_name: locationName.trim(),
      disciplines,
      notes: notes.trim() || null,
      status: 'pending',
    });
    setLoading(false);

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Could not send request. Please try again.' });
      return;
    }

    showModal({
      type: 'success',
      title: 'Request Sent!',
      message: `Your dive request has been sent to ${buddyName}. You'll be notified when they respond.`,
      onConfirm: () => navigation.goBack(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request a Dive</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.buddyRow}>
            <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.buddyText}>Requesting dive with <Text style={styles.buddyName}>{buddyName}</Text></Text>
          </View>

          {/* Date */}
          <Text style={styles.label}>Dive Date *</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <Text style={[styles.input, { color: Colors.text, paddingVertical: 14 }]}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.pickerDone}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          )}

          {/* Location */}
          <Text style={[styles.label, { marginTop: Spacing.md }]}>Dive Location *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={locationName}
              onChangeText={setLocationName}
              placeholder="e.g. Moalboal, Cebu"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Disciplines */}
          <Text style={[styles.label, { marginTop: Spacing.md }]}>Disciplines (optional)</Text>
          <View style={styles.chipRow}>
            {DISCIPLINES.map(({ key, label }) => {
              const active = disciplines.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleDiscipline(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notes */}
          <Text style={[styles.label, { marginTop: Spacing.md }]}>Message (optional)</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Introduce yourself or share any details about the dive..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Send Request</Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  form: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  buddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceBlue,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buddyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  buddyName: { fontWeight: '700', color: Colors.primary },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: FontSize.md, color: Colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  pickerDone: { alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  pickerDoneText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
});
