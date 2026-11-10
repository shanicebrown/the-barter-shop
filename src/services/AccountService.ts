import { supabase } from '../config/supabase';

export type MyProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  location_city: string | null;
  location_state: string | null;
  user_type: string | null;
};

async function requireUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  return session.user.id;
}

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, bio, avatar_url, location_city, location_state, user_type')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(patch: Partial<Pick<MyProfile, 'full_name' | 'bio' | 'avatar_url' | 'location_city'>>) {
  const userId = await requireUserId();
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

/** Uploads to avatars/<userId>/ and returns the public URL. */
export async function uploadAvatar(uri: string, mimeType = 'image/jpeg'): Promise<string> {
  const userId = await requireUserId();
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read the selected photo');
  const blob = await response.blob();
  const ext = mimeType.split('/')[1] || 'jpg';
  // Timestamped name so caches pick up a changed photo.
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: mimeType, upsert: true });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

async function removeFolder(bucket: string, userId: string) {
  const { data: files } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
  if (files?.length) {
    await supabase.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
  }
}

/**
 * Permanently deletes the signed-in user's files, profile, and auth account.
 * Requires the `delete_own_account` function from migration-v14.
 */
export async function deleteAccount(): Promise<void> {
  const userId = await requireUserId();
  await removeFolder('avatars', userId);
  await removeFolder('verifications', userId);
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;
  // The server-side session is already gone with the user; only clear the device.
  await supabase.auth.signOut({ scope: 'local' });
}
