import { View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { useAuth } from '@/features/auth/useAuth';
import { useSyncNow } from './useSync';

/** Visible sync controls/status. Only meaningful when signed in + configured. */
export function SyncSection() {
  const { configured, status } = useAuth();
  const sync = useSyncNow();

  if (!configured) return null;

  const statusText =
    status !== 'authenticated'
      ? 'Sign in to sync your data to the cloud.'
      : sync.isPending
        ? 'Syncing…'
        : sync.isSuccess
          ? `Last sync: pushed ${sync.data.pushed}, pulled ${sync.data.pulled}.`
          : 'Local changes will sync on demand.';

  return (
    <View style={{ gap: 8 }}>
      <Text variant="titleMedium">Sync</Text>
      <Text variant="bodyMedium">{statusText}</Text>
      {sync.isError ? (
        <HelperText type="error" visible>
          {(sync.error as Error).message}
        </HelperText>
      ) : null}
      <Button
        mode="outlined"
        icon="cloud-sync"
        loading={sync.isPending}
        disabled={status !== 'authenticated' || sync.isPending}
        onPress={() => sync.mutate()}
        accessibilityLabel="Sync now"
      >
        Sync now
      </Button>
    </View>
  );
}
