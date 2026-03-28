import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Profile } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { isDemoMode, DEMO_BUDDIES } from '../../lib/mockData'; // DEMO MODE

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeCertifiedScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, setProfile } = useAuthStore();
  const [availableBuddies, setAvailableBuddies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (profile) fetchBuddies();
    }, [profile])
  );

  const fetchBuddies = async () => {
    if (!profile) return;
    setLoading(true);

    // DEMO MODE — skip Supabase when using demo account
    if (isDemoMode(profile.id)) {
      const available = (DEMO_BUDDIES as any[]).filter((b) => b.available_to_dive && b.id !== profile.id);
      setAvailableBuddies(available);
      setLoading(false);
      return;
    }
    // END DEMO MODE

    const { data } = await supabase
      .from('profiles')
      .select('*, certified:certified_profiles!id(*)')
      .eq('role', 'certified')
      .eq('verification_status', 'verified')
      .eq('available_to_dive', true)
      .eq('city_region', profile.city_region)
      .neq('id', profile.id)
      .limit(20);

    setAvailableBuddies(data || []);
    setLoading(false);
  };

  const toggleAvailability = async () => {
    if (!profile) return;
    // DEMO MODE — just update local state, no Supabase call
    if (isDemoMode(profile.id)) {
      setProfile({ ...profile, available_to_dive: !profile.available_to_dive });
      return;
    }
    // END DEMO MODE
    setTogglingAvailability(true);
    const newVal = !profile.available_to_dive;

    const { data: updated } = await supabase
      .from('profiles')
      .update({ available_to_dive: newVal })
      .eq('id', profile.id)
      .select('*')
      .single();

    if (updated) setProfile(updated as Profile);
    setTogglingAvailability(false);

    if (newVal) fetchBuddies();
  };

  const initials = (name: string) =>
    name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Home</Text>
              <Text style={styles.heroSub}>
                {profile?.city_region ? `Divers near ${profile.city_region}` : 'Find dive buddies near you'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.accentLight} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Availability toggle */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Available to dive</Text>
          <Text style={styles.toggleDesc}>
            {profile?.available_to_dive
              ? 'Others can see you are looking for a buddy'
              : 'Toggle on to let others know you want to dive'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, profile?.available_to_dive && styles.toggleOn]}
          onPress={toggleAvailability}
          disabled={togglingAvailability}
        >
          {togglingAvailability ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={[styles.toggleKnob, profile?.available_to_dive && styles.toggleKnobOn]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Available buddies in area */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Now — {profile?.city_region || 'Your Area'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FindBuddy' as any)}>
          <Text style={styles.sectionLink}>See all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : availableBuddies.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No buddies available nearby</Text>
          <Text style={styles.emptySub}>
            {profile?.available_to_dive
              ? 'Check back later or try Find Buddy with different filters.'
              : 'Toggle "Available to dive" to connect with others in your area.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableBuddies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.buddyCard}
              onPress={() => navigation.navigate('BuddyProfile', { buddyId: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.buddyAvatar}>
                <Text style={styles.buddyAvatarText}>{initials(item.display_name)}</Text>
              </View>
              <View style={styles.buddyInfo}>
                <Text style={styles.buddyName}>{item.display_name}</Text>
                <View style={styles.rolePill}>
                  <Ionicons name="people-outline" size={10} color={Colors.primary} />
                  <Text style={styles.rolePillText}>Certified Buddy</Text>
                </View>
                <Text style={styles.buddyMeta}>
                  {item.certified?.cert_level ?? 'Certified'} · {item.city_region}
                </Text>
                {item.certified?.disciplines?.length > 0 && (
                  <Text style={styles.buddyDisciplines} numberOfLines={1}>
                    {item.certified.disciplines.join(', ')}
                  </Text>
                )}
              </View>
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Available</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { backgroundColor: Colors.primaryDeep, paddingBottom: Spacing.lg },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: FontSize.xs, color: Colors.accentLight, marginTop: 3 },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  toggleDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    padding: 3,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  sectionLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  buddyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyAvatarText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  buddyInfo: { flex: 1 },
  buddyName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  buddyMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  buddyDisciplines: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary + '12', borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2,
  },
  rolePillText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  availableText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
