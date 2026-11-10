export type AccountType = 'individual' | 'business' | 'verified_pro';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Registration: undefined;
  RegistrationInfo: { accountType: AccountType };
  RegistrationSkills: { accountType: AccountType };
  Subscription: { highlight?: 'verified_pro' | 'business' } | undefined;
  Welcome: { userName: string };
  MainTabs: undefined;
  ProfileCreation: undefined;
  BarterRequest: {
    providerName: string;
    serviceName: string;
    serviceIcon: string;
    serviceCategory: string;
  };
  ProviderDetail: { providerId: string };
  CategoryDetail: { categoryName: string };
  CreateListing: undefined;
  Conversation: { providerId: string; providerName: string; providerIcon: string };
  BarterFlow: {
    providerName: string;
    providerIcon: string;
    providerService: string;
    providerValue: number;
    userService: string;
    userValue: number;
  };
  OfferConfirmation: {
    providerName: string;
    providerIcon: string;
    providerService: string;
    providerValue: number;
    userService: string;
    userValue: number;
    cashAmount: number;
    paymentType: 'service' | 'cash' | 'barter_bucks';
  };
  Payment: { amount: number; providerService: string };
  Rating: { providerName: string; providerIcon: string; providerService: string };
  BarterBucksGuide: undefined;
  Notifications: undefined;
  ForgotPassword: undefined;
  EmailConfirmed: undefined;
  TaxDocuments: undefined;
  TaxStatement: { year: number };
  TaxEducation: undefined;
  Assistant: undefined;
  BarterAgreement: {
    agreementId?: string;
    barterReference: string;
    partyAName: string;
    partyBName: string;
    partyAOffering: string;
    partyBOffering: string;
    partyAValue: number;
    partyBValue: number;
    deliveryDate: string;
    agreementText: string;
    isPartyA: boolean;
    partyASigned: boolean;
    partyBSigned: boolean;
  };
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  CommunityStandards: undefined;
  VerificationFlow: { tier: 'verified_pro' | 'business' };
  VettingScoreDetail: undefined;
  CommunityGuidelines: undefined;
  Settings: undefined;
  BarterChat: {
    providerName: string;
    providerIcon: string;
    providerId: string;
    barterReference: string;
    yourService: string;
    yourValue: number;
    theirService: string;
    theirValue: number;
    deliveryDate: string;
  };
  ProposalReview: {
    requesterName: string;
    requesterIcon: string;
    requesterService: string;
    requesterValue: number;
    providerService: string;
    providerValue: number;
    barterType: string;
    cashAmount: number;
    deliveryDate: string;
    note: string;
  };
  Chat: { conversationId: string; recipientName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Barter: undefined;
  Messages: undefined;
  Profile: undefined;
};
