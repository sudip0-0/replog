import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { SetRow, nextSetType } from './SetRow';
import type { SetRecord } from '@/domain/schemas';

const set: SetRecord = {
  id: '11111111-1111-5111-8111-111111111111',
  user_id: 'local',
  workout_exercise_id: '22222222-2222-5222-8222-222222222222',
  set_index: 0,
  set_type: 'normal',
  weight_kg: 60,
  reps: 8,
  rpe: null,
  completed: false,
  note: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  deleted_at: null,
};

function renderRow(overrides: Partial<Parameters<typeof SetRow>[0]> = {}) {
  const onCommit = jest.fn();
  const onToggleComplete = jest.fn();
  const onRemove = jest.fn();
  render(
    <PaperProvider>
      <SetRow
        set={set}
        unit="kg"
        onCommit={onCommit}
        onToggleComplete={onToggleComplete}
        onRemove={onRemove}
        {...overrides}
      />
    </PaperProvider>,
  );
  return { onCommit, onToggleComplete, onRemove };
}

describe('nextSetType', () => {
  it('cycles normal -> warmup -> drop -> failure -> normal', () => {
    expect(nextSetType('normal')).toBe('warmup');
    expect(nextSetType('warmup')).toBe('drop');
    expect(nextSetType('drop')).toBe('failure');
    expect(nextSetType('failure')).toBe('normal');
  });
});

describe('SetRow', () => {
  it('exposes accessible labels for weight, reps, and completion', () => {
    renderRow();
    expect(screen.getByLabelText('Weight in kg')).toBeTruthy();
    expect(screen.getByLabelText('Repetitions')).toBeTruthy();
    expect(screen.getByLabelText('Mark set complete')).toBeTruthy();
  });

  it('cycles the set type on chip press', () => {
    const { onCommit } = renderRow();
    fireEvent.press(screen.getByLabelText(/Set type Normal/));
    expect(onCommit).toHaveBeenCalledWith({ set_type: 'warmup' });
  });

  it('commits reps on end editing', () => {
    const { onCommit } = renderRow();
    const reps = screen.getByLabelText('Repetitions');
    fireEvent.changeText(reps, '10');
    fireEvent(reps, 'endEditing');
    expect(onCommit).toHaveBeenCalledWith({ reps: 10 });
  });

  it('toggles completion', () => {
    const { onToggleComplete } = renderRow();
    fireEvent.press(screen.getByLabelText('Mark set complete'));
    expect(onToggleComplete).toHaveBeenCalled();
  });

  it('rejects invalid reps without committing and shows an error', () => {
    const { onCommit } = renderRow();
    const reps = screen.getByLabelText('Repetitions');
    fireEvent.changeText(reps, '8.5');
    fireEvent(reps, 'endEditing');
    expect(onCommit).not.toHaveBeenCalledWith(expect.objectContaining({ reps: expect.anything() }));
    expect(screen.getByText('Whole reps only')).toBeTruthy();
  });

  it('rejects negative weight', () => {
    const { onCommit } = renderRow();
    const weight = screen.getByLabelText('Weight in kg');
    fireEvent.changeText(weight, '-20');
    fireEvent(weight, 'endEditing');
    expect(onCommit).not.toHaveBeenCalledWith(expect.objectContaining({ weight_kg: expect.anything() }));
    expect(screen.getByText('No negative weight')).toBeTruthy();
  });

  it('expands to reveal RPE/note and commits a valid RPE', () => {
    const { onCommit } = renderRow();
    fireEvent.press(screen.getByLabelText(/Show set details/));
    const rpe = screen.getByLabelText('RPE, 1 to 10');
    fireEvent.changeText(rpe, '8');
    fireEvent(rpe, 'endEditing');
    expect(onCommit).toHaveBeenCalledWith({ rpe: 8 });
  });

  it('rejects out-of-range RPE', () => {
    renderRow();
    fireEvent.press(screen.getByLabelText(/Show set details/));
    const rpe = screen.getByLabelText('RPE, 1 to 10');
    fireEvent.changeText(rpe, '12');
    fireEvent(rpe, 'endEditing');
    expect(screen.getByText('RPE is 1-10')).toBeTruthy();
  });

  it('commits a per-set note', () => {
    const { onCommit } = renderRow();
    fireEvent.press(screen.getByLabelText(/Show set details/));
    const note = screen.getByLabelText('Set note');
    fireEvent.changeText(note, 'felt heavy');
    fireEvent(note, 'endEditing');
    expect(onCommit).toHaveBeenCalledWith({ note: 'felt heavy' });
  });

  it('shows a plate calculation for the loaded weight', () => {
    renderRow();
    fireEvent.press(screen.getByLabelText(/Show set details/));
    // 60kg on a 20kg bar => 20 per side
    expect(screen.getByLabelText(/Plate calculator. Per side: 20/)).toBeTruthy();
  });
});
