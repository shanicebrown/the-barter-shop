import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ActionSheetIOS, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { colors, spacing, fontSize, borderRadius, fonts } from '../theme';

type UploadType = {
  type: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

type Props = {
  uploads: UploadType[];
  userId?: string;
  onUploaded?: (type: string) => void;
};

export default function VerificationUpload({ uploads, userId, onUploaded }: Props) {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  async function handleUpload(type: string) {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Choose Document', 'Take Photo'], cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) pickDocument(type); else if (idx === 2) takePhoto(type); },
      );
    } else {
      Alert.alert('Upload', 'Choose an option', [
        { text: 'Choose Document', onPress: () => pickDocument(type) },
        { text: 'Take Photo', onPress: () => takePhoto(type) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  async function pickDocument(type: string) {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) { Alert.alert('File too large', 'Please upload a file under 10MB.'); return; }
      await doUpload(type, file.uri, file.mimeType || 'application/octet-stream');
    } catch { Alert.alert('Error', 'Could not pick document.'); }
  }

  async function takePhoto(type: string) {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access is required.'); return; }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
      if (result.canceled) return;
      await doUpload(type, result.assets[0].uri, 'image/jpeg');
    } catch { Alert.alert('Error', 'Could not take photo.'); }
  }

  async function doUpload(type: string, uri: string, mimeType: string) {
    setUploading(type);
    try {
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Failed to read file');
      const blob = await response.blob();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const uid = userId || user?.id || 'anon';

      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `${uid}/${type}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from('verifications').upload(fileName, blob, { contentType: mimeType || 'application/octet-stream', upsert: true });
      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(error.message);
      }

      // Save verification record
      if (uid !== 'anon') {
        const { error: dbError } = await supabase.from('verifications').upsert({
          user_id: uid,
          verification_type: type,
          document_url: fileName,
          status: 'pending',
        }, { onConflict: 'user_id,verification_type' });
        if (dbError) {
          console.error('DB error:', dbError);
          // Don't throw — upload succeeded, DB record is secondary
        }
      }

      setUploadedDocs((prev) => ({ ...prev, [type]: true }));
      onUploaded?.(type);
      Alert.alert('Uploaded', 'Your document has been uploaded and is pending review.');
    } catch (e: any) {
      console.error('Full upload error:', e);
      Alert.alert('Upload Failed', e?.message || 'Please check your connection and try again.');
    } finally {
      setUploading(null);
    }
  }

  return (
    <View style={styles.container}>
      {uploads.map((u) => {
        const isUploaded = uploadedDocs[u.type];
        const isUploading = uploading === u.type;
        return (
          <TouchableOpacity key={u.type} style={styles.card} onPress={() => handleUpload(u.type)} disabled={isUploading}>
            <View style={styles.iconBox}>
              {isUploading ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name={u.icon} size={24} color="#FFF" />}
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{u.title}</Text>
              <Text style={styles.subtitle}>{u.subtitle}</Text>
              <View style={[styles.statusPill, isUploaded ? styles.statusUploaded : styles.statusPending]}>
                <Text style={[styles.statusText, isUploaded && { color: '#FFF' }]}>
                  {isUploading ? 'Uploading...' : isUploaded ? '✓ Uploaded' : 'Not uploaded'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 12, padding: 16, gap: 14, alignItems: 'center', minHeight: 100 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '700', color: '#000', fontFamily: fonts.bold },
  subtitle: { fontSize: 12, color: '#999', fontFamily: fonts.regular },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full, marginTop: 4 },
  statusPending: { backgroundColor: '#F5F5F5' },
  statusUploaded: { backgroundColor: colors.primary },
  statusText: { fontSize: 11, fontWeight: '600', color: '#999', fontFamily: fonts.semiBold },
});
