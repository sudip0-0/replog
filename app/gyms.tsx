import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, RadioButton, Text, TextInput } from 'react-native-paper';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useCreateGymProfile, useGymProfiles, useRemoveGymProfile } from '@/features/gyms/useGyms';
import { useUIStore } from '@/store/uiStore';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

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
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        Gym profiles
      </Text>
      <Text variant="bodyMedium" style={styles.muted}>
        Exercise notes are scoped to the active gym.
      </Text>

      <View style={[ui.card, styles.section]}>
        <RadioButton.Group value={activeGymId ?? 'none'} onValueChange={(v) => setActiveGym(v === 'none' ? null : v)}>
          <RadioButton.Item label="General (no gym)" value="none" accessibilityLabel="Use general notes" />
          {gyms?.map((g) => (
            <View key={g.id} style={styles.gymRow}>
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
        {gyms && gyms.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>
            No gyms yet.
          </Text>
        ) : null}
      </View>

      <View style={[ui.card, styles.section]}>
        <TextInput label="New gym name" value={name} onChangeText={setName} accessibilityLabel="New gym name" />
        <Button mode="contained" icon="plus" onPress={onAdd} accessibilityLabel="Add gym profile">
          Add gym
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: replogColors.text, fontWeight: '700' },
  muted: { color: replogColors.textMuted },
  section: { gap: 8, padding: 12 },
  gymRow: { alignItems: 'center', flexDirection: 'row' },
});
