import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useListings } from '../../context/ListingsContext';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { useRequireAccount } from '../../context/AuthContext';
import AppImage from '../../components/AppImage';
import { getCategoryImage } from '../../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateListing'>;

const CATEGORIES = [
  { name: 'Photography', icon: '📸' },
  { name: 'Product Dev', icon: '💻' },
  { name: 'Meal Prep', icon: '🍽️' },
  { name: 'Wellness', icon: '🧘' },
  { name: 'Fitness', icon: '💪' },
  { name: 'Design', icon: '🎨' },
  { name: 'Legal', icon: '⚖️' },
  { name: 'Hair & Beauty', icon: '💇' },
  { name: 'Home Repair', icon: '🔧' },
  { name: 'Music', icon: '🎵' },
];

const BARTER_TYPES = ['Full Barter', 'Partial Barter', 'Pay in Full'] as const;

export default function CreateListingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addListing } = useListings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [barterType, setBarterType] = useState<string>('Full Barter');
  const [lookingFor, setLookingFor] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const requireAccount = useRequireAccount();

  function handlePost() {
    if (!requireAccount('post a listing')) return;
    if (!title.trim() || !selectedCategory) {
      Alert.alert('Required', 'Please add a title and select a category.');
      return;
    }
    const cat = CATEGORIES.find((c) => c.name === selectedCategory);
    addListing({
      category: selectedCategory,
      icon: cat?.icon || '🤝',
      description: title.trim(),
    });
    Alert.alert('Posted!', 'Your listing is now live.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create new listing</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        <Text style={styles.label}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
          {hasPhoto && (
            <View style={styles.photoUploaded}>
              <Text style={styles.photoEmoji}>📷</Text>
              <TouchableOpacity style={styles.photoRemove} onPress={() => setHasPhoto(false)}>
                <Ionicons name="close-circle" size={20} color="#FF4444" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.photoAdd} onPress={() => setHasPhoto(true)}>
            <Ionicons name="add" size={28} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoAdd} onPress={() => setHasPhoto(true)}>
            <Ionicons name="add" size={28} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoAdd} onPress={() => setHasPhoto(true)}>
            <Ionicons name="add" size={28} color="#999" />
          </TouchableOpacity>
        </ScrollView>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Name your service"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Describe your service in detail"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[styles.categoryCard, selectedCategory === cat.name && styles.categoryCardActive]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <View style={[styles.categoryIcon, selectedCategory === cat.name && styles.categoryIconActive]}>
                <AppImage uri={getCategoryImage(cat.name)} width={52} height={52} borderRadius={6} fallbackText={cat.name} />
              </View>
              <Text style={[styles.categoryName, selectedCategory === cat.name && styles.categoryNameActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Total Value */}
        <Text style={styles.label}>Total Value</Text>
        <TextInput
          style={styles.input}
          placeholder="Estimate your service value in USD"
          placeholderTextColor="#999"
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />

        {/* Barter Type */}
        <Text style={styles.label}>Barter Type</Text>
        <View style={styles.barterTypeRow}>
          {BARTER_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.barterPill, barterType === type && styles.barterPillActive]}
              onPress={() => setBarterType(type)}
            >
              <Text style={[styles.barterPillText, barterType === type && styles.barterPillTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Looking For */}
        <Text style={styles.label}>What I am looking for</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="What service would you like in exchange?"
          placeholderTextColor="#999"
          value={lookingFor}
          onChangeText={setLookingFor}
          multiline
          numberOfLines={3}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Post Button */}
      <View style={[styles.postBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post it!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#000',
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.sm,
    color: '#000',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // Photos
  photosRow: {
    gap: 10,
  },
  photoAdd: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploaded: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F0F7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEmoji: {
    fontSize: 32,
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
  },

  // Categories
  categoriesRow: {
    gap: 10,
  },
  categoryCard: {
    alignItems: 'center',
    gap: 4,
  },
  categoryCardActive: {},
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIconActive: {
    borderColor: colors.primary,
    backgroundColor: '#E0F7FA',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 10,
    color: '#999',
  },
  categoryNameActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Barter Type
  barterTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  barterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  barterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  barterPillText: {
    fontSize: fontSize.xs,
    color: '#666',
    fontWeight: '600',
  },
  barterPillTextActive: {
    color: '#FFF',
  },

  // Post
  postBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
