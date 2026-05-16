const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permettre à Metro d'importer les fichiers .sql (migrations Drizzle)
config.resolver.assetExts.push('sql');

module.exports = config;
