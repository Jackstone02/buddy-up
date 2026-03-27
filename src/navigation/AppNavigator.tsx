import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Auth
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import SocialOnboardingScreen from '../screens/auth/SocialOnboardingScreen';
import TermsOfServiceScreen from '../screens/auth/TermsOfServiceScreen';

// Profile setup
import ProfileSetupScreen from '../screens/profile/ProfileSetupScreen';
import VerificationPendingScreen from '../screens/profile/VerificationPendingScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';

// Shared
import SafetyScreen from '../screens/shared/SafetyScreen';
import MessagingScreen from '../screens/shared/MessagingScreen';
import ReportScreen from '../screens/shared/ReportScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

// Detail screens
import InstructorProfileScreen from '../screens/instructor/InstructorProfileScreen';
import BuddyProfileScreen from '../screens/buddy/BuddyProfileScreen';

// Booking screens
import BookingFormScreen from '../screens/shared/BookingFormScreen';
import BookingConfirmationScreen from '../screens/shared/BookingConfirmationScreen';
import BookingDetailScreen from '../screens/shared/BookingDetailScreen';
import InstructorBookingDetailScreen from '../screens/instructor/InstructorBookingDetailScreen';

// Tab navigators
import BeginnerTabs from './BeginnerTabs';
import CertifiedTabs from './CertifiedTabs';
import InstructorTabs from './InstructorTabs';
import AdminTabs from './AdminTabs';

// Admin screens
import AdminUserDetailScreen from '../screens/admin/AdminUserDetailScreen';

// Role change
import RoleChangeScreen from '../screens/profile/RoleChangeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="SocialOnboarding" component={SocialOnboardingScreen} options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />

        {/* Terms of Service — shown once after profile setup */}
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ gestureEnabled: false, animation: 'fade' }} />

        {/* Safety disclaimer — mandatory */}
        <Stack.Screen name="Safety" component={SafetyScreen} options={{ gestureEnabled: false, animation: 'fade' }} />

        {/* Main tab stacks */}
        <Stack.Screen name="BeginnerTabs" component={BeginnerTabs} />
        <Stack.Screen name="CertifiedTabs" component={CertifiedTabs} />
        <Stack.Screen name="InstructorTabs" component={InstructorTabs} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} />

        {/* Shared stack screens (pushed on top of tabs) */}
        <Stack.Screen name="Messaging" component={MessagingScreen} />
        <Stack.Screen name="InstructorProfile" component={InstructorProfileScreen} />
        <Stack.Screen name="BuddyProfile" component={BuddyProfileScreen} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="RoleChange" component={RoleChangeScreen} />

        {/* Admin */}
        <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />

        {/* Booking flow */}
        <Stack.Screen name="BookingForm" component={BookingFormScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
        <Stack.Screen name="InstructorBookingDetail" component={InstructorBookingDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
