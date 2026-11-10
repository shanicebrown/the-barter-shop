import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Rating'>;

function InteractiveStars({ rating, onRate }: { rating: number; onRate: (n: number) => void }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={44}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RatingScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { providerName, providerIcon, providerService } = route.params;

  const [step, setStep] = useState<1 | 2>(1);
  const [providerRating, setProviderRating] = useState(0);
  const [providerReview, setProviderReview] = useState('');
  const [appRating, setAppRating] = useState(0);
  const [appReview, setAppReview] = useState('');
  const [showThanks, setShowThanks] = useState(false);

  function handleNext() {
    setStep(2);
  }

  function handleSubmit() {
    setShowThanks(true);
  }

  function handleDone() {
    setShowThanks(false);
    navigation.popToTop();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {step === 1 ? (
        <View style={styles.content}>
          <Text style={styles.title}>Rate your barter experience</Text>

          {/* Provider card */}
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerEmoji}>{providerIcon}</Text>
            </View>
            <Text style={styles.providerName}>{providerName}</Text>
            <Text style={styles.providerService}>{providerService}</Text>
          </View>

          {/* Stars */}
          <InteractiveStars rating={providerRating} onRate={setProviderRating} />

          {/* Review input */}
          <View style={styles.reviewSection}>
            <View style={styles.reviewLabelRow}>
              <Ionicons name="pencil" size={16} color="#999" />
              <Text style={styles.reviewLabel}>Write a review</Text>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="What did you like about this barter?"
              placeholderTextColor="#999"
              value={providerReview}
              onChangeText={setProviderReview}
              multiline
              numberOfLines={5}
            />
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Rate your overall Barter Shop experience</Text>

          <InteractiveStars rating={appRating} onRate={setAppRating} />

          <View style={styles.reviewSection}>
            <View style={styles.reviewLabelRow}>
              <Ionicons name="pencil" size={16} color="#999" />
              <Text style={styles.reviewLabel}>Write a review</Text>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Any feedback to help us improve?"
              placeholderTextColor="#999"
              value={appReview}
              onChangeText={setAppReview}
              multiline
              numberOfLines={5}
            />
          </View>
        </View>
      )}

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={step === 1 ? handleNext : handleSubmit}
        >
          <Text style={styles.nextBtnText}>{step === 1 ? 'Next' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Thanks Modal */}
      <Modal visible={showThanks} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.thanksCard}>
            <Text style={styles.thanksEmoji}>🤝</Text>
            <Text style={styles.thanksTitle}>Thanks for your review!</Text>
            <Text style={styles.thanksSubtext}>
              Your feedback helps build a trusted barter community.
            </Text>
            <TouchableOpacity style={styles.thanksBtn} onPress={handleDone}>
              <Text style={styles.thanksBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  content: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.lg, marginTop: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center' },

  // Provider card
  providerCard: { backgroundColor: '#FFFDE7', borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', gap: 6 },
  providerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  providerEmoji: { fontSize: 24 },
  providerName: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  providerService: { fontSize: fontSize.md, color: '#FF6B6B' },

  // Stars
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },

  // Review
  reviewSection: { gap: 8 },
  reviewLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewLabel: { fontSize: fontSize.sm, color: '#999' },
  reviewInput: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: borderRadius.lg, padding: spacing.md, fontSize: fontSize.sm, color: '#000', minHeight: 120, textAlignVertical: 'top' },

  // Bottom
  bottomBar: { paddingHorizontal: spacing.md, paddingTop: 12 },
  nextBtn: { backgroundColor: colors.primary, height: 56, borderRadius: borderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  thanksCard: { backgroundColor: '#FFF', borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', width: '100%', gap: spacing.md },
  thanksEmoji: { fontSize: 56 },
  thanksTitle: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center' },
  thanksSubtext: { fontSize: fontSize.sm, color: '#999', textAlign: 'center' },
  thanksBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: borderRadius.lg, alignItems: 'center', width: '100%' },
  thanksBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700' },
});
