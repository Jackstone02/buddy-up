import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import CertBadge from '../../components/CertBadge';
import UserAvatar from '../../components/UserAvatar';
import { useAuthStore } from '../../store/authStore';
import { isDemoMode, DEMO_INSTRUCTORS } from '../../lib/mockData'; // DEMO MODE
import { haversineKm, getCurrentCoords, DISTANCE_OPTIONS, DistanceFilter } from '../../lib/location';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FindInstructorScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('any');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchInstructors();
    }, [search, filterDiscipline, distanceFilter, userCoords])
  );

  const fetchInstructors = async () => {
    setLoading(true);

    // DEMO MODE — skip Supabase when using demo account
    if (isDemoMode(profile?.id)) {
      let filtered = DEMO_INSTRUCTORS as any[];
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter((i) => i.teaching_location.toLowerCase().includes(q));
      }
      if (distanceFilter !== 'any' && userCoords) {
        filtered = filtered.filter((i: any) =>
          i.profile?.latitude != null && i.profile?.longitude != null &&
          haversineKm(userCoords.latitude, userCoords.longitude, i.profile.latitude, i.profile.longitude) <= distanceFilter
        );
      }
      setInstructors(filtered);
      setLoading(false);
      return;
    }
    // END DEMO MODE

    let query = supabase
      .from('instructor_profiles')
      .select('*, profile:profiles!id(*)')
      .filter('profile.verification_status', 'eq', 'verified');

    if (search.trim()) {
      query = query.ilike('teaching_location', `%${search.trim()}%`);
    }

    const { data } = await query.order('years_teaching', { ascending: false });

    // Filter out rows where profile join came back null (unverified)
    let filtered = (data || []).filter((r: any) => r.profile?.verification_status === 'verified');

    if (distanceFilter !== 'any' && userCoords) {
      filtered = filtered.filter((r: any) =>
        r.profile?.latitude != null && r.profile?.longitude != null &&
        haversineKm(userCoords.latitude, userCoords.longitude, r.profile.latitude, r.profile.longitude) <= distanceFilter
      );
    }

    setInstructors(filtered);
    setLoading(false);
  };

  const handleNearMe = async () => {
    const coords = await getCurrentCoords();
    if (coords) {
      setUserCoords(coords);
      if (distanceFilter === 'any') setDistanceFilter(10);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero header */}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Find an Instructor</Text>
              <Text style={styles.heroSub}>Verified freediving instructors</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="school" size={26} color={Colors.accent} />
            </View>
          </View>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Distance filter */}
      <View style={styles.distanceBar}>
        <TouchableOpacity
          style={[styles.filterChip, styles.nearMeChip, userCoords != null && styles.filterChipActive]}
          onPress={handleNearMe}
        >
          <Ionicons name="navigate-outline" size={12} color={userCoords ? '#fff' : Colors.primary} />
          <Text style={[styles.filterText, { color: userCoords ? '#fff' : Colors.primary }]}>Near Me</Text>
        </TouchableOpacity>
        {DISTANCE_OPTIONS.filter((o) => o.value !== 'any').map((opt) => (
          <TouchableOpacity
            key={String(opt.value)}
            style={[styles.filterChip, distanceFilter === opt.value && styles.filterChipActive]}
            onPress={() => setDistanceFilter(distanceFilter === opt.value ? 'any' : opt.value)}
          >
            <Text style={[styles.filterText, distanceFilter === opt.value && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        {distanceFilter !== 'any' && (
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => { setDistanceFilter('any'); setUserCoords(null); }}
          >
            <Ionicons name="close-circle-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.filterText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This app connects people only — it does not supervise dives.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={instructors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="school-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No instructors found</Text>
              <Text style={styles.emptySub}>Try a different location or check back later.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('InstructorProfile', { instructorId: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <UserAvatar avatarUrl={item.profile?.avatar_url} name={item.profile?.display_name ?? ''} size={52} color={Colors.primaryMid} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardName}>{item.profile?.display_name ?? 'Instructor'}</Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.locationText}>{item.teaching_location}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{item.years_teaching}y teaching</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>{(item.agencies || []).slice(0, 2).join(', ')}</Text>
                </View>
                <View style={styles.certRow}>
                  {(item.certs_offered || []).slice(0, 3).map((c: string) => (
                    <CertBadge key={c} certType={c} isVerified={true} />
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { backgroundColor: Colors.primaryDeep, paddingBottom: Spacing.md },
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
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF30',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF18',
    borderRadius: Radius.full,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFFFFF30',
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: FontSize.md, color: '#FFFFFF' },
  distanceBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    flexWrap: 'wrap',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    gap: 4,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  nearMeChip: { borderColor: Colors.primary },
  disclaimer: {
    backgroundColor: Colors.border,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  disclaimerText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
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
  cardLeft: {},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  cardBody: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  metaDot: { fontSize: FontSize.xs, color: Colors.textMuted },
  certRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
