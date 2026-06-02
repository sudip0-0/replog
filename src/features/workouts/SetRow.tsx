import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import type { SetRecord, SetType } from '@/domain/schemas';
import { fromKg, type WeightUnit } from '@/domain/units';
import { parseReps, parseRpe, parseWeight } from '@/domain/setValidation';
import { barbellPlates } from '@/domain/plates';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

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
  onInputFocus?: () => void;
}

export function SetRow({ set, unit, onCommit, onToggleComplete, onRemove, onInputFocus }: Props) {
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
    <View style={[styles.wrap, set.completed && styles.completedWrap]}>
      <View style={styles.header}>
        <Text style={[ui.label, styles.typeLabel]}>Set</Text>
        <Text style={[ui.label, styles.previousLabel]}>Prev</Text>
        <Text style={[ui.label, styles.valueLabel]}>{unit}</Text>
        <Text style={[ui.label, styles.valueLabel]}>Reps</Text>
        <Text style={[ui.label, styles.doneLabel]}>Done</Text>
      </View>

      <View style={styles.row}>
        <Chip
          compact
          onPress={() => onCommit({ set_type: nextSetType(set.set_type) })}
          accessibilityLabel={`Set type ${TYPE_LABEL[set.set_type]}, tap to change`}
          style={[styles.type, styles[set.set_type]]}
          textStyle={styles.chipText}
        >
          {TYPE_LABEL[set.set_type]}
        </Chip>
        <Text variant="bodySmall" numberOfLines={1} style={styles.previousValue}>
          -
        </Text>
        <TextInput
          dense
          mode="outlined"
          keyboardType="numeric"
          label=""
          value={weight}
          onChangeText={setWeight}
          onEndEditing={commitWeight}
          error={!!errors.weight}
          accessibilityLabel={`Weight in ${unit}`}
          style={styles.input}
          contentStyle={[ui.dataText, styles.inputContent]}
          onFocus={onInputFocus}
        />
        <TextInput
          dense
          mode="outlined"
          keyboardType="number-pad"
          label=""
          value={reps}
          onChangeText={setReps}
          onEndEditing={commitReps}
          error={!!errors.reps}
          accessibilityLabel="Repetitions"
          style={styles.input}
          contentStyle={[ui.dataText, styles.inputContent]}
          onFocus={onInputFocus}
        />
        <IconButton
          icon={set.completed ? 'check-circle' : 'circle-outline'}
          onPress={onToggleComplete}
          accessibilityLabel={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
          accessibilityState={{ checked: set.completed }}
          iconColor={set.completed ? replogColors.onPrimary : replogColors.textMuted}
          containerColor={set.completed ? replogColors.primary : replogColors.surface}
          style={styles.done}
        />
      </View>

      <View style={styles.tools}>
        <IconButton
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          onPress={() => setExpanded((v) => !v)}
          accessibilityLabel={expanded ? 'Hide set details' : 'Show set details (RPE, note)'}
          iconColor={replogColors.textMuted}
          size={20}
          style={styles.toolButton}
        />
        <IconButton
          icon="delete-outline"
          onPress={onRemove}
          accessibilityLabel="Remove set"
          iconColor={replogColors.textDim}
          size={20}
          style={styles.toolButton}
        />
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
            onFocus={onInputFocus}
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
            onFocus={onInputFocus}
          />
          {plateText ? (
            <Text variant="bodySmall" style={styles.plateText} accessibilityLabel={`Plate calculator. ${plateText}`}>
              Plates: {plateText}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
    gap: 3,
    padding: 6,
  },
  completedWrap: { backgroundColor: '#1D1A10', borderColor: replogColors.primary },
  header: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  typeLabel: { width: 68 },
  previousLabel: { color: replogColors.textDim, width: 38 },
  valueLabel: { flex: 1, minWidth: 48, textAlign: 'center' },
  doneLabel: { textAlign: 'center', width: 44 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  type: {
    backgroundColor: 'transparent',
    borderColor: replogColors.outline,
    borderRadius: 4,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 68,
  },
  chipText: { color: replogColors.textMuted, fontSize: 11, fontWeight: '700' },
  normal: {},
  warmup: { backgroundColor: '#112836', borderColor: '#25546A' },
  drop: { backgroundColor: '#251B34', borderColor: '#4C3769' },
  failure: { backgroundColor: '#371919', borderColor: '#703333' },
  previousValue: { color: replogColors.textDim, width: 38 },
  input: { backgroundColor: replogColors.surface, flex: 1, height: 48, minWidth: 48 },
  inputContent: { color: replogColors.text, fontSize: 18, textAlign: 'center' },
  done: { borderRadius: 8, height: 44, margin: 0, width: 44 },
  tools: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: -2 },
  toolButton: { height: 32, margin: 0, width: 44 },
  details: { gap: 8, paddingBottom: 4, paddingTop: 4 },
  plateText: { color: replogColors.textMuted },
});
