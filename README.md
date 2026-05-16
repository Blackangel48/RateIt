# RateIt App

Application mobile de notation 100% hors-ligne — React Native (Expo) + TypeScript + SQLite.

## Stack

| Rôle | Lib |
|---|---|
| Framework | React Native via Expo SDK 51 |
| Langage | TypeScript |
| Navigation | React Navigation (Native Stack + Bottom Tabs) |
| Base de données | SQLite via `expo-sqlite` |
| ORM | Drizzle ORM |
| État global | Zustand |
| Fichiers/Images | `expo-file-system` + `expo-image-picker` |
| Icônes | `@expo/vector-icons` (Ionicons) |
| Animations | `react-native-reanimated` |
| Graphiques | `react-native-gifted-charts` |

## Structure des fichiers

```
RateItApp/
├── app/                      # Screens (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx         # Accueil — liste des catégories
│   │   ├── lists.tsx         # Listes
│   │   ├── stats.tsx         # Statistiques
│   │   └── settings.tsx      # Réglages
│   ├── category/
│   │   ├── new.tsx           # Créer une catégorie
│   │   └── [id].tsx          # Voir/éditer une catégorie
│   ├── item/
│   │   ├── new.tsx           # Ajouter un élément
│   │   └── [id].tsx          # Fiche détail + notation
│   └── _layout.tsx
├── src/
│   ├── db/
│   │   ├── client.ts         # Instance SQLite
│   │   ├── schema.ts         # Schéma Drizzle (tables)
│   │   ├── migrations/       # Migrations auto-générées
│   │   └── seeds.ts          # Statuts par défaut
│   ├── store/
│   │   ├── categoriesStore.ts
│   │   ├── itemsStore.ts
│   │   └── statusStore.ts
│   ├── hooks/
│   │   ├── useCategories.ts
│   │   ├── useItems.ts
│   │   └── useStats.ts
│   ├── components/
│   │   ├── ui/               # Composants réutilisables
│   │   │   ├── Badge.tsx
│   │   │   ├── ScoreSlider.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   └── ItemRow.tsx
│   │   └── forms/
│   │       ├── CategoryForm.tsx
│   │       └── ItemForm.tsx
│   ├── utils/
│   │   ├── scoring.ts        # Calculs de notes
│   │   └── export.ts         # Export/Import JSON
│   └── constants/
│       ├── colors.ts
│       └── statuses.ts       # Statuts fixes (v1)
├── assets/
├── drizzle.config.ts
├── app.json
├── tsconfig.json
└── package.json
```

## Lancer le projet

Voir `SETUP.md` pour les instructions complètes.
