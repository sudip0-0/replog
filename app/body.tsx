import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, IconButton, List, Text, TextInput } from 'react-native-paper';
import { useAddBodyMetric, useBodyMetrics, useRemoveBodyMetric } from '@/features/body/useBody';
import { fromKg, toKg } from '@/domain/units';
import { useUIStore } from '@/store/uiStore';

export default function BodyScreen() {
  const unit = useUIStore((s) => s.unit);
  const { data } = useBodyMetrics();
  const add = useAddBodyMetric();
  const remove = useRemoveBodyMetric();
  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');

  const onAdd = () => {
    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) return;
    add.mutate(
      {
        date: new Date().toISOString().slice(0, 10),
        weight_kg: toKg(w, unit),
        body_fat_pct: fat ? Number(fat) : null,
      },
      { onSuccess: () => { setWeight(''); setFat(''); } },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>
      <Text variant="headlineSmall">Body metrics</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          dense
          style={{ flex: 1 }}
          label={`Weight (${unit})`}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          accessibilityLabel={`Body weight in ${unit}`}
        />
        <TextInput
          dense
          style={{ flex: 1 }}
          label="Body fat % (optional)"
          keyboardType="numeric"
          value={fat}
          onChangeText={setFat}
          accessibilityLabel="Body fat percentage"
        />
      </View>
      <Button mode="contained" icon="plus" onPress={onAdd} accessibilityLabel="Log body weight">
        Log today
      </Button>

      {!data || data.length === 0 ? (
        <Text variant="bodyMedium">No entries yet.</Text>
      ) : (
        data.map((m) => (
          <List.Item
            key={m.id}
            title={`${Math.round(fromKg(m.weight_kg, unit) * 10) / 10} ${unit}${m.body_fat_pct != null ? ` · ${m.body_fat_pct}%` : ''}`}
            description={m.date}
            right={() => (
              <IconButton
                icon="delete-outline"
                onPress={() => remove.mutate(m.id)}
                accessibilityLabel={`Delete entry from ${m.date}`}
              />
            )}
          />
        ))
      )}
    </ScrollView>
  );
}
