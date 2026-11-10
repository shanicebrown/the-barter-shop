import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { generateAgreementText, generateBarterReference } from '../../templates/BarterAgreement';

type Props = NativeStackScreenProps<RootStackParamList, 'ProposalReview'>;

export default function ProposalReviewScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    requesterName, requesterIcon, requesterService, requesterValue,
    providerService, providerValue, barterType, cashAmount, deliveryDate, note,
  } = route.params;

  function handleDecline() {
    Alert.alert('Decline Barter', 'Are you sure you want to decline this proposal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => navigation.popToTop() },
    ]);
  }

  function handleAccept() {
    // Generate agreement and navigate
    const ref = generateBarterReference();
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const text = generateAgreementText({
      effectiveDate: today,
      partyAName: requesterName,
      partyAAddress: 'Denver, CO',
      partyBName: 'Jamie Collins',
      partyBAddress: 'Denver, CO',
      partyAOffering: requesterService,
      partyAValue: requesterValue,
      partyBOffering: providerService,
      partyBValue: providerValue,
      deliveryDate,
      barterId: ref,
    });

    navigation.navigate('BarterAgreement', {
      barterReference: ref,
      partyAName: requesterName,
      partyBName: 'Jamie Collins',
      partyAOffering: requesterService,
      partyBOffering: providerService,
      partyAValue: requesterValue,
      partyBValue: providerValue,
      deliveryDate,
      agreementText: text,
      isPartyA: false,
      partyASigned: false,
      partyBSigned: false,
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barter Proposal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Proposal Header */}
        <View style={styles.proposalBanner}>
          <Text style={styles.proposalEmoji}>{requesterIcon}</Text>
          <Text style={styles.proposalTitle}>{requesterName} wants to barter!</Text>
        </View>

        {/* Trade Summary */}
        <View style={styles.tradeCards}>
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardLabel}>They offer</Text>
            <Text style={styles.tradeCardService}>{requesterService}</Text>
            <Text style={styles.tradeCardValue}>${requesterValue}</Text>
          </View>

          <View style={styles.tradeArrow}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
          </View>

          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardLabel}>Your service</Text>
            <Text style={styles.tradeCardService}>{providerService}</Text>
            <Text style={styles.tradeCardValue}>${providerValue}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Barter Type</Text>
            <Text style={styles.termValue}>{barterType === 'full' ? 'Full Barter' : barterType === 'partial' ? `Partial (+$${cashAmount})` : `Cash ($${providerValue})`}</Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Delivery By</Text>
            <Text style={styles.termValue}>{deliveryDate}</Text>
          </View>
          {note ? (
            <View style={styles.noteSection}>
              <Text style={styles.termLabel}>Note</Text>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ) : null}
        </View>

        {/* Agreement Info */}
        <View style={styles.infoCard}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Accepting will generate a barter agreement. Both parties must sign within the signing window to proceed. Chat unlocks after both signatures.
          </Text>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 100 },

  proposalBanner: { alignItems: 'center', backgroundColor: '#F0FAFB', borderRadius: 16, padding: spacing.lg, gap: 12 },
  proposalEmoji: { fontSize: 48 },
  proposalTitle: { fontSize: 20, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold, textAlign: 'center' },

  tradeCards: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tradeCard: { flex: 1, backgroundColor: '#FFFDE7', borderRadius: 12, padding: spacing.md, alignItems: 'center', gap: 4 },
  tradeCardLabel: { fontSize: 11, color: '#999', fontFamily: fonts.semiBold },
  tradeCardService: { fontSize: fontSize.sm, fontWeight: '700', color: '#000', fontFamily: fonts.bold, textAlign: 'center' },
  tradeCardValue: { fontSize: fontSize.lg, fontWeight: '900', color: colors.primary, fontFamily: fonts.extraBold },
  tradeArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FAFB', justifyContent: 'center', alignItems: 'center' },

  termsCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: spacing.md, gap: 12 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  termLabel: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular },
  termValue: { fontSize: fontSize.sm, fontWeight: '600', color: '#000', fontFamily: fonts.semiBold },
  noteSection: { gap: 4 },
  noteText: { fontSize: fontSize.sm, color: '#666', fontFamily: fonts.regular, lineHeight: 20 },

  infoCard: { flexDirection: 'row', backgroundColor: '#E0F7FA', borderRadius: 12, padding: spacing.md, gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: fontSize.xs, color: '#00838F', lineHeight: 18, fontFamily: fonts.regular },

  bottomBar: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  declineBtn: { flex: 1, height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  declineBtnText: { color: '#666', fontSize: fontSize.md, fontFamily: fonts.semiBold },
  acceptBtn: { flex: 1, height: 56, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: fontSize.md, fontFamily: fonts.bold },
});
