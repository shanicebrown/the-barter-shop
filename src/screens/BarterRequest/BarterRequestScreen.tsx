import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { useRequireAccount } from '../../context/AuthContext';
import { useBarterBucks } from '../../context/BarterBucksContext';
import PartialPaymentSheet, { GapMethod } from '../../components/PartialPaymentSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'BarterRequest'>;

const BARTER_TYPES = [
  {
    key: 'full',
    label: 'Full Barter',
    icon: '🔄',
    description: 'Trade skill for skill. Zero dollars change hands.',
    note: 'No money changes hands',
  },
  {
    key: 'partial',
    label: 'Partial Barter',
    icon: '◑$',
    description: 'Your service covers part of the cost. Pay the difference in USD or Barter Bucks.',
    note: null,
  },
  {
    key: 'none',
    label: 'Pay in Full',
    icon: '$',
    description: 'Pay the full rate in USD. No trade required.',
    note: null,
  },
] as const;

type BarterType = typeof BARTER_TYPES[number]['key'];

export default function BarterRequestScreen({ route, navigation }: Props) {
  const { providerName, serviceName, serviceIcon, serviceCategory } = route.params;
  const [offerDescription, setOfferDescription] = useState('');
  const [barterType, setBarterType] = useState<BarterType>('full');
  const [barterPercent, setBarterPercent] = useState(50);
  const [notes, setNotes] = useState('');
  const [gapAmount, setGapAmount] = useState('');
  const [gapMethod, setGapMethod] = useState<GapMethod | null>(null);
  const [showGapSheet, setShowGapSheet] = useState(false);
  const requireAccount = useRequireAccount();
  const { balance } = useBarterBucks();
  const gapDollars = Math.max(0, Math.round(Number(gapAmount.replace(/[^0-9.]/g, '')) || 0));

  function chooseType(key: BarterType) {
    setBarterType(key);
    if (key === 'partial' && !gapMethod) setShowGapSheet(true);
  }

  function handleSubmit() {
    if (!requireAccount('send barter requests')) return;
    if (barterType !== 'none' && !offerDescription.trim()) {
      Alert.alert('Required', 'Please describe the skill you are offering in exchange.');
      return;
    }
    if (barterType === 'partial') {
      if (gapDollars <= 0) {
        Alert.alert('Add the difference', 'Enter the dollar difference you will cover.');
        return;
      }
      if (!gapMethod || (gapMethod === 'barter_bucks' && balance < gapDollars)) {
        setShowGapSheet(true);
        return;
      }
    }
    Alert.alert('Request Sent', `Your barter request has been sent to ${providerName.replace(/\.$/, '')}.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headline}>Send a Barter Request</Text>

      <View style={styles.providerCard}>
        <View style={styles.providerIcon}>
          <Text style={styles.providerIconText}>{serviceIcon}</Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{providerName}</Text>
          <Text style={styles.providerService}>{serviceName}</Text>
          <Text style={styles.providerCategory}>{serviceCategory}</Text>
        </View>
      </View>

      <Text style={styles.label}>What skill are you offering in exchange?</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe your service in detail — be specific about what you bring to the table"
        placeholderTextColor={colors.textMuted}
        value={offerDescription}
        onChangeText={setOfferDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Barter Type</Text>
      <View style={styles.barterTypes}>
        {BARTER_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.barterTypeCard, barterType === type.key && styles.barterTypeSelected]}
            onPress={() => chooseType(type.key)}
          >
            <View style={styles.barterTypeHeader}>
              <View style={[styles.radio, barterType === type.key && styles.radioSelected]}>
                {barterType === type.key && <View style={styles.radioInner} />}
              </View>
              <View style={styles.typeIconContainer}>
                <Text style={styles.typeIcon}>{type.icon}</Text>
              </View>
              <Text style={[styles.barterTypeLabel, barterType === type.key && styles.barterTypeLabelSelected]}>
                {type.label}
              </Text>
            </View>
            <Text style={styles.barterTypeDescription}>{type.description}</Text>
            {type.note && barterType === type.key && (
              <Text style={styles.barterTypeNote}>{type.note}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {barterType === 'partial' && (
        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Barter vs. Cash Split</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFilled, { flex: barterPercent }]} />
            <View style={[styles.sliderEmpty, { flex: 100 - barterPercent }]} />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderBarterLabel}>{barterPercent}% Skill</Text>
            <Text style={styles.sliderCashLabel}>{100 - barterPercent}% USD</Text>
          </View>
          <Text style={[styles.sliderLabel, { marginTop: spacing.md }]}>Difference you'll cover</Text>
          <View style={styles.gapInputRow}>
            <Text style={styles.gapDollar}>$</Text>
            <TextInput
              style={styles.gapInput}
              value={gapAmount}
              onChangeText={setGapAmount}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="Dollar difference you will cover"
            />
          </View>
          <TouchableOpacity style={styles.gapMethodRow} onPress={() => setShowGapSheet(true)}>
            <Text style={styles.gapMethodText}>
              {gapMethod === 'barter_bucks'
                ? `Paying with Barter Bucks${gapDollars ? ` (${gapDollars} BB)` : ''}`
                : gapMethod === 'usd'
                  ? `Paying in USD${gapDollars ? ` ($${gapDollars})` : ''}`
                  : 'Choose how to pay the difference'}
            </Text>
            <Text style={styles.gapMethodChange}>{gapMethod ? 'Change' : 'Choose'}</Text>
          </TouchableOpacity>
          <View style={styles.sliderButtons}>
            {[25, 50, 75].map((pct) => (
              <TouchableOpacity
                key={pct}
                style={[styles.sliderButton, barterPercent === pct && styles.sliderButtonActive]}
                onPress={() => setBarterPercent(pct)}
              >
                <Text style={[styles.sliderButtonText, barterPercent === pct && styles.sliderButtonTextActive]}>
                  {pct}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.label}>Additional Notes</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Any availability, location preferences, or special considerations"
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <View style={styles.guardrail}>
        <Text style={styles.guardrailText}>
          The Barter Shop is a skill-for-skill platform. Physical items are not permitted. Partial Barter means your service covers part of the cost — the remaining balance is paid in USD or Barter Bucks.
        </Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Send Barter Request</Text>
      </TouchableOpacity>

      <PartialPaymentSheet
        key={showGapSheet ? 'open' : 'closed'}
        visible={showGapSheet}
        amount={gapDollars}
        amountText={gapAmount}
        onAmountChange={setGapAmount}
        selected={gapMethod}
        onChoose={setGapMethod}
        onClose={() => setShowGapSheet(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headline: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  providerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  providerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerIconText: {
    fontSize: 28,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  providerService: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  providerCategory: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  barterTypes: {
    gap: spacing.sm,
  },
  barterTypeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  barterTypeSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  barterTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  typeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 14,
    color: colors.primary,
  },
  barterTypeLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  barterTypeLabelSelected: {
    color: colors.primary,
  },
  barterTypeDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: 60,
  },
  barterTypeNote: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginLeft: 60,
    marginTop: spacing.xs,
    fontWeight: '500',
  },

  // Partial Barter slider
  gapInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  gapDollar: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginRight: 4 },
  gapInput: { flex: 1, fontSize: fontSize.lg, paddingVertical: 12, color: colors.text },
  gapMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0FAFB',
  },
  gapMethodText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, flex: 1 },
  gapMethodChange: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  sliderSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sliderLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  sliderTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sliderFilled: {
    backgroundColor: colors.primary,
  },
  sliderEmpty: {
    backgroundColor: colors.surfaceLight,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderBarterLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  sliderCashLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sliderButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
  },
  sliderButtonText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sliderButtonTextActive: {
    color: colors.primary,
  },

  guardrail: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  guardrailText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
