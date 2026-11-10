import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { formatCountdown } from '../services/AccountabilityService';
import { colors, spacing, fontSize, borderRadius, fonts } from '../theme';

type Props = {
  providerName: string;
  deadline: Date;
  onSignNow: () => void;
};

export default function LockedChat({ providerName, deadline, onSignNow }: Props) {
  const [countdown, setCountdown] = useState(formatCountdown(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <View style={styles.container}>
      {/* Locked overlay */}
      <View style={styles.lockArea}>
        <View style={styles.lockCircle}>
          <Ionicons name="lock-closed" size={32} color="#FFF" />
        </View>
        <Text style={styles.lockTitle}>Chat Locked</Text>
        <Text style={styles.lockText}>
          Sign your barter agreement to unlock this conversation and begin your barter with {providerName}.
        </Text>

        {/* Countdown */}
        <View style={styles.timerRow}>
          <Ionicons name="time-outline" size={16} color={countdown.color} />
          <Text style={[styles.timerText, { color: countdown.color }]}>{countdown.text}</Text>
        </View>

        <TouchableOpacity style={styles.signBtn} onPress={onSignNow}>
          <Ionicons name="pencil" size={16} color="#FFF" />
          <Text style={styles.signBtnText}>Sign Now</Text>
        </TouchableOpacity>
      </View>

      {/* Locked input bar */}
      <View style={styles.lockedInput}>
        <View style={styles.lockedInputBar}>
          <Ionicons name="lock-closed" size={14} color="#999" />
          <Text style={styles.lockedInputText}>Sign agreement to unlock chat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  lockArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  lockCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', opacity: 0.9 },
  lockTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  lockText: { fontSize: fontSize.sm, color: '#666', textAlign: 'center', lineHeight: 22, fontFamily: fonts.regular },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full },
  timerText: { fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  signBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, alignItems: 'center', gap: 8 },
  signBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  lockedInput: { padding: spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  lockedInputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F5F5', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  lockedInputText: { color: '#999', fontSize: fontSize.sm, fontFamily: fonts.regular },
});
