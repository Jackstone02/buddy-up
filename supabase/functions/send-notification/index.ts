import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { db: { schema: 'buddyline' } },
);

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: Record<string, any>;
  old_record?: Record<string, any>;
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound: 'default';
  priority: 'high' | 'default';
  badge: number;
  channelId?: string;
}

async function sendPush(messages: PushMessage[]) {
  if (messages.length === 0) return;

  const payload = messages.length === 1 ? messages[0] : messages;

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log('[Push] Expo response:', JSON.stringify(result));
}

// Get all push tokens for a user (all devices)
async function getUserTokens(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Push] Error fetching tokens:', error);
    return [];
  }

  return (data ?? []).map((r: any) => r.token).filter(Boolean);
}

async function getDisplayName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single();
  return data?.display_name ?? 'Someone';
}

function buildMessages(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, any>,
  priority: 'high' | 'default' = 'high',
): PushMessage[] {
  return tokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: 'default',
    priority,
    badge: 1,
    channelId: 'default',
  }));
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { type, table, record, old_record } = payload;

    console.log(`[Push] Webhook: ${type} on ${table}`);

    // ── New message ──────────────────────────────────────────────────────────
    if (table === 'messages' && type === 'INSERT') {
      const tokens = await getUserTokens(record.receiver_id);
      if (tokens.length === 0) return new Response('no tokens', { status: 200 });

      const senderName = await getDisplayName(record.sender_id);
      const body = record.content.length > 80
        ? record.content.slice(0, 80) + '…'
        : record.content;

      await sendPush(buildMessages(tokens, senderName, body, {
        type: 'message',
        otherUserId: record.sender_id,
        otherUserName: senderName,
      }));
    }

    // ── New dive request ─────────────────────────────────────────────────────
    if (table === 'dive_requests' && type === 'INSERT') {
      const tokens = await getUserTokens(record.buddy_id);
      if (tokens.length === 0) return new Response('no tokens', { status: 200 });

      const requesterName = await getDisplayName(record.requester_id);
      const date = new Date(record.requested_date).toLocaleDateString('en', { month: 'short', day: 'numeric' });

      await sendPush(buildMessages(
        tokens,
        'New Dive Request',
        `${requesterName} wants to dive with you on ${date}`,
        { type: 'dive_request', requestId: record.id },
      ));
    }

    // ── Dive request status changed ──────────────────────────────────────────
    if (table === 'dive_requests' && type === 'UPDATE') {
      if (record.status === old_record?.status) return new Response('ok', { status: 200 });

      const tokens = await getUserTokens(record.requester_id);
      if (tokens.length === 0) return new Response('no tokens', { status: 200 });

      const buddyName = await getDisplayName(record.buddy_id);
      const statusMessages: Record<string, string> = {
        accepted: `${buddyName} accepted your dive request`,
        declined: `${buddyName} declined your dive request`,
        cancelled: `${buddyName} cancelled the dive`,
      };

      const body = statusMessages[record.status];
      if (!body) return new Response('ok', { status: 200 });

      await sendPush(buildMessages(
        tokens,
        'Dive Request Update',
        body,
        { type: 'dive_request', requestId: record.id },
      ));
    }

    // ── New booking (notify instructor) ──────────────────────────────────────
    if (table === 'bookings' && type === 'INSERT') {
      const tokens = await getUserTokens(record.instructor_id);
      if (tokens.length === 0) return new Response('no tokens', { status: 200 });

      const customerName = await getDisplayName(record.customer_id);
      const date = new Date(record.booking_date).toLocaleDateString('en', { month: 'short', day: 'numeric' });

      await sendPush(buildMessages(
        tokens,
        'New Booking Request',
        `${customerName} booked a lesson on ${date}`,
        { type: 'booking_instructor', bookingId: record.id },
      ));
    }

    // ── Booking status changed ────────────────────────────────────────────────
    if (table === 'bookings' && type === 'UPDATE') {
      if (record.status === old_record?.status) return new Response('ok', { status: 200 });

      // Notify customer: instructor confirmed or cancelled
      if (['confirmed', 'cancelled'].includes(record.status)) {
        const tokens = await getUserTokens(record.customer_id);
        if (tokens.length > 0) {
          const instructorName = await getDisplayName(record.instructor_id);
          const bodyMap: Record<string, string> = {
            confirmed: `${instructorName} confirmed your lesson`,
            cancelled: `${instructorName} cancelled your lesson`,
          };
          await sendPush(buildMessages(
            tokens,
            'Booking Update',
            bodyMap[record.status],
            { type: 'booking_customer', bookingId: record.id },
          ));
        }
      }

      // Notify instructor: customer cancelled
      if (record.status === 'cancelled') {
        const tokens = await getUserTokens(record.instructor_id);
        if (tokens.length > 0) {
          const customerName = await getDisplayName(record.customer_id);
          await sendPush(buildMessages(
            tokens,
            'Booking Cancelled',
            `${customerName} cancelled their lesson`,
            { type: 'booking_instructor', bookingId: record.id },
          ));
        }
      }

      // Notify customer: lesson completed
      if (record.status === 'completed') {
        const tokens = await getUserTokens(record.customer_id);
        if (tokens.length > 0) {
          await sendPush(buildMessages(
            tokens,
            'Lesson Completed',
            'Your lesson is marked complete. How was it?',
            { type: 'booking_customer', bookingId: record.id },
            'default',
          ));
        }
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('[Push] Error:', err);
    return new Response('error', { status: 500 });
  }
});
