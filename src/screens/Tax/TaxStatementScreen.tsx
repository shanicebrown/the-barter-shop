import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { generateStatementText, generateStatementId, getDemoTaxData } from '../../services/TaxService';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxStatement'>;

export default function TaxStatementScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { year } = route.params;
  const { summary, transactions } = getDemoTaxData(year);

  const statementId = generateStatementId(year, 'jamie-abc');
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const statementText = generateStatementText({
    year, generatedDate, statementId,
    fullName: 'Jamie Collins', username: 'jamiecollins',
    memberSince: 'January 2026',
    summary, transactions,
  });

  function handleDownload() {
    Alert.alert('Download PDF', 'PDF generation available for Verified Pro and Business tiers.', [
      { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
      { text: 'OK' },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Statement {year}</Text>
        <TouchableOpacity onPress={handleDownload}>
          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.docHeader}>
          <Text style={styles.docCompany}>The Barter Shop Inc.</Text>
          <Text style={styles.docTitle}>Annual Barter Activity Statement</Text>
          <Text style={styles.docMeta}>Tax Year: {year}</Text>
          <Text style={styles.docMeta}>Generated: {generatedDate}</Text>
          <Text style={styles.docMeta}>Statement ID: {statementId}</Text>
        </View>

        {/* Member Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Information</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>Jamie Collins</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Username</Text><Text style={styles.infoValue}>jamiecollins</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>January 2026</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Period</Text><Text style={styles.infoValue}>Jan 1 — Dec 31, {year}</Text></View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="warning" size={16} color="#8B6914" />
          <Text style={styles.disclaimerText}>
            This statement is provided for your records and tax preparation purposes. The Barter Shop Inc. is not a tax advisor. Barter transactions may be taxable as ordinary income at fair market value. Please consult a qualified tax professional. See IRS Publication 525.
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barter Activity Summary</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="Total barters completed" value={String(summary.totalBarters)} />
            <SummaryRow label="Services provided value" value={`$${summary.servicesProvidedValue.toLocaleString()}`} highlight />
            <SummaryRow label="Services received value" value={`$${summary.servicesReceivedValue.toLocaleString()}`} highlight />
            <SummaryRow label="Net barter value" value={`$${summary.netBarterValue.toLocaleString()}`} bold />
            <SummaryRow label="Partial cash received" value={`$${summary.cashReceived.toLocaleString()}`} />
            <SummaryRow label="Partial cash paid" value={`$${summary.cashPaid.toLocaleString()}`} />
            <SummaryRow label="Barter Bucks earned" value={`${summary.barterBucksEarned} BB`} />
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Detail</Text>
          {transactions.map((t, i) => (
            <View key={i} style={styles.txCard}>
              <View style={styles.txHeader}>
                <Text style={styles.txDate}>{t.date}</Text>
                <View style={[styles.txTypeBadge, t.type === 'Full Barter' ? styles.txTypeFull : styles.txTypePartial]}>
                  <Text style={styles.txTypeText}>{t.type}</Text>
                </View>
              </View>
              <Text style={styles.txPartner}>with {t.partner}</Text>
              <View style={styles.txDetail}>
                <View style={styles.txCol}>
                  <Text style={styles.txColLabel}>Provided</Text>
                  <Text style={styles.txColService}>{t.serviceProvided}</Text>
                  <Text style={styles.txColValue}>${t.providedValue}</Text>
                </View>
                <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                <View style={styles.txCol}>
                  <Text style={styles.txColLabel}>Received</Text>
                  <Text style={styles.txColService}>{t.serviceReceived}</Text>
                  <Text style={styles.txColValue}>${t.receivedValue}</Text>
                </View>
              </View>
              {t.cashAmount > 0 && <Text style={styles.txCash}>Cash: ${t.cashAmount}</Text>}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            The fair market values shown above are based on the amounts agreed upon by both parties at the time of the barter agreement. These values may constitute taxable income.{'\n\n'}For IRS guidance: irs.gov/taxtopics/tc420{'\n\n'}The Barter Shop Inc.{'\n'}info@thebartershop.app{'\n'}Governing law: State of Colorado
          </Text>
        </View>
      </ScrollView>

      {/* Download Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Ionicons name="download-outline" size={18} color="#FFF" />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold, highlight && { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, paddingBottom: 100 },

  docHeader: { backgroundColor: '#0A3D44', borderRadius: 16, padding: spacing.lg, gap: 4, marginBottom: spacing.md },
  docCompany: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.6)', fontFamily: fonts.regular },
  docTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: fonts.bold },
  docMeta: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.5)', fontFamily: fonts.regular },

  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold, marginBottom: spacing.sm },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  infoLabel: { fontSize: fontSize.sm, color: '#999', fontFamily: fonts.regular },
  infoValue: { fontSize: fontSize.sm, color: '#000', fontFamily: fonts.semiBold },

  disclaimer: { flexDirection: 'row', backgroundColor: '#FFFDE7', borderRadius: 12, padding: spacing.md, gap: 10, alignItems: 'flex-start', marginBottom: spacing.lg, borderWidth: 1, borderColor: '#FFF9C4' },
  disclaimerText: { flex: 1, fontSize: fontSize.xs, color: '#8B6914', lineHeight: 18, fontFamily: fonts.regular },

  summaryCard: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  summaryLabel: { fontSize: fontSize.sm, color: '#666', fontFamily: fonts.regular },
  summaryValue: { fontSize: fontSize.sm, color: '#000', fontFamily: fonts.semiBold },
  summaryValueBold: { fontWeight: '700', fontSize: fontSize.md, fontFamily: fonts.bold },

  txCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  txDate: { fontSize: fontSize.sm, fontWeight: '600', color: '#000', fontFamily: fonts.semiBold },
  txTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  txTypeFull: { backgroundColor: '#E0F7FA' },
  txTypePartial: { backgroundColor: '#FFF3E0' },
  txTypeText: { fontSize: 10, fontWeight: '600', fontFamily: fonts.semiBold },
  txPartner: { fontSize: fontSize.xs, color: '#999', fontFamily: fonts.regular, marginBottom: 8 },
  txDetail: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txCol: { flex: 1 },
  txColLabel: { fontSize: 10, color: '#999', fontFamily: fonts.regular },
  txColService: { fontSize: fontSize.xs, fontWeight: '600', color: '#000', fontFamily: fonts.semiBold },
  txColValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, fontFamily: fonts.bold },
  txCash: { fontSize: fontSize.xs, color: '#FF6B6B', fontFamily: fonts.semiBold, marginTop: 6 },

  footer: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: spacing.md, marginBottom: spacing.lg },
  footerText: { fontSize: 11, color: '#999', lineHeight: 18, fontFamily: fonts.regular },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  downloadBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  downloadBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});
