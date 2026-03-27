import React from 'react';
import { View, Text, Image } from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  avatarUrl?: string | null;
  name: string;
  size?: number;
  color?: string;
}

export default function UserAvatar({ avatarUrl, name, size = 50, color = Colors.primary }: Props) {
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.border,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.36, fontWeight: '800' }}>
        {initials}
      </Text>
    </View>
  );
}
