import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// Ouverture (ou création) de la base de données locale
const sqlite = SQLite.openDatabaseSync('rateit.db');

// Instance Drizzle avec le schéma typé
export const db = drizzle(sqlite, { schema });

export default db;
