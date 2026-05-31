import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useStartFlow } from './useStartFlow';

/** Rendered once at the app root; prompts when starting over an active workout. */
export function StartConflictDialog() {
  const { conflict, resume, replace, cancel } = useStartFlow();
  return (
    <Portal>
      <Dialog visible={conflict} onDismiss={cancel}>
        <Dialog.Title>A workout is already in progress</Dialog.Title>
        <Dialog.Content>
          <Text>Resume your current workout, or replace it with a new one?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={cancel} accessibilityLabel="Cancel">
            Cancel
          </Button>
          <Button onPress={() => void replace()} accessibilityLabel="Replace active workout">
            Replace
          </Button>
          <Button mode="contained" onPress={resume} accessibilityLabel="Resume active workout">
            Resume
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
