import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Searchbar, Text } from 'react-native-paper';
import { useExerciseSearch } from './useExercises';
import type { Exercise } from '@/domain/schemas';
import { replogColors } from '@/theme';

interface Props {
  onSelect?: (exercise: Exercise) => void;
  actionIcon?: string;
}

export function ExercisePicker({ onSelect, actionIcon = 'plus' }: Props) {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useExerciseSearch(query);

  return (
    <View style={styles.screen}>
      <Searchbar
        placeholder="Search exercises"
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search exercises"
        style={styles.search}
        inputStyle={styles.searchInput}
      />
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>No exercises found.</Text>}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.primary_muscle} / ${item.equipment}`}
              onPress={onSelect ? () => onSelect(item) : undefined}
              accessibilityLabel={`${item.name}, ${item.primary_muscle}`}
              right={(p) => (onSelect ? <List.Icon {...p} icon={actionIcon} color={replogColors.primary} /> : null)}
              style={styles.row}
              titleStyle={styles.rowTitle}
              descriptionStyle={styles.rowDescription}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: replogColors.base, flex: 1 },
  search: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
    margin: 12,
  },
  searchInput: { color: replogColors.text },
  list: { gap: 8, padding: 12, paddingTop: 0 },
  row: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
  },
  rowTitle: { color: replogColors.text, fontWeight: '700' },
  rowDescription: { color: replogColors.textMuted },
  empty: { color: replogColors.textMuted, marginTop: 24, textAlign: 'center' },
});
