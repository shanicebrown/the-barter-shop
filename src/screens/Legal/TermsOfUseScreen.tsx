import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsOfUse'>;

const SECTIONS = [
  { title: 'Privacy & Security', body: 'The Barter Shop Inc. ("we," "us," or "our") is committed to protecting the privacy and security of our users. By using our platform, you agree that we may collect, store, and process personal information as described in our Privacy Policy. We employ industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.' },
  { title: 'Use of the Platform', body: 'The Barter Shop is a peer-to-peer platform that facilitates the exchange of services between users. You may use the platform solely for lawful purposes and in accordance with these Terms. The platform is intended for service-for-service bartering, partial barter (service plus cash), and direct service purchases. Physical goods trading is not permitted.' },
  { title: 'Accounts', body: 'You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.' },
  { title: 'Memberships and Subscriptions', body: 'Community membership is free. Verified Pro ($9.00/month) and Business ($49.99/month) are auto-renewing monthly subscriptions purchased through the Apple App Store or Google Play; prices may vary by country and are shown before purchase. New subscribers may receive a 30-day free trial, which converts to a paid subscription at the end of the trial unless cancelled at least 24 hours before it ends. Payment is charged to your App Store or Google Play account, and your subscription renews automatically unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage or cancel your subscription in your App Store or Google Play account settings; refunds are handled by Apple or Google under their policies. Paid plans include a subscription to platform features; identity and credential verification is a separate review and is not guaranteed by purchase.' },
  { title: 'Founding Members', body: 'Members invited by The Barter Shop as Founding Members receive the plan stated in their invitation (Verified Pro or Business) free of charge for 12 months, starting when they first confirm their account. Founding membership is personal, non-transferable, and has no cash value. After 12 months, Founding Members may continue on a paid plan or on free Community membership.' },
  { title: 'Barter Bucks', body: 'Barter Bucks are in-app credits with no cash value; they cannot be redeemed, sold, or exchanged for money. Earned Barter Bucks are granted for platform activity (such as confirming a new account, completed barters, five-star reviews, verification, and completing your profile) and may be spent on in-app perks or applied toward a value difference in a barter. Purchased Barter Bucks are sold in packs (5 for $5.00, 20 for $10.00, 50 for $19.99), processed by Stripe, and may be used only to cover a value difference in a barter that both members have agreed to in a signed barter agreement, at a rate of one Barter Buck per $1.00 of difference; they cannot be used for perks. When you cover a difference, purchased Barter Bucks are applied before earned ones. A member who accepts Barter Bucks for a difference agrees to accept them in place of cash. Purchases are final except where required by law or approved by us; if a purchase is refunded, any unspent Barter Bucks from it are removed. Earned Barter Bucks may be deducted for violations of our Community Guidelines. Barter Bucks are forfeited when an account is deleted or terminated. We may change the program, including earning rates and perk costs, at any time; pack prices will not change for Barter Bucks already purchased.' },
  { title: 'Content Licenses', body: 'By posting content on The Barter Shop, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with operating and promoting the platform. You retain all ownership rights to your content.' },
  { title: 'Prohibitions', body: 'Users are prohibited from: posting false or misleading information; engaging in fraudulent transactions; harassing, threatening, or discriminating against other users; using the platform for illegal activities; attempting to reverse engineer or hack the platform; creating multiple accounts for deceptive purposes; trading physical goods or controlled substances.' },
  { title: 'Disputes Between Users', body: 'The Barter Shop is not a party to transactions between users. Disputes arising from barter transactions should be resolved directly between the parties involved. We provide a dispute resolution mechanism as a courtesy, but we are not obligated to mediate or resolve disputes. Users acknowledge that The Barter Shop bears no liability for the quality, safety, or legality of services exchanged.' },
  { title: 'Intellectual Property Rights', body: 'The Barter Shop and its original content, features, and functionality are owned by The Barter Shop Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our trademarks may not be used in connection with any product or service without our prior written consent.' },
  { title: 'No Endorsement', body: 'The Barter Shop does not endorse, guarantee, or assume responsibility for any service advertised or offered by users. We are not responsible for the actions, services, content, or data of third parties. You acknowledge sole responsibility for and assume all risk arising from your use of any third-party services.' },
  { title: 'Indemnity', body: 'You agree to indemnify, defend, and hold harmless The Barter Shop Inc., its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney fees, arising out of or in any way connected with your access to or use of the platform or your violation of these Terms.' },
  { title: 'Disclaimer of Warranties', body: 'THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.' },
  { title: 'Limitation on Liability', body: 'IN NO EVENT SHALL THE BARTER SHOP INC. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF THE PLATFORM.' },
  { title: 'No Refunds or Exchanges', body: 'Once a barter transaction is completed and confirmed by both parties, it is considered final. The Barter Shop does not offer refunds or facilitate exchanges for completed transactions. Users should carefully review all transaction details before confirming completion.' },
  { title: 'Legal Disputes and Binding Arbitration', body: 'Any dispute arising from these Terms or your use of the platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive your right to participate in a class action lawsuit or class-wide arbitration.' },
  { title: 'Governing Law', body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Colorado, without regard to its conflict of law provisions. Any legal proceedings must be brought in the courts located in Denver County, Colorado.' },
  { title: 'Termination', body: 'We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, your right to use the platform will immediately cease.' },
  { title: 'Contact', body: 'For questions about these Terms of Use, please contact us at:\n\ninfo@thebartershop.app\n\nThe Barter Shop Inc.\nDenver, Colorado' },
];

export default function TermsOfUseScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: 04/4/2026</Text>

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
