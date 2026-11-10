import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { useBarterBucks } from '../../context/BarterBucksContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BarterFlow'>;

export default function BarterFlowScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { providerName, providerIcon, providerService, providerValue, userService, userValue } = route.params;
  const { balance: bbBalance } = useBarterBucks();
  const [paymentType, setPaymentType] = useState<'service' | 'cash' | 'barter_bucks'>('service');
  const [cashAmount, setCashAmount] = useState(0);
  const [bbAmount, setBBAmount] = useState(0);

  const maxCash = providerValue;
  // Matches the server award: full barter +2 BB each, partial (service + cash) +1 BB each.
  const barterBucks = cashAmount === 0 ? 2 : 1;

  function getSummaryText() {
    if (paymentType === 'cash') return `$${providerValue}`;
    if (paymentType === 'barter_bucks') return `${bbAmount} BB`;
    if (cashAmount === 0) return 'Full Service';
    return `Service + $${cashAmount}`;
  }

  function handleContinue() {
    navigation.navigate('OfferConfirmation', {
      providerName, providerIcon, providerService, providerValue,
      userService, userValue,
      cashAmount: paymentType === 'cash' ? providerValue : cashAmount,
      paymentType,
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Their Service */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceCardHeader}>
            <Text style={styles.serviceCardEmoji}>{providerIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceCardName}>{providerService}</Text>
              <Text style={styles.serviceCardValue}>Total value ${providerValue}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </View>
        </View>

        {/* Payment Options */}
        <Text style={styles.sectionLabel}>Payment Type</Text>

        {/* Option 1: Pay by service/cash */}
        <TouchableOpacity style={styles.optionCard} onPress={() => setPaymentType('service')}>
          <View style={styles.radioRow}>
            <View style={[styles.radio, paymentType === 'service' && styles.radioActive]}>
              {paymentType === 'service' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>Pay by service / cash</Text>
          </View>
        </TouchableOpacity>

        {paymentType === 'service' && (
          <View style={styles.servicePayDetail}>
            {/* Your service card */}
            <View style={styles.yourServiceCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.yourServiceName}>{userService}</Text>
                <Text style={styles.yourServiceValue}>Total value ${userValue}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Service + cash */}
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>{userService}</Text>
              <Text style={styles.splitPlus}>+</Text>
              <View style={styles.cashInputBox}>
                <Text style={styles.cashDollar}>$</Text>
                <TextInput
                  style={styles.cashInput}
                  value={String(cashAmount)}
                  onChangeText={(t) => setCashAmount(Math.min(Number(t) || 0, maxCash))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>$0</Text>
                <Text style={styles.sliderLabel}>${maxCash}</Text>
              </View>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { flex: cashAmount || 0.01 }]} />
                <View style={[styles.sliderEmpty, { flex: maxCash - cashAmount || 0.01 }]} />
              </View>
              <TouchableOpacity
                style={[styles.sliderThumb, { left: `${(cashAmount / maxCash) * 100}%` }]}
                activeOpacity={1}
              >
                <Text style={styles.sliderThumbIcon}>$</Text>
              </TouchableOpacity>
              {/* Functional slider overlay */}
              <View style={styles.sliderOverlay}>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={maxCash}
                  step={10}
                  value={cashAmount}
                  onValueChange={setCashAmount}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="transparent"
                />
              </View>
            </View>

            {/* Barter bucks info */}
            <View style={styles.bbBanner}>
              <Text style={styles.bbBannerText}>You'll both earn {barterBucks} BB when this barter is completed</Text>
            </View>
          </View>
        )}

        {/* Option 2: Pay by cash */}
        <TouchableOpacity style={[styles.optionCard, { marginTop: spacing.sm }]} onPress={() => setPaymentType('cash')}>
          <View style={styles.radioRow}>
            <View style={[styles.radio, paymentType === 'cash' && styles.radioActive]}>
              {paymentType === 'cash' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>Pay by cash</Text>
          </View>
        </TouchableOpacity>

        {/* Option 3: Pay with Barter Bucks */}
        {bbBalance > 0 && (
          <TouchableOpacity style={[styles.optionCard, { marginTop: spacing.sm }]} onPress={() => setPaymentType('barter_bucks')}>
            <View style={styles.radioRow}>
              <View style={[styles.radio, paymentType === 'barter_bucks' && styles.radioActive]}>
                {paymentType === 'barter_bucks' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>Pay with Barter Bucks</Text>
            </View>
          </TouchableOpacity>
        )}

        {paymentType === 'barter_bucks' && (
          <View style={styles.bbPayDetail}>
            <View style={styles.bbBalanceRow}>
              <Text style={styles.bbBalanceLabel}>Your balance:</Text>
              <Text style={styles.bbBalanceValue}>{bbBalance} BB</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0 BB</Text>
                <Text style={styles.sliderLabel}>{bbBalance} BB</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={bbBalance}
                step={1}
                value={bbAmount}
                onValueChange={setBBAmount}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#FFD700"
              />
              <Text style={styles.bbSelectedAmount}>Using {Math.round(bbAmount)} Barter Bucks</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <Text style={styles.bottomSummary}>{getSummaryText()}</Text>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 120 },
  serviceCard: { backgroundColor: '#FFFDE7', borderRadius: borderRadius.lg, padding: spacing.md },
  serviceCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  serviceCardEmoji: { fontSize: 28 },
  serviceCardName: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  serviceCardValue: { fontSize: fontSize.xs, color: '#999', marginTop: 2 },
  sectionLabel: { fontSize: fontSize.md, fontWeight: '700', color: '#000', marginTop: spacing.sm },
  optionCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: borderRadius.lg, padding: spacing.md },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  optionLabel: { fontSize: fontSize.md, fontWeight: '600', color: '#000' },
  servicePayDetail: { gap: spacing.md },
  yourServiceCard: { backgroundColor: '#E0F7FA', borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  yourServiceName: { fontSize: fontSize.sm, fontWeight: '700', color: '#000' },
  yourServiceValue: { fontSize: fontSize.xs, color: '#666', marginTop: 2 },
  changeLink: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  splitLabel: { fontSize: fontSize.sm, color: '#000', fontWeight: '600', flex: 1 },
  splitPlus: { fontSize: fontSize.lg, color: '#999' },
  cashInputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: borderRadius.md, paddingHorizontal: 12, paddingVertical: 8, minWidth: 80 },
  cashDollar: { fontSize: fontSize.md, color: '#000', fontWeight: '700' },
  cashInput: { fontSize: fontSize.md, color: '#000', fontWeight: '700', minWidth: 40, textAlign: 'right' },
  sliderContainer: { height: 50, justifyContent: 'center', marginTop: spacing.sm, position: 'relative' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sliderLabel: { fontSize: 11, color: '#999' },
  sliderTrack: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
  sliderFill: { backgroundColor: '#FF6B6B' },
  sliderEmpty: { backgroundColor: '#E0E0E0' },
  sliderThumb: { position: 'absolute', top: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', marginLeft: -14 },
  sliderThumbIcon: { fontSize: 14, fontWeight: '900', color: '#000' },
  sliderOverlay: { position: 'absolute', top: 5, left: 0, right: 0, opacity: 0 },
  bbBanner: { backgroundColor: '#E0F7FA', borderRadius: borderRadius.md, padding: spacing.sm },
  bbBannerText: { fontSize: fontSize.xs, color: '#00838F', fontWeight: '600', textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', paddingHorizontal: spacing.md, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  bottomSummary: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  continueBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: borderRadius.full },
  continueBtnText: { color: '#FFF', fontSize: fontSize.sm, fontWeight: '700' },

  // BB Payment
  bbPayDetail: { gap: spacing.md, backgroundColor: '#FFFDE7', borderRadius: borderRadius.lg, padding: spacing.md },
  bbBalanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bbBalanceLabel: { fontSize: fontSize.sm, color: '#666', fontFamily: fonts.semiBold },
  bbBalanceValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary, fontFamily: fonts.bold },
  bbSelectedAmount: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', textAlign: 'center', fontFamily: fonts.semiBold },
});
