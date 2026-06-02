import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useActiveWorkout } from '@/features/workouts/useWorkout';
import { useStartFlow } from '@/features/workouts/useStartFlow';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export default function TodayScreen() {
  const { data: active, isLoading } = useActiveWorkout();
  const { start } = useStartFlow();

  return (
    <ScreenContainer>
      <View accessibilityRole="header" style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Today
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Log the next set.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator />
      ) : active ? (
        <Card mode="contained" style={ui.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={ui.label}>Active workout</Text>
            <Text variant="titleLarge" style={styles.cardTitle}>
              {active.name}
            </Text>
            <Button
              mode="contained"
              icon="play"
              onPress={() => router.push({ pathname: '/workout/[id]', params: { id: active.id } })}
              accessibilityLabel="Resume workout"
            >
              Resume
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card mode="contained" style={ui.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={ui.label}>Ready</Text>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Start workout
            </Text>
            <Button
              mode="contained"
              icon="play"
              onPress={() => void start({ kind: 'empty' })}
              accessibilityLabel="Start an empty workout"
            >
              Start empty workout
            </Button>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="outlined"
        icon="magnify"
        onPress={() => router.push('/exercises')}
        accessibilityLabel="Browse exercise library"
      >
        Browse exercises
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 2, paddingBottom: 4 },
  title: { color: replogColors.text, fontWeight: '700' },
  subtitle: { color: replogColors.textMuted },
  cardContent: { gap: 10, paddingVertical: 14 },
  cardTitle: { color: replogColors.text, fontWeight: '700' },
});
