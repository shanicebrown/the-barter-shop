import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import AppImage from '../../components/AppImage';
import { getProviderAvatar } from '../../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'BarterChat'>;
type Message = { id: string; text: string; fromUser: boolean; day: number };

const SAMPLE: Message[] = [
  { id: '1', text: "Agreement signed! Let's coordinate our barter. When works for you?", fromUser: false, day: 1 },
  { id: '2', text: "I'm free this Saturday afternoon. Does 2pm work?", fromUser: true, day: 1 },
  { id: '3', text: "Perfect! I'll come to you. Send me your address?", fromUser: false, day: 1 },
];

export default function BarterChatScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { providerName, providerIcon, providerId, barterReference, yourService, yourValue, theirService, theirValue, deliveryDate } = route.params;
  const [messages, setMessages] = useState<Message[]>(SAMPLE);
  const [input, setInput] = useState('');
  const [showReport, setShowReport] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const daysRemaining = Math.max(0, Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: input.trim(), fromUser: true, day: 1 }]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleMarkComplete() {
    Alert.alert('Mark Complete', 'Confirm that your part of the barter is complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Complete', onPress: () => {
          Alert.alert('Marked Complete', 'Waiting for the other party to confirm completion.');
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <AppImage uri={getProviderAvatar(providerId)} width={36} height={36} borderRadius={18} fallbackText={providerName} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{providerName}</Text>
          <Text style={styles.headerLabel}>Barter Chat</Text>
        </View>
        <Text style={styles.headerTimer}>⏰ {daysRemaining}d left</Text>
        <TouchableOpacity onPress={() => setShowReport(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Agreement Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>📋 ACTIVE BARTER AGREEMENT</Text>
        <Text style={styles.bannerRef}>Ref: {barterReference}</Text>
        <View style={styles.bannerRow}>
          <View style={styles.bannerCol}>
            <Text style={styles.bannerLabel}>You are providing:</Text>
            <Text style={styles.bannerValue}>{yourService} — ${yourValue}</Text>
          </View>
          <View style={styles.bannerCol}>
            <Text style={styles.bannerLabel}>You are receiving:</Text>
            <Text style={styles.bannerValue}>{theirService} — ${theirValue}</Text>
          </View>
        </View>
        <Text style={styles.bannerDeadline}>⏰ {daysRemaining} days until deadline</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BarterAgreement', {
          barterReference, partyAName: 'Jamie Collins', partyBName: providerName,
          partyAOffering: yourService, partyBOffering: theirService,
          partyAValue: yourValue, partyBValue: theirValue, deliveryDate,
          agreementText: '', isPartyA: true, partyASigned: true, partyBSigned: true,
        })}>
          <Text style={styles.bannerLink}>View Full Agreement →</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={item.fromUser ? styles.rowUser : styles.rowProvider}>
            <View style={[styles.bubble, item.fromUser ? styles.bubbleUser : styles.bubbleProvider]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
            <Text style={styles.dayLabel}>Day {item.day} of barter</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.actionBtnText}>Share Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnComplete} onPress={handleMarkComplete}>
          <Ionicons name="checkmark-circle" size={16} color="#FFF" />
          <Text style={styles.actionBtnCompleteText}>Mark Complete</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { paddingBottom: insets.bottom || 12 }]}>
          <TextInput style={styles.textInput} placeholder="Type a message..." placeholderTextColor="#999" value={input} onChangeText={setInput} onSubmitEditing={handleSend} returnKeyType="send" />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: spacing.md, paddingBottom: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerName: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  headerLabel: { fontSize: 11, color: colors.primary, fontWeight: '600', fontFamily: fonts.semiBold },
  headerTimer: { fontSize: 11, color: '#FF6B6B', fontWeight: '600', fontFamily: fonts.semiBold, marginRight: 4 },

  banner: { backgroundColor: '#0A3D44', margin: spacing.md, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.primary, gap: 6 },
  bannerTitle: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFF', fontFamily: fonts.bold },
  bannerRef: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: fonts.regular },
  bannerRow: { flexDirection: 'row', gap: 12 },
  bannerCol: { flex: 1 },
  bannerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: fonts.regular },
  bannerValue: { fontSize: fontSize.xs, color: '#FFF', fontWeight: '600', fontFamily: fonts.semiBold },
  bannerDeadline: { fontSize: fontSize.xs, color: '#FF6B6B', fontFamily: fonts.semiBold },
  bannerLink: { fontSize: fontSize.xs, color: colors.primary, fontFamily: fonts.semiBold },

  messagesList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.md },
  rowUser: { alignItems: 'flex-end', gap: 4 },
  rowProvider: { alignItems: 'flex-start', gap: 4 },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser: { backgroundColor: '#E0F7FA', borderBottomRightRadius: 4 },
  bubbleProvider: { backgroundColor: '#F5F5F5', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: fontSize.sm, lineHeight: 20, color: '#000', fontFamily: fonts.regular },
  dayLabel: { fontSize: 9, color: '#999', paddingHorizontal: 4, fontFamily: fonts.regular },

  actionBar: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: 8, paddingVertical: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnText: { fontSize: 11, color: colors.primary, fontFamily: fonts.semiBold },
  actionBtnComplete: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnCompleteText: { fontSize: 11, color: '#FFF', fontFamily: fonts.semiBold },

  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: spacing.sm, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: fontSize.sm, color: '#000', fontFamily: fonts.regular },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
