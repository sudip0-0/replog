import { View } from 'react-native';
import { Divider, List, SegmentedButtons, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useUIStore } from '@/store/uiStore';
import { AccountSection } from '@/features/auth/AccountSection';
import { SyncSection } from '@/features/sync/SyncSection';

export default function ProfileScreen() {
  const { themeMode, setThemeMode, unit, setUnit } = useUIStore();
  return (
    <ScreenContainer>
      <Text variant="headlineMedium">Profile</Text>
      <AccountSection />
      <SyncSection />
      <Divider />
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as typeof themeMode)}
            buttons={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </View>
        <List.Subheader>Units</List.Subheader>
        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedButtons
            value={unit}
            onValueChange={(v) => setUnit(v as typeof unit)}
            buttons={[
              { value: 'kg', label: 'kg' },
              { value: 'lb', label: 'lb' },
            ]}
          />
        </View>
      </List.Section>
      <List.Item
        title="Body metrics"
        left={(p) => <List.Icon {...p} icon="scale-bathroom" />}
        onPress={() => router.push('/body')}
        accessibilityLabel="Open body metrics"
      />
      <List.Item
        title="Gym profiles"
        left={(p) => <List.Icon {...p} icon="map-marker" />}
        onPress={() => router.push('/gyms')}
        accessibilityLabel="Open gym profiles"
      />
    </ScreenContainer>
  );
}
