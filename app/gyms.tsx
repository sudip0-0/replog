import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, IconButton, RadioButton, Text, TextInput } from 'react-native-paper';
import { useCreateGymProfile, useGymProfiles, useRemoveGymProfile } from '@/features/gyms/useGyms';
import { useUIStore } from '@/store/uiStore';

export default function GymsScreen() {
  const { data: gyms } = useGymProfiles();
  const create = useCreateGymProfile();
  const remove = useRemoveGymProfile();
  const { activeGymId, setActiveGym } = useUIStore();
  const [name, setName] = useState('');

  const onAdd = () => {
    const n = name.trim();
    if (!n) return;
    create.mutate(n, { onSuccess: () => setName('') });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>
      <Text variant="headlineSmall">Gym profiles</Text>
      <Text variant="bodyMedium">
        Exercise notes are saved against the active gym, so machine settings can differ per gym.
      </Text>

      <RadioButton.Group
        value={activeGymId ?? 'none'}
        onValueChange={(v) => setActiveGym(v === 'none' ? null : v)}
      >
        <RadioButton.Item label="General (no gym)" value="none" accessibilityLabel="Use general notes" />
        {gyms?.map((g) => (
          <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <RadioButton.Item label={g.name} value={g.id} accessibilityLabel={`Select ${g.name}`} />
            </View>
            <IconButton
              icon="delete-outline"
              onPress={() => {
                if (activeGymId === g.id) setActiveGym(null);
                remove.mutate(g.id);
              }}
              accessibilityLabel={`Delete ${g.name}`}
            />
          </View>
        ))}
      </RadioButton.Group>

      {gyms && gyms.length === 0 ? <Text variant="bodySmall">No gyms yet.</Text> : null}

      <TextInput
        label="New gym name"
        value={name}
        onChangeText={setName}
        accessibilityLabel="New gym name"
      />
      <Button mode="contained" icon="plus" onPress={onAdd} accessibilityLabel="Add gym profile">
        Add gym
      </Button>
    </ScrollView>
  );
}
