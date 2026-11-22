import { create } from 'zustand';
import { db } from '../db/client';
import { categories, criteria } from '../db/schema';
import type { Category, NewCategory, Criterion } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

interface CategoriesState {
  categories: Category[];
  loading: boolean;

  fetchCategories: () => Promise<void>;
  createCategory: (data: NewCategory, criteriaLabels: string[]) => Promise<Category>;
  updateCategory: (id: number, data: Partial<NewCategory>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  reorderCategories: (orderedIds: number[]) => Promise<void>;
  getCriteria: (categoryId: number) => Promise<Criterion[]>;
  addCriterion: (categoryId: number, label: string, position: number) => Promise<Criterion>;
  deleteCriterion: (criterionId: number) => Promise<void>;
  renameCriterion: (criterionId: number, label: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    const result = await db.select().from(categories).orderBy(asc(categories.position)).all();
    set({ categories: result, loading: false });
  },

  createCategory: async (data, criteriaLabels) => {
    const [newCat] = await db.insert(categories).values(data).returning();
    if (criteriaLabels.length > 0) {
      await db.insert(criteria).values(
        criteriaLabels.map((label, i) => ({ categoryId: newCat.id, label, position: i }))
      );
    }
    await get().fetchCategories();
    return newCat;
  },

  updateCategory: async (id, data) => {
    await db.update(categories).set(data).where(eq(categories.id, id));
    await get().fetchCategories();
  },

  deleteCategory: async (id) => {
    await db.delete(categories).where(eq(categories.id, id));
    await get().fetchCategories();
  },

  reorderCategories: async (orderedIds) => {
    // Mettre à jour optimistiquement l'état local
    const currentCategories = get().categories;
    const reordered = orderedIds
      .map((id, index) => {
        const category = currentCategories.find(c => c.id === id);
        return category ? { ...category, position: index } : null;
      })
      .filter(Boolean) as Category[];
    set({ categories: reordered });
 
    // Persister en base
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(categories).set({ position: index }).where(eq(categories.id, id))
      )
    );
  },

  getCriteria: async (categoryId) => {
    return db.select().from(criteria).where(eq(criteria.categoryId, categoryId)).all();
  },

  addCriterion: async (categoryId, label, position) => {
    const [newCriterion] = await db
      .insert(criteria)
      .values({ categoryId, label, position, weight: 1 })
      .returning();
    return newCriterion;
  },

  deleteCriterion: async (criterionId) => {
    await db.delete(criteria).where(eq(criteria.id, criterionId));
  },

  renameCriterion: async (criterionId, label) => {
    await db.update(criteria).set({ label }).where(eq(criteria.id, criterionId));
  },
}));
