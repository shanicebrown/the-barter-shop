import { supabase } from '../config/supabase';
import { WarningLevel, UserType } from '../types/database';

// ── Signing Window by Tier ─────────────────────────────────
export function getSigningWindowHours(userType: UserType): number {
  switch (userType) {
    case 'business': return 72;
    case 'verified_pro': return 48;
    default: return 24;
  }
}

export function getSigningDeadline(userType: UserType): Date {
  const hours = getSigningWindowHours(userType);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// ── Timer Display ──────────────────────────────────────────
export function formatCountdown(deadline: Date): { text: string; color: string } {
  const remaining = deadline.getTime() - Date.now();
  if (remaining <= 0) return { text: 'Agreement Expired', color: '#999' };

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const text = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} remaining`;

  let color = '#4CAF50'; // green >24h
  if (hours < 12) color = '#F44336'; // red <12h
  else if (hours < 24) color = '#FF9800'; // yellow 12-24h

  return { text, color };
}

// ── Reliability Badges ─────────────────────────────────────
export type ReliabilityBadge = {
  emoji: string;
  label: string;
  color: string;
};

export function getReliabilityBadge(
  completionRate: number,
  barterCount: number,
  warningLevel: WarningLevel,
): ReliabilityBadge | null {
  if (warningLevel === 'flagged' || warningLevel === 'suspended') {
    return { emoji: '🚩', label: 'Flagged Account', color: '#F44336' };
  }
  if (completionRate < 70) {
    return { emoji: '⚠️', label: 'Low Completion Rate', color: '#FF9800' };
  }
  if (completionRate >= 98 && barterCount >= 50) {
    return { emoji: '💎', label: 'Elite Barterer', color: '#00BCD4' };
  }
  if (completionRate >= 95 && barterCount >= 25) {
    return { emoji: '🏆', label: 'Trusted Pro', color: '#FFD700' };
  }
  if (completionRate === 100 && barterCount >= 5) {
    return { emoji: '🌟', label: 'Reliable Barterer', color: '#4CAF50' };
  }
  return null;
}

// ── Penalty Application ────────────────────────────────────
export async function applyUnsignedPenalty(
  userId: string,
  barterId: string,
  currentUnsignedCount: number,
  currentBB: number,
): Promise<{ bbDeducted: number; newWarningLevel: WarningLevel; message: string }> {
  let bbDeducted = 0;
  let newWarningLevel: WarningLevel = 'good';
  let message = '';

  const offenseCount = currentUnsignedCount + 1;

  if (offenseCount === 1) {
    bbDeducted = 1;
    newWarningLevel = 'good';
    message = `⚠️ Your barter expired unsigned. You lost 1 Barter Buck. Repeated non-signing may affect your rating.`;
  } else if (offenseCount === 2) {
    bbDeducted = 3;
    newWarningLevel = 'warning';
    message = `⚠️ Warning: You have unsigned 2 barters this month. You lost 3 Barter Bucks. Your profile now shows a warning badge.`;
  } else {
    bbDeducted = 5;
    newWarningLevel = 'flagged';
    message = `🚩 Your account has been flagged for repeated non-completion. You lost 5 Barter Bucks and your profile is now flagged. Contact info@thebartershop.app`;
  }

  const newBB = Math.max(0, currentBB - bbDeducted);

  try {
    // Update profile
    await supabase.from('profiles').update({
      unsigned_barters_count: offenseCount,
      barter_bucks: newBB,
      warning_level: newWarningLevel,
      flags_count: newWarningLevel === 'flagged' ? offenseCount : undefined,
    }).eq('id', userId);

    // Log penalty
    await supabase.from('penalty_log').insert({
      user_id: userId,
      penalty_type: newWarningLevel === 'flagged' ? 'flag' : 'unsigned_barter',
      barter_id: barterId,
      bb_deducted: bbDeducted,
      description: message,
    });

    // Send notification
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Barter Penalty',
      message,
      type: 'barter_completed',
    });
  } catch (e) {
    console.log('Penalty application error:', e);
  }

  return { bbDeducted, newWarningLevel, message };
}

export async function applyIncompletePenalty(
  userId: string,
  barterId: string,
  currentBB: number,
  totalAccepted: number,
  totalCompleted: number,
): Promise<{ newCompletionRate: number; message: string }> {
  const bbDeducted = 10;
  const newBB = Math.max(0, currentBB - bbDeducted);
  const newRate = totalAccepted > 0 ? Math.round((totalCompleted / totalAccepted) * 100) : 100;

  let warningLevel: WarningLevel = 'good';
  if (newRate < 50) warningLevel = 'flagged';
  else if (newRate < 70) warningLevel = 'warning';

  const message = `Your barter was marked incomplete. You lost 10 Barter Bucks. Completion rate: ${newRate}%.`;

  try {
    await supabase.from('profiles').update({
      incomplete_barters_count: totalAccepted - totalCompleted,
      barter_bucks: newBB,
      completion_rate: newRate,
      warning_level: warningLevel,
    }).eq('id', userId);

    await supabase.from('penalty_log').insert({
      user_id: userId,
      penalty_type: 'incomplete_barter',
      barter_id: barterId,
      bb_deducted: bbDeducted,
      description: message,
    });
  } catch (e) {
    console.log('Incomplete penalty error:', e);
  }

  return { newCompletionRate: newRate, message };
}

// ── Pre-Barter Profile Check ───────────────────────────────
export type ProfileCheck = {
  canBarter: boolean;
  showWarning: boolean;
  warningMessage: string | null;
  completionRate: number;
  flagsCount: number;
};

export function checkProfileForBarter(
  warningLevel: WarningLevel,
  completionRate: number,
  flagsCount: number,
): ProfileCheck {
  if (warningLevel === 'suspended') {
    return {
      canBarter: false,
      showWarning: false,
      warningMessage: "This user's account is currently under review and cannot accept barter proposals.",
      completionRate,
      flagsCount,
    };
  }

  if (warningLevel === 'flagged') {
    return {
      canBarter: true,
      showWarning: true,
      warningMessage: `⚠️ Heads up — This user has a history of incomplete barters.\nCompletion rate: ${completionRate}%\nFlagged barters: ${flagsCount}\n\nDo you still want to send a barter proposal?`,
      completionRate,
      flagsCount,
    };
  }

  return {
    canBarter: true,
    showWarning: false,
    warningMessage: null,
    completionRate,
    flagsCount,
  };
}

// ── Admin Alert (email via Supabase Edge Function or logging) ──
export async function sendAdminAlert(
  type: string,
  userId: string,
  username: string,
  details: string,
): Promise<void> {
  console.log(`[ADMIN ALERT] ${type} — User: ${username} (${userId}) — ${details}`);
  // In production: call Supabase Edge Function to send email to info@thebartershop.app
  // Subject: "⚠️ Barter Shop Alert — [type]"
  // Body: User ID, username, offense details, history, recommended action
}
