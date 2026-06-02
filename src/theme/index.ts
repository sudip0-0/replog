import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

export const replogColors = {
  base: '#090A0D',
  background: '#121316',
  surface: '#121419',
  surfaceLow: '#181B22',
  surfaceContainer: '#1f1f23',
  surfaceHigh: '#292a2d',
  surfaceHighest: '#343538',
  outline: '#252A33',
  outlineWarm: '#4e4634',
  outlineStrong: '#9a907b',
  primary: '#F5C542',
  primarySoft: '#FFE5AA',
  onPrimary: '#251A00',
  text: '#E3E2E6',
  textMuted: '#D1C5AE',
  textDim: '#9A907B',
  success: '#A8DAB5',
  successContainer: '#173623',
  error: '#FFB4AB',
  errorContainer: '#4B1112',
  warningContainer: '#3B2D09',
};

const roundness = 2;

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  roundness,
  colors: {
    ...MD3DarkTheme.colors,
    primary: replogColors.primary,
    onPrimary: replogColors.onPrimary,
    primaryContainer: replogColors.primary,
    onPrimaryContainer: replogColors.onPrimary,
    secondary: '#C4C6D0',
    onSecondary: '#191C23',
    secondaryContainer: '#44474F',
    onSecondaryContainer: '#E0E2EC',
    tertiary: '#C5EEFF',
    onTertiary: '#003544',
    tertiaryContainer: '#174252',
    onTertiaryContainer: '#C5EEFF',
    error: replogColors.error,
    onError: '#3B0608',
    errorContainer: replogColors.errorContainer,
    onErrorContainer: '#FFDAD6',
    background: replogColors.base,
    onBackground: replogColors.text,
    surface: replogColors.background,
    onSurface: replogColors.text,
    surfaceVariant: replogColors.surfaceHighest,
    onSurfaceVariant: replogColors.textMuted,
    outline: replogColors.outlineStrong,
    outlineVariant: replogColors.outline,
    inverseSurface: replogColors.text,
    inverseOnSurface: '#303034',
    inversePrimary: '#765A00',
    surfaceDisabled: '#202126',
    onSurfaceDisabled: '#74706A',
    backdrop: 'rgba(0, 0, 0, 0.72)',
    elevation: {
      level0: 'transparent',
      level1: replogColors.surface,
      level2: replogColors.surfaceLow,
      level3: replogColors.surfaceContainer,
      level4: replogColors.surfaceHigh,
      level5: replogColors.surfaceHighest,
    },
  },
};

export const lightTheme: MD3Theme = darkTheme;

export type ThemeMode = 'light' | 'dark' | 'system';
