import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme';

import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import ForgotPasswordScreen from '../screens/Login/ForgotPasswordScreen';
import EmailConfirmedScreen from '../screens/Auth/EmailConfirmedScreen';
import RegistrationScreen from '../screens/Registration/RegistrationScreen';
import RegistrationInfoScreen from '../screens/Registration/RegistrationInfoScreen';
import RegistrationSkillsScreen from '../screens/Registration/RegistrationSkillsScreen';
import SubscriptionScreen from '../screens/Subscription/SubscriptionScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import ProfileCreationScreen from '../screens/ProfileCreation/ProfileCreationScreen';
import BarterRequestScreen from '../screens/BarterRequest/BarterRequestScreen';
import ProviderDetailScreen from '../screens/ProviderDetail/ProviderDetailScreen';
import CategoryDetailScreen from '../screens/CategoryDetail/CategoryDetailScreen';
import ConversationScreen from '../screens/Conversation/ConversationScreen';
import CreateListingScreen from '../screens/CreateListing/CreateListingScreen';
import BarterFlowScreen from '../screens/BarterFlow/BarterFlowScreen';
import OfferConfirmationScreen from '../screens/OfferConfirmation/OfferConfirmationScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import RatingScreen from '../screens/Rating/RatingScreen';
import BarterBucksGuideScreen from '../screens/BarterBucks/BarterBucksGuideScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import AssistantScreen from '../screens/Assistant/AssistantScreen';
import AgreementScreen from '../screens/BarterAgreement/AgreementScreen';
import ProposalReviewScreen from '../screens/ProposalReview/ProposalReviewScreen';
import BarterChatScreen from '../screens/BarterChat/BarterChatScreen';
import CommunityStandardsScreen from '../screens/CommunityStandards/CommunityStandardsScreen';
import CommunityGuidelinesScreen from '../screens/Settings/CommunityGuidelinesScreen';
import VerificationFlowScreen from '../screens/Verification/VerificationFlowScreen';
import VettingScoreDetailScreen from '../screens/Verification/VettingScoreDetailScreen';
import TaxDocumentsScreen from '../screens/Tax/TaxDocumentsScreen';
import TaxStatementScreen from '../screens/Tax/TaxStatementScreen';
import TaxEducationScreen from '../screens/Tax/TaxEducationScreen';
import TermsOfUseScreen from '../screens/Legal/TermsOfUseScreen';
import PrivacyPolicyScreen from '../screens/Legal/PrivacyPolicyScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isAuthenticated: boolean;
  onSkipAuth: () => void;
  /** Skip onboarding slides when a guest chose "Sign up". */
  startAtSignup?: boolean;
};

export default function RootNavigator({ isAuthenticated, onSkipAuth, startAtSignup }: Props) {
  return (
    <Stack.Navigator
      // initialRouteName is only read on mount, so remount when the entry point changes.
      key={isAuthenticated ? 'app' : startAtSignup ? 'signup' : 'onboarding'}
      initialRouteName={isAuthenticated ? 'MainTabs' : startAtSignup ? 'Registration' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} options={{ title: 'Edit Profile', headerBackTitle: 'Back' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BarterRequest" component={BarterRequestScreen} options={{ title: 'Send Barter Request' }} />
          <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="BarterFlow" component={BarterFlowScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OfferConfirmation" component={OfferConfirmationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Rating" component={RatingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BarterBucksGuide" component={BarterBucksGuideScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Assistant" component={AssistantScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BarterAgreement" component={AgreementScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProposalReview" component={ProposalReviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BarterChat" component={BarterChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CommunityStandards" component={CommunityStandardsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VerificationFlow" component={VerificationFlowScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VettingScoreDetail" component={VettingScoreDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TaxDocuments" component={TaxDocumentsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TaxStatement" component={TaxStatementScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TaxEducation" component={TaxEducationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {(props) => <OnboardingScreen {...props} onSkipAuth={onSkipAuth} />}
          </Stack.Screen>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmailConfirmed" component={EmailConfirmedScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RegistrationInfo" component={RegistrationInfoScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RegistrationSkills" component={RegistrationSkillsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CommunityStandards" component={CommunityStandardsScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
