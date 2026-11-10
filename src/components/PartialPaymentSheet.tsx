import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBarterBucks } from '../context/BarterBucksContext';
import { useRequireAccount } from '../context/AuthContext';
import { colors, fontSize, fonts, spacing, borderRadius } from '../theme';
import BarterBucksIcon from './BarterBucksIcon';
import BuyBarterBucksSheet from './BuyBarterBucksSheet';

export type GapMethod = 'usd' | 'barter_bucks';

type Props = {
  visible: boolean;
  /** Dollar difference the member will cover (1 Barter Buck = $1). 0 if not entered yet. */
  amount: number;
  onAmountChange: (text: string) => void;
  amountText: string;
  selected: GapMethod | null;
  onChoose: (method: GapMethod) => void;
  onClose: () => void;
};

export default function PartialPaymentSheet({ visible, amount, amountText, onAmountChange, selected, onChoose, onClose }: Props) {
  const { balance } = useBarterBucks();
  const requireAccount = useRequireAccount();
  const [method, setMethod] = useState<GapMethod | null>(selected);
  const [showBuy, setShowBuy] = useState(false);

  const shortBy = Math.max(0, amount - balance);
  const bbReady = method === 'barter_bucks' && amount > 0 && shortBy === 0;
  const canConfirm = amount > 0 && (method === 'usd' || bbReady);

  function confirm() {
    if (!method) return;
    onChoose(method);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Cover the difference</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Your service covers part of the trade. How much is left, and how will you pay it?</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountDollar}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amountText}
              onChangeText={onAmountChange}
              placeholder="Difference"
              placeholderTextColor="#AAA"
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="Dollar difference you will cover"
            />
          </View>

          <TouchableOpacity style={[styles.option, method === 'usd' && styles.optionOn]} onPress={() => setMethod('usd')}>
            <View style={styles.optionIcon}><Text style={styles.dollar}>$</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Pay in USD</Text>
              <Text style={styles.optionBody}>Pay the difference by card once you've both signed the agreement.</Text>
            </View>
            <Ionicons name={method === 'usd' ? 'radio-button-on' : 'radio-button-off'} size={22} color={method === 'usd' ? colors.primary : '#CCC'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.option, method === 'barter_bucks' && styles.optionOn]} onPress={() => setMethod('barter_bucks')}>
            <View style={styles.optionIcon}><BarterBucksIcon size={24} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Pay with Barter Bucks</Text>
              <Text style={styles.optionBody}>
                1 Barter Buck covers $1. You have <Text style={styles.bold}>{balance} BB</Text>
                {amount > 0 ? <>; this needs <Text style={styles.bold}>{amount} BB</Text>.</> : '.'}
              </Text>
            </View>
            <Ionicons name={method === 'barter_bucks' ? 'radio-button-on' : 'radio-button-off'} size={22} color={method === 'barter_bucks' ? colors.primary : '#CCC'} />
          </TouchableOpacity>

          {method === 'barter_bucks' && shortBy > 0 && (
            <View style={styles.short}>
              <Text style={styles.shortText}>You're {shortBy} Barter Bucks short.</Text>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => { if (requireAccount('buy Barter Bucks')) setShowBuy(true); }}
              >
                <Text style={styles.buyBtnText}>Buy Barter Bucks</Text>
              </TouchableOpacity>
              <Text style={styles.packLine}>5 for $5 · 20 for $10 · 50 for $19.99</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirm, !canConfirm && { opacity: 0.4 }]}
            onPress={confirm}
            disabled={!canConfirm}
          >
            <Text style={styles.confirmText}>
              {amount <= 0
                ? 'Enter the difference'
                : method === 'barter_bucks'
                  ? `Use ${amount} Barter Bucks`
                  : method === 'usd'
                    ? `Pay $${amount} in USD`
                    : 'Choose an option'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.fine}>Nothing is charged or moved until both of you sign the barter agreement.</Text>
        </View>
        <BuyBarterBucksSheet visible={showBuy} onClose={() => setShowBuy(false)} needed={shortBy} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40, gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#000', fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.sm, color: '#666', marginBottom: spacing.sm, fontFamily: fonts.regular, lineHeight: 20 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 14, paddingHorizontal: 14 },
  amountDollar: { fontSize: 22, fontWeight: '800', color: '#000' },
  amountInput: { flex: 1, fontSize: 22, fontWeight: '700', paddingVertical: 12, paddingLeft: 6, color: '#000' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 14, padding: 14 },
  optionOn: { borderColor: colors.primary, backgroundColor: '#F0FAFB' },
  optionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center' },
  dollar: { fontSize: 20, fontWeight: '800', color: colors.primary },
  optionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  optionBody: { fontSize: fontSize.xs, color: '#666', marginTop: 2, lineHeight: 17 },
  bold: { fontWeight: '800', color: '#000' },
  short: { backgroundColor: '#FFFDE7', borderRadius: 14, padding: 14, alignItems: 'center', gap: 8 },
  shortText: { fontSize: fontSize.sm, color: '#5C4A0A', fontWeight: '700' },
  buyBtn: { backgroundColor: '#FEED66', paddingVertical: 10, paddingHorizontal: 22, borderRadius: borderRadius.full },
  buyBtnText: { fontSize: fontSize.sm, fontWeight: '800', color: '#1E1E1E' },
  packLine: { fontSize: fontSize.xs, color: '#8B6914' },
  confirm: { backgroundColor: colors.primary, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  confirmText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
  fine: { fontSize: 11, color: '#999', textAlign: 'center' },
});
