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
import { RootStackParamList, BookingStatus } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { isDemoMode, DEMO_INSTRUCTOR_BOOKINGS } from '../../lib/mockData'; // DEMO MODE

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: { key: BookingStatus | 'pending'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#F59E0B',
  confirmed: Colors.success,
  completed: Colors.primary,
  cancelled: '#EF4444',
};

export default function BookingRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<BookingStatus>('pending');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [activeTab])
  );

  const fetchBookings = async () => {
    if (!profile) return;
    setLoading(true);

    // DEMO MODE
    if (isDemoMode(profile.id)) {
      const filtered = (DEMO_INSTRUCTOR_BOOKINGS as any[]).filter((b) => b.status === activeTab);
      setBookings(filtered);
      setLoading(false);
      return;
    }
    // END DEMO MODE

    const { data } = await supabase
      .from('bookings')
      .select('*, customer:profiles!customer_id(id, display_name, city_region), lesson_type:lesson_types(*)')
      .eq('instructor_id', profile.id)
      .eq('status', activeTab)
      .order('booking_date', { ascending: true });

    setBookings(data || []);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Booking Requests</Text>
              <Text style={styles.heroSub}>Manage your sessions</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="clipboard" size={26} color={Colors.accent} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key as BookingStatus)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="clipboard-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No {activeTab} bookings</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('InstructorBookingDetail', { bookingId: item.id })}
              activeOpacity={0.85}
            >
              <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[item.status as BookingStatus] }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.lessonName}>{item.lesson_type?.name ?? 'Session'}</Text>
                  {item.status === 'pending' && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{item.customer?.display_name ?? 'Student'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{formatDate(item.booking_date)} · {item.start_time}</Text>
                </View>
                {item.notes && (
                  <Text style={styles.notePreview} numberOfLines={1}>"{item.notes}"</Text>
                )}
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
    paddingBottom: Spacing.md,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusBar: { width: 5, alignSelf: 'stretch' },
  cardBody: { flex: 1, paddingVertical: Spacing.md, gap: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.sm },
  lessonName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, flex: 1 },
  newBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  notePreview: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
});
