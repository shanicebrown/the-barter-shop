import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CommunityGuidelines'>;

export default function CommunityGuidelinesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Our Mission">
          The Barter Shop exists to help people trade their skills and preserve their cash. We are a professional service exchange community built on trust, respect, and accountability.
        </Section>

        <Section title="What's Allowed ✅">
          {`• Professional services of all kinds
• Creative and artistic services
• Educational and mentoring services
• Health, fitness and wellness services
• Home, business and technical services
• Community and social services`}
        </Section>

        <Section title="What's Prohibited 🚫">
          {`• Illegal services of any kind
• Adult or sexual services
• Drug or substance-related services
• Weapons or dangerous goods trading
• Counterfeit or stolen goods
• Discriminatory services based on race, religion, gender, sexuality, age, or disability
• Any service violating local, state, or federal law
• Fraudulent or misleading service descriptions
• Pyramid schemes or multi-level marketing
• Services requiring a license you don't hold`}
        </Section>

        <Section title="Consequences">
          {`Violations result in:

• First offense: Account warning and review
• Second offense: Temporary suspension (7-30 days)
• Third offense or severe violation: Permanent ban and potential reporting to law enforcement

All penalties are logged and affect your reliability score and Barter Bucks balance.`}
        </Section>

        <Section title="Reporting">
          {`See something? Say something.

Report suspicious activity using the 3-dot menu on any profile, listing, or message. Reports are reviewed within 24 hours.

Contact: info@thebartershop.app`}
        </Section>

        <View style={styles.zeroTolerance}>
          <Text style={styles.ztTitle}>ZERO TOLERANCE</Text>
          <Text style={styles.ztText}>
            The Barter Shop has ZERO TOLERANCE for illegal activity. Accounts found offering illegal services will be immediately suspended, permanently banned, and reported to the appropriate authorities.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, paddingBottom: 40 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', marginBottom: spacing.sm, fontFamily: fonts.bold },
  sectionBody: { fontSize: fontSize.sm, color: '#666', lineHeight: 22, fontFamily: fonts.regular },
  zeroTolerance: { backgroundColor: '#FFEBEE', borderRadius: 16, padding: spacing.md, gap: 8, borderWidth: 1, borderColor: '#FFCDD2' },
  ztTitle: { fontSize: fontSize.md, fontWeight: '900', color: '#C62828', fontFamily: fonts.black },
  ztText: { fontSize: fontSize.sm, color: '#C62828', lineHeight: 22, fontFamily: fonts.regular },
});
