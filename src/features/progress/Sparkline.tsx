import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface Props {
  values: number[];
  label: string;
  height?: number;
}

/** Minimal bar chart (no external chart dependency). */
export function Sparkline({ values, label, height = 80 }: Props) {
  const theme = useTheme();
  const max = Math.max(1, ...values);
  return (
    <View accessibilityLabel={`${label} chart, ${values.length} sessions`}>
      <Text variant="labelLarge">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 3, marginTop: 4 }}>
        {values.length === 0 ? (
          <Text variant="bodySmall">No data yet</Text>
        ) : (
          values.map((v, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: Math.max(2, (v / max) * height),
                backgroundColor: theme.colors.primary,
                borderRadius: 2,
              }}
            />
          ))
        )}
      </View>
    </View>
  );
}
