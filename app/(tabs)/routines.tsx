import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { router } from 'expo-router';
import {
  useRoutines,
  useInstallTemplates,
  useCreateRoutine,
  useDuplicateRoutine,
  useDeleteRoutine,
} from '@/features/routines/useRoutines';
import { useStartFlow } from '@/features/workouts/useStartFlow';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export default function RoutinesScreen() {
  const { data: routines, isLoading } = useRoutines();
  const install = useInstallTemplates();
  const create = useCreateRoutine();
  const duplicate = useDuplicateRoutine();
  const remove = useDeleteRoutine();
  const { start } = useStartFlow();
  const [dialog, setDialog] = useState(false);
  const [name, setName] = useState('');

  const onStart = (id: string) => void start({ kind: 'routine', routineId: id });

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Text variant="headlineMedium" style={styles.title}>
        Routines
      </Text>

      {routines && routines.length === 0 ? (
        <Card mode="contained" style={ui.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={ui.label}>Templates</Text>
            <Text variant="titleMedium" style={styles.cardTitle}>
              No routines yet
            </Text>
            <Text variant="bodyMedium" style={styles.muted}>
              Install starter splits or create your own.
            </Text>
            <Button
              mode="contained"
              loading={install.isPending}
              onPress={() => install.mutate()}
              accessibilityLabel="Install starter templates"
            >
              Install starter templates
            </Button>
          </Card.Content>
        </Card>
      ) : (
        routines?.map((r) => (
          <Card key={r.id} mode="contained" style={ui.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.rowHeader}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {r.name}
                </Text>
                <View style={styles.iconRow}>
                  <IconButton
                    icon="content-copy"
                    onPress={() => duplicate.mutate(r.id)}
                    accessibilityLabel={`Duplicate ${r.name}`}
                  />
                  <IconButton
                    icon="delete-outline"
                    onPress={() => remove.mutate(r.id)}
                    accessibilityLabel={`Delete ${r.name}`}
                  />
                </View>
              </View>
              <View style={styles.actions}>
                <Button onPress={() => router.push({ pathname: '/routine/[id]', params: { id: r.id } })} accessibilityLabel={`Edit ${r.name}`}>
                  Edit
                </Button>
                <Button mode="contained" onPress={() => onStart(r.id)} accessibilityLabel={`Start ${r.name}`}>
                  Start
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      <Button mode="outlined" icon="plus" onPress={() => setDialog(true)} accessibilityLabel="Create routine">
        Create routine
      </Button>

      <Portal>
        <Dialog visible={dialog} onDismiss={() => setDialog(false)} style={ui.sheet}>
          <View style={ui.grabber} />
          <Dialog.Title>New routine</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={name} onChangeText={setName} accessibilityLabel="Routine name" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => {
                const n = name.trim();
                if (!n) return;
                create.mutate(n, {
                  onSuccess: (r) => {
                    setDialog(false);
                    setName('');
                    router.push({ pathname: '/routine/[id]', params: { id: r.id } });
                  },
                });
              }}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: replogColors.base },
  content: { gap: 12, padding: 16, paddingBottom: 48 },
  title: { color: replogColors.text, fontWeight: '700' },
  cardContent: { gap: 8 },
  cardTitle: { color: replogColors.text, fontWeight: '700' },
  muted: { color: replogColors.textMuted },
  rowHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  iconRow: { flexDirection: 'row' },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
});
