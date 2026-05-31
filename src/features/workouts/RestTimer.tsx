import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRestTimer } from '@/store/sessionStore';

const PRESETS = [60, 90, 120, 180];

/** Compact rest timer scoped to one workout-exercise via `id`. */
export function RestTimer({ id }: { id: string }) {
  const endsAt = useRestTimer((s) => s.endsAt[id]);
  const start = useRestTimer((s) => s.start);
  const stop = useRestTimer((s) => s.stop);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (endsAt == null) return;
    const t = setInterval(
      () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))),
      200,
    );
    return () => clearInterval(t);
  }, [endsAt]);

  if (endsAt && remaining > 0) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text variant="titleMedium" accessibilityLabel={`Rest ${remaining} seconds remaining`}>
          Rest {remaining}s
        </Text>
        <Button compact onPress={() => stop(id)} accessibilityLabel="Skip rest">
          Skip
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {PRESETS.map((s) => (
        <Button
          key={s}
          compact
          mode="text"
          onPress={() => start(id, s)}
          accessibilityLabel={`Start ${s} second rest`}
        >
          {s}s
        </Button>
      ))}
    </View>
  );
}
