import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';

interface Props {
  message?: string;
}

export default function SafetyBanner({ message = 'Safety reminder: Always dive within your training limits. Never dive alone.' }: Props) {
  return (
    <View style={styles.banner}>
      <Ionicons name="warning-outline" size={14} color={Colors.warning} style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '18',
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  icon: { flexShrink: 0 },
  text: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text,
    lineHeight: 16,
  },
});
