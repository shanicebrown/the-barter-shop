export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Registration: undefined;
  MainTabs: undefined;
  ProfileCreation: undefined;
  BarterInitiation: { itemId?: string };
  Chat: { conversationId: string; recipientName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Barter: undefined;
  Messages: undefined;
  Profile: undefined;
};
