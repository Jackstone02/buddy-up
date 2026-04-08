import React, { useState, useCallback, useEffect } from 'react';
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
import { RootStackParamList } from '../../types';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import UserAvatar from '../../components/UserAvatar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MessagesListScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (profile) fetchConversations();
    }, [profile])
  );

  // Real-time: re-fetch conversation list when any message arrives or is sent
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('messages-list')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'buddyline',
        table: 'messages',
        filter: `receiver_id=eq.${profile.id}`,
      }, () => fetchConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const fetchConversations = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(id, display_name, avatar_url), receiver:profiles!receiver_id(id, display_name, avatar_url)')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    const seen = new Set<string>();
    const convos: any[] = [];
    (data || []).forEach((msg: any) => {
      const otherId = msg.sender_id === profile.id ? msg.receiver_id : msg.sender_id;
      const otherUser = msg.sender_id === profile.id ? msg.receiver : msg.sender;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        convos.push({ other_user: otherUser, last_message: msg });
      }
    });

    setConversations(convos);
    setLoading(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 1) return `${Math.floor(diffH * 60)}m ago`;
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Messages</Text>
              <Text style={styles.heroSub}>
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="chatbubbles" size={26} color={Colors.accent} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.other_user?.id ?? Math.random().toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubble-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>
                Find a buddy or instructor and send them a message.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convoRow}
              onPress={() =>
                navigation.navigate('Messaging', {
                  otherUserId: item.other_user?.id,
                  otherUserName: item.other_user?.display_name ?? 'User',
                })
              }
              activeOpacity={0.85}
            >
              <UserAvatar
                avatarUrl={item.other_user?.avatar_url}
                name={item.other_user?.display_name ?? '?'}
                size={50}
              />
              <View style={styles.convoInfo}>
                <View style={styles.convoTopRow}>
                  <Text style={styles.convoName}>{item.other_user?.display_name ?? 'User'}</Text>
                  <Text style={styles.convoTime}>{formatTime(item.last_message.created_at)}</Text>
                </View>
                <Text style={styles.convoLast} numberOfLines={1}>
                  {item.last_message.sender_id === profile?.id ? 'You: ' : ''}
                  {item.last_message.content}
                </Text>
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
  heroLeft: {},
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
  list: { paddingVertical: Spacing.xs },
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
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
  convoInfo: { flex: 1, minWidth: 0 },
  convoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  convoName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  convoTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  convoLast: { fontSize: FontSize.sm, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptySubText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
});
