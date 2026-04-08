import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DiveRequestStatus, BookingStatus } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import UserAvatar from '../../components/UserAvatar';
type Nav = NativeStackNavigationProp<RootStackParamList>;
type ScreenView = 'calendar' | 'requests';
type RequestTab = 'Incoming' | 'Outgoing';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const todayStr = new Date().toISOString().split('T')[0];

const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const REQUEST_STATUS: Record<DiveRequestStatus, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: Colors.warning },
  accepted:  { label: 'Accepted',  color: Colors.success },
  declined:  { label: 'Declined',  color: Colors.error },
  cancelled: { label: 'Cancelled', color: Colors.textMuted },
};

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   Colors.warning,
  confirmed: Colors.success,
  completed: Colors.primary,
  cancelled: Colors.error,
};

export default function MyActivityScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();

  const [screenView, setScreenView] = useState<ScreenView>('calendar');

  // ── Calendar / bookings state ──────────────────────────────────────────
  const [bookings, setBookings]   = useState<any[]>([]);
  const [calLoading, setCalLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // ── Requests state ────────────────────────────────────────────────────
  const [requestTab, setRequestTab]     = useState<RequestTab>('Incoming');
  const [requests, setRequests]         = useState<any[]>([]);
  const [reqLoading, setReqLoading]     = useState(false);
  const [reqRefreshing, setReqRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  useEffect(() => {
    if (screenView === 'requests') fetchRequests();
  }, [screenView, requestTab]);

  // ── Fetch bookings (for calendar) ──────────────────────────────────────
  const fetchBookings = async () => {
    if (!profile) return;
    setCalLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, instructor:profiles!instructor_id(id, display_name, avatar_url), lesson_type:lesson_types(*)')
      .eq('customer_id', profile.id)
      .order('booking_date', { ascending: true });
    setBookings(data ?? []);
    setCalLoading(false);
  };

  // ── Fetch dive requests ────────────────────────────────────────────────
  const fetchRequests = async (isRefresh = false) => {
    if (!profile) return;
    if (isRefresh) setReqRefreshing(true);
    else setReqLoading(true);

    const column  = requestTab === 'Incoming' ? 'buddy_id' : 'requester_id';
    const otherKey = requestTab === 'Incoming' ? 'requester' : 'buddy';
    const otherFk  = requestTab === 'Incoming'
      ? 'profiles!dive_requests_requester_id_fkey'
      : 'profiles!dive_requests_buddy_id_fkey';

    const { data } = await supabase
      .from('dive_requests')
      .select(`*, ${otherKey}:${otherFk}(id, display_name, avatar_url, city_region)`)
      .eq(column, profile.id)
      .order('created_at', { ascending: false });

    setRequests(data ?? []);
    setReqLoading(false);
    setReqRefreshing(false);
  };

  // ── Calendar helpers ───────────────────────────────────────────────────
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };
  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  // Build a lookup of dateStr → statuses
  const bookingsByDate: Record<string, BookingStatus[]> = {};
  bookings.forEach((b) => {
    const d = (b.booking_date ?? '').split('T')[0];
    if (!d) return;
    if (!bookingsByDate[d]) bookingsByDate[d] = [];
    bookingsByDate[d].push(b.status);
  });

  const selectedBookings = bookings.filter((b) => {
    const d = (b.booking_date ?? '').split('T')[0];
    return d === selectedDate;
  });

  const formatFullDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });

  const formatBookingDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

  // ── Pending dive request count (for badge on requests toggle) ──────────
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>My Schedule</Text>
              <Text style={styles.heroSub}>Calendar & dive requests</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="calendar" size={26} color={Colors.accent} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* View toggle: Calendar | Requests */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewToggleBtn, screenView === 'calendar' && styles.viewToggleBtnActive]}
          onPress={() => setScreenView('calendar')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={15} color={screenView === 'calendar' ? '#fff' : Colors.primary} />
          <Text style={[styles.viewToggleText, screenView === 'calendar' && styles.viewToggleTextActive]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleBtn, screenView === 'requests' && styles.viewToggleBtnActive]}
          onPress={() => setScreenView('requests')}
          activeOpacity={0.8}
        >
          <Ionicons name="people-outline" size={15} color={screenView === 'requests' ? '#fff' : Colors.primary} />
          <Text style={[styles.viewToggleText, screenView === 'requests' && styles.viewToggleTextActive]}>Dive Requests</Text>
          {pendingCount > 0 && screenView !== 'requests' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── REQUESTS VIEW ── */}
      {screenView === 'requests' ? (
        <View style={styles.requestsContainer}>
          {/* Incoming / Outgoing tabs */}
          <View style={styles.reqTabBar}>
            {(['Incoming', 'Outgoing'] as RequestTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.reqTab, requestTab === tab && styles.reqTabActive]}
                onPress={() => setRequestTab(tab)}
              >
                <Text style={[styles.reqTabText, requestTab === tab && styles.reqTabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {reqLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.reqList}
              refreshControl={
                <RefreshControl refreshing={reqRefreshing} onRefresh={() => fetchRequests(true)} tintColor={Colors.primary} />
              }
              ListEmptyComponent={
                <View style={styles.reqEmpty}>
                  <View style={styles.reqEmptyIcon}>
                    <Ionicons name="people-outline" size={40} color={Colors.primary} />
                  </View>
                  <Text style={styles.reqEmptyTitle}>No {requestTab.toLowerCase()} requests</Text>
                  <Text style={styles.reqEmptySub}>
                    {requestTab === 'Incoming'
                      ? 'When someone books a dive with you, it will appear here.'
                      : 'Find a buddy and request a dive with them.'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const other = requestTab === 'Incoming' ? item.requester : item.buddy;
                const statusCfg = REQUEST_STATUS[item.status as DiveRequestStatus] ?? REQUEST_STATUS.pending;
                return (
                  <TouchableOpacity
                    style={styles.reqCard}
                    onPress={() => navigation.navigate('DiveRequestDetail', { requestId: item.id })}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.reqStatusBar, { backgroundColor: statusCfg.color }]} />
                    <View style={styles.reqCardBody}>
                      <View style={styles.reqCardTopRow}>
                        <Text style={styles.reqName}>{other?.display_name ?? 'Diver'}</Text>
                        {item.status === 'pending' && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>New</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.reqMetaRow}>
                        <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.reqMetaText}>{item.requested_date}</Text>
                      </View>
                      <View style={styles.reqMetaRow}>
                        <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.reqMetaText} numberOfLines={1}>{item.location_name}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '18' }]}>
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      ) : (
        /* ── CALENDAR VIEW ── */
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Calendar grid */}
          <View style={styles.calendar}>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={styles.weekDay}>{d}</Text>
              ))}
            </View>
            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <View key={row} style={styles.weekRow}>
                {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                  if (!day) return <View key={col} style={styles.dayCell} />;
                  const dateStr    = toDateStr(year, month, day);
                  const isSelected = dateStr === selectedDate;
                  const isToday    = dateStr === todayStr;
                  const statuses   = bookingsByDate[dateStr] ?? [];
                  const hasPending  = statuses.includes('pending');
                  const hasConfirmed = statuses.includes('confirmed');
                  const hasCompleted = statuses.includes('completed');
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => setSelectedDate(dateStr)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dayNum,
                        isSelected && styles.dayNumSelected,
                        isToday && !isSelected && styles.dayNumToday,
                      ]}>
                        {day}
                      </Text>
                      <View style={styles.dots}>
                        {hasPending   && <View style={[styles.dot, { backgroundColor: Colors.warning }]} />}
                        {hasConfirmed && <View style={[styles.dot, { backgroundColor: Colors.success }]} />}
                        {hasCompleted && <View style={[styles.dot, { backgroundColor: Colors.primary }]} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Confirmed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
          </View>

          {/* Day detail panel */}
          <View style={styles.panel}>
            <Text style={styles.panelDate}>{formatFullDate(selectedDate)}</Text>

            {calLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />
            ) : selectedBookings.length === 0 ? (
              <View style={styles.emptyDay}>
                <Ionicons name="calendar-outline" size={26} color={Colors.textMuted} />
                <Text style={styles.emptyDayText}>No bookings on this day</Text>
              </View>
            ) : (
              <>
                <Text style={styles.panelLabel}>Bookings</Text>
                {selectedBookings.map((b: any) => {
                  const statusColor = BOOKING_STATUS_COLORS[b.status as BookingStatus] ?? Colors.textMuted;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={styles.bookingRow}
                      onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.bookingAccent, { backgroundColor: statusColor }]} />
                      <View style={styles.bookingBody}>
                        <Text style={styles.bookingName}>{b.instructor?.display_name ?? 'Instructor'}</Text>
                        <Text style={styles.bookingMeta}>{b.lesson_type?.name ?? 'Lesson'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Hero
  hero: { backgroundColor: Colors.primaryDeep, paddingBottom: Spacing.lg },
  heroContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: FontSize.xs, color: Colors.accentLight, marginTop: 3 },
  heroIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFFFFF30',
  },

  // View toggle
  viewToggle: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    padding: Spacing.sm, gap: Spacing.xs,
  },
  viewToggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: Radius.full, paddingVertical: 8,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  viewToggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  viewToggleText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  viewToggleTextActive: { color: '#fff' },
  badge: {
    backgroundColor: Colors.warning, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1, minWidth: 16, alignItems: 'center',
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  // ── Requests view ────────────────────────────────────────────────────
  requestsContainer: { flex: 1 },
  reqTabBar: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  reqTab: {
    flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  reqTabActive: { borderBottomColor: Colors.primary },
  reqTabText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },
  reqTabTextActive: { color: Colors.primary },
  reqList: { padding: Spacing.md, gap: Spacing.sm },
  reqCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  reqStatusBar: { width: 5, alignSelf: 'stretch' },
  reqCardBody: { flex: 1, paddingVertical: Spacing.md, paddingLeft: Spacing.sm, gap: 4 },
  reqCardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.xs },
  reqName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, flex: 1 },
  newBadge: { backgroundColor: Colors.warning, borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  newBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  reqMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reqMetaText: { fontSize: FontSize.sm, color: Colors.textSecondary, flexShrink: 1 },
  reqEmpty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  reqEmptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  reqEmptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  reqEmptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.lg },

  // ── Calendar view ─────────────────────────────────────────────────────
  inner: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.sm,
  },
  monthNavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  monthTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  calendar: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  weekRow: { flexDirection: 'row' },
  weekDay: {
    flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700',
    color: Colors.textMuted, paddingVertical: Spacing.xs,
  },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: Radius.sm, margin: 1 },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayCellToday: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.primary },
  dayNum: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  dayNumSelected: { color: '#fff', fontWeight: '800' },
  dayNumToday: { color: Colors.primary, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2, minHeight: 5 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  legend: {
    flexDirection: 'row', gap: Spacing.lg,
    marginBottom: Spacing.md, paddingHorizontal: Spacing.xs,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  panel: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  panelDate: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  panelLabel: {
    fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm,
  },
  bookingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: Radius.md,
    marginBottom: Spacing.xs, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, paddingRight: Spacing.sm,
  },
  bookingAccent: { width: 4, alignSelf: 'stretch' },
  bookingBody: { flex: 1, paddingVertical: Spacing.sm, paddingLeft: Spacing.sm },
  bookingName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  bookingMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, marginRight: Spacing.xs },
  statusText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  emptyDay: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
  emptyDayText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
});
