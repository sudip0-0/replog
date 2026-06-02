import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, HelperText, Portal, Text, TextInput } from 'react-native-paper';
import { useExerciseNote, useUpsertNote } from './useNotes';
import { hasNoteContent, type NoteFields } from './noteService';
import { useUIStore } from '@/store/uiStore';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

const FIELDS: { key: keyof NoteFields; label: string }[] = [
  { key: 'machine_settings', label: 'Machine settings' },
  { key: 'grip', label: 'Grip' },
  { key: 'stance', label: 'Stance' },
  { key: 'injury_caution', label: 'Injury caution' },
  { key: 'substitutions', label: 'Preferred substitutions' },
];

/** Inline, low-tap exercise memory: shows saved notes and an edit dialog. */
export function ExerciseNoteSection({ exerciseId }: { exerciseId: string }) {
  const activeGymId = useUIStore((s) => s.activeGymId);
  const { data: note } = useExerciseNote(exerciseId, activeGymId);
  const upsert = useUpsertNote(exerciseId, activeGymId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<NoteFields>>({});

  const open = () => {
    setDraft({
      machine_settings: note?.machine_settings ?? '',
      grip: note?.grip ?? '',
      stance: note?.stance ?? '',
      injury_caution: note?.injury_caution ?? '',
      substitutions: note?.substitutions ?? '',
    });
    setEditing(true);
  };

  return (
    <View style={styles.wrap}>
      {hasNoteContent(note ?? null) ? (
        FIELDS.filter((f) => note?.[f.key]).map((f) => (
          <HelperText key={f.key} type="info" visible accessibilityLabel={`${f.label}: ${note?.[f.key]}`}>
            {f.label}: {note?.[f.key]}
          </HelperText>
        ))
      ) : (
        <Text variant="bodySmall" style={styles.muted}>
          No notes yet.
        </Text>
      )}
      <Button compact icon="note-edit-outline" onPress={open} accessibilityLabel="Edit exercise notes">
        Notes
      </Button>

      <Portal>
        <Dialog visible={editing} onDismiss={() => setEditing(false)} style={ui.sheet}>
          <View style={ui.grabber} />
          <Dialog.Title>Exercise notes</Dialog.Title>
          <Dialog.ScrollArea>
            <View style={{ gap: 8, paddingVertical: 8 }}>
              {FIELDS.map((f) => (
                <TextInput
                  key={f.key}
                  dense
                  label={f.label}
                  value={(draft[f.key] as string) ?? ''}
                  onChangeText={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                  accessibilityLabel={f.label}
                />
              ))}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditing(false)}>Cancel</Button>
            <Button
              onPress={() => {
                const cleaned: Partial<NoteFields> = {};
                for (const f of FIELDS) {
                  const v = (draft[f.key] as string)?.trim();
                  cleaned[f.key] = v ? v : null;
                }
                upsert.mutate(cleaned, { onSuccess: () => setEditing(false) });
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: replogColors.surface,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  muted: { color: replogColors.textDim },
});
