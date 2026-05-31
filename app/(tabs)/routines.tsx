import { useState } from 'react';
import { ScrollView, View } from 'react-native';
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>
      <Text variant="headlineMedium">Routines</Text>

      {routines && routines.length === 0 ? (
        <Card mode="contained">
          <Card.Content style={{ gap: 8 }}>
            <Text variant="titleMedium">No routines yet</Text>
            <Text variant="bodyMedium">Install starter splits or create your own.</Text>
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
          <Card key={r.id} mode="contained">
            <Card.Title
              title={r.name}
              right={(p) => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton
                    {...p}
                    icon="content-copy"
                    onPress={() => duplicate.mutate(r.id)}
                    accessibilityLabel={`Duplicate ${r.name}`}
                  />
                  <IconButton
                    {...p}
                    icon="delete-outline"
                    onPress={() => remove.mutate(r.id)}
                    accessibilityLabel={`Delete ${r.name}`}
                  />
                </View>
              )}
            />
            <Card.Actions>
              <Button
                onPress={() => router.push({ pathname: '/routine/[id]', params: { id: r.id } })}
                accessibilityLabel={`Edit ${r.name}`}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                onPress={() => onStart(r.id)}
                accessibilityLabel={`Start ${r.name}`}
              >
                Start
              </Button>
            </Card.Actions>
          </Card>
        ))
      )}

      <Button icon="plus" onPress={() => setDialog(true)} accessibilityLabel="Create routine">
        Create routine
      </Button>

      <Portal>
        <Dialog visible={dialog} onDismiss={() => setDialog(false)}>
          <Dialog.Title>New routine</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              accessibilityLabel="Routine name"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(false)}>Cancel</Button>
            <Button
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
