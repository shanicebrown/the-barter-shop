import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, AccountType } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

const ACCOUNT_TYPES: { type: AccountType; icon: keyof typeof Ionicons.glyphMap; title: string; description: string; price: string }[] = [
  { type: 'individual', icon: 'person', title: 'Individual', description: 'Trade your skills with the community. Perfect for freelancers and everyday people.', price: 'Free' },
  { type: 'business', icon: 'business', title: 'Business', description: 'Grow your business through barter. Get premium placement and analytics.', price: '$49.99/mo' },
  { type: 'verified_pro', icon: 'shield-checkmark', title: 'Verified Pro', description: 'Stand out with a verified badge. Priority placement and trust boost.', price: '$9/mo' },
];

export default function RegistrationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<AccountType>('individual');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>I am registering as:</Text>

        <View style={styles.cards}>
          {ACCOUNT_TYPES.map((at) => (
            <TouchableOpacity
              key={at.type}
              style={[styles.card, selected === at.type && styles.cardSelected]}
              onPress={() => setSelected(at.type)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIcon, selected === at.type && styles.cardIconSelected]}>
                <Ionicons name={at.icon} size={28} color={selected === at.type ? '#FFF' : '#666'} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{at.title}</Text>
                <Text style={styles.cardDesc}>{at.description}</Text>
              </View>
              <Text style={[styles.cardPrice, selected === at.type && styles.cardPriceSelected]}>{at.price}</Text>
              {selected === at.type && (
                <View style={styles.cardCheck}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('RegistrationInfo', { accountType: selected })}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signInLink} hitSlop={8}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 4, fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.md, color: '#999', marginBottom: 24, fontFamily: fonts.regular },
  cards: { gap: 12 },
  signInLink: { alignItems: 'center', paddingTop: 14 },
  signInText: { fontSize: fontSize.sm, color: '#666', fontFamily: fonts.regular },
  signInBold: { color: colors.primary, fontWeight: '700' },
  card: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardSelected: { borderColor: colors.primary, backgroundColor: '#F0FAFB' },
  cardIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  cardIconSelected: { backgroundColor: colors.primary },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  cardDesc: { fontSize: 12, color: '#999', marginTop: 2, lineHeight: 17, fontFamily: fonts.regular },
  cardPrice: { fontSize: fontSize.sm, fontWeight: '700', color: '#666', fontFamily: fonts.bold },
  cardPriceSelected: { color: colors.primary },
  cardCheck: { position: 'absolute', top: 12, right: 12 },
  bottomBar: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  continueBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});
