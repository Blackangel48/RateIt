# SETUP — RateIt App

## Prérequis

| Outil | Version min | Installer |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 10+ | inclus avec Node |
| Expo CLI | latest | `npm i -g expo-cli` |
| EAS CLI (build) | latest | `npm i -g eas-cli` |
| Expo Go (téléphone) | latest | App Store / Play Store |

---

## Étape 1 — Initialiser le projet

```bash
npx create-expo-app@latest RateItApp --template expo-template-blank-typescript
cd RateItApp
```

---

## Étape 2 — Installer les dépendances

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Base de données
npx expo install expo-sqlite

# ORM (Drizzle)
npm install drizzle-orm
npm install --save-dev drizzle-kit

# État global
npm install zustand

# Fichiers & images
npx expo install expo-file-system expo-image-picker expo-sharing expo-document-picker

# UI & animations
npx expo install react-native-reanimated
npm install react-native-gifted-charts react-native-linear-gradient

# Icônes (inclus dans Expo, rien à installer)
# @expo/vector-icons est déjà disponible avec Expo
```

---

## Étape 3 — Configurer Drizzle (ORM)

Créer `drizzle.config.ts` à la racine :

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
```

Ajouter dans `package.json` (section `scripts`) :

```json
"db:generate": "drizzle-kit generate",
"db:studio": "drizzle-kit studio"
```

---

## Étape 4 — Configurer `tsconfig.json`

Remplacer le contenu par :

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Étape 5 — Configurer Reanimated

Dans `babel.config.js` (ou `babel.config.cjs`) :

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // ← doit être en dernier
  };
};
```

---

## Étape 6 — Générer les migrations et lancer

```bash
# Générer les fichiers de migration Drizzle
npm run db:generate

# Lancer l'app
npx expo start
```

Scanner le QR code avec **Expo Go** (iOS / Android).

---

## Étape 7 (optionnel) — Build natif

Si tu as besoin d'un build `.apk` / `.ipa` :

```bash
eas login
eas build:configure
eas build --platform android --profile preview
```

---

## Arborescence après setup

```
RateItApp/
├── src/db/migrations/     ← générés par drizzle-kit
├── node_modules/
├── drizzle.config.ts
├── babel.config.js
├── tsconfig.json
└── ...
```
