import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

interface Props {
  values: number[];
  label: string;
  height?: number;
}

export function Sparkline({ values, label, height = 80 }: Props) {
  const max = Math.max(1, ...values);
  return (
    <View style={[ui.card, styles.wrap]} accessibilityLabel={`${label} chart, ${values.length} sessions`}>
      <Text style={ui.label}>{label}</Text>
      <View style={[styles.chart, { height }]}>
        {values.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>
            No data yet
          </Text>
        ) : (
          values.map((v, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.max(2, (v / max) * height),
                  opacity: 0.5 + (v / max) * 0.5,
                },
              ]}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, padding: 10 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 3 },
  bar: { backgroundColor: replogColors.primary, borderRadius: 2, flex: 1 },
  muted: { color: replogColors.textMuted },
});
