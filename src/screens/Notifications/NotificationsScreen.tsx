import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useNotifications, AppNotification } from '../../context/NotificationsContext';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import AppImage from '../../components/AppImage';
import { CONTACT_AVATARS, getProviderAvatar } from '../../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const PERIOD_LABELS: Record<string, string> = {
  today: 'Today',
  week: 'This week',
  earlier: 'Earlier',
};

const AVATAR_COLORS: Record<string, string> = {
  Lisa: '#E8B4B8',
  Charlese: '#B4C7E8',
  Shauna: '#C8E8B4',
  Rogan: '#E8D4B4',
  Aaliyah: '#D4B4E8',
  Carlos: '#B4E8D4',
  System: '#FFFDE7',
};

export default function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { notifications, markAllRead, clearSection } = useNotifications();

  // Mark all read on mount
  React.useEffect(() => { markAllRead(); }, [markAllRead]);

  const sections = (['today', 'week', 'earlier'] as const)
    .map((period) => ({
      title: period,
      data: notifications.filter((n) => n.period === period),
    }))
    .filter((s) => s.data.length > 0);

  function handleTap(notif: AppNotification) {
    switch (notif.type) {
      case 'barter_initiated':
      case 'accepted':
        navigation.navigate('BarterFlow', {
          providerName: notif.senderName, providerIcon: notif.icon,
          providerService: 'Service', providerValue: 500,
          userService: 'Fitness Training', userValue: 300,
        });
        break;
      case 'message':
        navigation.navigate('Conversation', {
          providerId: '1', providerName: notif.senderName, providerIcon: notif.icon,
        });
        break;
      case 'match':
        navigation.navigate('MainTabs');
        break;
      case 'completed':
        navigation.navigate('Rating', {
          providerName: notif.senderName, providerIcon: notif.icon, providerService: 'Service',
        });
        break;
      case 'review':
        navigation.navigate('MainTabs');
        break;
      case 'bb_earned':
      case 'tier_up':
        navigation.navigate('BarterBucksGuide');
        break;
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptySubtext}>New barter activity will appear here</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{PERIOD_LABELS[section.title]}</Text>
              <TouchableOpacity onPress={() => clearSection(section.title)}>
                <Text style={styles.clearAll}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, !item.read && styles.rowUnread]}
              activeOpacity={0.7}
              onPress={() => handleTap(item)}
            >
              <AppImage
                uri={CONTACT_AVATARS[item.senderName] || getProviderAvatar(item.senderName) || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop'}
                width={52}
                height={52}
                borderRadius={26}
                fallbackText={item.senderName}
              />
              <View style={styles.rowContent}>
                <Text style={styles.rowText} numberOfLines={2}>{item.text}</Text>
              </View>
              <Text style={styles.rowTime}>{item.time}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000', fontFamily: fonts.extraBold },
  list: { paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10, backgroundColor: '#FAFAFA' },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  clearAll: { fontSize: fontSize.xs, color: '#999', fontFamily: fonts.regular },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 72, gap: 12, backgroundColor: '#FFF' },
  rowUnread: { backgroundColor: '#F0FAFB', borderLeftWidth: 3, borderLeftColor: colors.primary },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  rowContent: { flex: 1 },
  rowText: { fontSize: fontSize.sm, color: '#000', lineHeight: 20, fontFamily: fonts.regular },
  rowTime: { fontSize: fontSize.xs, color: '#999', fontFamily: fonts.regular },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 80 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#000' },
  emptySubtext: { fontSize: fontSize.sm, color: '#999' },
});
