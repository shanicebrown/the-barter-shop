import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BarterAgreement'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StatusType = 'pending' | 'awaiting' | 'executed';

function getStatus(isPartyA: boolean, partyASigned: boolean, partyBSigned: boolean): StatusType {
  if (partyASigned && partyBSigned) return 'executed';
  const mySigned = isPartyA ? partyASigned : partyBSigned;
  if (mySigned) return 'awaiting';
  return 'pending';
}

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bg: string }> = {
  pending: { label: 'Awaiting Your Signature', color: '#8B6914', bg: '#FFFDE7' },
  awaiting: { label: 'Awaiting Other Party', color: '#1565C0', bg: '#E3F2FD' },
  executed: { label: 'Fully Executed', color: '#2E7D32', bg: '#E8F5E9' },
};

// Simple signature canvas using PanResponder
function SignatureCanvas({ onSign }: { onSign: (sig: string) => void }) {
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [signed, setSigned] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setPaths((prev) => [...prev, currentPath]);
        setCurrentPath([]);
        setSigned(true);
      },
    })
  ).current;

  function clear() {
    setPaths([]);
    setCurrentPath([]);
    setSigned(false);
  }

  function submit() {
    if (!signed) return;
    // Generate a placeholder signature string (in production, use canvas to base64)
    onSign(`sig_${Date.now()}_signed`);
  }

  const allPoints = [...paths, currentPath];

  return (
    <View style={sigStyles.container}>
      <View style={sigStyles.canvas} {...panResponder.panHandlers}>
        {allPoints.length === 0 && (
          <Text style={sigStyles.placeholder}>Sign Here</Text>
        )}
        {/* Visual feedback - show dots along signature path */}
        {allPoints.map((path, pi) =>
          path.map((point, i) => (
            <View
              key={`${pi}-${i}`}
              style={[sigStyles.dot, { left: point.x - 2, top: point.y - 2 }]}
            />
          ))
        )}
      </View>
      <View style={sigStyles.actions}>
        <TouchableOpacity onPress={clear}>
          <Text style={sigStyles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sigStyles.doneBtn, !signed && { opacity: 0.4 }]}
          onPress={submit}
          disabled={!signed}
        >
          <Text style={sigStyles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sigStyles = StyleSheet.create({
  container: { gap: 8 },
  canvas: { width: '100%', height: 80, borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  placeholder: { color: '#CCC', fontSize: 16, fontFamily: fonts.regular },
  dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#000' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearText: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fonts.semiBold },
  doneBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  doneBtnText: { color: '#FFF', fontSize: fontSize.sm, fontFamily: fonts.bold },
});

// ── Main Screen ────────────────────────────────────────────
export default function AgreementScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    barterReference, partyAName, partyBName,
    partyAOffering, partyBOffering, partyAValue, partyBValue,
    deliveryDate, agreementText, isPartyA,
    partyASigned: initialASigned, partyBSigned: initialBSigned,
  } = route.params;

  const [partyASigned, setPartyASigned] = useState(initialASigned);
  const [partyBSigned, setPartyBSigned] = useState(initialBSigned);
  const [mySignature, setMySignature] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [signingMode, setSigningMode] = useState(false);

  const status = getStatus(isPartyA, partyASigned, partyBSigned);
  const statusInfo = STATUS_CONFIG[status];
  const mySigned = isPartyA ? partyASigned : partyBSigned;

  function handleSignatureCapture(sig: string) {
    setMySignature(sig);
    setSigningMode(false);
    setShowConfirm(true);
  }

  function confirmSign() {
    setShowConfirm(false);
    if (isPartyA) {
      setPartyASigned(true);
    } else {
      setPartyBSigned(true);
    }
    // Check if both signed
    const otherSigned = isPartyA ? partyBSigned : partyASigned;
    if (otherSigned) {
      setShowCelebration(true);
    }
  }

  // Format agreement text with highlights
  function renderAgreementText() {
    const sections = agreementText.split('\n\n');
    return sections.map((section, i) => {
      const isHeader = section.match(/^[IVX]+\.\s/) || section === 'BARTER AGREEMENT';
      const hasPartyName = section.includes(partyAName) || section.includes(partyBName);
      const hasValue = section.includes('$');

      return (
        <Text
          key={i}
          style={[
            styles.agreementText,
            isHeader && styles.agreementHeader,
          ]}
        >
          {section}
        </Text>
      );
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={require('../../../assets/BarterLogo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Barter Agreement</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Reference + Status */}
      <View style={styles.metaBar}>
        <Text style={styles.refText}>Ref: {barterReference}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Agreement Text */}
        <View style={styles.agreementCard}>
          {renderAgreementText()}
        </View>

        {/* Signatures Section */}
        <View style={styles.signaturesSection}>
          <Text style={styles.sigSectionTitle}>Signatures</Text>

          {/* Party A */}
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>{partyAName}</Text>
            {partyASigned ? (
              <View style={styles.signedRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.signedText}>Signed</Text>
              </View>
            ) : isPartyA ? (
              !signingMode ? (
                <TouchableOpacity style={styles.signHereBtn} onPress={() => setSigningMode(true)}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                  <Text style={styles.signHereText}>Sign Here</Text>
                </TouchableOpacity>
              ) : (
                <SignatureCanvas onSign={handleSignatureCapture} />
              )
            ) : (
              <Text style={styles.awaitingText}>Awaiting signature</Text>
            )}
          </View>

          {/* Party B */}
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>{partyBName}</Text>
            {partyBSigned ? (
              <View style={styles.signedRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.signedText}>Signed</Text>
              </View>
            ) : !isPartyA ? (
              !signingMode ? (
                <TouchableOpacity style={styles.signHereBtn} onPress={() => setSigningMode(true)}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                  <Text style={styles.signHereText}>Sign Here</Text>
                </TouchableOpacity>
              ) : (
                <SignatureCanvas onSign={handleSignatureCapture} />
              )
            ) : (
              <Text style={styles.awaitingText}>Awaiting signature</Text>
            )}
          </View>
        </View>

        {/* Sign Button */}
        {!mySigned && !signingMode && (
          <TouchableOpacity style={styles.signBtn} onPress={() => setSigningMode(true)}>
            <Ionicons name="pencil" size={18} color="#FFF" />
            <Text style={styles.signBtnText}>Sign Agreement</Text>
          </TouchableOpacity>
        )}

        {/* Download (Pro/Business) */}
        {status === 'executed' && (
          <View style={styles.downloadSection}>
            <TouchableOpacity style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={18} color={colors.primary} />
              <Text style={styles.downloadBtnText}>Download PDF</Text>
            </TouchableOpacity>
            <Text style={styles.downloadNote}>Available for Verified Pro and Business tiers</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="document-text" size={40} color={colors.primary} />
            <Text style={styles.modalTitle}>Confirm Signature</Text>
            <Text style={styles.modalText}>
              By signing you agree to complete {isPartyA ? partyAOffering : partyBOffering} by {deliveryDate}. This is a legally binding agreement.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSignBtn} onPress={confirmSign}>
                <Text style={styles.modalSignText}>I Agree, Sign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.celebCard}>
            <Text style={styles.celebEmoji}>🎉</Text>
            <Text style={styles.celebTitle}>Agreement Fully Executed!</Text>
            <Text style={styles.celebText}>
              Both parties have signed. Your barter agreement with {isPartyA ? partyBName : partyAName} is now legally binding.
            </Text>
            <TouchableOpacity style={styles.celebBtn} onPress={() => { setShowCelebration(false); navigation.goBack(); }}>
              <Text style={styles.celebBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 24, height: 24 },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  metaBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10, backgroundColor: '#FAFAFA' },
  refText: { fontSize: fontSize.xs, color: '#999', fontFamily: fonts.regular },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { fontSize: 11, fontWeight: '600', fontFamily: fonts.semiBold },
  content: { padding: spacing.md },

  // Agreement
  agreementCard: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: spacing.md, gap: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  agreementText: { fontSize: fontSize.sm, color: '#333', lineHeight: 22, fontFamily: fonts.regular },
  agreementHeader: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold, marginTop: 8 },

  // Signatures
  signaturesSection: { marginTop: spacing.lg, gap: spacing.md },
  sigSectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  sigBox: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: spacing.md, gap: 8 },
  sigLabel: { fontSize: fontSize.sm, fontWeight: '600', color: '#000', fontFamily: fonts.semiBold },
  signedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signedText: { color: '#4CAF50', fontSize: fontSize.sm, fontFamily: fonts.semiBold },
  awaitingText: { color: '#999', fontSize: fontSize.sm, fontStyle: 'italic', fontFamily: fonts.regular },
  signHereBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 8, paddingVertical: 20, justifyContent: 'center' },
  signHereText: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fonts.semiBold },

  // Sign Button
  signBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: spacing.lg },
  signBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },

  // Download
  downloadSection: { alignItems: 'center', marginTop: spacing.lg, gap: 4 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  downloadBtnText: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fonts.semiBold },
  downloadNote: { fontSize: 11, color: '#999', fontFamily: fonts.regular },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  modalText: { fontSize: fontSize.sm, color: '#666', textAlign: 'center', lineHeight: 20, fontFamily: fonts.regular },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  modalCancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#666', fontSize: fontSize.sm, fontFamily: fonts.semiBold },
  modalSignBtn: { flex: 1, backgroundColor: colors.primary, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalSignText: { color: '#FFF', fontSize: fontSize.sm, fontFamily: fonts.bold },

  celebCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', gap: 12 },
  celebEmoji: { fontSize: 56 },
  celebTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  celebText: { fontSize: fontSize.sm, color: '#666', textAlign: 'center', lineHeight: 20, fontFamily: fonts.regular },
  celebBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 8 },
  celebBtnText: { color: '#FFF', fontSize: fontSize.md, fontFamily: fonts.bold },
});
