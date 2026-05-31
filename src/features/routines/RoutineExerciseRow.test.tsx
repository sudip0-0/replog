import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { RoutineExerciseRow } from './RoutineExerciseRow';
import { useRemoveRoutineExercise } from './useRoutines';
import type { RoutineExerciseDetail } from './routineService';

jest.mock('./useRoutines', () => ({
  useUpdateRoutineExercise: () => ({ mutate: jest.fn() }),
  useRemoveRoutineExercise: jest.fn(() => ({ mutate: jest.fn() })),
}));

const detail: RoutineExerciseDetail = {
  routineExercise: {
    id: 're-1',
    user_id: 'local',
    routine_id: 'r-1',
    exercise_id: 'e-1',
    order_index: 0,
    target_sets: 3,
    target_reps_min: 8,
    target_reps_max: 12,
    target_rest_sec: 120,
    progression_rule: 'double_progression',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
  },
  exercise: {
    id: 'e-1',
    user_id: null,
    name: 'Back Squat',
    primary_muscle: 'quads',
    secondary_muscles: [],
    equipment: 'barbell',
    is_custom: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
  },
};

function renderRow(props: Partial<Parameters<typeof RoutineExerciseRow>[0]> = {}) {
  const onMove = jest.fn();
  render(
    <PaperProvider>
      <RoutineExerciseRow
        routineId="r-1"
        detail={detail}
        canUp={false}
        canDown
        onMove={onMove}
        {...props}
      />
    </PaperProvider>,
  );
  return { onMove };
}

describe('RoutineExerciseRow', () => {
  it('disables the up control at the top and enables move down', () => {
    const { onMove } = renderRow();
    const up = screen.getByLabelText('Move Back Squat up');
    expect(up.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(screen.getByLabelText('Move Back Squat down'));
    expect(onMove).toHaveBeenCalledWith(1);
  });

  it('removes the exercise from the routine', () => {
    const mutate = jest.fn();
    (useRemoveRoutineExercise as jest.Mock).mockReturnValue({ mutate });
    renderRow();
    fireEvent.press(screen.getByLabelText('Remove Back Squat from routine'));
    expect(mutate).toHaveBeenCalledWith('re-1');
  });

  it('opens the edit targets dialog', () => {
    renderRow();
    fireEvent.press(screen.getByLabelText('Edit Back Squat targets'));
    expect(screen.getByLabelText('Target sets')).toBeTruthy();
    expect(screen.getByLabelText('Target rest seconds')).toBeTruthy();
  });
});
