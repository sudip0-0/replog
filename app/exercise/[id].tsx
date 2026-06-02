import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, List, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import {
  useExerciseHistory,
  useExercisePRs,
  useProgressionSuggestion,
} from '@/features/progress/useProgress';
import { Sparkline } from '@/features/progress/Sparkline';
import { fromKg } from '@/domain/units';
import { useUIStore } from '@/store/uiStore';
import { ScreenContainer } from '@/components/ScreenContainer';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

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
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        {name ?? 'Exercise'}
      </Text>

      <Card mode="contained" style={ui.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={ui.label}>Progression</Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {suggestion.data?.explanation ?? 'Loading...'}
          </Text>
        </Card.Content>
      </Card>

      {!history || history.length === 0 ? (
        <Text variant="bodyMedium" style={styles.muted}>
          No completed sessions yet for this exercise.
        </Text>
      ) : (
        <>
          <Card mode="contained" style={ui.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={ui.label}>Latest session</Text>
              <Metric label="Best weight" value={w(latest?.bestWeightKg ?? 0)} />
              <Metric label="Est. 1RM" value={w(latest?.estimatedOneRepMax ?? 0)} />
              <Metric label="Total reps" value={`${latest?.totalReps ?? 0}`} />
              <Metric label="Volume" value={w(latest?.totalVolume ?? 0)} />
            </Card.Content>
          </Card>

          <Sparkline label="Volume over time" values={history.map((h) => h.totalVolume)} />
          <Sparkline label="Estimated 1RM" values={history.map((h) => h.estimatedOneRepMax)} />
        </>
      )}

      <View style={[ui.card, styles.cardContent]}>
        <Text style={ui.label}>Personal records</Text>
        {!prs || prs.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>
            No PRs yet.
          </Text>
        ) : (
          prs.slice(0, 10).map((pr) => (
            <List.Item
              key={pr.id}
              title={`${pr.kind.toUpperCase()} / ${w(pr.value)}`}
              description={pr.reps ? `${pr.reps} reps` : undefined}
              left={() => (
                <Chip compact style={styles.prChip} textStyle={styles.prText}>
                  {pr.kind}
                </Chip>
              )}
              titleStyle={styles.rowTitle}
              descriptionStyle={styles.muted}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: replogColors.text, fontWeight: '700' },
  cardContent: { gap: 8, padding: 12 },
  muted: { color: replogColors.textMuted },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricValue: { ...ui.dataText, color: replogColors.text, fontSize: 16, lineHeight: 20 },
  prChip: { alignSelf: 'center', backgroundColor: replogColors.warningContainer, borderRadius: 4 },
  prText: { color: replogColors.primary, fontWeight: '700' },
  rowTitle: { color: replogColors.text, fontWeight: '700' },
});
