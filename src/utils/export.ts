import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '@/db/client';
import { categories, statuses, criteria, items, itemCriteriaScores } from '@/db/schema';

/**
 * Exporte toutes les données en JSON et ouvre le partage système.
 */
export async function exportData(): Promise<void> {
  const [
    allCategories,
    allStatuses,
    allCriteria,
    allItems,
    allScores,
  ] = await Promise.all([
    db.select().from(categories).all(),
    db.select().from(statuses).all(),
    db.select().from(criteria).all(),
    db.select().from(items).all(),
    db.select().from(itemCriteriaScores).all(),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      categories: allCategories,
      statuses: allStatuses,
      criteria: allCriteria,
      items: allItems,
      itemCriteriaScores: allScores,
    },
  };

  const filename = `rateit_backup_${Date.now()}.json`;
  const path = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType: 'application/json' });
  }
}
