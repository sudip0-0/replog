import { View } from 'react-native';
import { router } from 'expo-router';
import { ExercisePicker } from '@/features/exercises/ExercisePicker';

export default function ExercisesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ExercisePicker
        actionIcon="chevron-right"
        onSelect={(ex) =>
          router.push({ pathname: '/exercise/[id]', params: { id: ex.id, name: ex.name } })
        }
      />
    </View>
  );
}
