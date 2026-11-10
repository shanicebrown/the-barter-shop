import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useBarterBucks } from '../context/BarterBucksContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import BarterBucksIcon from './BarterBucksIcon';

export default function BBIntroTooltip() {
  const { hasSeenIntro, dismissIntro } = useBarterBucks();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (hasSeenIntro) return null;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Arrow pointing up */}
        <View style={styles.arrow} />
        <View style={styles.card}>
          <BarterBucksIcon size={48} />
          <Text style={styles.title}>Introducing Barter Bucks!</Text>
          <Text style={styles.body}>
            Earn Barter Bucks every time you complete a barter. Use them to boost your profile, unlock perks, and level up your tier.
          </Text>
          <TouchableOpacity style={styles.gotItBtn} onPress={dismissIntro}>
            <Text style={styles.gotItText}>Got it!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              dismissIntro();
              navigation.navigate('BarterBucksGuide');
            }}
          >
            <Text style={styles.learnMore}>Learn more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 90, paddingHorizontal: 24 },
  arrow: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FFF', marginRight: 40, marginBottom: -1 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', gap: 12 },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  body: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  gotItBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', width: '100%' },
  gotItText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  learnMore: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
