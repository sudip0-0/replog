import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from './useAuth';
import { useSyncNow } from '@/features/sync/useSync';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export function AccountSection() {
  const { status, userId, configured, init, signIn, signUp, signOut } = useAuth();
  const sync = useSyncNow();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void init();
  }, [init]);

  if (!configured) {
    return (
      <View style={styles.wrap}>
        <Text style={ui.label}>Account</Text>
        <Text variant="titleMedium" style={styles.title}>
          Local mode
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          Data is stored on this device. Add Supabase credentials to enable cloud sync.
        </Text>
      </View>
    );
  }

  if (status === 'authenticated') {
    return (
      <View style={styles.wrap}>
        <Text style={ui.label}>Account</Text>
        <Text variant="titleMedium" style={styles.title}>
          Signed in
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          User {userId?.slice(0, 8)}. Data syncs to the cloud.
        </Text>
        <Button mode="outlined" onPress={() => void signOut()} accessibilityLabel="Sign out">
          Sign out
        </Button>
      </View>
    );
  }

  const submit = async (fn: typeof signIn) => {
    setError(null);
    const err = await fn(email.trim(), password);
    if (err) setError(err);
    else sync.mutate();
  };

  return (
    <View style={styles.wrap}>
      <Text style={ui.label}>Account</Text>
      <TextInput label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} accessibilityLabel="Email" />
      <TextInput label="Password" secureTextEntry value={password} onChangeText={setPassword} accessibilityLabel="Password" />
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
      <View style={styles.actions}>
        <Button mode="contained" onPress={() => void submit(signIn)} accessibilityLabel="Sign in">
          Sign in
        </Button>
        <Button mode="outlined" onPress={() => void submit(signUp)} accessibilityLabel="Sign up">
          Sign up
        </Button>
      </View>
      <Text variant="bodySmall" style={styles.muted}>
        Guest mode remains available.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, padding: 12 },
  title: { color: replogColors.text, fontWeight: '700' },
  muted: { color: replogColors.textMuted },
  actions: { flexDirection: 'row', gap: 8 },
});
