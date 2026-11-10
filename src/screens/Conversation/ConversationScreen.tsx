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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { useRequireAccount } from '../../context/AuthContext';
import AppImage from '../../components/AppImage';
import { getProviderAvatar } from '../../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;
type Message = { id: string; text: string; fromUser: boolean; time: string };

const SAMPLE_MESSAGES: Message[] = [
  { id: '1', text: "Hey! I saw you liked my profile. I'd love to discuss a barter! 🤝", fromUser: false, time: '10:30 AM' },
  { id: '2', text: "Yes! I'd love to book you, and I can trade personal training.", fromUser: true, time: '10:32 AM' },
  { id: '3', text: "That sounds amazing! I've been wanting to get more active. How many sessions are you thinking?", fromUser: false, time: '10:35 AM' },
  { id: '4', text: 'How about 3 training sessions in exchange for one of yours? Does that work? 🤝', fromUser: true, time: '10:38 AM' },
  { id: '5', text: 'Perfect! When are you available?', fromUser: false, time: '10:40 AM' },
];

export default function ConversationScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { providerId, providerName, providerIcon } = route.params;
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const requireAccount = useRequireAccount();

  function handleSend() {
    if (!input.trim()) return;
    if (!requireAccount('message other members')) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: input.trim(), fromUser: true, time: 'Now' }]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <AppImage
          uri={getProviderAvatar(providerId)}
          width={40}
          height={40}
          borderRadius={20}
          fallbackText={providerName}
        />
        <View>
          <Text style={styles.headerName}>{providerName}</Text>
          <Text style={styles.headerOnline}>Online</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>Today</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={item.fromUser ? styles.rowUser : styles.rowProvider}>
            <View style={[styles.bubble, item.fromUser ? styles.bubbleUser : styles.bubbleProvider]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { paddingBottom: insets.bottom || 12 }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color="#999" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
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
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  headerAvatarEmoji: { fontSize: 20 },
  headerName: { fontSize: fontSize.md, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  headerOnline: { fontSize: 11, color: colors.primary, fontWeight: '600', fontFamily: fonts.semiBold },
  messagesList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.md },
  dateSeparator: { alignSelf: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 4, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  dateSeparatorText: { fontSize: 11, color: '#999', fontFamily: fonts.semiBold },
  rowUser: { alignItems: 'flex-end', gap: 4 },
  rowProvider: { alignItems: 'flex-start', gap: 4 },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser: { backgroundColor: '#E0F7FA', borderBottomRightRadius: 4 },
  bubbleProvider: { backgroundColor: '#F5F5F5', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: fontSize.sm, lineHeight: 20, color: '#000', fontFamily: fonts.regular },
  timeText: { fontSize: 10, color: '#999', paddingHorizontal: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: spacing.sm, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 8 },
  attachBtn: { padding: 4 },
  textInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: fontSize.sm, color: '#000' },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
