import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useItemsStore } from '../../src/store/itemsStore';
import { useCategoriesStore } from '../../src/store/categoriesStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../src/constants/statuses';

const STATUS_IDS = [1, 2, 3, 4];

export default function NewItemScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const catId = parseInt(categoryId, 10);

  const { createItem } = useItemsStore();
  const { categories } = useCategoriesStore();
  const category = categories.find(c => c.id === catId);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number>(3); // "À faire" par défaut
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Donne un titre à cet élément.');
      return;
    }
    setSaving(true);
    try {
      await createItem({
        categoryId: catId,
        statusId,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        imagePath: null,
        score: null,
      });
      router.back();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'élément.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Ajouter dans{category ? ` "${category.name}"` : ''}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? '...' : 'Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Aperçu */}
        {title.trim() ? (
          <View style={[styles.preview, { backgroundColor: category?.color ?? '#F8F7F4' }]}>
            <Text style={styles.previewEmoji}>{category?.icon ?? '📁'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle} numberOfLines={1}>{title}</Text>
              {subtitle ? <Text style={styles.previewSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
            {statusId && (
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[statusId].bg }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[statusId].text }]}>
                  {STATUS_LABELS[statusId]}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Titre */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TITRE</Text>
          <TextInput
            style={styles.input}
            placeholder={category ? `Nom du ${category.name.replace(/s$/i, '').toLowerCase()}…` : 'Titre…'}
            placeholderTextColor="#B4B2A9"
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* Sous-titre */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOUS-TITRE <Text style={styles.optional}>(optionnel)</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Artiste, auteur, année, réalisateur…"
            placeholderTextColor="#B4B2A9"
            value={subtitle}
            onChangeText={setSubtitle}
            returnKeyType="next"
          />
        </View>

        {/* Statut */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STATUT</Text>
          <View style={styles.statusGrid}>
            {STATUS_IDS.map(id => {
              const color = STATUS_COLORS[id];
              const isActive = statusId === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.statusBtn,
                    isActive && { backgroundColor: color.bg, borderColor: color.text + '60' },
                  ]}
                  onPress={() => setStatusId(id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusDot, { backgroundColor: isActive ? color.text : '#C9C7BE' }]} />
                  <Text style={[styles.statusText, isActive && { color: color.text, fontWeight: '600' }]}>
                    {STATUS_LABELS[id]}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={14} color={color.text} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DESCRIPTION <Text style={styles.optional}>(optionnel)</Text></Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Notes, impressions, contexte…"
            placeholderTextColor="#B4B2A9"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Note — on peut déjà en mettre une */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#888780" />
          <Text style={styles.infoText}>
            La notation détaillée se fait depuis la fiche de l'élément, après l'avoir ajouté.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7',
  },
  headerTitle: { fontSize: 15, fontWeight: '500', color: '#2C2C2A', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  cancelBtn: { padding: 4, minWidth: 60 },
  cancelText: { fontSize: 16, color: '#888780' },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#E24B4A', borderRadius: 8, minWidth: 60, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 40 },

  preview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    marginBottom: 4,
  },
  previewEmoji: { fontSize: 24 },
  previewTitle: { fontSize: 15, fontWeight: '500', color: '#2C2C2A' },
  previewSubtitle: { fontSize: 12, color: '#888780', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  section: { gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#B4B2A9', letterSpacing: 0.8 },
  optional: { fontWeight: '400', color: '#C9C7BE' },

  input: {
    borderWidth: 0.5, borderColor: '#D3D1C7', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#2C2C2A', backgroundColor: '#fff',
  },
  textarea: { minHeight: 90, paddingTop: 12 },

  statusGrid: { gap: 8 },
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#D3D1C7',
    backgroundColor: '#fff',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { flex: 1, fontSize: 14, color: '#888780' },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, backgroundColor: '#F8F7F4', borderRadius: 10,
  },
  infoText: { flex: 1, fontSize: 12, color: '#888780', lineHeight: 18 },
});
