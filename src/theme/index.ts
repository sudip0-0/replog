import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// RepLog brand seed applied over Paper's MD3 baselines. Kept minimal and
// high-contrast for mid-workout legibility.
const brand = { primary: '#3D5AFE', secondary: '#00BFA5' };

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...brand },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: '#8C9EFF', secondary: '#64FFDA' },
};

export type ThemeMode = 'light' | 'dark' | 'system';
