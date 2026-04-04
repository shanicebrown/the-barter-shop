import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const PLACEHOLDER_ITEMS = [
  { id: '1', title: 'Vintage Camera', category: 'Electronics', owner: 'Alex' },
  { id: '2', title: 'Leather Jacket', category: 'Clothing', owner: 'Jordan' },
  { id: '3', title: 'Guitar Amp', category: 'Music', owner: 'Sam' },
  { id: '4', title: 'Mountain Bike', category: 'Sports', owner: 'Taylor' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover Items</Text>
      <FlatList
        data={PLACEHOLDER_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📦</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemOwner}>by {item.owner}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  cardContent: {
    padding: spacing.md,
  },
  itemTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  itemCategory: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  itemOwner: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
