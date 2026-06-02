import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useCompletedWorkouts, useWeeklyMuscleVolume } from '@/features/progress/useProgress';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export default function HistoryScreen() {
  const { data: workouts, isLoading } = useCompletedWorkouts();
  const { data: weeks } = useWeeklyMuscleVolume();
  const latestWeek = weeks?.[weeks.length - 1];

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Text variant="headlineMedium" style={styles.title}>
        History
      </Text>

      {latestWeek ? (
        <Card mode="contained" style={ui.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={ui.label}>Week of {latestWeek.weekStart}</Text>
            <Text variant="titleMedium" style={styles.cardTitle}>
              This week volume
            </Text>
            {Object.entries(latestWeek.volumeByMuscle)
              .sort((a, b) => b[1] - a[1])
              .map(([muscle, vol]) => (
                <View key={muscle} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{muscle}</Text>
                  <Text style={styles.metricValue}>{Math.round(vol)} kg</Text>
                </View>
              ))}
          </Card.Content>
        </Card>
      ) : null}

      {!workouts || workouts.length === 0 ? (
        <Text variant="bodyMedium" style={styles.muted}>
          No completed workouts yet. Finish a workout to see it here.
        </Text>
      ) : (
        workouts.map((wkt) => (
          <List.Item
            key={wkt.id}
            title={wkt.name}
            description={new Date(wkt.completed_at ?? wkt.started_at).toLocaleString()}
            left={(p) => <List.Icon {...p} icon="calendar-check" color={replogColors.primary} />}
            onPress={() => router.push({ pathname: '/history/[id]', params: { id: wkt.id } })}
            accessibilityLabel={`${wkt.name}, completed workout`}
            style={styles.listRow}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: replogColors.base },
  content: { gap: 12, padding: 16, paddingBottom: 48 },
  title: { color: replogColors.text, fontWeight: '700' },
  cardContent: { gap: 8 },
  cardTitle: { color: replogColors.text, fontWeight: '700' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { color: replogColors.textMuted },
  metricValue: { ...ui.dataText, color: replogColors.text, fontSize: 16, lineHeight: 20 },
  muted: { color: replogColors.textMuted },
  listRow: {
    backgroundColor: replogColors.surfaceLow,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
  },
  listTitle: { color: replogColors.text, fontWeight: '700' },
  listDescription: { color: replogColors.textMuted },
});
