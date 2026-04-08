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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Discipline } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { haversineKm, getCurrentCoords, DISTANCE_OPTIONS, DistanceFilter } from '../../lib/location';
import UserAvatar from '../../components/UserAvatar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CERT_FILTERS = ['All', 'AIDA 2', 'AIDA 3', 'AIDA 4', 'SSI Level 2', 'SSI Level 3'];
const DISCIPLINE_FILTERS: Discipline[] = ['pool', 'depth', 'spearfishing', 'dynamic', 'static'];

export default function FindBuddyScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();
  const [buddies, setBuddies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [certFilter, setCertFilter] = useState('All');
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | ''>('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('any');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchBuddies();
    }, [search, availableOnly, certFilter, disciplineFilter, distanceFilter, userCoords])
  );

  const fetchBuddies = async () => {
    if (!profile) return;
    setLoading(true);

    let query = supabase
      .from('profiles')
      .select('*, certified:certified_profiles!id(*)')
      .eq('role', 'certified')
      .eq('verification_status', 'verified')
      .neq('id', profile.id);

    if (availableOnly) query = query.eq('available_to_dive', true);
    if (search.trim()) query = query.ilike('city_region', `%${search.trim()}%`);

    const { data } = await query.order('display_name');

    let filtered = (data || []);

    if (certFilter !== 'All') {
      filtered = filtered.filter((b: any) => b.certified?.cert_level === certFilter);
    }
    if (disciplineFilter) {
      filtered = filtered.filter((b: any) =>
        (b.certified?.disciplines || []).includes(disciplineFilter)
      );
    }
    if (distanceFilter !== 'any' && userCoords) {
      filtered = filtered.filter((b: any) =>
        b.latitude != null && b.longitude != null &&
        haversineKm(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude) <= distanceFilter
      );
    }

    // Filter blocked users
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', profile.id);

    const blockedIds = new Set((blocks || []).map((b: any) => b.blocked_id));
    filtered = filtered.filter((b: any) => !blockedIds.has(b.id));

    setBuddies(filtered);
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
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Find a Buddy</Text>
              <Text style={styles.heroSub}>Verified certified freedivers</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="people" size={26} color={Colors.accent} />
            </View>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city / region..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, availableOnly && styles.filterChipActive]}
          onPress={() => setAvailableOnly(!availableOnly)}
        >
          <View style={[styles.filterDot, availableOnly && styles.filterDotActive]} />
          <Text style={[styles.filterText, availableOnly && styles.filterTextActive]}>
            Available Now
          </Text>
        </TouchableOpacity>
        {DISCIPLINE_FILTERS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.filterChip, disciplineFilter === d && styles.filterChipActive]}
            onPress={() => setDisciplineFilter(disciplineFilter === d ? '' : d)}
          >
            <Text style={[styles.filterText, disciplineFilter === d && styles.filterTextActive]}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
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
          data={buddies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No buddies found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or search location.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BuddyProfile', { buddyId: item.id })}
              activeOpacity={0.85}
            >
              <UserAvatar avatarUrl={item.avatar_url} name={item.display_name} size={52} />
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardName}>{item.display_name}</Text>
                  {item.available_to_dive && (
                    <View style={styles.availableBadge}>
                      <View style={styles.availableDot} />
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  )}
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.locationText}>{item.city_region}</Text>
                </View>
                <View style={styles.metaRow}>
                  {item.certified?.cert_level && (
                    <Text style={styles.meta}>{item.certified.cert_level}</Text>
                  )}
                  {item.certified?.years_experience > 0 && (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.meta}>{item.certified.years_experience}y exp</Text>
                    </>
                  )}
                </View>
                {item.certified?.disciplines?.length > 0 && (
                  <Text style={styles.disciplines} numberOfLines={1}>
                    {item.certified.disciplines.join(', ')}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() =>
                  navigation.navigate('Messaging', {
                    otherUserId: item.id,
                    otherUserName: item.display_name,
                  })
                }
              >
                <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  filterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  filterDotActive: { backgroundColor: Colors.success },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  cardBody: { flex: 1, gap: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  availableDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.success },
  availableText: { fontSize: 10, color: Colors.success, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  metaDot: { fontSize: FontSize.xs, color: Colors.textMuted },
  disciplines: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  msgBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
