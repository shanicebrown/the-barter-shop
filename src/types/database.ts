export type UserType = 'individual' | 'business' | 'verified_pro';
export type BarterType = 'full' | 'partial' | 'cash';
export type BarterStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type Tier = 'seedling' | 'trader' | 'pro' | 'expert' | 'legend';

export type WarningLevel = 'good' | 'warning' | 'flagged' | 'suspended';

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  bio: string | null;
  location: string | null;
  rating: number;
  barter_count: number;
  barter_bucks: number;
  tier: Tier;
  unsigned_barters_count: number;
  incomplete_barters_count: number;
  completion_rate: number;
  reliability_score: number;
  warning_level: WarningLevel;
  flags_count: number;
  vetting_score: number;
  verification_status: ProfileVerificationStatus;
  barter_value_cap: number;
  created_at: string;
};

export type Service = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  barter_type: BarterType;
  value: number;
  looking_for: string | null;
  is_active: boolean;
  created_at: string;
};

export type Barter = {
  id: string;
  requester_id: string;
  provider_id: string;
  requester_service_id: string | null;
  provider_service_id: string | null;
  barter_type: BarterType | null;
  cash_amount: number;
  payment_method: PaymentMethod;
  barter_bucks_amount: number;
  status: BarterStatus;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  barter_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  barter_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Like = {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type NotificationType =
  | 'barter_initiated'
  | 'barter_accepted'
  | 'barter_completed'
  | 'new_message'
  | 'new_match'
  | 'new_review'
  | 'barter_bucks_earned'
  | 'tier_upgrade';

export type AppNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type PaymentMethod = 'full_barter' | 'cash' | 'barter_bucks' | 'combination';

export type PenaltyType = 'unsigned_barter' | 'incomplete_barter' | 'flag' | 'suspension' | 'tier_demotion';

export type VerificationType = 'government_id' | 'selfie_match' | 'phone_number' | 'skill_credential' | 'business_license' | 'business_insurance' | 'business_registration' | 'portfolio' | 'reference';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type ProfileVerificationStatus = 'unverified' | 'pending_review' | 'verified_pro' | 'verified_business' | 'suspended';
export type ApplicationStatus = 'submitted' | 'in_review' | 'approved' | 'rejected' | 'more_info_needed';

export type Verification = {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  document_url: string | null;
  status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export type VettingApplication = {
  id: string;
  user_id: string;
  tier_applying_for: 'verified_pro' | 'business';
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  rejection_reason: string | null;
  resubmit_allowed: boolean;
};

export type PenaltyLog = {
  id: string;
  user_id: string;
  penalty_type: PenaltyType;
  barter_id: string | null;
  bb_deducted: number;
  description: string | null;
  created_at: string;
};

export type AgreementStatus = 'pending_signatures' | 'awaiting_counterparty' | 'fully_executed' | 'cancelled';

export type BarterAgreement = {
  id: string;
  barter_id: string | null;
  agreement_text: string;
  barter_reference: string;
  party_a_id: string | null;
  party_b_id: string | null;
  party_a_name: string | null;
  party_b_name: string | null;
  party_a_offering: string | null;
  party_b_offering: string | null;
  party_a_value: number | null;
  party_b_value: number | null;
  delivery_date: string | null;
  party_a_signed: boolean;
  party_b_signed: boolean;
  party_a_signed_at: string | null;
  party_b_signed_at: string | null;
  party_a_signature: string | null;
  party_b_signature: string | null;
  status: AgreementStatus;
  created_at: string;
};
