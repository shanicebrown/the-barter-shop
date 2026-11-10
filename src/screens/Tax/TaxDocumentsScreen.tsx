import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaxDocuments'>;

const AVAILABLE_YEARS = [
  { year: 2026, barters: 12, status: 'available' },
  { year: 2025, barters: 0, status: 'no_activity' },
];

export default function TaxDocumentsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={AVAILABLE_YEARS}
        keyExtractor={(item) => String(item.year)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.infoBanner}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Your Annual Barter Activity Statements are generated each January for the previous tax year.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.yearCard}
            onPress={() => item.status === 'available' ? navigation.navigate('TaxStatement', { year: item.year }) : null}
            disabled={item.status !== 'available'}
          >
            <View style={styles.yearIcon}>
              <Ionicons name="document-text" size={24} color={item.status === 'available' ? colors.primary : '#CCC'} />
            </View>
            <View style={styles.yearInfo}>
              <Text style={styles.yearTitle}>Tax Year {item.year}</Text>
              <Text style={styles.yearDesc}>
                {item.status === 'available'
                  ? `${item.barters} barters completed`
                  : 'No barter activity'}
              </Text>
            </View>
            {item.status === 'available' ? (
              <Ionicons name="chevron-forward" size={20} color="#999" />
            ) : (
              <Text style={styles.naText}>N/A</Text>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('TaxEducation')}>
              <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.footerLinkText}>Understanding Barter Taxes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  content: { padding: spacing.md, gap: spacing.md },
  infoBanner: { flexDirection: 'row', backgroundColor: '#E0F7FA', borderRadius: 12, padding: spacing.md, gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: fontSize.sm, color: '#00838F', lineHeight: 20, fontFamily: fonts.regular },
  yearCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 12, padding: spacing.md, gap: 12 },
  yearIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  yearInfo: { flex: 1 },
  yearTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  yearDesc: { fontSize: fontSize.xs, color: '#999', fontFamily: fonts.regular, marginTop: 2 },
  naText: { fontSize: fontSize.xs, color: '#CCC', fontFamily: fonts.regular },
  footerLinks: { marginTop: spacing.lg },
  footerLink: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  footerLinkText: { fontSize: fontSize.sm, color: colors.primary, fontFamily: fonts.semiBold },
});
