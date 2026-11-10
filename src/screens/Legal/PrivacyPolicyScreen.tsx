import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const SECTIONS = [
  { title: 'Information We Collect', body: 'We collect information you provide directly to us, including: name, email address, phone number, profile information, service listings, transaction history, messages between users, ratings and reviews, and payment information (processed securely through third-party providers). We also automatically collect certain information when you use the platform, including device information, IP address, browser type, operating system, and usage data.' },
  { title: 'How We Use Your Information', body: 'We use the information we collect to: provide, maintain, and improve our platform; facilitate barter transactions between users; send you notifications about matches, messages, and transaction updates; personalize your experience and provide relevant service recommendations; detect, investigate, and prevent fraudulent transactions and other illegal activities; comply with legal obligations; and communicate with you about products, services, and events.' },
  { title: 'Our Security Measures', body: 'We implement industry-standard security measures to protect your personal information, including: SSL/TLS encryption for data in transit; encrypted storage for sensitive data at rest; regular security audits and penetration testing; access controls and authentication requirements for our systems; and compliance with PCI-DSS standards for payment processing. While we strive to protect your information, no method of transmission over the Internet is 100% secure.' },
  { title: 'Keeping Your Information', body: 'We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and personal data at any time by contacting us.' },
  { title: "Children's Privacy", body: 'The Barter Shop is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected personal information from a child under 18, we will take steps to delete such information promptly. If you believe we have inadvertently collected information from a minor, please contact us immediately.' },
  { title: 'California Privacy Rights', body: 'If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights regarding your personal information, including: the right to know what personal information we collect and how it is used; the right to request deletion of your personal information; the right to opt-out of the sale of your personal information (we do not sell personal information); and the right to non-discrimination for exercising your privacy rights.' },
  { title: 'When We Share Your Information', body: 'We may share your information with: other users as necessary to facilitate barter transactions (e.g., your name, profile, service listings); service providers who assist us in operating the platform; law enforcement or government agencies when required by law; third parties in connection with a merger, acquisition, or sale of assets; and with your consent or at your direction.' },
  { title: 'Cookie Policy', body: 'We use cookies and similar tracking technologies to collect and track information about your use of the platform. Cookies are small data files stored on your device. We use session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted). You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of the platform may not function properly without cookies.' },
  { title: 'Contact', body: 'For questions about this Privacy Policy or our data practices, please contact us at:\n\ninfo@thebartershop.app\n\nThe Barter Shop Inc.\nDenver, Colorado\n\nYou may also submit a data access or deletion request by emailing the address above with the subject line "Privacy Request."' },
];

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: 06/12/2025</Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.agreeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.agreeBtnText}>I Agree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  content: { padding: spacing.md, paddingBottom: 100 },
  lastUpdated: { fontSize: fontSize.xs, color: '#999', marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', marginBottom: spacing.sm },
  sectionBody: { fontSize: fontSize.sm, color: '#666', lineHeight: 22 },
  bottomBar: { paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  agreeBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.lg, alignItems: 'center' },
  agreeBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
});
