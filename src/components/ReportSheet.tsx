import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../theme';

const REASONS = [
  'Prohibited or illegal service',
  'Inappropriate content',
  'Fraudulent activity',
  'Harassment or threatening behavior',
  'Fake profile or impersonation',
  'Spam',
  'Other',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  reportedUserId?: string;
  contentType?: string;
  contentId?: string;
};

export default function ReportSheet({ visible, onClose, reportedUserId, contentType, contentId }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedReason) {
      Alert.alert('Required', 'Please select a reason.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('reports').insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reported_content_type: contentType,
          reported_content_id: contentId,
          reason: selectedReason,
          details: details.trim() || null,
        });
      }
    } catch (e) {
      console.log('Report submission error:', e);
    }

    setSubmitted(true);
  }

  function handleClose() {
    setSelectedReason(null);
    setDetails('');
    setSubmitted(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTap} onPress={handleClose} activeOpacity={1} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom || 16 }]}>
          <View style={styles.handle} />

          {submitted ? (
            <View style={styles.successContent}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successTitle}>Thank you for your report</Text>
              <Text style={styles.successText}>Our team will review this within 24 hours. We take all reports seriously.</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Report This User</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.selectLabel}>Select a reason:</Text>
              {REASONS.map((reason) => (
                <TouchableOpacity key={reason} style={styles.radioRow} onPress={() => setSelectedReason(reason)}>
                  <View style={[styles.radio, selectedReason === reason && styles.radioActive]}>
                    {selectedReason === reason && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{reason}</Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={styles.detailsInput}
                placeholder="Additional details (optional)"
                placeholderTextColor="#999"
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={[styles.submitBtn, !selectedReason && { opacity: 0.4 }]} onPress={handleSubmit} disabled={!selectedReason}>
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayTap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.md, paddingTop: 12, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  selectLabel: { fontSize: fontSize.sm, color: '#666', marginBottom: spacing.sm, fontFamily: fonts.regular },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  radioLabel: { fontSize: fontSize.sm, color: '#000', fontFamily: fonts.regular },
  detailsInput: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: spacing.md, marginTop: spacing.md, minHeight: 80, fontSize: fontSize.sm, color: '#000', textAlignVertical: 'top', fontFamily: fonts.regular },
  submitBtn: { backgroundColor: colors.primary, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  submitBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
  cancelText: { color: '#999', fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.sm, fontFamily: fonts.regular },
  successContent: { alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  successText: { fontSize: fontSize.sm, color: '#666', textAlign: 'center', lineHeight: 20, fontFamily: fonts.regular },
  doneBtn: { backgroundColor: colors.primary, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', width: '100%' },
  doneBtnText: { color: '#FFF', fontSize: fontSize.md, fontFamily: fonts.bold },
});
