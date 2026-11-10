import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VerificationFlow'>;

const PRO_STEPS = ['Identity', 'Selfie', 'Phone', 'Skills', 'Review'];
const BIZ_STEPS = ['Business Info', 'Registration', 'License', 'Insurance', 'Owner ID', 'Portfolio', 'Review'];

const SKILL_OPTIONS = [
  'Professional license/certification',
  'Degree or diploma',
  'Portfolio (min 5 samples)',
  'Professional profile link (LinkedIn, etc.)',
  'Three client references',
];

export default function VerificationFlowScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { tier } = route.params;
  const isPro = tier === 'verified_pro';
  const steps = isPro ? PRO_STEPS : BIZ_STEPS;
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [selectedSkillOption, setSelectedSkillOption] = useState<string | null>(null);
  const [bizName, setBizName] = useState('');
  const [bizEin, setBizEin] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitted(true);
    }
  }

  function handleUpload() {
    Alert.alert('Upload', 'Camera and document picker would open here.', [{ text: 'OK' }]);
  }

  function handleSendCode() {
    if (!phone.trim()) { Alert.alert('Required', 'Enter your phone number.'); return; }
    setCodeSent(true);
    Alert.alert('Code Sent', `Verification code sent to ${phone}`);
  }

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successText}>
            Our team will review your {isPro ? 'Verified Pro' : 'Business'} application within {isPro ? '48' : '72'} hours. You'll receive a notification with the result.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.popToTop()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const stepName = steps[currentStep];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStep > 0 ? setCurrentStep((s) => s - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isPro ? 'Verified Pro' : 'Business'} Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= currentStep && styles.progressDotActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step {currentStep + 1} of {totalSteps} — {stepName}</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity Step */}
        {stepName === 'Identity' || stepName === 'Owner ID' ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Upload your government-issued ID</Text>
            <Text style={styles.stepDesc}>Accepted: Driver's license, Passport, or State ID. Both sides required for ID cards.</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadCard} onPress={handleUpload}>
                <Ionicons name="camera" size={28} color={colors.primary} />
                <Text style={styles.uploadCardText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadCard} onPress={handleUpload}>
                <Ionicons name="cloud-upload" size={28} color={colors.primary} />
                <Text style={styles.uploadCardText}>Upload File</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.privacyText}>Your ID is encrypted and used only for verification. It is never shared with other users.</Text>
            </View>
          </View>
        ) : stepName === 'Selfie' ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Take a selfie to match your ID</Text>
            <Text style={styles.stepDesc}>Your selfie is compared to your ID photo by our team.</Text>
            <TouchableOpacity style={styles.selfieCircle} onPress={handleUpload}>
              <Ionicons name="person" size={48} color="#CCC" />
              <Text style={styles.selfieHint}>Tap to open camera</Text>
            </TouchableOpacity>
            <Text style={styles.livenessHint}>Liveness prompts: Smile → Turn left → Blink</Text>
          </View>
        ) : stepName === 'Phone' ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Verify your phone number</Text>
            <View style={styles.phoneRow}>
              <TextInput style={styles.phoneInput} placeholder="+1 (555) 000-0000" placeholderTextColor="#999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TouchableOpacity style={styles.sendCodeBtn} onPress={handleSendCode}>
                <Text style={styles.sendCodeText}>{codeSent ? 'Resend' : 'Send Code'}</Text>
              </TouchableOpacity>
            </View>
            {codeSent && (
              <View style={styles.codeRow}>
                <TextInput style={styles.codeInput} placeholder="Enter 6-digit code" placeholderTextColor="#999" value={verificationCode} onChangeText={setVerificationCode} keyboardType="number-pad" maxLength={6} />
                {verificationCode.length === 6 && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
              </View>
            )}
          </View>
        ) : stepName === 'Skills' ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Verify your expertise</Text>
            <Text style={styles.stepDesc}>Upload ONE of the following:</Text>
            {SKILL_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.radioRow} onPress={() => setSelectedSkillOption(opt)}>
                <View style={[styles.radio, selectedSkillOption === opt && styles.radioActive]}>
                  {selectedSkillOption === opt && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{opt}</Text>
              </TouchableOpacity>
            ))}
            {selectedSkillOption && (
              <TouchableOpacity style={styles.uploadBtnFull} onPress={handleUpload}>
                <Ionicons name="cloud-upload" size={20} color="#FFF" />
                <Text style={styles.uploadBtnFullText}>Upload Document</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : stepName === 'Business Info' ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Business Information</Text>
            <TextInput style={styles.field} placeholder="Business Name" placeholderTextColor="#999" value={bizName} onChangeText={setBizName} />
            <TextInput style={styles.field} placeholder="EIN / Tax ID" placeholderTextColor="#999" value={bizEin} onChangeText={setBizEin} />
            <TextInput style={styles.field} placeholder="Business Address" placeholderTextColor="#999" value={bizAddress} onChangeText={setBizAddress} />
          </View>
        ) : stepName === 'Registration' || stepName === 'License' || stepName === 'Insurance' || stepName === 'Portfolio' ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Upload {stepName}</Text>
            <Text style={styles.stepDesc}>{stepName === 'Portfolio' ? 'Upload at least 5 project samples.' : `Upload your ${stepName.toLowerCase()} document.`}</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadCard} onPress={handleUpload}>
                <Ionicons name="camera" size={28} color={colors.primary} />
                <Text style={styles.uploadCardText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadCard} onPress={handleUpload}>
                <Ionicons name="cloud-upload" size={28} color={colors.primary} />
                <Text style={styles.uploadCardText}>Upload File</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : stepName === 'Review' ? (
          <View style={styles.stepContent}>
            <Ionicons name="document-text" size={48} color={colors.primary} style={{ alignSelf: 'center' }} />
            <Text style={styles.stepTitle}>Review & Submit</Text>
            <Text style={styles.stepDesc}>
              Our team will review your application within {isPro ? '48' : '72'} hours. You'll receive an email and push notification with the result.
            </Text>
            {!isPro && (
              <Text style={styles.stepDesc}>We may reach out to schedule a brief video call.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Next Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{currentStep === totalSteps - 1 ? 'Submit Application' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  progressDotActive: { backgroundColor: colors.primary, width: 20 },
  stepLabel: { fontSize: fontSize.xs, color: '#999', textAlign: 'center', fontFamily: fonts.regular, marginBottom: spacing.sm },
  content: { padding: spacing.md, paddingBottom: 100 },

  stepContent: { gap: spacing.md },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  stepDesc: { fontSize: fontSize.sm, color: '#666', lineHeight: 22, fontFamily: fonts.regular },

  uploadRow: { flexDirection: 'row', gap: 12 },
  uploadCard: { flex: 1, height: 120, borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  uploadCardText: { fontSize: fontSize.xs, color: colors.primary, fontFamily: fonts.semiBold },
  uploadBtnFull: { flexDirection: 'row', backgroundColor: colors.primary, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  uploadBtnFullText: { color: '#FFF', fontSize: fontSize.sm, fontFamily: fonts.bold },

  privacyNotice: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderRadius: 12, padding: spacing.md, gap: 8, alignItems: 'flex-start' },
  privacyText: { flex: 1, fontSize: fontSize.xs, color: '#2E7D32', lineHeight: 18, fontFamily: fonts.regular },

  selfieCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', gap: 8 },
  selfieHint: { fontSize: fontSize.xs, color: '#999', fontFamily: fonts.regular },
  livenessHint: { fontSize: fontSize.xs, color: colors.primary, textAlign: 'center', fontFamily: fonts.semiBold },

  phoneRow: { flexDirection: 'row', gap: 8 },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: fontSize.md, color: '#000', fontFamily: fonts.regular },
  sendCodeBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  sendCodeText: { color: '#FFF', fontSize: fontSize.sm, fontFamily: fonts.bold },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeInput: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 20, color: '#000', fontFamily: fonts.bold, letterSpacing: 8, textAlign: 'center' },

  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  radioLabel: { fontSize: fontSize.sm, color: '#000', fontFamily: fonts.regular, flex: 1 },

  field: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: fontSize.md, color: '#000', fontFamily: fonts.regular },

  bottomBar: { paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  nextBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },

  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: spacing.md },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  successText: { fontSize: fontSize.sm, color: '#666', textAlign: 'center', lineHeight: 22, fontFamily: fonts.regular },
  doneBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', width: '100%' },
  doneBtnText: { color: '#FFF', fontSize: fontSize.md, fontFamily: fonts.bold },
});
