import { VerificationType, VerificationStatus } from '../types/database';

export type VettingBreakdown = {
  label: string;
  points: number;
  maxPoints: number;
  status: 'earned' | 'pending' | 'missing';
};

export type VettingResult = {
  score: number;
  breakdown: VettingBreakdown[];
  color: string;
  label: string;
};

type VerificationMap = Partial<Record<VerificationType, VerificationStatus>>;

export function calculateVettingScore(params: {
  verifications: VerificationMap;
  completionRate: number;
  rating: number;
  barterCount: number;
  flagsCount: number;
  unsignedCount: number;
  isBusiness: boolean;
}): VettingResult {
  const { verifications, completionRate, rating, barterCount, flagsCount, unsignedCount, isBusiness } = params;
  const breakdown: VettingBreakdown[] = [];

  function addItem(label: string, maxPts: number, earned: boolean, pending: boolean = false) {
    breakdown.push({
      label,
      points: earned ? maxPts : 0,
      maxPoints: maxPts,
      status: earned ? 'earned' : pending ? 'pending' : 'missing',
    });
  }

  // Document checks
  const govIdOk = verifications.government_id === 'approved';
  addItem('Government ID verified', 25, govIdOk, verifications.government_id === 'pending');

  const selfieOk = verifications.selfie_match === 'approved';
  addItem('Selfie/liveness verified', 10, selfieOk, verifications.selfie_match === 'pending');

  const phoneOk = verifications.phone_number === 'approved';
  addItem('Phone number verified', 10, phoneOk, verifications.phone_number === 'pending');

  const credOk = verifications.skill_credential === 'approved';
  addItem('Skill credential uploaded', 15, credOk, verifications.skill_credential === 'pending');

  if (isBusiness) {
    const licenseOk = verifications.business_license === 'approved';
    addItem('Business license', 10, licenseOk, verifications.business_license === 'pending');

    const insuranceOk = verifications.business_insurance === 'approved';
    addItem('Insurance verified', 10, insuranceOk, verifications.business_insurance === 'pending');
  }

  // Completion rate
  let completionPts = 0;
  if (completionRate >= 100) completionPts = 15;
  else if (completionRate >= 90) completionPts = 12;
  else if (completionRate >= 80) completionPts = 9;
  breakdown.push({ label: `Completion rate (${Math.round(completionRate)}%)`, points: completionPts, maxPoints: 15, status: completionPts > 0 ? 'earned' : 'missing' });

  // Rating
  let ratingPts = 0;
  if (rating >= 5.0) ratingPts = 10;
  else if (rating >= 4.5) ratingPts = 7;
  else if (rating >= 4.0) ratingPts = 5;
  breakdown.push({ label: `Rating (${rating})`, points: ratingPts, maxPoints: 10, status: ratingPts > 0 ? 'earned' : 'missing' });

  // Barter count
  const barterPts = barterCount >= 10 ? 5 : 0;
  breakdown.push({ label: `10+ completed barters (${barterCount})`, points: barterPts, maxPoints: 5, status: barterPts > 0 ? 'earned' : 'missing' });

  // Portfolio
  const portfolioOk = verifications.portfolio === 'approved';
  addItem('Portfolio uploaded', 5, portfolioOk, verifications.portfolio === 'pending');

  // Penalties
  const flagPenalty = flagsCount * -10;
  if (flagPenalty < 0) {
    breakdown.push({ label: `Fraud flags (${flagsCount})`, points: flagPenalty, maxPoints: 0, status: 'missing' });
  }

  const unsignedPenalty = Math.max(0, unsignedCount - 2) * -5;
  if (unsignedPenalty < 0) {
    breakdown.push({ label: `Unsigned agreements (${unsignedCount})`, points: unsignedPenalty, maxPoints: 0, status: 'missing' });
  }

  const totalScore = Math.max(0, Math.min(100, breakdown.reduce((sum, b) => sum + b.points, 0)));

  let color = '#999';
  let label = 'Unverified';
  if (totalScore >= 81) { color = '#00BCD4'; label = 'Highly Trusted'; }
  else if (totalScore >= 61) { color = '#2196F3'; label = 'Trusted'; }
  else if (totalScore >= 41) { color = '#FF9800'; label = 'Building Trust'; }

  return { score: totalScore, breakdown, color, label };
}

export function getValueCap(userType: string, verificationStatus: string): number {
  if (userType === 'business' && verificationStatus === 'verified_business') return Infinity;
  if (verificationStatus === 'verified_pro') return 2500;
  return 500;
}

export function getVerificationBadge(verificationStatus: string): { emoji: string; label: string; color: string } | null {
  switch (verificationStatus) {
    case 'verified_pro': return { emoji: '✅', label: 'Verified Pro', color: '#00BCD4' };
    case 'verified_business': return { emoji: '🏢', label: 'Verified Business', color: '#FFD700' };
    case 'pending_review': return { emoji: '⏳', label: 'Verification Pending', color: '#999' };
    default: return null;
  }
}
