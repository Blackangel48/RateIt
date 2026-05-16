import { create } from 'zustand';
import { db } from '../db/client';
import { categories, criteria } from '../db/schema';
import type { Category, NewCategory, Criterion, NewCriterion } from '../db/schema';
import { eq } from 'drizzle-orm';

interface CategoriesState {
  categories: Category[];
  loading: boolean;

  fetchCategories: () => Promise<void>;
  createCategory: (data: NewCategory, criteriaLabels: string[]) => Promise<Category>;
  updateCategory: (id: number, data: Partial<NewCategory>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCriteria: (categoryId: number) => Promise<Criterion[]>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    const result = await db.select().from(categories).all();
    set({ categories: result, loading: false });
  },

  createCategory: async (data, criteriaLabels) => {
    const [newCat] = await db.insert(categories).values(data).returning();

    // Insérer les critères associés
    if (criteriaLabels.length > 0) {
      await db.insert(criteria).values(
        criteriaLabels.map((label, i) => ({
          categoryId: newCat.id,
          label,
          position: i,
        }))
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
    // Les items et critères sont supprimés en cascade (schema onDelete: 'cascade')
    await db.delete(categories).where(eq(categories.id, id));
    await get().fetchCategories();
  },

  getCriteria: async (categoryId) => {
    return db
      .select()
      .from(criteria)
      .where(eq(criteria.categoryId, categoryId))
      .all();
  },
}));
