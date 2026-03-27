import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

export type ModalType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

export interface AppModalProps {
  visible: boolean;
  type?: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

function getTypeConfig(type: ModalType) {
  switch (type) {
    case 'success':
      return { icon: 'checkmark-circle', color: Colors.success };
    case 'error':
      return { icon: 'close-circle', color: Colors.error };
    case 'warning':
      return { icon: 'warning', color: Colors.warning };
    case 'confirm':
      return { icon: 'help-circle', color: Colors.primary };
    default:
      return { icon: 'information-circle', color: Colors.primary };
  }
}

const AppModal: React.FC<AppModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = false,
  isLoading = false,
  loadingText = 'Processing...',
}) => {
  const { icon, color } = getTypeConfig(type);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6 }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.85);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else if (onCancel) onCancel();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => !isLoading && handleCancel()}
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon as any} size={40} color={color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.btnRow}>
            {showCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: color },
                !showCancel && styles.fullWidth,
                isLoading && styles.btnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmBtnText}>{loadingText}</Text>
                </>
              ) : (
                <Text style={styles.confirmBtnText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { flex: 1 },
  btnDisabled: { opacity: 0.6 },
  confirmBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
});

export default AppModal;
