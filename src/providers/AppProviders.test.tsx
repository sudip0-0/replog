import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native-paper';
import { AppProviders } from './AppProviders';

describe('AppProviders', () => {
  it('renders children within the themed provider tree', () => {
    render(
      <AppProviders>
        <Text>RepLog</Text>
      </AppProviders>,
    );
    expect(screen.getByText('RepLog')).toBeTruthy();
  });
});
