import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SKILLS_LIST } from '../data/skills';
import { colors, spacing, fontSize, borderRadius, fonts } from '../theme';

type Props = {
  selectedSkills: string[];
  onSkillAdd: (skill: string) => void;
  onSkillRemove: (skill: string) => void;
  placeholder: string;
  maxSkills?: number;
};

export default function SkillsAutocomplete({ selectedSkills, onSkillAdd, onSkillRemove, placeholder, maxSkills = 10 }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = SKILLS_LIST
      .filter((skill) => skill.toLowerCase().includes(text.toLowerCase()) && !selectedSkills.includes(skill))
      .slice(0, 6);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 || text.length > 2);
  }, [selectedSkills]);

  function handleSelect(skill: string) {
    onSkillAdd(skill);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function handleCustomEntry() {
    if (query.trim() && !selectedSkills.includes(query.trim())) {
      onSkillAdd(query.trim());
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Tags */}
      {selectedSkills.length > 0 && (
        <View style={styles.tags}>
          {selectedSkills.map((skill) => (
            <TouchableOpacity key={skill} style={styles.tag} onPress={() => onSkillRemove(skill)}>
              <Text style={styles.tagText}>{skill}</Text>
              <Ionicons name="close" size={12} color="#FFF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      {selectedSkills.length < maxSkills && (
        <View style={styles.inputRow}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onSubmitEditing={handleCustomEntry}
            returnKeyType="done"
          />
        </View>
      )}

      {/* Suggestions */}
      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestions.map((skill) => (
            <TouchableOpacity key={skill} style={styles.suggestion} onPress={() => handleSelect(skill)}>
              <Text style={styles.suggestionText}>{skill}</Text>
            </TouchableOpacity>
          ))}
          {query.length > 2 && !suggestions.some((s) => s.toLowerCase() === query.toLowerCase()) && (
            <TouchableOpacity style={[styles.suggestion, styles.customSuggestion]} onPress={handleCustomEntry}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={styles.customText}>Add "{query}"</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.hint}>{selectedSkills.length}/{maxSkills} skills selected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  tagText: { color: '#FFF', fontSize: 13, fontFamily: fonts.semiBold },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 14, gap: 8, backgroundColor: '#FFF' },
  input: { flex: 1, paddingVertical: 12, fontSize: fontSize.sm, color: '#000', fontFamily: fonts.regular },
  suggestions: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden', marginTop: 4, zIndex: 999 },
  suggestion: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  suggestionText: { color: '#000', fontSize: fontSize.sm, fontFamily: fonts.regular },
  customSuggestion: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FAFB' },
  customText: { color: colors.primary, fontSize: fontSize.sm, fontFamily: fonts.semiBold },
  hint: { color: '#999', fontSize: 12, fontFamily: fonts.regular, marginTop: 8 },
});
