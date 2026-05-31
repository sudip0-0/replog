import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Divider, List, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import {
  useExerciseHistory,
  useExercisePRs,
  useProgressionSuggestion,
} from '@/features/progress/useProgress';
import { Sparkline } from '@/features/progress/Sparkline';
import { fromKg } from '@/domain/units';
import { useUIStore } from '@/store/uiStore';

export default function ExerciseDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const unit = useUIStore((s) => s.unit);
  const { data: history, isLoading } = useExerciseHistory(id);
  const { data: prs } = useExercisePRs(id);
  const suggestion = useProgressionSuggestion(id, 'double_progression', unit);

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  const w = (kg: number) => `${Math.round(fromKg(kg, unit) * 10) / 10} ${unit}`;
  const latest = history?.[history.length - 1];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>
      <Text variant="headlineSmall">{name ?? 'Exercise'}</Text>

      <Card mode="contained">
        <Card.Content>
          <Text variant="titleMedium">Progression suggestion</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>
            {suggestion.data?.explanation ?? 'Loading…'}
          </Text>
        </Card.Content>
      </Card>

      {!history || history.length === 0 ? (
        <Text variant="bodyMedium">No completed sessions yet for this exercise.</Text>
      ) : (
        <>
          <Card mode="contained">
            <Card.Content style={{ gap: 4 }}>
              <Text variant="titleMedium">Latest session</Text>
              <Text>Best weight: {w(latest?.bestWeightKg ?? 0)}</Text>
              <Text>Est. 1RM: {w(latest?.estimatedOneRepMax ?? 0)}</Text>
              <Text>Total reps: {latest?.totalReps ?? 0}</Text>
              <Text>Volume: {w(latest?.totalVolume ?? 0)}</Text>
            </Card.Content>
          </Card>

          <Sparkline label="Volume over time" values={history.map((h) => h.totalVolume)} />
          <Sparkline label="Estimated 1RM" values={history.map((h) => h.estimatedOneRepMax)} />
        </>
      )}

      <View>
        <Text variant="titleMedium">Personal records</Text>
        <Divider style={{ marginVertical: 4 }} />
        {!prs || prs.length === 0 ? (
          <Text variant="bodySmall">No PRs yet.</Text>
        ) : (
          prs.slice(0, 10).map((pr) => (
            <List.Item
              key={pr.id}
              title={`${pr.kind.toUpperCase()} · ${w(pr.value)}`}
              description={pr.reps ? `${pr.reps} reps` : undefined}
              left={() => <Chip compact style={{ alignSelf: 'center' }}>{pr.kind}</Chip>}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
