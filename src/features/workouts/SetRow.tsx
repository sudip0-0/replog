import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import type { SetRecord, SetType } from '@/domain/schemas';
import { fromKg, type WeightUnit } from '@/domain/units';
import { parseReps, parseRpe, parseWeight } from '@/domain/setValidation';
import { barbellPlates } from '@/domain/plates';

const TYPE_ORDER: SetType[] = ['normal', 'warmup', 'drop', 'failure'];
const TYPE_LABEL: Record<SetType, string> = {
  normal: 'Normal',
  warmup: 'Warmup',
  drop: 'Drop',
  failure: 'Failure',
};

export function nextSetType(t: SetType): SetType {
  const i = TYPE_ORDER.indexOf(t);
  return TYPE_ORDER[(i + 1) % TYPE_ORDER.length] as SetType;
}

interface Props {
  set: SetRecord;
  unit: WeightUnit;
  onCommit: (patch: Partial<SetRecord>) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
}

/** A single editable set row: compact by default; expandable for RPE/note/plates. */
export function SetRow({ set, unit, onCommit, onToggleComplete, onRemove }: Props) {
  const [weight, setWeight] = useState(set.weight_kg ? String(fromKg(set.weight_kg, unit)) : '');
  const [reps, setReps] = useState(set.reps ? String(set.reps) : '');
  const [rpe, setRpe] = useState(set.rpe != null ? String(set.rpe) : '');
  const [note, setNote] = useState(set.note ?? '');
  const [errors, setErrors] = useState<{ weight?: string; reps?: string; rpe?: string }>({});
  const [expanded, setExpanded] = useState(false);

  const commitWeight = () => {
    const { value, error } = parseWeight(weight, unit);
    setErrors((e) => ({ ...e, weight: error ?? undefined }));
    if (!error) onCommit({ weight_kg: value });
  };
  const commitReps = () => {
    const { value, error } = parseReps(reps);
    setErrors((e) => ({ ...e, reps: error ?? undefined }));
    if (!error) onCommit({ reps: value });
  };
  const commitRpe = () => {
    const { value, error } = parseRpe(rpe);
    setErrors((e) => ({ ...e, rpe: error ?? undefined }));
    if (!error) onCommit({ rpe: value });
  };

  const plates = barbellPlates(set.weight_kg, unit);
  const plateText = set.weight_kg
    ? plates.perSide.length
      ? `Per side: ${plates.perSide.join(' + ')}${plates.leftover ? ` (+${plates.leftover} left)` : ''}`
      : `Just the ${plates.barWeight}${unit} bar`
    : null;

  return (
    <View>
      <View style={styles.row}>
        <Chip
          compact
          onPress={() => onCommit({ set_type: nextSetType(set.set_type) })}
          accessibilityLabel={`Set type ${TYPE_LABEL[set.set_type]}, tap to change`}
          style={styles.type}
        >
          {TYPE_LABEL[set.set_type]}
        </Chip>
        <TextInput
          dense
          mode="outlined"
          keyboardType="numeric"
          label={unit}
          value={weight}
          onChangeText={setWeight}
          onEndEditing={commitWeight}
          error={!!errors.weight}
          accessibilityLabel={`Weight in ${unit}`}
          style={styles.input}
        />
        <Text style={styles.times}>×</Text>
        <TextInput
          dense
          mode="outlined"
          keyboardType="number-pad"
          label="reps"
          value={reps}
          onChangeText={setReps}
          onEndEditing={commitReps}
          error={!!errors.reps}
          accessibilityLabel="Repetitions"
          style={styles.input}
        />
        <IconButton
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          onPress={() => setExpanded((v) => !v)}
          accessibilityLabel={expanded ? 'Hide set details' : 'Show set details (RPE, note)'}
        />
        <IconButton
          icon={set.completed ? 'check-circle' : 'circle-outline'}
          onPress={onToggleComplete}
          accessibilityLabel={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
          accessibilityState={{ checked: set.completed }}
        />
        <IconButton icon="delete-outline" onPress={onRemove} accessibilityLabel="Remove set" />
      </View>

      {(errors.weight || errors.reps) && (
        <HelperText type="error" visible>
          {errors.weight ?? errors.reps}
        </HelperText>
      )}

      {expanded && (
        <View style={styles.details}>
          <TextInput
            dense
            mode="outlined"
            keyboardType="numeric"
            label="RPE (1-10)"
            value={rpe}
            onChangeText={setRpe}
            onEndEditing={commitRpe}
            error={!!errors.rpe}
            accessibilityLabel="RPE, 1 to 10"
          />
          {errors.rpe ? (
            <HelperText type="error" visible>
              {errors.rpe}
            </HelperText>
          ) : null}
          <TextInput
            dense
            mode="outlined"
            label="Note"
            value={note}
            onChangeText={setNote}
            onEndEditing={() => onCommit({ note: note.trim() || null })}
            accessibilityLabel="Set note"
          />
          {plateText ? (
            <Text variant="bodySmall" accessibilityLabel={`Plate calculator. ${plateText}`}>
              🏋 {plateText}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  type: { minWidth: 76 },
  input: { flex: 1, height: 44 },
  times: { marginHorizontal: 2 },
  details: { gap: 6, paddingLeft: 8, paddingBottom: 8 },
});
