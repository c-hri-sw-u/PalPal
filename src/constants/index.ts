export const COLORS = {
  // Primary - Soft Coral
  primary: '#FF8A80',
  primaryLight: '#FFBDBD',
  primaryDark: '#C75B5B',

  // Secondary - Mint Green
  secondary: '#B9F6CA',
  secondaryLight: '#EAFFEF',

  // Backgrounds - Pure White/Black
  background: '#FFFFFF',
  backgroundDark: '#000000',
  surface: '#FFFFFF',
  surfaceDark: '#1A1A1A',

  // Text
  text: '#000000',
  textSecondary: '#666666',
  textDark: '#FFFFFF',

  // Accents
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  info: '#2196F3',

  // Glass effect (iOS26 style)
  glass: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassDark: 'rgba(0, 0, 0, 0.25)',
  glassBorderDark: 'rgba(255, 255, 255, 0.1)',
};

export const STORAGE_BUCKETS = {
  USER_AVATARS: 'user-avatars',
  PAL_AVATARS: 'pal-avatars',
  PAL_FULLBODY: 'pal-fullbody',
  POST_IMAGES: 'post-images',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  display: 48,
};
