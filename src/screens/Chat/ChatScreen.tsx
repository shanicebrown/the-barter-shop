import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import AppImage from '../../components/AppImage';
import MembershipBadge from '../../components/MembershipBadge';
import { getProviderAvatar, CONTACT_AVATARS } from '../../constants/images';

type Conversation = {
  id: string;
  icon: string;
  name: string;
  online: boolean;
  time: string;
  isMatch: boolean;
};

const LIKES = [
  { id: 'l1', name: 'Eve', color: '#E8B4B8' },
  { id: 'l2', name: 'Carman', color: '#B4C7E8' },
  { id: 'l3', name: 'Henry', color: '#C8E8B4' },
  { id: 'l4', name: 'John', color: '#E8D4B4' },
  { id: 'l5', name: 'Cafee', color: '#D4B4E8' },
  { id: 'l6', name: 'Mia', color: '#B4E8D4' },
];

const CONVERSATIONS: Conversation[] = [
  { id: '2', icon: '💇', name: 'Aaliyah R.', online: true, time: '28m', isMatch: true },
  { id: '4', icon: '🎨', name: 'Sofia M.', online: false, time: '1:05 PM', isMatch: false },
  { id: '7', icon: '👨‍🍳', name: 'Carlos V.', online: false, time: '1:05 PM', isMatch: false },
  { id: '1', icon: '💪', name: 'Marcus T.', online: false, time: 'Yesterday', isMatch: false },
  { id: '3', icon: '📸', name: 'Jordan K.', online: false, time: 'Yesterday', isMatch: false },
  { id: '6', icon: '📚', name: 'Priya S.', online: false, time: 'Wed', isMatch: false },
  { id: '8', icon: '💆', name: 'Zoe W.', online: false, time: 'Sun', isMatch: false },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function openConversation(conv: Conversation) {
    navigation.navigate('Conversation', {
      providerId: conv.id,
      providerName: conv.name,
      providerIcon: conv.icon,
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Likes Section */}
      <View style={styles.likesSection}>
        <View style={styles.likesHeader}>
          <Text style={styles.likesTitle}>Likes</Text>
          <Text style={styles.likesCount}>32</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.likesScroll}>
          {LIKES.map((like) => (
            <TouchableOpacity key={like.id} style={styles.likeItem}>
              <AppImage
                uri={CONTACT_AVATARS[like.name] || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop'}
                width={60}
                height={60}
                borderRadius={30}
                fallbackText={like.name}
              />
              <Text style={styles.likeName}>{like.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversations */}
      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.conversationRow} activeOpacity={0.7} onPress={() => openConversation(item)}>
            <View style={styles.avatarContainer}>
              <AppImage
                uri={getProviderAvatar(item.id)}
                width={56}
                height={56}
                borderRadius={28}
                fallbackText={item.name}
              />
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.conversationInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.conversationName}>{item.name}</Text>
                <MembershipBadge status="unverified" size={20} />
              </View>
            </View>
            <View style={styles.timeContainer}>
              {item.isMatch && <Ionicons name="heart" size={14} color="#FF4444" style={{ marginRight: 6 }} />}
              <Text style={styles.conversationTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  likesSection: { backgroundColor: '#F5F0E8', paddingBottom: spacing.md, paddingTop: spacing.sm },
  likesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  likesTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  likesCount: { fontSize: fontSize.lg, fontWeight: '700', color: '#FF4444', fontFamily: fonts.bold },
  likesScroll: { paddingHorizontal: spacing.md, gap: 12 },
  likeItem: { alignItems: 'center', gap: 4 },
  likeAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  likeAvatarText: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  likeName: { fontSize: fontSize.xs, color: '#000', textAlign: 'center', fontFamily: fonts.semiBold },
  conversationsList: { flex: 1, backgroundColor: '#FFF' },
  conversationRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 72, gap: 12 },
  avatarContainer: { position: 'relative' },
  conversationAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  conversationAvatarEmoji: { fontSize: 26 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#FFF' },
  conversationInfo: { flex: 1 },
  conversationName: { fontSize: fontSize.md, fontWeight: '600', color: '#000', fontFamily: fonts.semiBold },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  conversationTime: { fontSize: fontSize.xs, color: '#9E9E9E', fontFamily: fonts.regular },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 80 },
});
