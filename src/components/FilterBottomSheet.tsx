import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import AppImage from './AppImage';
import { getCategoryImage } from '../constants/images';

const CATEGORIES = [
  'Photography', 'Product Dev', 'Podcasting', 'Fitness',
  'Hair & Beauty', 'Home Repair', 'Legal', 'Cooking',
  'Design', 'Music', 'Tutoring', 'Massage',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { distance: number; priceMin: number; priceMax: number; category: string | null }) => void;
};

export default function FilterBottomSheet({ visible, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const [distance, setDistance] = useState(150);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  function handleClear() {
    setDistance(150);
    setPriceMin(0);
    setPriceMax(1000);
    setSelectedCategory(null);
  }

  function handleApply() {
    onApply({ distance, priceMin, priceMax, category: selectedCategory });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTap} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom || 16 }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Distance */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Distance (km)</Text>
                <Text style={styles.sliderValue}>{distance >= 150 ? '150+' : distance}km</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={150}
                step={1}
                value={distance}
                onValueChange={setDistance}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={colors.primary}
              />
            </View>

            {/* Pricing */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Pricing</Text>
                <Text style={styles.sliderValue}>${Math.round(priceMin)}-{Math.round(priceMax) >= 1000 ? '1000+' : Math.round(priceMax)}</Text>
              </View>
              <Text style={styles.miniLabel}>Minimum</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1000}
                step={10}
                value={priceMin}
                onValueChange={(v) => setPriceMin(Math.min(v, priceMax - 10))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={colors.primary}
              />
              <Text style={styles.miniLabel}>Maximum</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1000}
                step={10}
                value={priceMax}
                onValueChange={(v) => setPriceMax(Math.max(v, priceMin + 10))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={colors.primary}
              />
            </View>

            {/* Service Type */}
            <View style={styles.categorySection}>
              <Text style={styles.sliderLabel}>Service Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {CATEGORIES.map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(selectedCategory === name ? null : name)}
                  >
                    <View style={[styles.categoryIcon, selectedCategory === name && { borderColor: colors.primary }]}>
                      <AppImage
                        uri={getCategoryImage(name)}
                        width={76}
                        height={76}
                        borderRadius={10}
                        fallbackText={name}
                      />
                    </View>
                    <Text style={styles.categoryName}>{name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayTap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000' },
  content: { paddingHorizontal: spacing.md, gap: spacing.lg, paddingBottom: spacing.md },

  sliderSection: { gap: 4 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  sliderValue: { fontSize: fontSize.md, fontWeight: '700', color: '#000' },
  miniLabel: { fontSize: 11, color: '#999', marginTop: 4 },
  slider: { width: '100%', height: 40 },

  categorySection: { gap: spacing.sm },
  categoryRow: { gap: 10 },
  categoryCard: { alignItems: 'center', gap: 4 },
  categoryCardSelected: { },
  categoryIcon: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F5F5F5', overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  categoryName: { fontSize: fontSize.xs, color: '#000' },

  buttons: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.md, paddingTop: 12 },
  clearBtn: { flex: 1, height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  clearBtnText: { fontSize: fontSize.md, color: '#000' },
  applyBtn: { flex: 1, height: 56, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { fontSize: fontSize.md, fontWeight: '700', color: '#FFF' },
});

