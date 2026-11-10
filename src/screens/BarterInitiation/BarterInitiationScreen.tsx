import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useListings } from '../../context/ListingsContext';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const SERVICE_CATEGORIES = [
  { name: 'Hair & Beauty', icon: '💇' },
  { name: 'Fitness & Training', icon: '💪' },
  { name: 'Photography', icon: '📸' },
  { name: 'Tutoring & Education', icon: '📚' },
  { name: 'Home Repair', icon: '🔧' },
  { name: 'Legal & Financial Advice', icon: '⚖️' },
  { name: 'Graphic Design & Creative', icon: '🎨' },
];

export default function BarterInitiationScreen() {
  const { listings, addListing } = useListings();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  function handleSubmit() {
    if (!selectedCategory) return;
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe your skill.');
      return;
    }

    const cat = SERVICE_CATEGORIES.find((c) => c.name === selectedCategory);
    addListing({
      category: selectedCategory,
      icon: cat?.icon || '🤝',
      description: description.trim(),
    });

    Alert.alert('Skill Listed', 'Your skill is now visible on the Home Feed.');
    setSelectedCategory(null);
    setDescription('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Offer a Skill</Text>
      <Text style={styles.subtitle}>What skill can you bring to the table?</Text>

      <View style={styles.guardrail}>
        <Text style={styles.guardrailText}>
          The Barter Shop is a skill-for-skill platform. Physical items are not permitted.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Select a Category</Text>
      <View style={styles.categoriesGrid}>
        {SERVICE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryCard,
              selectedCategory === cat.name && styles.categoryCardSelected,
            ]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === cat.name && styles.categoryNameSelected,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedCategory && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Describe Your Skill</Text>
          <TextInput
            style={styles.textArea}
            placeholder={`Describe your ${selectedCategory} skill in detail...`}
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>List My Skill</Text>
          </TouchableOpacity>
        </View>
      )}

      {listings.length > 0 && (
        <View style={styles.activeSection}>
          <Text style={styles.sectionTitle}>Your Active Listings</Text>
          {listings.map((listing) => (
            <View key={listing.id} style={styles.activeCard}>
              <View style={styles.activeCardHeader}>
                <View style={styles.activeCardIcon}>
                  <Text style={styles.activeCardIconText}>{listing.icon}</Text>
                </View>
                <View style={styles.activeCardInfo}>
                  <Text style={styles.activeCardCategory}>{listing.category}</Text>
                  <Text style={styles.activeCardDesc}>{listing.description}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How Bartering Works</Text>
        <Text style={styles.infoText}>1. List a skill you can offer</Text>
        <Text style={styles.infoText}>2. Browse skills from your community</Text>
        <Text style={styles.infoText}>3. Propose a barter and chat</Text>
        <Text style={styles.infoText}>4. Trade skills with each other</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  guardrail: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  guardrailText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    width: '48%',
    flexGrow: 1,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  descriptionSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  activeSection: {
    marginBottom: spacing.lg,
  },
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activeCardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  activeCardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCardIconText: {
    fontSize: 22,
  },
  activeCardInfo: {
    flex: 1,
  },
  activeCardCategory: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  activeCardDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
