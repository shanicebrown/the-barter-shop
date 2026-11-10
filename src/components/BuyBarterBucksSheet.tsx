import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { PACKS, PackId, useBarterBucks } from '../context/BarterBucksContext';
import { colors, fontSize, fonts, spacing } from '../theme';
import BarterBucksIcon from './BarterBucksIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Barter Bucks still needed for the current trade; highlights the smallest pack that covers it. */
  needed?: number;
};

/**
 * Buys Barter Bucks packs with Stripe. Purchased Barter Bucks only cover value
 * differences in barters (real-world services), which is why this uses Stripe
 * rather than Apple/Google in-app purchase.
 */
export default function BuyBarterBucksSheet({ visible, onClose, needed }: Props) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { refresh } = useBarterBucks();
  const [busy, setBusy] = useState<PackId | null>(null);

  const suggested = needed && needed > 0 ? (PACKS.find((p) => p.bb >= needed) ?? PACKS[PACKS.length - 1]).id : null;

  async function buy(pack: PackId) {
    setBusy(pack);
    try {
      const { data, error } = await supabase.functions.invoke('bb-checkout', { body: { pack } });
      if (error || !data?.clientSecret) throw new Error('Checkout is unavailable right now. Please try again in a moment.');

      const init = await initPaymentSheet({
        merchantDisplayName: 'The Barter Shop',
        paymentIntentClientSecret: data.clientSecret,
        returnURL: 'thebartershop://stripe-redirect',
      });
      if (init.error) throw new Error(init.error.message);

      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== 'Canceled') Alert.alert('Payment failed', result.error.message);
        return;
      }

      // Stripe confirms the payment to our server, which then credits the
      // Barter Bucks; the wallet updates live. Refresh as a fallback.
      setTimeout(refresh, 3000);
      Alert.alert('Payment received', `${data.bb} Barter Bucks are on their way to your wallet.`, [
        { text: 'Done', onPress: onClose },
      ]);
    } catch (e: any) {
      Alert.alert('Could not complete purchase', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Buy Barter Bucks</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {needed && needed > 0 ? (
            <Text style={styles.subtitle}>You need {needed} more Barter Bucks to cover this difference.</Text>
          ) : (
            <Text style={styles.subtitle}>Use them to cover the difference when a trade isn't perfectly even.</Text>
          )}

          {PACKS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.pack, suggested === p.id && styles.packSuggested]}
              onPress={() => buy(p.id)}
              disabled={busy !== null}
              accessibilityRole="button"
              accessibilityLabel={`${p.bb} Barter Bucks for ${p.price}`}
            >
              <BarterBucksIcon size={28} />
              <View style={{ flex: 1 }}>
                <Text style={styles.packBB}>{p.bb} Barter Bucks</Text>
                {p.note ? <Text style={styles.packNote}>{p.note}</Text> : null}
              </View>
              {busy === p.id ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.packPrice}>{p.price}</Text>}
            </TouchableOpacity>
          ))}

          <Text style={styles.fine}>
            1 Barter Buck covers $1 of difference in a barter agreement. Purchased Barter Bucks can be used only
            in trades — not for perks — and can't be exchanged for cash. Payments are processed securely by Stripe.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40, gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#000', fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.sm, color: '#666', marginBottom: spacing.sm, fontFamily: fonts.regular },
  pack: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 14, padding: 14 },
  packSuggested: { borderColor: colors.primary, backgroundColor: '#F0FAFB' },
  packBB: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  packNote: { fontSize: fontSize.xs, color: '#8B6914', fontWeight: '700' },
  packPrice: { fontSize: fontSize.md, fontWeight: '800', color: '#000', fontFamily: fonts.extraBold },
  fine: { fontSize: 11, color: '#999', lineHeight: 16, marginTop: spacing.sm, textAlign: 'center' },
});
