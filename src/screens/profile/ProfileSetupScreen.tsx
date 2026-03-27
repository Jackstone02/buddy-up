import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import ProfileSetupBeginnerScreen from './ProfileSetupBeginnerScreen';
import ProfileSetupCertifiedScreen from './ProfileSetupCertifiedScreen';
import ProfileSetupInstructorScreen from './ProfileSetupInstructorScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation, route }: Props) {
  const { role } = route.params;

  if (role === 'beginner') return <ProfileSetupBeginnerScreen navigation={navigation} route={route} />;
  if (role === 'certified') return <ProfileSetupCertifiedScreen navigation={navigation} route={route} />;
  return <ProfileSetupInstructorScreen navigation={navigation} route={route} />;
}
