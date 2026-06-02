import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, List, Text, TextInput } from 'react-native-paper';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAddBodyMetric, useBodyMetrics, useRemoveBodyMetric } from '@/features/body/useBody';
import { fromKg, toKg } from '@/domain/units';
import { useUIStore } from '@/store/uiStore';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

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
      {
        onSuccess: () => {
          setWeight('');
          setFat('');
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        Body metrics
      </Text>
      <View style={[ui.card, styles.form]}>
        <View style={styles.inputRow}>
          <TextInput
            dense
            style={styles.input}
            label={`Weight (${unit})`}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            accessibilityLabel={`Body weight in ${unit}`}
          />
          <TextInput
            dense
            style={styles.input}
            label="Body fat %"
            keyboardType="numeric"
            value={fat}
            onChangeText={setFat}
            accessibilityLabel="Body fat percentage"
          />
        </View>
        <Button mode="contained" icon="plus" onPress={onAdd} accessibilityLabel="Log body weight">
          Log today
        </Button>
      </View>

      {!data || data.length === 0 ? (
        <Text variant="bodyMedium" style={styles.muted}>
          No entries yet.
        </Text>
      ) : (
        data.map((m) => (
          <List.Item
            key={m.id}
            title={`${Math.round(fromKg(m.weight_kg, unit) * 10) / 10} ${unit}${m.body_fat_pct != null ? ` / ${m.body_fat_pct}%` : ''}`}
            description={m.date}
            right={() => (
              <IconButton icon="delete-outline" onPress={() => remove.mutate(m.id)} accessibilityLabel={`Delete entry from ${m.date}`} />
            )}
            style={styles.row}
            titleStyle={styles.rowTitle}
            descriptionStyle={styles.muted}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: replogColors.text, fontWeight: '700' },
  form: { gap: 10, padding: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1 },
  muted: { color: replogColors.textMuted },
  row: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  rowTitle: { color: replogColors.text, fontWeight: '700' },
});
