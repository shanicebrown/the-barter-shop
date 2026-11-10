import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius, fonts } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function GuaranteeModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>🤝 The Barter Shop Guarantee</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕐 The 48-Hour Match Guarantee</Text>
              <Text style={styles.sectionBody}>
                We will match you with your first barter partner within 48 hours of completing your profile. If we can't find a local match we will:{'\n\n'}• Expand your search nationally{'\n'}• Personally introduce you to 3 remote barterers who need your specific skill{'\n\n'}If we still can't match you your free trial automatically extends by 30 days. No action needed.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 The Legal Protection Guarantee</Text>
              <Text style={styles.sectionBody}>
                Every confirmed barter automatically generates a legally binding agreement signed by both parties before any trading begins.{'\n\n'}Your time and skills are always protected. If a barter partner doesn't deliver you have a signed legal document to back you up.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ The Completion Guarantee</Text>
              <Text style={styles.sectionBody}>
                Our accountability system tracks completion rates publicly. Users with low completion rates are flagged and penalized. You can always see a user's completion rate before agreeing to a barter.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Got It 🤝</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function GuaranteePills() {
  return (
    <View style={pillStyles.row}>
      <View style={pillStyles.pill}><Text style={pillStyles.text}>🕐 48hr Match Guarantee</Text></View>
      <View style={pillStyles.pill}><Text style={pillStyles.text}>📋 Legal Protection</Text></View>
      <View style={pillStyles.pill}><Text style={pillStyles.text}>✅ Cancel Anytime</Text></View>
    </View>
  );
}

export function GuaranteeInfoButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={btnStyles.container} onPress={onPress}>
      <Ionicons name="shield-checkmark" size={18} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '85%' },
  header: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 20, fontFamily: fonts.extraBold },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', marginBottom: 8, fontFamily: fonts.bold },
  sectionBody: { fontSize: fontSize.sm, color: '#666', lineHeight: 22, fontFamily: fonts.regular },
  closeBtn: { backgroundColor: colors.primary, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  closeBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});

const pillStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  pill: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  text: { color: '#FFF', fontSize: 11, fontFamily: fonts.semiBold },
});

const btnStyles = StyleSheet.create({
  container: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
});
