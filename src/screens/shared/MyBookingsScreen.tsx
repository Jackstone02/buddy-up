import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BookingStatus } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: { label: string; statuses: BookingStatus[] }[] = [
  { label: 'Upcoming', statuses: ['pending', 'confirmed'] },
  { label: 'Completed', statuses: ['completed'] },
  { label: 'Cancelled', statuses: ['cancelled'] },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_DOT: Record<BookingStatus, string> = {
  pending:   '#F59E0B',
  confirmed: Colors.success,
  completed: '#94A3B8',
  cancelled: '#EF4444',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   '#F59E0B',
  confirmed: Colors.success,
  completed: Colors.primary,
  cancelled: '#EF4444',
};

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

export default function MyBookingsScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState(0);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('bookings')
      .select('*, instructor:profiles!instructor_id(id, display_name, city_region), lesson_type:lesson_types(*)')
      .eq('customer_id', profile.id)
      .order('booking_date', { ascending: true });

    setAllBookings(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  // ── Calendar helpers ──────────────────────────────────────────
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const bookingsByDate: Record<string, BookingStatus[]> = {};
  allBookings.forEach((b) => {
    const d = b.booking_date.split('T')[0];
    if (!bookingsByDate[d]) bookingsByDate[d] = [];
    bookingsByDate[d].push(b.status);
  });

  const todayStr = toDateStr(today);

  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // ── Filtered list ─────────────────────────────────────────────
  const displayedBookings = selectedDate
    ? allBookings.filter((b) => b.booking_date.split('T')[0] === selectedDate)
    : allBookings.filter((b) => TABS[activeTab].statuses.includes(b.status));

  const totalCount = displayedBookings.length;

  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : TABS[activeTab].label;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>My Bookings</Text>
              <Text style={styles.heroSub}>
                {totalCount} booking{totalCount !== 1 ? 's' : ''} · {selectedLabel}
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="calendar" size={26} color={Colors.accent} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Calendar */}
      <View style={styles.calendarCard}>
        <View style={styles.calMonthRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.calArrow}>
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.calMonthLabel}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calArrow}>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.calDayRow}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.calDayHeader}>{d}</Text>
          ))}
        </View>

        <View style={styles.calGrid}>
          {calendarCells.map((day, idx) => {
            if (!day) return <View key={`e-${idx}`} style={styles.calCell} />;
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday    = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const statuses   = bookingsByDate[dateStr] ?? [];
            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.calCell,
                  isToday && !isSelected && styles.calCellToday,
                  isSelected && styles.calCellSelected,
                ]}
                onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.calDayNum,
                  isToday && !isSelected && styles.calDayNumToday,
                  isSelected && styles.calDayNumSelected,
                ]}>
                  {day}
                </Text>
                {statuses.length > 0 && (
                  <View style={styles.dotsRow}>
                    {[...new Set(statuses)].slice(0, 3).map((s) => (
                      <View key={s} style={[styles.dot, { backgroundColor: STATUS_DOT[s as BookingStatus] }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {(Object.entries(STATUS_DOT) as [BookingStatus, string][]).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tab pills (hidden when date is selected) */}
      {!selectedDate && (
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab.label}
                style={[styles.tab, activeTab === i && styles.tabActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Clear pill */}
      {selectedDate && (
        <TouchableOpacity style={styles.clearPill} onPress={() => setSelectedDate(null)}>
          <Ionicons name="close-circle" size={16} color={Colors.primary} />
          <Text style={styles.clearPillText}>Showing {selectedLabel} · tap to clear</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={displayedBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchBookings(); }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>
                {selectedDate ? 'No bookings on this day' : 'No bookings here yet'}
              </Text>
              <Text style={styles.emptySub}>
                {selectedDate
                  ? 'Select another date or clear the filter.'
                  : activeTab === 0
                  ? 'Find an instructor to book your first session.'
                  : `Your ${TABS[activeTab].label.toLowerCase()} sessions will appear here.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const status: BookingStatus = item.status;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
                activeOpacity={0.85}
              >
                <View style={[styles.cardAccent, { backgroundColor: STATUS_COLORS[status] }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.lessonName}>{item.lesson_type?.name ?? 'Session'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{item.instructor?.display_name ?? 'Instructor'}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{formatDate(item.booking_date)} · {item.start_time}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          }}
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
  heroIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFFFFF30',
  },

  // Calendar
  calendarCard: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  calMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  calArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  calMonthLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  calDayRow: { flexDirection: 'row', marginBottom: 4 },
  calDayHeader: {
    flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600',
    color: Colors.textSecondary, paddingVertical: 2,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 2,
  },
  calCellToday: { borderWidth: 1.5, borderColor: Colors.primary },
  calCellSelected: { backgroundColor: Colors.primary },
  calDayNum: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  calDayNumToday: { color: Colors.primary, fontWeight: '700' },
  calDayNumSelected: { color: '#fff', fontWeight: '700' },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 1 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: Colors.textSecondary },

  // Tabs
  tabsContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: Spacing.xs + 2, alignItems: 'center', borderRadius: Radius.full },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  // Clear date pill
  clearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  clearPillText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  // Booking cards
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardAccent: { width: 5, alignSelf: 'stretch' },
  cardBody: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, gap: 5 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, flex: 1, marginRight: Spacing.sm },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // Empty
  empty: { alignItems: 'center', paddingTop: Spacing.xl, gap: Spacing.sm },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySub: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', paddingHorizontal: Spacing.xl, lineHeight: 20,
  },
});
