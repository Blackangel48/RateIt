import { int, real, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon'),               // emoji ou nom d'icône
  color: text('color'),             // code HEX ex: "#FAEEDA"
  scoreMax: int('score_max').notNull().default(10),
  scoreGrain: real('score_grain').notNull().default(0.5),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ─────────────────────────────────────────────
// STATUTS (seeds fixes en V1 — table prête pour V2 perso)
// ─────────────────────────────────────────────
export const statuses = sqliteTable('statuses', {
  id: int('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  color: text('color'),             // couleur du badge HEX
  // V2 : ajouter category_id pour statuts par catégorie
  // categoryId: int('category_id').references(() => categories.id),
});

// ─────────────────────────────────────────────
// CRITÈRES DE NOTATION PAR CATÉGORIE
// Ex : "Composition", "Production", "Histoire"...
// ─────────────────────────────────────────────
export const criteria = sqliteTable('criteria', {
  id: int('id').primaryKey({ autoIncrement: true }),
  categoryId: int('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  weight: real('weight').notNull().default(1), // poids dans la moyenne (V2)
  position: int('position').notNull().default(0), // ordre d'affichage
});

// ─────────────────────────────────────────────
// ÉLÉMENTS (films, albums, jeux...)
// ─────────────────────────────────────────────
export const items = sqliteTable('items', {
  id: int('id').primaryKey({ autoIncrement: true }),
  categoryId: int('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  statusId: int('status_id')
    .references(() => statuses.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  subtitle: text('subtitle'),       // artiste, auteur, année...
  description: text('description'),
  imagePath: text('image_path'),    // chemin local expo-file-system
  score: real('score'),             // note globale finale
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ─────────────────────────────────────────────
// NOTES PAR CRITÈRE (lien item ↔ critère)
// ─────────────────────────────────────────────
export const itemCriteriaScores = sqliteTable('item_criteria_scores', {
  id: int('id').primaryKey({ autoIncrement: true }),
  itemId: int('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  criterionId: int('criterion_id')
    .notNull()
    .references(() => criteria.id, { onDelete: 'cascade' }),
  score: real('score').notNull(),
});

// ─────────────────────────────────────────────
// TYPES INFÉRÉS (utilisation dans les stores/hooks)
// ─────────────────────────────────────────────
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Status = typeof statuses.$inferSelect;

export type Criterion = typeof criteria.$inferSelect;
export type NewCriterion = typeof criteria.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type ItemCriterionScore = typeof itemCriteriaScores.$inferSelect;
