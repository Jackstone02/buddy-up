import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Profile, CertifiedProfile, InstructorProfile } from '../types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  certifiedProfile: CertifiedProfile | null;
  instructorProfile: InstructorProfile | null;
  isLoading: boolean;
  safetyAccepted: boolean;
  demoMode: boolean; // DEMO MODE — remove when Supabase is live
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setCertifiedProfile: (profile: CertifiedProfile | null) => void;
  setInstructorProfile: (profile: InstructorProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setSafetyAccepted: (accepted: boolean) => void;
  setDemoMode: (demoMode: boolean) => void; // DEMO MODE
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  certifiedProfile: null,
  instructorProfile: null,
  isLoading: true,
  safetyAccepted: false,
  demoMode: false, // DEMO MODE
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setCertifiedProfile: (certifiedProfile) => set({ certifiedProfile }),
  setInstructorProfile: (instructorProfile) => set({ instructorProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  setSafetyAccepted: (safetyAccepted) => set({ safetyAccepted }),
  setDemoMode: (demoMode) => set({ demoMode }), // DEMO MODE
  clearAuth: () =>
    set({ session: null, profile: null, certifiedProfile: null, instructorProfile: null, demoMode: false }),
}));
