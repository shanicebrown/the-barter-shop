export const colors = {
  primary: '#00BCD4',
  primaryLight: '#4DD0E1',
  primaryDark: '#0097A7',

  // Light mode (default)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F5F5F5',
  card: '#FFFFFF',

  text: '#000000',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',

  border: '#E0E0E0',
  divider: '#F0F0F0',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  white: '#FFFFFF',
  black: '#000000',

  // Badge colors
  badgeBlue: '#2196F3',
  badgeOrange: '#FF5722',
  badgeGreen: '#4CAF50',
};

// Dark mode overrides
export const darkColors: typeof colors = {
  ...colors,
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#757575',
  border: '#333333',
  divider: '#2C2C2C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  title: 28,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

export const navigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' as const },
    medium: { fontFamily: fonts.medium, fontWeight: '500' as const },
    bold: { fontFamily: fonts.bold, fontWeight: '700' as const },
    heavy: { fontFamily: fonts.black, fontWeight: '900' as const },
  },
};
