import { StyleSheet, View } from 'react-native';
import { List, SegmentedButtons, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useUIStore } from '@/store/uiStore';
import { AccountSection } from '@/features/auth/AccountSection';
import { SyncSection } from '@/features/sync/SyncSection';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export default function ProfileScreen() {
  const { themeMode, setThemeMode, unit, setUnit } = useUIStore();
  return (
    <ScreenContainer>
      <Text variant="headlineMedium" style={styles.title}>
        Profile
      </Text>
      <View style={ui.card}>
        <AccountSection />
      </View>
      <View style={ui.card}>
        <SyncSection />
      </View>
      <View style={[ui.card, styles.section]}>
        <Text style={ui.label}>Appearance</Text>
        <SegmentedButtons
          value={themeMode}
          onValueChange={(v) => setThemeMode(v as typeof themeMode)}
          buttons={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
        <Text style={ui.label}>Units</Text>
        <SegmentedButtons
          value={unit}
          onValueChange={(v) => setUnit(v as typeof unit)}
          buttons={[
            { value: 'kg', label: 'kg' },
            { value: 'lb', label: 'lb' },
          ]}
        />
      </View>
      <List.Item
        title="Body metrics"
        left={(p) => <List.Icon {...p} icon="scale-bathroom" color={replogColors.primary} />}
        onPress={() => router.push('/body')}
        accessibilityLabel="Open body metrics"
        style={styles.listRow}
        titleStyle={styles.listTitle}
      />
      <List.Item
        title="Gym profiles"
        left={(p) => <List.Icon {...p} icon="map-marker" color={replogColors.primary} />}
        onPress={() => router.push('/gyms')}
        accessibilityLabel="Open gym profiles"
        style={styles.listRow}
        titleStyle={styles.listTitle}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: replogColors.text, fontWeight: '700' },
  section: { gap: 10, padding: 12 },
  listRow: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  listTitle: { color: replogColors.text, fontWeight: '700' },
});
