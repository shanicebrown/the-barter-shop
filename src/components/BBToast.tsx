import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useBarterBucks } from '../context/BarterBucksContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import BarterBucksIcon from './BarterBucksIcon';

export default function BBToast() {
  const { showToast, toastAmount, dismissToast } = useBarterBucks();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  if (!showToast) return null;

  return (
    <TouchableOpacity
      style={[styles.toast, { top: insets.top + 8 }]}
      activeOpacity={0.9}
      onPress={() => {
        dismissToast();
        navigation.navigate('BarterBucksGuide');
      }}
    >
      <BarterBucksIcon size={28} />
      <View>
        <Text style={styles.toastTitle}>You earned {toastAmount} BB!</Text>
        <Text style={styles.toastSub}>Tap to see your balance</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', left: 16, right: 16, backgroundColor: colors.primary, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  toastEmoji: { fontSize: 28 },
  toastTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#FFF' },
  toastSub: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)' },
});
