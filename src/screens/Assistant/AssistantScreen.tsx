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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Assistant'>;

type Message = {
  id: string;
  text: string;
  fromUser: boolean;
};

const SYSTEM_PROMPT = `You are the Barter Shop Assistant, an AI helper for The Barter Shop app — a service-for-service trading platform. Help users write compelling service descriptions, find good barter matches, understand the platform, negotiate trades, and get the most out of bartering. Always be encouraging, practical, and focused on helping users trade their skills to preserve their cash. Never recommend trading physical items — this platform is strictly service-for-service. Keep responses concise and actionable.`;

const QUICK_PROMPTS = [
  'Help me write my service description',
  'Who should I barter with?',
  'How do I start a barter?',
  "What's my service worth?",
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "Hi! I'm your Barter AI Assistant. I can help you write service descriptions, find great barter matches, understand how the platform works, and more. What can I help you with today?",
  fromUser: false,
};

export default function AssistantScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: text.trim(), fromUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const conversationHistory = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.fromUser ? 'user' as const : 'assistant' as const,
          content: m.text,
        }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'YOUR_ANTHROPIC_API_KEY',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.content?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: aiText, fromUser: false }]);
      } else {
        // Fallback response when API key not configured
        const fallback = getFallbackResponse(text.trim());
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: fallback, fromUser: false }]);
      }
    } catch {
      const fallback = getFallbackResponse(text.trim());
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: fallback, fromUser: false }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
          </View>
          <Text style={styles.headerTitle}>Barter AI</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickPrompts}>
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.quickPromptPill}
              onPress={() => sendMessage(prompt)}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={item.fromUser ? styles.rowUser : styles.rowAi}>
            {!item.fromUser && (
              <View style={styles.aiAvatarSmall}>
                <Ionicons name="sparkles" size={12} color="#FFF" />
              </View>
            )}
            <View style={[styles.bubble, item.fromUser ? styles.bubbleUser : styles.bubbleAi]}>
              <Text style={[styles.bubbleText, item.fromUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Loading */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.aiAvatarSmall}>
            <Ionicons name="sparkles" size={12} color="#FFF" />
          </View>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { paddingBottom: insets.bottom || 12 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything about bartering..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && { opacity: 0.4 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Fallback responses when API key is not configured
function getFallbackResponse(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes('description') || lower.includes('write')) {
    return "Great question! Here's a template for a compelling service description:\n\n1. Start with what you do in one clear sentence\n2. Mention your experience and qualifications\n3. List 3-4 specific services you offer\n4. End with what makes you unique\n\nExample: \"I'm a certified personal trainer with 5 years of experience. I offer customized 1-on-1 sessions, nutrition plans, and group fitness classes. My focus is on sustainable results — no crash diets or extreme routines.\"\n\nWant me to help tailor this for your specific service?";
  }
  if (lower.includes('match') || lower.includes('who') || lower.includes('barter with')) {
    return "To find great barter matches:\n\n1. Make sure your profile lists what you offer AND what you're looking for\n2. Use the Match tab to swipe through providers near you\n3. Look for providers whose \"looking for\" matches your skill\n4. Check their rating and completed barters for trust\n\nThe best matches happen when both sides see clear value. A photographer who needs fitness training matching with a personal trainer who needs headshots — that's a perfect trade!";
  }
  if (lower.includes('start') || lower.includes('how do')) {
    return "Here's how to start your first barter:\n\n1. Complete your profile with a great description\n2. List at least one service you can offer\n3. Browse the Match tab or Home Feed\n4. When you find someone interesting, tap \"Request Barter\"\n5. Choose Full Barter (skill for skill) or Partial (skill + cash)\n6. Write a personalized message explaining the trade\n7. Wait for them to accept!\n\nTip: The more specific your offer, the better your response rate.";
  }
  if (lower.includes('worth') || lower.includes('value') || lower.includes('price')) {
    return "Determining your service value:\n\n1. Research what similar services charge in your area\n2. Factor in your experience level and certifications\n3. Consider the time involved per session\n4. Start competitive — you can adjust as you build reviews\n\nGeneral ranges:\n• Photography session: $150-500\n• Personal training: $50-150/session\n• Graphic design project: $200-1000\n• Tutoring: $30-80/hour\n• Home repair: $50-200/job\n\nRemember: in bartering, both sides should feel they're getting equal value!";
  }
  return "That's a great question! Here are some tips:\n\n• Keep your profile updated with your best skills\n• Be responsive to messages — quick replies lead to more trades\n• Leave reviews after every barter to build trust\n• Start with Full Barter trades to earn Barter Bucks\n• Check the Match tab daily for new providers\n\nIs there something specific about bartering I can help you with?";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: '#1A1A1A' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: '#FFF', fontFamily: fonts.bold },

  quickPrompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: spacing.md },
  quickPromptPill: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: 14, paddingVertical: 8 },
  quickPromptText: { color: colors.primary, fontSize: fontSize.xs, fontFamily: fonts.semiBold },

  messagesList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.md },
  rowUser: { alignItems: 'flex-end', gap: 4 },
  rowAi: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  aiAvatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: '#2A2A2A', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: fontSize.sm, lineHeight: 22 },
  bubbleTextUser: { color: '#FFF', fontFamily: fonts.regular },
  bubbleTextAi: { color: '#EEE', fontFamily: fonts.regular },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2A2A2A', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  typingText: { color: '#888', fontSize: fontSize.xs, fontFamily: fonts.regular },

  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: spacing.sm, paddingTop: 10, gap: 8 },
  textInput: { flex: 1, backgroundColor: '#2A2A2A', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: fontSize.sm, color: '#FFF', fontFamily: fonts.regular },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
