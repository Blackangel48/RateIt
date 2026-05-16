import { create } from 'zustand';
import { db } from '@/db/client';
import { items, itemCriteriaScores } from '@/db/schema';
import type { Item, NewItem, ItemCriterionScore } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface ItemsState {
  items: Item[];
  loading: boolean;

  fetchItems: (categoryId: number) => Promise<void>;
  createItem: (data: NewItem) => Promise<Item>;
  updateItem: (id: number, data: Partial<NewItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  saveCriterionScore: (itemId: number, criterionId: number, score: number) => Promise<void>;
  getCriterionScores: (itemId: number) => Promise<ItemCriterionScore[]>;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async (categoryId) => {
    set({ loading: true });
    const result = await db
      .select()
      .from(items)
      .where(eq(items.categoryId, categoryId))
      .all();
    set({ items: result, loading: false });
  },

  createItem: async (data) => {
    const [newItem] = await db.insert(items).values(data).returning();
    return newItem;
  },

  updateItem: async (id, data) => {
    const now = new Date().toISOString();
    await db
      .update(items)
      .set({ ...data, updatedAt: now })
      .where(eq(items.id, id));

    // Rafraîchir si on a des items en mémoire pour cette catégorie
    const currentItems = get().items;
    if (currentItems.length > 0) {
      await get().fetchItems(currentItems[0].categoryId);
    }
  },

  deleteItem: async (id) => {
    await db.delete(items).where(eq(items.id, id));
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  saveCriterionScore: async (itemId, criterionId, score) => {
    // Upsert : mettre à jour si déjà noté, insérer sinon
    const existing = await db
      .select()
      .from(itemCriteriaScores)
      .where(
        and(
          eq(itemCriteriaScores.itemId, itemId),
          eq(itemCriteriaScores.criterionId, criterionId)
        )
      )
      .get();

    if (existing) {
      await db
        .update(itemCriteriaScores)
        .set({ score })
        .where(eq(itemCriteriaScores.id, existing.id));
    } else {
      await db.insert(itemCriteriaScores).values({ itemId, criterionId, score });
    }
  },

  getCriterionScores: async (itemId) => {
    return db
      .select()
      .from(itemCriteriaScores)
      .where(eq(itemCriteriaScores.itemId, itemId))
      .all();
  },
}));
