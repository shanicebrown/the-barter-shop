import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import SkillsAutocomplete from '../../components/SkillsAutocomplete';
import { savePendingProfile } from '../../services/PendingProfile';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationSkills'>;

export default function RegistrationSkillsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [offeredSkills, setOfferedSkills] = useState<string[]>([]);
  const [wantedSkills, setWantedSkills] = useState<string[]>([]);

  const canFinish = offeredSkills.length >= 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressDot, s === 3 && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>What skills do you offer?</Text>
        <Text style={styles.subtitle}>Start typing to search from hundreds of skills or add your own</Text>

        <SkillsAutocomplete
          selectedSkills={offeredSkills}
          onSkillAdd={(skill) => setOfferedSkills((prev) => [...prev, skill])}
          onSkillRemove={(skill) => setOfferedSkills((prev) => prev.filter((s) => s !== skill))}
          placeholder="Search skills (e.g. Photography, Accounting...)"
          maxSkills={10}
        />

        <Text style={[styles.title, { marginTop: 32 }]}>What do you need?</Text>
        <Text style={styles.subtitle}>What services are you hoping to receive in exchange?</Text>

        <SkillsAutocomplete
          selectedSkills={wantedSkills}
          onSkillAdd={(skill) => setWantedSkills((prev) => [...prev, skill])}
          onSkillRemove={(skill) => setWantedSkills((prev) => prev.filter((s) => s !== skill))}
          placeholder="Search what you need (e.g. Legal advice, Yoga...)"
          maxSkills={10}
        />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.finishBtn, !canFinish && { opacity: 0.4 }]}
          onPress={async () => {
            await savePendingProfile({ skills_offered: offeredSkills, skills_wanted: wantedSkills });
            navigation.navigate('Subscription');
          }}
          disabled={!canFinish}
        >
          <Text style={styles.finishBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  progressDotActive: { backgroundColor: colors.primary, width: 24 },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 4, fontFamily: fonts.extraBold },
  subtitle: { fontSize: fontSize.sm, color: '#999', marginBottom: 16, fontFamily: fonts.regular },
  bottomBar: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  finishBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  finishBtnText: { color: '#FFF', fontSize: fontSize.md, fontWeight: '700', fontFamily: fonts.bold },
});
