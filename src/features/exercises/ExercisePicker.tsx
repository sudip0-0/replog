import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, List, Searchbar, Text } from 'react-native-paper';
import { useExerciseSearch } from './useExercises';
import type { Exercise } from '@/domain/schemas';

interface Props {
  onSelect?: (exercise: Exercise) => void;
  actionIcon?: string;
}

/** Searchable list of exercises from the local library. */
export function ExercisePicker({ onSelect, actionIcon = 'plus' }: Props) {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useExerciseSearch(query);

  return (
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="Search exercises"
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search exercises"
        style={{ margin: 12 }}
      />
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(e) => e.id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 24 }}>No exercises found.</Text>
          }
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.primary_muscle} · ${item.equipment}`}
              onPress={onSelect ? () => onSelect(item) : undefined}
              accessibilityLabel={`${item.name}, ${item.primary_muscle}`}
              right={(p) => (onSelect ? <List.Icon {...p} icon={actionIcon} /> : null)}
            />
          )}
        />
      )}
    </View>
  );
}
