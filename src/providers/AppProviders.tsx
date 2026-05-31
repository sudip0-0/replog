import { useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { darkTheme, lightTheme } from '@/theme';
import { useUIStore } from '@/store/uiStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const themeMode = useUIStore((s) => s.themeMode);
  const system = useColorScheme();
  const isDark = themeMode === 'system' ? system === 'dark' : themeMode === 'dark';

  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: paperTheme.colors.primary,
        background: paperTheme.colors.background,
        card: paperTheme.colors.elevation.level2,
        text: paperTheme.colors.onSurface,
        border: paperTheme.colors.outlineVariant,
      },
    };
  }, [isDark, paperTheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navTheme}>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              {children}
            </ThemeProvider>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
