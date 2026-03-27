// ══════════════════════════════════════════════════════════════
// DEMO MODE — remove this file and all isDemoMode() checks
// when Supabase is live. Search "DEMO MODE" across the project
// to find every touch point.
// ══════════════════════════════════════════════════════════════

import { Profile, CertifiedProfile, InstructorProfile } from '../types';

// ── Demo user IDs ────────────────────────────────────────────
export const DEMO_IDS = {
  beginner:   'demo-beginner',
  certified:  'demo-certified',
  instructor: 'demo-instructor',
  admin:      'demo-admin',
} as const;

export function isDemoMode(id: string | undefined | null): boolean {
  if (!id) return false;
  return Object.values(DEMO_IDS).includes(id as any);
}

// ── Demo profiles ────────────────────────────────────────────
export const DEMO_PROFILES: Record<string, Profile> = {
  [DEMO_IDS.beginner]: {
    id: DEMO_IDS.beginner,
    role: 'beginner',
    display_name: 'Demo Beginner',
    city_region: 'Cebu City, Philippines',
    bio: 'Just starting out — excited to learn freediving!',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'none',
    available_to_dive: false,
    created_at: new Date().toISOString(),
  },
  [DEMO_IDS.certified]: {
    id: DEMO_IDS.certified,
    role: 'certified',
    display_name: 'Demo Certified',
    city_region: 'Cebu City, Philippines',
    bio: 'AIDA 3 freediver. Love depth training and spearfishing.',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'verified',
    available_to_dive: true,
    created_at: new Date().toISOString(),
  },
  [DEMO_IDS.instructor]: {
    id: DEMO_IDS.instructor,
    role: 'instructor',
    display_name: 'Demo Instructor',
    city_region: 'Cebu City, Philippines',
    bio: 'Certified AIDA & SSI instructor with 8 years teaching experience.',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'verified',
    available_to_dive: false,
    created_at: new Date().toISOString(),
  },
  [DEMO_IDS.admin]: {
    id: DEMO_IDS.admin,
    role: 'admin',
    display_name: 'Admin',
    city_region: '',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'verified',
    available_to_dive: false,
    created_at: new Date().toISOString(),
  },
};

export const DEMO_CERTIFIED_PROFILE: CertifiedProfile = {
  id: DEMO_IDS.certified,
  cert_level: 'AIDA 3',
  agency: 'AIDA',
  years_experience: 4,
  disciplines: ['depth', 'spearfishing', 'pool'],
  cert_card_url: '',
};

export const DEMO_INSTRUCTOR_PROFILE: InstructorProfile = {
  id: DEMO_IDS.instructor,
  teaching_location: 'Cebu City, Philippines',
  agencies: ['AIDA', 'SSI'],
  certs_offered: ['AIDA Instructor', 'SSI Instructor'],
  years_teaching: 8,
  credentials_url: '',
};

// ── Demo instructor list (FindScreen — instructor mode) ───────
export const DEMO_INSTRUCTORS = [
  {
    id: DEMO_IDS.instructor,
    teaching_location: 'Cebu City, Philippines',
    agencies: ['AIDA', 'SSI'],
    certs_offered: ['AIDA Instructor', 'SSI Instructor'],
    years_teaching: 8,
    credentials_url: '',
    profile: {
      id: DEMO_IDS.instructor,
      display_name: 'Demo Instructor',
      verification_status: 'verified',
      city_region: 'Cebu City, Philippines',
      bio: 'Certified AIDA & SSI instructor.',
      latitude: 10.3157,
      longitude: 123.8854,
    },
  },
  {
    id: 'demo-instructor-2',
    teaching_location: 'Mactan, Cebu, Philippines',
    agencies: ['SSI'],
    certs_offered: ['SSI Instructor'],
    years_teaching: 5,
    credentials_url: '',
    profile: {
      id: 'demo-instructor-2',
      display_name: 'Maria Santos',
      verification_status: 'verified',
      city_region: 'Mactan, Cebu, Philippines',
      bio: 'SSI instructor specializing in pool and open water training.',
      latitude: 10.2965,
      longitude: 124.0217,
    },
  },
  {
    id: 'demo-instructor-3',
    teaching_location: 'Oslob, Cebu, Philippines',
    agencies: ['AIDA'],
    certs_offered: ['AIDA Instructor'],
    years_teaching: 3,
    credentials_url: '',
    profile: {
      id: 'demo-instructor-3',
      display_name: 'James Lee',
      verification_status: 'verified',
      city_region: 'Oslob, Cebu, Philippines',
      bio: 'Passionate AIDA freedive instructor. Depth specialist.',
      latitude: 9.4861,
      longitude: 123.3991,
    },
  },
];

// ── Demo buddy list (FindScreen — buddy mode / HomeCertified) ─
export const DEMO_BUDDIES = [
  {
    id: DEMO_IDS.certified,
    display_name: 'Demo Certified',
    city_region: 'Cebu City, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: true,
    bio: 'AIDA 3. Love depth and spearfishing.',
    latitude: 10.3200,
    longitude: 123.8900,
    certified: {
      cert_level: 'AIDA 3',
      agency: 'AIDA',
      years_experience: 4,
      disciplines: ['depth', 'spearfishing', 'pool'],
    },
  },
  {
    id: 'demo-buddy-2',
    display_name: 'Alex Cruz',
    city_region: 'Cebu City, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: true,
    bio: 'Weekend freediver. Spearfishing enthusiast.',
    latitude: 10.3050,
    longitude: 123.8800,
    certified: {
      cert_level: 'AIDA 2',
      agency: 'AIDA',
      years_experience: 2,
      disciplines: ['spearfishing', 'static'],
    },
  },
  {
    id: 'demo-buddy-3',
    display_name: 'Sarah Kim',
    city_region: 'Cebu City, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: false,
    bio: 'SSI freediver training for depth.',
    latitude: 10.3100,
    longitude: 123.8950,
    certified: {
      cert_level: 'SSI Level 2',
      agency: 'SSI',
      years_experience: 3,
      disciplines: ['depth', 'dynamic', 'pool'],
    },
  },
  {
    id: 'demo-buddy-4',
    display_name: 'Marco Diaz',
    city_region: 'Mactan, Cebu, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: true,
    bio: 'AIDA 3 diver. Depth and dynamic training.',
    latitude: 10.2965,
    longitude: 124.0217,
    certified: {
      cert_level: 'AIDA 3',
      agency: 'AIDA',
      years_experience: 5,
      disciplines: ['depth', 'dynamic', 'line_training'],
    },
  },
];

// ── Demo conversations (MessagesListScreen) ──────────────────
export function getDemoConversations(myId: string) {
  const otherId = myId === DEMO_IDS.instructor ? 'demo-buddy-2' : DEMO_IDS.instructor;
  const otherName = myId === DEMO_IDS.instructor ? 'Alex Cruz' : 'Demo Instructor';
  const now = new Date();

  return [
    {
      other_user: { id: otherId, display_name: otherName },
      last_message: {
        id: 'demo-msg-1',
        sender_id: otherId,
        receiver_id: myId,
        content: 'Hey! Are you free to dive this weekend?',
        is_read: false,
        created_at: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
      },
    },
    {
      other_user: { id: 'demo-buddy-3', display_name: 'Sarah Kim' },
      last_message: {
        id: 'demo-msg-2',
        sender_id: myId,
        receiver_id: 'demo-buddy-3',
        content: "Sure, I'll be at Moalboal on Sunday.",
        is_read: true,
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
      },
    },
  ];
}

// ── Demo messages (MessagingScreen) ──────────────────────────
export function getDemoMessages(myId: string, otherId: string) {
  const now = new Date();
  return [
    {
      id: 'dm-1',
      sender_id: otherId,
      receiver_id: myId,
      content: 'Hey! Saw your profile. Want to buddy up this weekend?',
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'dm-2',
      sender_id: myId,
      receiver_id: otherId,
      content: 'Sounds great! Where are you thinking?',
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 55).toISOString(),
    },
    {
      id: 'dm-3',
      sender_id: otherId,
      receiver_id: myId,
      content: 'Moalboal works — I know a good entry point. Shallow reef, max 15m.',
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 50).toISOString(),
    },
    {
      id: 'dm-4',
      sender_id: myId,
      receiver_id: otherId,
      content: "Perfect, that's within my training. Meet at 8am?",
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'dm-5',
      sender_id: otherId,
      receiver_id: myId,
      content: '8am works! Bring your safety lanyard. Never dive alone 🤝',
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
    },
  ];
}

// ── Demo lesson types (BookingFormScreen / InstructorProfile) ─
export const DEMO_LESSON_TYPES = [
  {
    id: 'demo-lesson-1',
    instructor_id: DEMO_IDS.instructor,
    name: 'Intro to Freediving',
    duration_minutes: 120,
    skill_level: 'Beginner',
    session_format: 'Pool',
    price: 80,
    max_participants: 4,
  },
  {
    id: 'demo-lesson-2',
    instructor_id: DEMO_IDS.instructor,
    name: 'AIDA 2 Course',
    duration_minutes: 180,
    skill_level: 'Beginner',
    session_format: 'Pool + Open Water',
    price: 250,
    max_participants: 3,
  },
  {
    id: 'demo-lesson-3',
    instructor_id: DEMO_IDS.instructor,
    name: 'Depth Training Session',
    duration_minutes: 90,
    skill_level: 'Intermediate',
    session_format: 'Open Water',
    price: 120,
    max_participants: 2,
  },
];

// ── Demo availability slots (BookingFormScreen) ───────────────
const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(today.getDate() + offset);
  return dt.toISOString().split('T')[0];
};

export const DEMO_SLOTS = [
  { id: 'slot-1', instructor_id: DEMO_IDS.instructor, slot_date: d(1), start_time: '08:00', end_time: '10:00', is_booked: false },
  { id: 'slot-2', instructor_id: DEMO_IDS.instructor, slot_date: d(1), start_time: '14:00', end_time: '16:00', is_booked: true },
  { id: 'slot-3', instructor_id: DEMO_IDS.instructor, slot_date: d(3), start_time: '09:00', end_time: '12:00', is_booked: false },
  { id: 'slot-4', instructor_id: DEMO_IDS.instructor, slot_date: d(5), start_time: '08:00', end_time: '10:00', is_booked: false },
  { id: 'slot-5', instructor_id: DEMO_IDS.instructor, slot_date: d(7), start_time: '10:00', end_time: '13:00', is_booked: false },
];

// ── Demo bookings (student view — MyBookingsScreen) ──────────
export const DEMO_CUSTOMER_BOOKINGS = [
  {
    id: 'booking-1',
    customer_id: DEMO_IDS.beginner,
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-1',
    availability_slot_id: 'slot-2',
    booking_date: d(1),
    start_time: '14:00',
    participants_count: 1,
    notes: 'First time in the pool!',
    status: 'confirmed',
    created_at: new Date().toISOString(),
    instructor: { id: DEMO_IDS.instructor, display_name: 'Demo Instructor', city_region: 'Cebu City, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[0],
  },
  {
    id: 'booking-2',
    customer_id: DEMO_IDS.beginner,
    instructor_id: 'demo-instructor-2',
    lesson_type_id: 'demo-lesson-x',
    availability_slot_id: 'slot-x',
    booking_date: d(-5),
    start_time: '09:00',
    participants_count: 2,
    notes: null,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    instructor: { id: 'demo-instructor-2', display_name: 'Maria Santos', city_region: 'Mactan, Cebu, Philippines' },
    lesson_type: { id: 'demo-lesson-x', name: 'SSI Pool Session', duration_minutes: 90, skill_level: 'Beginner', session_format: 'Pool', price: 70, max_participants: 4 },
  },
];

// ── Demo bookings (instructor view — BookingRequestsScreen) ──
export const DEMO_INSTRUCTOR_BOOKINGS = [
  {
    id: 'booking-3',
    customer_id: 'demo-buddy-2',
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-1',
    availability_slot_id: 'slot-3',
    booking_date: d(3),
    start_time: '09:00',
    participants_count: 1,
    notes: 'Looking to get started with AIDA.',
    status: 'pending',
    created_at: new Date().toISOString(),
    customer: { id: 'demo-buddy-2', display_name: 'Alex Cruz', city_region: 'Cebu City, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[0],
  },
  {
    id: 'booking-4',
    customer_id: 'demo-buddy-3',
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-3',
    availability_slot_id: 'slot-2',
    booking_date: d(1),
    start_time: '14:00',
    participants_count: 1,
    notes: null,
    status: 'confirmed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    customer: { id: 'demo-buddy-3', display_name: 'Sarah Kim', city_region: 'Cebu City, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[2],
  },
  {
    id: 'booking-5',
    customer_id: 'demo-buddy-4',
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-2',
    availability_slot_id: 'slot-x2',
    booking_date: d(-3),
    start_time: '08:00',
    participants_count: 2,
    notes: 'Bringing a friend.',
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    customer: { id: 'demo-buddy-4', display_name: 'Marco Diaz', city_region: 'Mactan, Cebu, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[1],
  },
];

// ── Demo pending verifications (AdminVerificationsScreen) ────
export const DEMO_PENDING_VERIFICATIONS = [
  {
    id: 'pending-1',
    profile: {
      id: 'demo-pending-1',
      display_name: 'Carlos Rivera',
      city_region: 'Manila, Philippines',
      role: 'instructor',
      verification_status: 'pending',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    instructor_profile: {
      teaching_location: 'Manila Bay, Philippines',
      agencies: ['AIDA'],
      certs_offered: ['AIDA Instructor'],
      years_teaching: 3,
      credentials_url: 'https://placehold.co/400x300.png',
    },
  },
  {
    id: 'pending-2',
    profile: {
      id: 'demo-pending-2',
      display_name: 'Nina Reyes',
      city_region: 'Dumaguete, Philippines',
      role: 'certified',
      verification_status: 'pending',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
    certified_profile: {
      cert_level: 'AIDA 3',
      agency: 'AIDA',
      years_experience: 5,
      disciplines: ['depth', 'pool'],
      cert_card_url: 'https://placehold.co/400x300.png',
    },
  },
  {
    id: 'pending-3',
    profile: {
      id: 'demo-pending-3',
      display_name: 'Tom Walsh',
      city_region: 'Anilao, Batangas, Philippines',
      role: 'instructor',
      verification_status: 'pending',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    instructor_profile: {
      teaching_location: 'Anilao, Batangas',
      agencies: ['SSI', 'PADI'],
      certs_offered: ['SSI Instructor', 'PADI Instructor'],
      years_teaching: 7,
      credentials_url: 'https://placehold.co/400x300.png',
    },
  },
];

// ── Demo all users (AdminOverviewScreen) ─────────────────────
export const DEMO_ALL_USERS = [
  { ...DEMO_PROFILES[DEMO_IDS.beginner] },
  { ...DEMO_PROFILES[DEMO_IDS.certified] },
  { ...DEMO_PROFILES[DEMO_IDS.instructor] },
  {
    id: 'demo-pending-1',
    role: 'instructor',
    display_name: 'Carlos Rivera',
    city_region: 'Manila, Philippines',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'pending',
    available_to_dive: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'demo-pending-2',
    role: 'certified',
    display_name: 'Nina Reyes',
    city_region: 'Dumaguete, Philippines',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'pending',
    available_to_dive: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: 'demo-pending-3',
    role: 'instructor',
    display_name: 'Tom Walsh',
    city_region: 'Anilao, Batangas, Philippines',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    verification_status: 'pending',
    available_to_dive: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// ── Demo recent messages (InstructorDashboardScreen) ─────────
export function getDemoRecentMessages(myId: string) {
  const now = new Date();
  return [
    {
      id: 'drm-1',
      sender_id: 'demo-buddy-2',
      receiver_id: myId,
      content: 'Hi! I want to get my AIDA 2. Are you taking students?',
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      sender: { id: 'demo-buddy-2', display_name: 'Alex Cruz' },
    },
    {
      id: 'drm-2',
      sender_id: 'demo-buddy-3',
      receiver_id: myId,
      content: 'What are your rates for a private pool session?',
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
      sender: { id: 'demo-buddy-3', display_name: 'Sarah Kim' },
    },
  ];
}
