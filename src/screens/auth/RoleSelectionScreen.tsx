import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserRole } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

const ROLES: { key: UserRole; icon: any; color: string; bg: string; title: string; desc: string; note: string }[] = [
  {
    key: 'beginner',
    icon: 'person-outline',
    color: Colors.emerald,
    bg: Colors.emerald + '18',
    title: "I'm Learning",
    desc: 'New to freediving or looking to get my first certification',
    note: 'Find nearby instructors and book your first lesson',
  },
  {
    key: 'certified',
    icon: 'people',
    color: Colors.primary,
    bg: Colors.primary + '15',
    title: 'I Dive Independently',
    desc: 'I have a cert card and want to find safe dive buddies',
    note: 'Join open dive sessions · Match with verified buddies',
  },
  {
    key: 'instructor',
    icon: 'school',
    color: Colors.purple,
    bg: Colors.purple + '18',
    title: 'I Teach Freediving',
    desc: 'I hold instructor credentials and offer courses',
    note: 'Get discovered by students · Manage your schedule',
  },
];

export default function RoleSelectionScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  const handleContinue = async () => {
    if (!selected) {
      showModal({ type: 'info', title: 'Select a Role', message: 'Please choose your role to continue.' });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: selected })
      .eq('id', user.id);

    if (error) {
      showModal({ type: 'error', title: 'Error', message: 'Could not save your role. Please try again.' });
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profile);
    navigation.replace('ProfileSetup', { role: selected });
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>What brings you here?</Text>
          <Text style={styles.headerSub}>
            We'll set up the right experience for you.
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        {ROLES.map((r) => {
          const isSelected = selected === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.card, isSelected && { borderColor: r.color, backgroundColor: r.color + '08' }]}
              onPress={() => setSelected(r.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, { backgroundColor: r.bg }]}>
                <Ionicons name={r.icon} size={26} color={r.color} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, isSelected && { color: r.color }]}>
                  {r.title}
                </Text>
                <Text style={styles.cardDesc}>{r.desc}</Text>
                <Text style={[styles.cardNote, { color: r.color }]}>{r.note}</Text>
              </View>
              <View style={[styles.radio, isSelected && { borderColor: r.color }]}>
                {isSelected && <View style={[styles.radioDot, { backgroundColor: r.color }]} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.button, (!selected || loading) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selected || loading}
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
      </View>

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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  headerContent: {},
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSub: { fontSize: FontSize.sm, color: Colors.accentLight, marginTop: 6, lineHeight: 20 },
  body: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  cardNote: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', lineHeight: 16 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700', letterSpacing: 0.5 },
});
