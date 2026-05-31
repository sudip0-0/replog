import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  scroll?: boolean;
}

/** Themed page wrapper that respects safe-area insets. */
export function ScreenContainer({ children, scroll = true }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const style = [
    styles.content,
    { backgroundColor: theme.colors.background, paddingBottom: insets.bottom + 16 },
  ];
  if (scroll) {
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={style}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.flex, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12 },
});
