import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import AppModal from '../../components/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const { accessToken, refreshToken } = route.params;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { visible, isLoading, config, showModal, handleConfirm, handleCancel } = useAppModal();

  useEffect(() => {
    // Restore session from the tokens in the deep link
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          showModal({
            type: 'error',
            title: 'Link Expired',
            message: 'This password reset link has expired. Please request a new one.',
            confirmText: 'Back to Sign In',
            onConfirm: () => navigation.replace('SignIn'),
          });
        } else {
          setSessionReady(true);
        }
      });
  }, []);

  const handleReset = async () => {
    if (!password || !confirm) {
      showModal({ type: 'error', title: 'Error', message: 'Please fill in both fields.' });
      return;
    }
    if (password.length < 6) {
      showModal({ type: 'error', title: 'Password Too Short', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirm) {
      showModal({ type: 'error', title: 'Passwords Don\'t Match', message: 'Please make sure both passwords match.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      showModal({ type: 'error', title: 'Error', message: error.message });
      return;
    }

    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut();

    showModal({
      type: 'success',
      title: 'Password Updated',
      message: 'Your password has been reset successfully. Please sign in with your new password.',
      confirmText: 'Sign In',
      onConfirm: () => navigation.replace('SignIn'),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSub}>Choose a strong new password</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={36} color={Colors.primary} />
          </View>

          <Text style={styles.desc}>
            Enter a new password for your Buddy Up account. Use at least 6 characters.
          </Text>

          <Text style={styles.label}>New password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="New password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Confirm password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm password"
              placeholderTextColor={Colors.textMuted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, (!sessionReady || loading) && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={!sessionReady || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Update Password</Text>
                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal
        visible={visible}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...config}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    overflow: 'hidden',
  },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSub: { fontSize: FontSize.sm, color: Colors.accentLight, marginTop: 4 },
  form: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { paddingVertical: 14, fontSize: FontSize.md, color: Colors.text },
  eyeBtn: { padding: Spacing.xs },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700', letterSpacing: 0.5 },
});
