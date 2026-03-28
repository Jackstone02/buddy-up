// ══════════════════════════════════════════════════════════════
// DEMO MODE — remove this file and all isDemoMode() checks
// when Supabase is live. Search "DEMO MODE" across the project
// to find every touch point.
// ══════════════════════════════════════════════════════════════

import { Profile, CertifiedProfile, InstructorProfile } from '../types';

// ── Helpers ──────────────────────────────────────────────────
const now = new Date();
const d = (offset: number) => {
  const dt = new Date(now);
  dt.setDate(now.getDate() + offset);
  return dt.toISOString().split('T')[0];
};
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60 * 1000).toISOString();

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
    display_name: 'Jamie Rivera',
    city_region: 'Cebu City, Philippines',
    bio: 'Just starting my freediving journey — can\'t wait to explore the ocean safely!',
    avatar_url: null,
    age_confirmed: true,
    tos_accepted_at: ago(60 * 24 * 5),
    verification_status: 'none',
    available_to_dive: false,
    created_at: ago(60 * 24 * 10),
  },
  [DEMO_IDS.certified]: {
    id: DEMO_IDS.certified,
    role: 'certified',
    display_name: 'Alex Reyes',
    city_region: 'Cebu City, Philippines',
    bio: 'AIDA 3 freediver. Passionate about depth training and spearfishing. Always looking for a safe buddy.',
    avatar_url: null,
    age_confirmed: true,
    tos_accepted_at: ago(60 * 24 * 14),
    verification_status: 'verified',
    available_to_dive: true,
    created_at: ago(60 * 24 * 30),
  },
  [DEMO_IDS.instructor]: {
    id: DEMO_IDS.instructor,
    role: 'instructor',
    display_name: 'Marco Santos',
    city_region: 'Cebu City, Philippines',
    bio: 'AIDA & SSI certified instructor with 8 years of teaching experience. Specialising in beginners and depth training.',
    avatar_url: null,
    age_confirmed: true,
    tos_accepted_at: ago(60 * 24 * 60),
    verification_status: 'verified',
    available_to_dive: false,
    created_at: ago(60 * 24 * 90),
  },
  [DEMO_IDS.admin]: {
    id: DEMO_IDS.admin,
    role: 'admin',
    display_name: 'Admin',
    city_region: '',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    tos_accepted_at: ago(60 * 24 * 90),
    verification_status: 'verified',
    available_to_dive: false,
    created_at: ago(60 * 24 * 90),
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
  certs_offered: ['AIDA 1 Star', 'AIDA 2 Star', 'AIDA Instructor'],
  years_teaching: 8,
  credentials_url: '',
};

// ── Demo instructor list (FindScreen — instructor mode) ───────
export const DEMO_INSTRUCTORS = [
  {
    id: DEMO_IDS.instructor,
    teaching_location: 'Cebu City, Philippines',
    agencies: ['AIDA', 'SSI'],
    certs_offered: ['AIDA 1 Star', 'AIDA 2 Star', 'AIDA Instructor'],
    years_teaching: 8,
    credentials_url: '',
    profile: {
      id: DEMO_IDS.instructor,
      display_name: 'Marco Santos',
      verification_status: 'verified',
      city_region: 'Cebu City, Philippines',
      bio: 'AIDA & SSI certified instructor. 8 years experience. Depth and pool specialist.',
      avatar_url: null,
      latitude: 10.3157,
      longitude: 123.8854,
    },
  },
  {
    id: 'demo-instructor-2',
    teaching_location: 'Mactan, Cebu, Philippines',
    agencies: ['SSI'],
    certs_offered: ['SSI Level 1', 'SSI Level 2', 'SSI Instructor'],
    years_teaching: 5,
    credentials_url: '',
    profile: {
      id: 'demo-instructor-2',
      display_name: 'Maria Cruz',
      verification_status: 'verified',
      city_region: 'Mactan, Cebu, Philippines',
      bio: 'SSI instructor specialising in pool and open water training. Beginner-friendly.',
      avatar_url: null,
      latitude: 10.2965,
      longitude: 124.0217,
    },
  },
  {
    id: 'demo-instructor-3',
    teaching_location: 'Oslob, Cebu, Philippines',
    agencies: ['AIDA'],
    certs_offered: ['AIDA 1 Star', 'AIDA 2 Star', 'AIDA 3 Star'],
    years_teaching: 3,
    credentials_url: '',
    profile: {
      id: 'demo-instructor-3',
      display_name: 'James Lee',
      verification_status: 'verified',
      city_region: 'Oslob, Cebu, Philippines',
      bio: 'Passionate AIDA freedive instructor. Depth and line training specialist.',
      avatar_url: null,
      latitude: 9.4861,
      longitude: 123.3991,
    },
  },
  {
    id: 'demo-instructor-4',
    teaching_location: 'Moalboal, Cebu, Philippines',
    agencies: ['AIDA', 'PADI'],
    certs_offered: ['AIDA 1 Star', 'AIDA 2 Star', 'PADI Freediver'],
    years_teaching: 6,
    credentials_url: '',
    profile: {
      id: 'demo-instructor-4',
      display_name: 'Nina Tanaka',
      verification_status: 'verified',
      city_region: 'Moalboal, Cebu, Philippines',
      bio: 'Multilingual freediving instructor (EN/JP). Coastal reefs and wall dives.',
      avatar_url: null,
      latitude: 9.9383,
      longitude: 123.3966,
    },
  },
  {
    id: 'demo-instructor-5',
    teaching_location: 'Anilao, Batangas, Philippines',
    agencies: ['SSI', 'PADI'],
    certs_offered: ['SSI Level 1', 'SSI Level 2', 'SSI Level 3', 'SSI Instructor'],
    years_teaching: 10,
    credentials_url: '',
    profile: {
      id: 'demo-instructor-5',
      display_name: 'Tom Walsh',
      verification_status: 'verified',
      city_region: 'Anilao, Batangas, Philippines',
      bio: '10 years teaching freediving. Spearfishing and competitive depth training.',
      avatar_url: null,
      latitude: 13.7009,
      longitude: 120.7294,
    },
  },
];

// ── Demo buddy list (FindScreen — buddy mode / HomeCertified) ─
export const DEMO_BUDDIES = [
  {
    id: DEMO_IDS.certified,
    display_name: 'Alex Reyes',
    city_region: 'Cebu City, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: true,
    bio: 'AIDA 3. Depth and spearfishing. Always up for an early morning session.',
    avatar_url: null,
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
    display_name: 'Carlos Diaz',
    city_region: 'Cebu City, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: true,
    bio: 'Weekend freediver. Spearfishing enthusiast. AIDA 2 working towards AIDA 3.',
    avatar_url: null,
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
    bio: 'SSI Level 2 freediver training for depth. Love pool sessions on weekends.',
    avatar_url: null,
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
    bio: 'AIDA 3. Depth and dynamic training. Based in Mactan, dive Malapascua regularly.',
    avatar_url: null,
    latitude: 10.2965,
    longitude: 124.0217,
    certified: {
      cert_level: 'AIDA 3',
      agency: 'AIDA',
      years_experience: 5,
      disciplines: ['depth', 'dynamic', 'line_training'],
    },
  },
  {
    id: 'demo-buddy-5',
    display_name: 'Yuki Tanaka',
    city_region: 'Moalboal, Cebu, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: true,
    bio: 'Competitive freediver. AIDA 4. Static and dynamic apnea specialist.',
    avatar_url: null,
    latitude: 9.9383,
    longitude: 123.3966,
    certified: {
      cert_level: 'AIDA 4',
      agency: 'AIDA',
      years_experience: 7,
      disciplines: ['static', 'dynamic', 'pool', 'depth'],
    },
  },
  {
    id: 'demo-buddy-6',
    display_name: 'Sofia Mendoza',
    city_region: 'Oslob, Cebu, Philippines',
    role: 'certified',
    verification_status: 'verified',
    available_to_dive: false,
    bio: 'Reef diver and underwater photographer. SSI Level 3. Oslob-based.',
    avatar_url: null,
    latitude: 9.4861,
    longitude: 123.3991,
    certified: {
      cert_level: 'SSI Level 3',
      agency: 'SSI',
      years_experience: 6,
      disciplines: ['depth', 'pool', 'spearfishing'],
    },
  },
];

// ── Demo conversations (MessagesListScreen) ──────────────────
export function getDemoConversations(myId: string) {
  if (myId === DEMO_IDS.instructor) {
    return [
      {
        other_user: { id: 'demo-buddy-2', display_name: 'Carlos Diaz', avatar_url: null },
        last_message: {
          id: 'dm-conv-1',
          sender_id: 'demo-buddy-2',
          receiver_id: myId,
          content: 'Hi! I want to get my AIDA 2. Are you taking students right now?',
          is_read: false,
          created_at: ago(30),
        },
      },
      {
        other_user: { id: 'demo-buddy-3', display_name: 'Sarah Kim', avatar_url: null },
        last_message: {
          id: 'dm-conv-2',
          sender_id: myId,
          receiver_id: 'demo-buddy-3',
          content: 'Your depth training session is confirmed for Thursday at 9am.',
          is_read: true,
          created_at: ago(60 * 5),
        },
      },
      {
        other_user: { id: 'demo-buddy-4', display_name: 'Marco Diaz', avatar_url: null },
        last_message: {
          id: 'dm-conv-3',
          sender_id: 'demo-buddy-4',
          receiver_id: myId,
          content: 'Thanks for the great session! Really pushed my depth PB.',
          is_read: true,
          created_at: ago(60 * 24),
        },
      },
    ];
  }

  if (myId === DEMO_IDS.certified) {
    return [
      {
        other_user: { id: DEMO_IDS.instructor, display_name: 'Marco Santos', avatar_url: null },
        last_message: {
          id: 'dm-conv-4',
          sender_id: DEMO_IDS.instructor,
          receiver_id: myId,
          content: 'Your AIDA 2 course is booked for next Saturday. See you at 8am!',
          is_read: false,
          created_at: ago(45),
        },
      },
      {
        other_user: { id: 'demo-buddy-2', display_name: 'Carlos Diaz', avatar_url: null },
        last_message: {
          id: 'dm-conv-5',
          sender_id: myId,
          receiver_id: 'demo-buddy-2',
          content: "Sure, I'll be at Moalboal on Sunday. Meet at the entry point at 7am?",
          is_read: true,
          created_at: ago(60 * 3),
        },
      },
      {
        other_user: { id: 'demo-buddy-5', display_name: 'Yuki Tanaka', avatar_url: null },
        last_message: {
          id: 'dm-conv-6',
          sender_id: 'demo-buddy-5',
          receiver_id: myId,
          content: 'Accepted your dive request! Moalboal on Saturday sounds perfect.',
          is_read: true,
          created_at: ago(60 * 8),
        },
      },
    ];
  }

  // Beginner
  return [
    {
      other_user: { id: DEMO_IDS.instructor, display_name: 'Marco Santos', avatar_url: null },
      last_message: {
        id: 'dm-conv-7',
        sender_id: DEMO_IDS.instructor,
        receiver_id: myId,
        content: 'Welcome to your first session! Please bring a wetsuit and fins.',
        is_read: false,
        created_at: ago(60),
      },
    },
    {
      other_user: { id: 'demo-instructor-2', display_name: 'Maria Cruz', avatar_url: null },
      last_message: {
        id: 'dm-conv-8',
        sender_id: myId,
        receiver_id: 'demo-instructor-2',
        content: 'Hi, do you offer beginner pool sessions on weekends?',
        is_read: true,
        created_at: ago(60 * 24 * 2),
      },
    },
  ];
}

// ── Demo messages (MessagingScreen) ──────────────────────────
export function getDemoMessages(myId: string, otherId: string) {
  // Instructor ↔ Carlos Diaz (new inquiry)
  if (otherId === 'demo-buddy-2' && myId === DEMO_IDS.instructor) {
    return [
      { id: 'dm-1', sender_id: otherId, receiver_id: myId, content: 'Hi Marco! Saw your profile — you teach AIDA 2?', is_read: true, created_at: ago(90) },
      { id: 'dm-2', sender_id: myId, receiver_id: otherId, content: 'Yes! I run AIDA 2 courses throughout the month. What is your current level?', is_read: true, created_at: ago(80) },
      { id: 'dm-3', sender_id: otherId, receiver_id: myId, content: 'I have AIDA 1 Star and did about 8 pool sessions. Really want to progress.', is_read: true, created_at: ago(70) },
      { id: 'dm-4', sender_id: myId, receiver_id: otherId, content: 'That is a great base. The AIDA 2 course is 2 days — pool + open water. Next available is this weekend.', is_read: true, created_at: ago(60) },
      { id: 'dm-5', sender_id: otherId, receiver_id: myId, content: 'Hi! I want to get my AIDA 2. Are you taking students right now?', is_read: false, created_at: ago(30) },
    ];
  }

  // Certified ↔ Instructor
  if (otherId === DEMO_IDS.instructor) {
    return [
      { id: 'dm-10', sender_id: myId, receiver_id: otherId, content: 'Hi Marco! I saw your AIDA 2 course listing. I am AIDA 1 Star and want to progress.', is_read: true, created_at: ago(120) },
      { id: 'dm-11', sender_id: otherId, receiver_id: myId, content: 'Great to hear! AIDA 2 includes pool sessions and an open water day. Are weekends good for you?', is_read: true, created_at: ago(110) },
      { id: 'dm-12', sender_id: myId, receiver_id: otherId, content: 'Yes, weekends work well. What does it cost and what do I need to bring?', is_read: true, created_at: ago(100) },
      { id: 'dm-13', sender_id: otherId, receiver_id: myId, content: 'PHP 3,500 for the full course. Bring mask, fins, wetsuit if you have one. I provide float lines.', is_read: true, created_at: ago(90) },
      { id: 'dm-14', sender_id: myId, receiver_id: otherId, content: "Perfect, booking now through the app!", is_read: true, created_at: ago(80) },
      { id: 'dm-15', sender_id: otherId, receiver_id: myId, content: 'Your AIDA 2 course is booked for next Saturday. See you at 8am!', is_read: false, created_at: ago(45) },
    ];
  }

  // Certified ↔ Carlos (buddy chat)
  if (otherId === 'demo-buddy-2') {
    return [
      { id: 'dm-20', sender_id: otherId, receiver_id: myId, content: 'Hey! Saw you are available to dive. Moalboal this Sunday?', is_read: true, created_at: ago(60 * 4) },
      { id: 'dm-21', sender_id: myId, receiver_id: otherId, content: 'Yes! I have been wanting to check out the sardine run again.', is_read: true, created_at: ago(60 * 3.5) },
      { id: 'dm-22', sender_id: otherId, receiver_id: myId, content: 'Perfect. Max depth around 12m, mostly reef. We stay together at all times.', is_read: true, created_at: ago(60 * 3.2) },
      { id: 'dm-23', sender_id: myId, receiver_id: otherId, content: "Sure, I'll be at Moalboal on Sunday. Meet at the entry point at 7am?", is_read: true, created_at: ago(60 * 3) },
    ];
  }

  // Certified ↔ Yuki (dive request accepted)
  if (otherId === 'demo-buddy-5') {
    return [
      { id: 'dm-30', sender_id: myId, receiver_id: otherId, content: 'Hi Yuki! Sent you a dive request for Saturday at Moalboal. Let me know if it works!', is_read: true, created_at: ago(60 * 9) },
      { id: 'dm-31', sender_id: otherId, receiver_id: myId, content: 'Looks good! I know Moalboal well. Which entry point — Panagsama or White Beach side?', is_read: true, created_at: ago(60 * 8.5) },
      { id: 'dm-32', sender_id: myId, receiver_id: otherId, content: 'Panagsama works for me. Easier parking and the reef is nicer.', is_read: true, created_at: ago(60 * 8.2) },
      { id: 'dm-33', sender_id: otherId, receiver_id: myId, content: 'Accepted your dive request! Moalboal on Saturday sounds perfect.', is_read: true, created_at: ago(60 * 8) },
    ];
  }

  // Beginner ↔ Instructor
  if (otherId === DEMO_IDS.instructor) {
    return [
      { id: 'dm-40', sender_id: myId, receiver_id: otherId, content: 'Hi! I am a complete beginner — do you offer intro pool sessions?', is_read: true, created_at: ago(60 * 24 * 2) },
      { id: 'dm-41', sender_id: otherId, receiver_id: myId, content: 'Hi Jamie! Yes, I offer a 2-hour Intro to Freediving pool session — perfect for beginners.', is_read: true, created_at: ago(60 * 24 * 2 - 30) },
      { id: 'dm-42', sender_id: myId, receiver_id: otherId, content: 'That sounds great! I will book through the app.', is_read: true, created_at: ago(60 * 24) },
      { id: 'dm-43', sender_id: otherId, receiver_id: myId, content: 'Welcome to your first session! Please bring a wetsuit and fins.', is_read: false, created_at: ago(60) },
    ];
  }

  // Fallback generic
  return [
    { id: 'dm-g1', sender_id: otherId, receiver_id: myId, content: 'Hey! Are you free to dive this weekend?', is_read: true, created_at: ago(60) },
    { id: 'dm-g2', sender_id: myId, receiver_id: otherId, content: 'Sounds great! Where are you thinking?', is_read: true, created_at: ago(55) },
    { id: 'dm-g3', sender_id: otherId, receiver_id: myId, content: 'Moalboal — shallow reef, max 15m. Never dive alone 🤝', is_read: false, created_at: ago(25) },
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
  {
    id: 'demo-lesson-4',
    instructor_id: DEMO_IDS.instructor,
    name: 'Static Apnea Clinic',
    duration_minutes: 60,
    skill_level: 'All levels',
    session_format: 'Pool',
    price: 60,
    max_participants: 6,
  },
  // Maria Cruz (demo-instructor-2)
  {
    id: 'demo-lesson-5',
    instructor_id: 'demo-instructor-2',
    name: 'SSI Level 1 Course',
    duration_minutes: 120,
    skill_level: 'Beginner',
    session_format: 'Pool + Open Water',
    price: 200,
    max_participants: 4,
  },
  {
    id: 'demo-lesson-6',
    instructor_id: 'demo-instructor-2',
    name: 'Pool Refresher Session',
    duration_minutes: 90,
    skill_level: 'All levels',
    session_format: 'Pool',
    price: 65,
    max_participants: 6,
  },
  // James Lee (demo-instructor-3)
  {
    id: 'demo-lesson-7',
    instructor_id: 'demo-instructor-3',
    name: 'AIDA 1 Star Course',
    duration_minutes: 120,
    skill_level: 'Beginner',
    session_format: 'Pool + Open Water',
    price: 180,
    max_participants: 4,
  },
  {
    id: 'demo-lesson-8',
    instructor_id: 'demo-instructor-3',
    name: 'Line Training — Depth',
    duration_minutes: 90,
    skill_level: 'Intermediate',
    session_format: 'Open Water',
    price: 110,
    max_participants: 2,
  },
  // Nina Tanaka (demo-instructor-4)
  {
    id: 'demo-lesson-9',
    instructor_id: 'demo-instructor-4',
    name: 'AIDA 2 Course',
    duration_minutes: 180,
    skill_level: 'Beginner',
    session_format: 'Pool + Open Water',
    price: 240,
    max_participants: 3,
  },
  {
    id: 'demo-lesson-10',
    instructor_id: 'demo-instructor-4',
    name: 'PADI Freediver Course',
    duration_minutes: 150,
    skill_level: 'Beginner',
    session_format: 'Pool + Open Water',
    price: 220,
    max_participants: 3,
  },
  // Tom Walsh (demo-instructor-5)
  {
    id: 'demo-lesson-11',
    instructor_id: 'demo-instructor-5',
    name: 'SSI Level 2 Course',
    duration_minutes: 180,
    skill_level: 'Intermediate',
    session_format: 'Pool + Open Water',
    price: 280,
    max_participants: 3,
  },
  {
    id: 'demo-lesson-12',
    instructor_id: 'demo-instructor-5',
    name: 'Spearfishing Intro',
    duration_minutes: 120,
    skill_level: 'Intermediate',
    session_format: 'Open Water',
    price: 150,
    max_participants: 2,
  },
];

// ── Demo availability slots (AvailabilityScreen / BookingForm) ─
export const DEMO_SLOTS = [
  { id: 'slot-1', instructor_id: DEMO_IDS.instructor, slot_date: d(1), start_time: '08:00', end_time: '10:00', is_booked: false },
  { id: 'slot-2', instructor_id: DEMO_IDS.instructor, slot_date: d(1), start_time: '14:00', end_time: '16:00', is_booked: true },
  { id: 'slot-3', instructor_id: DEMO_IDS.instructor, slot_date: d(3), start_time: '09:00', end_time: '12:00', is_booked: false },
  { id: 'slot-4', instructor_id: DEMO_IDS.instructor, slot_date: d(3), start_time: '14:00', end_time: '15:30', is_booked: true },
  { id: 'slot-5', instructor_id: DEMO_IDS.instructor, slot_date: d(5), start_time: '08:00', end_time: '10:00', is_booked: false },
  { id: 'slot-6', instructor_id: DEMO_IDS.instructor, slot_date: d(7), start_time: '10:00', end_time: '13:00', is_booked: false },
  { id: 'slot-7', instructor_id: DEMO_IDS.instructor, slot_date: d(7), start_time: '15:00', end_time: '16:00', is_booked: false },
];

// ── Demo bookings — student/beginner view (MyBookingsScreen) ──
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
    notes: 'First time in the pool — very excited!',
    status: 'confirmed',
    created_at: ago(60 * 24 * 2),
    instructor: { id: DEMO_IDS.instructor, display_name: 'Marco Santos', city_region: 'Cebu City, Philippines' },
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
    participants_count: 1,
    notes: null,
    status: 'completed',
    created_at: ago(60 * 24 * 8),
    instructor: { id: 'demo-instructor-2', display_name: 'Maria Cruz', city_region: 'Mactan, Cebu, Philippines' },
    lesson_type: { id: 'demo-lesson-x', name: 'SSI Pool Session', duration_minutes: 90, skill_level: 'Beginner', session_format: 'Pool', price: 70, max_participants: 4 },
  },
  {
    id: 'booking-6',
    customer_id: DEMO_IDS.certified,
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-2',
    availability_slot_id: 'slot-3',
    booking_date: d(3),
    start_time: '09:00',
    participants_count: 1,
    notes: 'Working towards AIDA 3. Already have AIDA 2.',
    status: 'confirmed',
    created_at: ago(60 * 24),
    instructor: { id: DEMO_IDS.instructor, display_name: 'Marco Santos', city_region: 'Cebu City, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[1],
  },
  {
    id: 'booking-7',
    customer_id: DEMO_IDS.certified,
    instructor_id: 'demo-instructor-4',
    lesson_type_id: 'demo-lesson-y',
    availability_slot_id: 'slot-y',
    booking_date: d(-3),
    start_time: '08:00',
    participants_count: 1,
    notes: null,
    status: 'completed',
    created_at: ago(60 * 24 * 5),
    instructor: { id: 'demo-instructor-4', display_name: 'Nina Tanaka', city_region: 'Moalboal, Cebu, Philippines' },
    lesson_type: { id: 'demo-lesson-y', name: 'Depth Training Session', duration_minutes: 90, skill_level: 'Intermediate', session_format: 'Open Water', price: 120, max_participants: 2 },
  },
];

// ── Demo bookings — instructor view (AvailabilityScreen) ──────
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
    notes: 'Looking to start with AIDA. First time in a formal course.',
    status: 'pending',
    created_at: ago(60 * 2),
    customer: { id: 'demo-buddy-2', display_name: 'Carlos Diaz', city_region: 'Cebu City, Philippines' },
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
    created_at: ago(60 * 24),
    customer: { id: 'demo-buddy-3', display_name: 'Sarah Kim', city_region: 'Cebu City, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[2],
  },
  {
    id: 'booking-5',
    customer_id: 'demo-buddy-4',
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-2',
    availability_slot_id: 'slot-4',
    booking_date: d(3),
    start_time: '14:00',
    participants_count: 2,
    notes: 'Bringing a friend who also has AIDA 1 Star.',
    status: 'pending',
    created_at: ago(60 * 5),
    customer: { id: 'demo-buddy-4', display_name: 'Marco Diaz', city_region: 'Mactan, Cebu, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[1],
  },
  {
    id: 'booking-8',
    customer_id: DEMO_IDS.certified,
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-2',
    availability_slot_id: 'slot-3',
    booking_date: d(3),
    start_time: '09:00',
    participants_count: 1,
    notes: 'Working towards AIDA 3.',
    status: 'confirmed',
    created_at: ago(60 * 24),
    customer: { id: DEMO_IDS.certified, display_name: 'Alex Reyes', city_region: 'Cebu City, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[1],
  },
  {
    id: 'booking-9',
    customer_id: 'demo-buddy-5',
    instructor_id: DEMO_IDS.instructor,
    lesson_type_id: 'demo-lesson-4',
    availability_slot_id: 'slot-x3',
    booking_date: d(-7),
    start_time: '10:00',
    participants_count: 3,
    notes: null,
    status: 'completed',
    created_at: ago(60 * 24 * 9),
    customer: { id: 'demo-buddy-5', display_name: 'Yuki Tanaka', city_region: 'Moalboal, Cebu, Philippines' },
    lesson_type: DEMO_LESSON_TYPES[3],
  },
];

// ── Demo dive requests — certified view (MyActivityScreen) ────
export const DEMO_DIVE_REQUESTS = [
  // Incoming: someone asked Alex Reyes to dive
  {
    id: 'req-1',
    requester_id: 'demo-buddy-2',
    buddy_id: DEMO_IDS.certified,
    requested_date: d(2),
    location_name: 'Moalboal, Cebu',
    disciplines: ['depth', 'spearfishing'],
    notes: 'Sardine run area, max 12m. Planning a morning session.',
    status: 'pending',
    created_at: ago(60 * 2),
    requester: { id: 'demo-buddy-2', display_name: 'Carlos Diaz', avatar_url: null, city_region: 'Cebu City, Philippines' },
    buddy: { id: DEMO_IDS.certified, display_name: 'Alex Reyes', avatar_url: null, city_region: 'Cebu City, Philippines' },
  },
  {
    id: 'req-2',
    requester_id: 'demo-buddy-4',
    buddy_id: DEMO_IDS.certified,
    requested_date: d(-1),
    location_name: 'Malapascua Island, Cebu',
    disciplines: ['depth'],
    notes: null,
    status: 'accepted',
    created_at: ago(60 * 24 * 2),
    requester: { id: 'demo-buddy-4', display_name: 'Marco Diaz', avatar_url: null, city_region: 'Mactan, Cebu, Philippines' },
    buddy: { id: DEMO_IDS.certified, display_name: 'Alex Reyes', avatar_url: null, city_region: 'Cebu City, Philippines' },
  },
  {
    id: 'req-3',
    requester_id: 'demo-buddy-3',
    buddy_id: DEMO_IDS.certified,
    requested_date: d(-5),
    location_name: 'Panagsama Beach, Moalboal',
    disciplines: ['pool', 'dynamic'],
    notes: 'Wanted to work on dynamic apnea technique.',
    status: 'declined',
    created_at: ago(60 * 24 * 7),
    requester: { id: 'demo-buddy-3', display_name: 'Sarah Kim', avatar_url: null, city_region: 'Cebu City, Philippines' },
    buddy: { id: DEMO_IDS.certified, display_name: 'Alex Reyes', avatar_url: null, city_region: 'Cebu City, Philippines' },
  },
  // Outgoing: Alex Reyes asked someone to dive
  {
    id: 'req-4',
    requester_id: DEMO_IDS.certified,
    buddy_id: 'demo-buddy-5',
    requested_date: d(4),
    location_name: 'Moalboal, Cebu',
    disciplines: ['depth', 'static'],
    notes: 'Would love to train with someone at AIDA 4 level.',
    status: 'accepted',
    created_at: ago(60 * 9),
    requester: { id: DEMO_IDS.certified, display_name: 'Alex Reyes', avatar_url: null, city_region: 'Cebu City, Philippines' },
    buddy: { id: 'demo-buddy-5', display_name: 'Yuki Tanaka', avatar_url: null, city_region: 'Moalboal, Cebu, Philippines' },
  },
  {
    id: 'req-5',
    requester_id: DEMO_IDS.certified,
    buddy_id: 'demo-buddy-6',
    requested_date: d(7),
    location_name: 'Oslob, Cebu',
    disciplines: ['depth', 'spearfishing'],
    notes: null,
    status: 'pending',
    created_at: ago(60 * 30),
    requester: { id: DEMO_IDS.certified, display_name: 'Alex Reyes', avatar_url: null, city_region: 'Cebu City, Philippines' },
    buddy: { id: 'demo-buddy-6', display_name: 'Sofia Mendoza', avatar_url: null, city_region: 'Oslob, Cebu, Philippines' },
  },
];

// ── Demo recent messages (InstructorDashboardScreen) ─────────
export function getDemoRecentMessages(myId: string) {
  return [
    {
      id: 'drm-1',
      sender_id: 'demo-buddy-2',
      receiver_id: myId,
      content: 'Hi! I want to get my AIDA 2. Are you taking students right now?',
      is_read: false,
      created_at: ago(30),
      sender: { id: 'demo-buddy-2', display_name: 'Carlos Diaz' },
    },
    {
      id: 'drm-2',
      sender_id: 'demo-buddy-3',
      receiver_id: myId,
      content: 'What are your rates for a private depth training session?',
      is_read: true,
      created_at: ago(60 * 5),
      sender: { id: 'demo-buddy-3', display_name: 'Sarah Kim' },
    },
    {
      id: 'drm-3',
      sender_id: 'demo-buddy-4',
      receiver_id: myId,
      content: 'Thanks for the great session last week! Really pushed my depth PB.',
      is_read: true,
      created_at: ago(60 * 24),
      sender: { id: 'demo-buddy-4', display_name: 'Marco Diaz' },
    },
  ];
}

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
      created_at: ago(60 * 5),
    },
    instructor_profile: {
      teaching_location: 'Manila Bay, Philippines',
      agencies: ['AIDA'],
      certs_offered: ['AIDA 1 Star', 'AIDA Instructor'],
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
      created_at: ago(60 * 22),
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
      created_at: ago(60 * 48),
    },
    instructor_profile: {
      teaching_location: 'Anilao, Batangas',
      agencies: ['SSI', 'PADI'],
      certs_offered: ['SSI Instructor', 'PADI Freediver Instructor'],
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
    tos_accepted_at: ago(60 * 24 * 3),
    verification_status: 'pending',
    available_to_dive: false,
    created_at: ago(60 * 5),
  },
  {
    id: 'demo-pending-2',
    role: 'certified',
    display_name: 'Nina Reyes',
    city_region: 'Dumaguete, Philippines',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    tos_accepted_at: ago(60 * 24 * 2),
    verification_status: 'pending',
    available_to_dive: false,
    created_at: ago(60 * 22),
  },
  {
    id: 'demo-pending-3',
    role: 'instructor',
    display_name: 'Tom Walsh',
    city_region: 'Anilao, Batangas, Philippines',
    bio: '',
    avatar_url: null,
    age_confirmed: true,
    tos_accepted_at: ago(60 * 24 * 5),
    verification_status: 'pending',
    available_to_dive: false,
    created_at: ago(60 * 48),
  },
];
