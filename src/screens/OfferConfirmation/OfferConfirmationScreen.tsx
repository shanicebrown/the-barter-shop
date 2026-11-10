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
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { generateAgreementText, generateBarterReference } from '../../templates/BarterAgreement';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferConfirmation'>;

export default function OfferConfirmationScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { providerName, providerIcon, providerService, providerValue, userService, userValue, cashAmount, paymentType } = route.params;
  const [showThanks, setShowThanks] = useState(false);

  const hasCash = cashAmount > 0;

  function handleSendOffer() {
    if (hasCash) {
      navigation.navigate('Payment', { amount: cashAmount, providerService });
    } else {
      setShowThanks(true);
    }
  }

  function handleThanksOk() {
    setShowThanks(false);
    // Generate and navigate to agreement
    const ref = generateBarterReference();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const delivery = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const text = generateAgreementText({
      effectiveDate: today,
      partyAName: 'Jamie Collins',
      partyAAddress: 'Denver, CO',
      partyBName: providerName,
      partyBAddress: 'Denver, CO',
      partyAOffering: userService,
      partyAValue: userValue,
      partyBOffering: providerService,
      partyBValue: providerValue,
      deliveryDate: delivery,
      barterId: ref,
    });
    navigation.navigate('BarterAgreement', {
      barterReference: ref,
      partyAName: 'Jamie Collins',
      partyBName: providerName,
      partyAOffering: userService,
      partyBOffering: providerService,
      partyAValue: userValue,
      partyBValue: providerValue,
      deliveryDate: delivery,
      agreementText: text,
      isPartyA: true,
      partyASigned: false,
      partyBSigned: false,
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer confirmation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Their offer */}
        <View style={styles.theirCard}>
          <View style={styles.cardAvatarRow}>
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarEmoji}>{providerIcon}</Text>
            </View>
            <Text style={styles.cardAvatarName}>{providerName}</Text>
          </View>
          <Text style={styles.cardServiceName}>{providerService}</Text>
          <Text style={styles.cardDescription}>Professional service tailored to your needs.</Text>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValueLabel}>Total value</Text>
            <Text style={styles.cardValueAmount}>${providerValue}</Text>
          </View>
        </View>

        {/* Your offer */}
        <View style={styles.yourCard}>
          <View style={styles.cardAvatarRow}>
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarEmoji}>👤</Text>
            </View>
            <Text style={styles.cardAvatarName}>You</Text>
          </View>
          <Text style={styles.cardServiceName}>{userService}</Text>
          <Text style={styles.cardDescription}>Your professional service offering.</Text>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValueLabel}>Total value</Text>
            <Text style={styles.cardValueAmount}>${userValue}</Text>
          </View>

          {hasCash && (
            <>
              <View style={styles.plusDivider}>
                <Text style={styles.plusText}>+</Text>
              </View>
              <View style={styles.cashBox}>
                <Text style={styles.cashBoxAmount}>${cashAmount}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Send offer button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendOffer}>
          <Text style={styles.sendBtnText}>Send offer</Text>
        </TouchableOpacity>
      </View>

      {/* Thanks Modal */}
      <Modal visible={showThanks} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.thanksCard}>
            <Text style={styles.thanksEmoji}>🤝</Text>
            <View style={styles.confettiRow}>
              {['🟡', '🔵', '🟢', '🔴', '🟣', '🟠'].map((c, i) => (
                <Text key={i} style={[styles.confettiDot, { transform: [{ rotate: `${i * 60}deg` }] }]}>{c}</Text>
              ))}
            </View>
            <Text style={styles.thanksTitle}>Thanks for confirming!</Text>
            <Text style={styles.thanksSubtext}>You will receive a notification when it is accepted</Text>
            <TouchableOpacity style={styles.thanksBtn} onPress={handleThanksOk}>
              <Text style={styles.thanksBtnText}>OK</Text>
            </TouchableOpacity>
            <View style={styles.bbBanner}>
              <Text style={styles.bbBannerText}>You'll earn 2 Barter Bucks when this barter is marked complete by both parties</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: '#FFF' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 100 },

  // Their card
  theirCard: { backgroundColor: '#FFFDE7', borderRadius: borderRadius.xl, padding: spacing.md, gap: 8 },
  cardAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  smallAvatarEmoji: { fontSize: 16 },
  cardAvatarName: { fontSize: fontSize.sm, fontWeight: '600', color: '#000' },
  cardServiceName: { fontSize: 20, fontWeight: '700', color: '#000' },
  cardDescription: { fontSize: fontSize.sm, color: '#999' },
  cardValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cardValueLabel: { fontSize: fontSize.sm, color: '#999' },
  cardValueAmount: { fontSize: 22, fontWeight: '900', color: '#000' },

  // Your card
  yourCard: { backgroundColor: '#FFF', borderRadius: borderRadius.xl, padding: spacing.md, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  plusDivider: { alignItems: 'center', paddingVertical: 4 },
  plusText: { fontSize: 20, color: '#999', fontWeight: '700' },
  cashBox: { backgroundColor: '#F5F5F5', borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  cashBoxAmount: { fontSize: 28, fontWeight: '900', color: '#000' },

  // Bottom
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  sendBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.lg, alignItems: 'center' },
  sendBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },

  // Thanks Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  thanksCard: { backgroundColor: '#FFF', borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', width: '100%', gap: spacing.md },
  thanksEmoji: { fontSize: 56 },
  confettiRow: { flexDirection: 'row', gap: 4, position: 'absolute', top: 20 },
  confettiDot: { fontSize: 8 },
  thanksTitle: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center' },
  thanksSubtext: { fontSize: fontSize.sm, color: '#999', textAlign: 'center' },
  thanksBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: borderRadius.lg, alignItems: 'center', width: '100%' },
  thanksBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
  bbBanner: { backgroundColor: '#E0F7FA', borderRadius: borderRadius.md, padding: 10, marginTop: 4 },
  bbBannerText: { fontSize: 11, color: '#00838F', textAlign: 'center', lineHeight: 16 },
});
