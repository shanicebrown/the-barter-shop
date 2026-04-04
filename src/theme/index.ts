export const colors = {
  primary: '#00BCD4',
  primaryLight: '#4DD0E1',
  primaryDark: '#0097A7',

  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',
  card: '#1E1E1E',

  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#757575',

  border: '#333333',
  divider: '#2C2C2C',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  white: '#FFFFFF',
  black: '#000000',
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

export const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};
