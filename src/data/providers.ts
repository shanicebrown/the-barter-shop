import { Ionicons } from '@expo/vector-icons';
import { getProviderPhoto, getProviderAvatar } from '../constants/images';

export type UserType = 'Individual' | 'Business' | 'Student';

export type Provider = {
  id: string;
  icon: string;
  name: string;
  skill: string;
  zip: string;
  city: string;
  state: string;
  distance: string;
  rating: number;
  userType: UserType;
  offer: string;
  lookingFor: string;
  photo: string;
  avatar: string;
};

export const PROVIDERS: Provider[] = [
  {
    id: '0', icon: '💇', name: 'Lillian Chen', skill: 'Barber and Hair Stylist',
    zip: '80202', city: 'Denver', state: 'CO', distance: '1.4 mi', rating: 4.5, userType: 'Individual',
    offer: 'I specialize in precision cuts, fades, and modern styling for all hair types. With 6 years of barbershop experience, I provide a relaxed, professional experience every time.',
    lookingFor: 'Looking for graphic design help for my personal brand, photography for portfolio shots, or fitness training.',
    photo: getProviderPhoto('0'), avatar: getProviderAvatar('0'),
  },
  {
    id: '1', icon: '💪', name: 'Marcus T.', skill: 'Personal Trainer',
    zip: '80203', city: 'Denver', state: 'CO', distance: '2.1 mi', rating: 4.9, userType: 'Individual',
    offer: 'I offer personalized 1-on-1 fitness training sessions tailored to your goals. Whether you want to lose weight, build muscle, or improve endurance, I create custom workout plans and provide ongoing nutrition guidance. I have 5 years of experience and multiple certifications.',
    lookingFor: "I'm looking for photography services for a personal branding shoot, graphic design for my fitness brand, or web development help. Open to discussing other creative services too.",
    photo: getProviderPhoto('1'), avatar: getProviderAvatar('1'),
  },
  {
    id: '2', icon: '💇', name: 'Aaliyah R.', skill: 'Hair Stylist',
    zip: '80211', city: 'Denver', state: 'CO', distance: '0.8 mi', rating: 4.8, userType: 'Business',
    offer: "I specialize in natural hair care including braids, locs, twists, and protective styles. With over 8 years of experience I can transform your hair while keeping it healthy. I also offer consultations for hair care routines.",
    lookingFor: "Looking for fitness training, meal prep services, or tutoring for my daughter. Also open to photography for my salon's social media.",
    photo: getProviderPhoto('2'), avatar: getProviderAvatar('2'),
  },
  {
    id: '3', icon: '📸', name: 'Jordan K.', skill: 'Photographer',
    zip: '80218', city: 'Denver', state: 'CO', distance: '3.1 mi', rating: 4.7, userType: 'Individual',
    offer: 'Professional portrait, event, and brand photography. I bring a full mobile studio setup to your location. Editing and delivery within 48 hours. Perfect for social media content, headshots, and special occasions.',
    lookingFor: 'Seeking legal consultation, accounting services, or web development. Also interested in personal training or cooking lessons.',
    photo: getProviderPhoto('3'), avatar: getProviderAvatar('3'),
  },
  {
    id: '4', icon: '🎨', name: 'Sofia M.', skill: 'Graphic Designer',
    zip: '80205', city: 'Denver', state: 'CO', distance: '2.3 mi', rating: 5.0, userType: 'Student',
    offer: 'Full brand identity design including logos, color palettes, typography, business cards, social media templates, and pitch decks. Clean, modern, and built for your specific audience.',
    lookingFor: 'Looking for photography, video editing, or music production. Also open to fitness training or massage therapy.',
    photo: getProviderPhoto('4'), avatar: getProviderAvatar('4'),
  },
  {
    id: '5', icon: '🔧', name: 'David L.', skill: 'Home Repair',
    zip: '80209', city: 'Denver', state: 'CO', distance: '4.7 mi', rating: 4.6, userType: 'Business',
    offer: 'Licensed and insured home repair professional. I handle plumbing, electrical, drywall, painting, and general repairs. 15 years experience. Free estimates. I take pride in doing it right the first time.',
    lookingFor: 'Looking for accounting or tax services, graphic design for my business, or photography. Also interested in meal prep services.',
    photo: getProviderPhoto('5'), avatar: getProviderAvatar('5'),
  },
  {
    id: '6', icon: '📚', name: 'Priya S.', skill: 'Tutor',
    zip: '80210', city: 'Denver', state: 'CO', distance: '1.9 mi', rating: 4.9, userType: 'Student',
    offer: 'Experienced tutor specializing in math, science, and SAT/ACT prep for middle and high school students. I break down complex concepts into simple steps. Online or in-person sessions available.',
    lookingFor: 'Looking for fitness training, yoga or wellness sessions, photography for headshots, or home repair services.',
    photo: getProviderPhoto('6'), avatar: getProviderAvatar('6'),
  },
  {
    id: '7', icon: '👨‍🍳', name: 'Carlos V.', skill: 'Personal Chef',
    zip: '80212', city: 'Denver', state: 'CO', distance: '2.8 mi', rating: 4.8, userType: 'Business',
    offer: 'Personal chef specializing in farm-to-table meal prep, intimate dinner parties, and cooking lessons. I source local ingredients and customize menus for dietary needs. Available weekdays and weekends.',
    lookingFor: 'Seeking photography or videography for my culinary brand, graphic design, or social media management. Also open to fitness training.',
    photo: getProviderPhoto('7'), avatar: getProviderAvatar('7'),
  },
  {
    id: '8', icon: '💆', name: 'Zoe W.', skill: 'Massage Therapist',
    zip: '80246', city: 'Denver', state: 'CO', distance: '4.1 mi', rating: 4.7, userType: 'Individual',
    offer: 'Licensed massage therapist offering deep tissue, Swedish, and sports massage. I am fully mobile and come to your home or office. Perfect for stress relief, injury recovery, and athletic performance.',
    lookingFor: 'Looking for meal prep, yoga instruction, photography, or graphic design services.',
    photo: getProviderPhoto('8'), avatar: getProviderAvatar('8'),
  },
];

export const BADGE_COLORS: Record<UserType, string> = {
  Individual: '#2196F3',
  Business: '#FF5722',
  Student: '#4CAF50',
};

export const BADGE_ICONS: Record<UserType, keyof typeof Ionicons.glyphMap> = {
  Individual: 'person',
  Business: 'business',
  Student: 'school',
};

// Providers who have already liked the current user (for demo)
export const PRE_SEEDED_LIKES = new Set(['2', '7']); // Aaliyah R. and Carlos V.
