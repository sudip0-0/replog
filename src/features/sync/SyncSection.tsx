import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { useAuth } from '@/features/auth/useAuth';
import { useSyncNow } from './useSync';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export function SyncSection() {
  const { configured, status } = useAuth();
  const sync = useSyncNow();

  if (!configured) return null;

  const statusText =
    status !== 'authenticated'
      ? 'Sign in to sync your data to the cloud.'
      : sync.isPending
        ? 'Syncing...'
        : sync.isSuccess
          ? `Last sync: pushed ${sync.data.pushed}, pulled ${sync.data.pulled}.`
          : 'Local changes will sync on demand.';

  return (
    <View style={styles.wrap}>
      <Text style={ui.label}>Sync</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {statusText}
      </Text>
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

const styles = StyleSheet.create({
  wrap: { gap: 8, padding: 12 },
  muted: { color: replogColors.textMuted },
});
