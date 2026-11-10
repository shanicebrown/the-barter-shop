import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, spacing, fontSize, borderRadius, fonts } from '../../theme';
import { GuaranteePills } from '../../components/GuaranteeModal';

const { width, height } = Dimensions.get('window');

const SLIDE_IMAGES: ImageSourcePropType[] = [
  require('../../../assets/Onboarding1.png'),
  require('../../../assets/Onboarding2.png'),
  require('../../../assets/Onboarding3.png'),
];

type SlideData = {
  key: string;
  title: string;
  body: React.ReactNode;
  image: ImageSourcePropType;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'> & {
  onSkipAuth: () => void;
};

export default function OnboardingScreen({ navigation, onSkipAuth }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides: SlideData[] = [
    {
      key: 'welcome',
      title: 'Trade Your Skills.\nPreserve Your Cash.',
      image: SLIDE_IMAGES[0],
      body: (
        <Text style={styles.bodyText}>
          The world's oldest form of commerce, reimagined for your community.
        </Text>
      ),
    },
    {
      key: 'how-it-works',
      title: 'How It Works',
      image: SLIDE_IMAGES[1],
      body: (
        <Text style={styles.bodyText}>
          List a skill you have. Find a skill you need. Trade directly with people in your community.{'\n\n'}No middleman. No fees. Just value for value.
        </Text>
      ),
    },
    {
      key: 'join',
      title: 'Join Your Local\nBarter Economy',
      image: SLIDE_IMAGES[2],
      body: (
        <View style={{ alignItems: 'center', gap: 20 }}>
          <Text style={styles.bodyText}>
            Connect with vetted professionals and everyday people who believe your skills are your currency.
          </Text>
          <GuaranteePills />
        </View>
      ),
    },
  ];

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  function goToSlide(index: number) {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ImageBackground
            source={item.image}
            style={styles.slide}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              {item.body}
            </View>
          </ImageBackground>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Registration')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={onSkipAuth}>
              <Text style={styles.skipButtonText}>Explore the app</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => goToSlide(activeIndex + 1)}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => goToSlide(slides.length - 1)}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.65)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: fonts.extraBold,
  },
  bodyText: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: fonts.regular,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    fontFamily: fonts.bold,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
  },
});
