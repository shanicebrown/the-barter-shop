import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const CARD_TYPES = [
  { name: 'Visa', logo: '💳' },
  { name: 'Mastercard', logo: '🔴' },
  { name: 'UnionPay', logo: '🔷' },
  { name: 'Amex', logo: '🟦' },
  { name: 'Diners', logo: '🔶' },
  { name: 'JCB', logo: '🟩' },
];

export default function PaymentScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { amount, providerService } = route.params;
  const [selectedCard, setSelectedCard] = useState('Visa');
  const [showThanks, setShowThanks] = useState(false);

  function handleConfirm() {
    // UI only — no real payment processing
    setShowThanks(true);
  }

  function handleThanksOk() {
    setShowThanks(false);
    navigation.popToTop();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Service summary */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceName}>{providerService}</Text>
          <Text style={styles.serviceValue}>Total value ${amount}</Text>
          <Ionicons name="chevron-down" size={18} color="#999" style={{ position: 'absolute', right: 16, top: 16 }} />
        </View>

        {/* Card type selector */}
        <Text style={styles.sectionLabel}>Select card type</Text>
        <View style={styles.cardGrid}>
          {CARD_TYPES.map((card) => (
            <TouchableOpacity
              key={card.name}
              style={[styles.cardType, selectedCard === card.name && styles.cardTypeActive]}
              onPress={() => setSelectedCard(card.name)}
            >
              <Text style={styles.cardLogo}>{card.logo}</Text>
              <Text style={styles.cardName}>{card.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card fields */}
        <Text style={styles.sectionLabel}>Card details</Text>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Card Number</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldValue}>4000 **** **** 0000</Text>
            <Ionicons name="eye-outline" size={18} color="#999" />
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Card Holder Name</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldValue}>C**** Fisher</Text>
            <Ionicons name="eye-outline" size={18} color="#999" />
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>MM/YY</Text>
          <Text style={styles.fieldValue}>10/26</Text>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <Text style={styles.bottomAmount}>${amount}</Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm to pay</Text>
        </TouchableOpacity>
      </View>

      {/* Thanks Modal */}
      <Modal visible={showThanks} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.thanksCard}>
            <Text style={styles.thanksEmoji}>🤝</Text>
            <Text style={styles.thanksTitle}>Thanks for confirming!</Text>
            <Text style={styles.thanksSubtext}>You will receive a notification when it is accepted</Text>
            <TouchableOpacity style={styles.thanksBtn} onPress={handleThanksOk}>
              <Text style={styles.thanksBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 100 },

  serviceCard: { backgroundColor: '#FFFDE7', borderRadius: borderRadius.lg, padding: spacing.md },
  serviceName: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  serviceValue: { fontSize: fontSize.xs, color: '#999', marginTop: 2 },

  sectionLabel: { fontSize: fontSize.sm, fontWeight: '700', color: '#000', marginTop: spacing.sm },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardType: { width: '31%', aspectRatio: 1.5, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center', gap: 4 },
  cardTypeActive: { borderColor: colors.primary, borderWidth: 2 },
  cardLogo: { fontSize: 20 },
  cardName: { fontSize: 10, color: '#666', fontWeight: '600' },

  fieldCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: borderRadius.lg, padding: spacing.md },
  fieldLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldValue: { fontSize: fontSize.md, color: '#000', fontWeight: '500' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  bottomAmount: { fontSize: 22, fontWeight: '900', color: '#000' },
  confirmBtn: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: borderRadius.full },
  confirmBtnText: { color: '#FFF', fontSize: fontSize.sm, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  thanksCard: { backgroundColor: '#FFF', borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', width: '100%', gap: spacing.md },
  thanksEmoji: { fontSize: 56 },
  thanksTitle: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center' },
  thanksSubtext: { fontSize: fontSize.sm, color: '#999', textAlign: 'center' },
  thanksBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: borderRadius.lg, alignItems: 'center', width: '100%' },
  thanksBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
});
