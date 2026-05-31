import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from './useAuth';
import { useSyncNow } from '@/features/sync/useSync';

/** Account/auth controls. Works in guest/local mode when Supabase is unset. */
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
      <View style={{ gap: 4 }}>
        <Text variant="titleMedium">Account</Text>
        <Text variant="bodyMedium">
          Running in local-only mode. All data is stored on this device. Add Supabase credentials to
          enable cloud sync (see README).
        </Text>
      </View>
    );
  }

  if (status === 'authenticated') {
    return (
      <View style={{ gap: 8 }}>
        <Text variant="titleMedium">Account</Text>
        <Text variant="bodyMedium">Signed in ({userId?.slice(0, 8)}…). Data syncs to the cloud.</Text>
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
    else sync.mutate(); // best-effort sync after sign-in; errors surface in SyncSection
  };

  return (
    <View style={{ gap: 8 }}>
      <Text variant="titleMedium">Account</Text>
      <TextInput
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Email"
      />
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="Password"
      />
      {error ? <HelperText type="error" visible>{error}</HelperText> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button mode="contained" onPress={() => void submit(signIn)} accessibilityLabel="Sign in">
          Sign in
        </Button>
        <Button mode="outlined" onPress={() => void submit(signUp)} accessibilityLabel="Sign up">
          Sign up
        </Button>
      </View>
      <Text variant="bodySmall">You can keep using the app as a guest without signing in.</Text>
    </View>
  );
}
