import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, List, Menu, Portal, TextInput } from 'react-native-paper';
import type { ProgressionRule } from '@/domain/schemas';
import type { RoutineExerciseDetail } from './routineService';
import { useRemoveRoutineExercise, useUpdateRoutineExercise } from './useRoutines';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

const RULES: { value: ProgressionRule; label: string }[] = [
  { value: 'double_progression', label: 'Double progression' },
  { value: 'add_reps', label: 'Add reps' },
  { value: 'add_weight', label: 'Add weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'deload', label: 'Deload' },
];
const ruleLabel = (r: ProgressionRule) => RULES.find((x) => x.value === r)?.label ?? r;

interface Props {
  routineId: string;
  detail: RoutineExerciseDetail;
  canUp: boolean;
  canDown: boolean;
  onMove: (dir: -1 | 1) => void;
}

export function RoutineExerciseRow({ routineId, detail, canUp, canDown, onMove }: Props) {
  const re = detail.routineExercise;
  const update = useUpdateRoutineExercise(routineId);
  const remove = useRemoveRoutineExercise(routineId);
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);
  const [sets, setSets] = useState(String(re.target_sets));
  const [min, setMin] = useState(String(re.target_reps_min));
  const [max, setMax] = useState(String(re.target_reps_max));
  const [rest, setRest] = useState(String(re.target_rest_sec));
  const [rule, setRule] = useState<ProgressionRule>(re.progression_rule);

  const save = () => {
    update.mutate({
      id: re.id,
      patch: {
        target_sets: Math.max(1, Math.trunc(Number(sets) || 1)),
        target_reps_min: Math.max(1, Math.trunc(Number(min) || 1)),
        target_reps_max: Math.max(1, Math.trunc(Number(max) || 1)),
        target_rest_sec: Math.max(0, Math.trunc(Number(rest) || 0)),
        progression_rule: rule,
      },
    });
    setEditing(false);
  };

  return (
    <List.Item
      title={detail.exercise?.name ?? 'Exercise'}
      description={`${re.target_sets} x ${re.target_reps_min}-${re.target_reps_max} / rest ${re.target_rest_sec}s / ${ruleLabel(re.progression_rule)}`}
      left={() => (
        <View style={styles.iconRow}>
          <IconButton icon="arrow-up" disabled={!canUp} onPress={() => onMove(-1)} accessibilityLabel={`Move ${detail.exercise?.name} up`} />
          <IconButton icon="arrow-down" disabled={!canDown} onPress={() => onMove(1)} accessibilityLabel={`Move ${detail.exercise?.name} down`} />
        </View>
      )}
      right={() => (
        <View style={styles.iconRow}>
          <IconButton icon="pencil" onPress={() => setEditing(true)} accessibilityLabel={`Edit ${detail.exercise?.name} targets`} />
          <IconButton icon="delete-outline" onPress={() => remove.mutate(re.id)} accessibilityLabel={`Remove ${detail.exercise?.name} from routine`} />
          <Portal>
            <Dialog visible={editing} onDismiss={() => setEditing(false)} style={ui.sheet}>
              <View style={ui.grabber} />
              <Dialog.Title>{detail.exercise?.name ?? 'Exercise'}</Dialog.Title>
              <Dialog.Content style={styles.dialogContent}>
                <TextInput dense label="Sets" keyboardType="number-pad" value={sets} onChangeText={setSets} accessibilityLabel="Target sets" />
                <View style={styles.inputRow}>
                  <TextInput dense style={styles.flex} label="Min reps" keyboardType="number-pad" value={min} onChangeText={setMin} accessibilityLabel="Target minimum reps" />
                  <TextInput dense style={styles.flex} label="Max reps" keyboardType="number-pad" value={max} onChangeText={setMax} accessibilityLabel="Target maximum reps" />
                </View>
                <TextInput dense label="Rest (seconds)" keyboardType="number-pad" value={rest} onChangeText={setRest} accessibilityLabel="Target rest seconds" />
                <Menu
                  visible={menu}
                  onDismiss={() => setMenu(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setMenu(true)} accessibilityLabel={`Progression rule: ${ruleLabel(rule)}`}>
                      {ruleLabel(rule)}
                    </Button>
                  }
                >
                  {RULES.map((r) => (
                    <Menu.Item
                      key={r.value}
                      title={r.label}
                      onPress={() => {
                        setRule(r.value);
                        setMenu(false);
                      }}
                    />
                  ))}
                </Menu>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setEditing(false)}>Cancel</Button>
                <Button mode="contained" onPress={save} accessibilityLabel="Save targets">
                  Save
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      )}
      style={styles.row}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: { color: replogColors.text, fontWeight: '700' },
  description: { color: replogColors.textMuted },
  iconRow: { flexDirection: 'row' },
  dialogContent: { gap: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
