import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../src/db/migrations/migrations';
import { db } from '../src/db/client';
import { seedStatuses } from '../src/db/seeds';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (success) {
      seedStatuses().then(() => setSeeded(true));
    }
  }, [success]);

  if (error) {
    // En production, afficher un écran d'erreur explicite
    console.error('Migration error:', error);
  }

  if (!success || !seeded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="category/new" options={{ title: 'Nouvelle catégorie', presentation: 'modal' }} />
      <Stack.Screen name="category/[id]" options={{ title: 'Catégorie' }} />
      <Stack.Screen name="item/new" options={{ title: 'Ajouter un élément', presentation: 'modal' }} />
      <Stack.Screen name="item/[id]" options={{ title: 'Détail' }} />
    </Stack>
  );
}
