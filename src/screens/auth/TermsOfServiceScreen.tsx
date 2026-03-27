import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsOfService'>;

const SECTIONS = [
  {
    title: '1. About Buddy Up',
    body: 'Buddy Up ("the App") is a connection platform that helps certified freedivers find dive buddies, and helps uncertified divers find certified instructors. The App facilitates introductions only. It does not monitor, supervise, or participate in any dive activity.',
  },
  {
    title: '2. Age Requirement',
    body: 'You must be at least 18 years old to create an account and use the App. By registering, you confirm that you meet this requirement.',
  },
  {
    title: '3. Connection-Only Platform',
    body: 'Buddy Up is a connection service only. We do not organise, supervise, or take responsibility for any dive sessions, training, or activities arranged between users. Any arrangement made between users is entirely at their own discretion and risk.',
  },
  {
    title: '4. No Liability',
    body: 'Freediving carries serious inherent risks, including blackout, injury, and death. By using this App you acknowledge these risks and accept full personal responsibility for your safety and the safety choices you make. To the maximum extent permitted by law, Buddy Up and its developers accept no liability for any injury, loss, death, or damage arising from use of the App or from dive activities arranged through it.',
  },
  {
    title: '5. Emergency Protocol',
    body: 'NEVER DIVE ALONE. Always ensure a trained, attentive buddy is present at the surface. If an emergency occurs, call your local emergency services immediately (e.g. 112 / 911 / Coast Guard). The App does not provide emergency response services.',
  },
  {
    title: '6. Verification',
    body: 'Certified diver and instructor profiles require credential verification before full access is granted. Buddy Up reviews submitted documents manually. Approval does not guarantee the accuracy of certifications claimed by users. Always verify a buddy or instructor\'s qualifications independently before diving with them.',
  },
  {
    title: '7. User Conduct',
    body: 'You agree to: (a) provide accurate information in your profile; (b) treat all users with respect; (c) not use the App to harass, scam, or harm others; (d) report any abusive behaviour using the in-app report feature. Violations may result in immediate account suspension.',
  },
  {
    title: '8. Privacy',
    body: 'Your location, profile information, and messages are stored securely. Location data is used only to show relevant nearby divers and instructors. We do not sell your personal data to third parties.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the App after changes are posted constitutes acceptance of the updated Terms.',
  },
  {
    title: '10. Contact',
    body: 'For questions about these Terms, please contact us through the App settings.',
  },
];

export default function TermsOfServiceScreen({ navigation, route }: Props) {
  const { nextRoute } = route.params ?? {};
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile, setProfile } = useAuthStore();
  const isViewOnly = !nextRoute;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrolledToBottom) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isBottom) setScrolledToBottom(true);
  };

  const handleAccept = async () => {
    if (!nextRoute) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const now = new Date().toISOString();
      const { data: updated } = await supabase
        .from('profiles')
        .update({ tos_accepted_at: now })
        .eq('id', user.id)
        .select('*')
        .single();
      if (updated && profile) setProfile({ ...profile, ...updated });
    }

    setLoading(false);

    if (nextRoute === 'VerificationPending') {
      navigation.replace('VerificationPending');
    } else {
      navigation.replace('Safety', { nextRoute });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        {isViewOnly && (
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.headerIcon}>
          <Ionicons name="document-text-outline" size={28} color={Colors.accent} />
        </View>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <Text style={styles.headerSub}>
          {isViewOnly
            ? 'Last updated March 2026'
            : 'Please read carefully and scroll to the bottom to accept.'}
        </Text>
      </SafeAreaView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
      >
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <View style={styles.disclaimerBox}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} style={{ marginBottom: 6 }} />
          <Text style={styles.disclaimerText}>
            By accepting, you acknowledge that freediving carries serious risks and that you are solely responsible for your own safety. Buddy Up is a connection service only and accepts no liability for dive-related incidents.
          </Text>
        </View>

        {!isViewOnly && (
          <TouchableOpacity
            style={[styles.button, (!scrolledToBottom || loading) && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!scrolledToBottom || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>
                  {scrolledToBottom ? 'I Accept — Continue' : 'Scroll to the bottom to accept'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  back: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.accentLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  bodyContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: Colors.warning + '18',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.3 },
});
