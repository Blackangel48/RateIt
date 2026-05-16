import { db } from './client';
import { statuses } from './schema';
import { eq } from 'drizzle-orm';

// Statuts par défaut (V1 — fixes)
// Couleurs en HEX correspondant au design
const DEFAULT_STATUSES = [
  { id: 1, label: 'Fini',       color: '#639922' },
  { id: 2, label: 'En cours',   color: '#EF9F27' },
  { id: 3, label: 'À faire',    color: '#888780' },
  { id: 4, label: 'Abandonné',  color: '#E24B4A' },
] as const;

/**
 * Insère les statuts par défaut s'ils n'existent pas encore.
 * Appelé une seule fois au démarrage de l'app (dans le provider DB).
 */
export async function seedStatuses() {
  for (const status of DEFAULT_STATUSES) {
    const existing = await db
      .select()
      .from(statuses)
      .where(eq(statuses.id, status.id))
      .get();

    if (!existing) {
      await db.insert(statuses).values(status);
    }
  }
}
