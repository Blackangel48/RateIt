import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Pressable, Modal, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategoriesStore } from '../../src/store/categoriesStore';

// ─── Données statiques ────────────────────────────────────────────────────────

const EMOJIS = [
  '🎬','🎵','🎮','📚','🍷','🍕','🏋️','🎨','✈️','⚽',
  '🎸','📷','🎭','🎤','🏄','🌿','🧪','💻','👗','🎲',
  '🏔️','🐾','🌮','☕','🎯','🛸','🎻','🏆','🌸','🦋',
];

const COLOR_PALETTE = [
  { bg: '#FAEEDA', border: '#EF9F27' },
  { bg: '#E6F1FB', border: '#5BA3D9' },
  { bg: '#E1F5EE', border: '#3DAB7A' },
  { bg: '#FBEAF0', border: '#D95F8A' },
  { bg: '#EEEDFE', border: '#7B6FD4' },
  { bg: '#F1EFE8', border: '#8A8778' },
  { bg: '#FDE8E8', border: '#E24B4A' },
  { bg: '#E8F4FD', border: '#2196F3' },
];

const GRAIN_OPTIONS = [0.1, 0.25, 0.5, 1];
const MAX_OPTIONS = [5, 10, 20, 100];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function NewCategoryScreen() {
  const router = useRouter();
  const { createCategory } = useCategoriesStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState(COLOR_PALETTE[0].bg);
  const [scoreMax, setScoreMax] = useState(10);
  const [scoreGrain, setScoreGrain] = useState(0.5);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const criterionInputRef = useRef<TextInput>(null);

  const addCriterion = () => {
    const trimmed = newCriterion.trim();
    if (!trimmed) return;
    setCriteria(prev => [...prev, trimmed]);
    setNewCriterion('');
    criterionInputRef.current?.focus();
  };

  const removeCriterion = (index: number) => {
    setCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nom requis', 'Donne un nom à ta catégorie.');
      return;
    }
    setSaving(true);
    try {
      await createCategory(
        { name: name.trim(), icon, color, scoreMax, scoreGrain },
        criteria
      );
      router.back();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de créer la catégorie.');
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
        <Text style={styles.headerTitle}>Nouvelle catégorie</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? '...' : 'Créer'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Aperçu */}
        <View style={styles.previewRow}>
          <TouchableOpacity
            style={[styles.previewIcon, { backgroundColor: color }]}
            onPress={() => setShowEmojiPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.previewEmoji}>{icon}</Text>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={10} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName} numberOfLines={1}>
              {name || 'Nom de la catégorie'}
            </Text>
            <Text style={styles.previewMeta}>
              /{scoreMax} · grain {scoreGrain}
            </Text>
          </View>
        </View>

        {/* Nom */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOM</Text>
          <TextInput
            style={styles.input}
            placeholder="Films, Albums, Restaurants..."
            placeholderTextColor="#B4B2A9"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
          />
        </View>

        {/* Couleur */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COULEUR</Text>
          <View style={styles.colorRow}>
            {COLOR_PALETTE.map((c) => (
              <TouchableOpacity
                key={c.bg}
                style={[
                  styles.colorDot,
                  { backgroundColor: c.bg, borderColor: c.border },
                  color === c.bg && styles.colorDotSelected,
                ]}
                onPress={() => setColor(c.bg)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>

        {/* Barème */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTE MAXIMALE</Text>
          <View style={styles.chipRow}>
            {MAX_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, scoreMax === v && styles.chipActive]}
                onPress={() => setScoreMax(v)}
              >
                <Text style={[styles.chipText, scoreMax === v && styles.chipTextActive]}>
                  /{v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grain */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRÉCISION (GRAIN)</Text>
          <View style={styles.chipRow}>
            {GRAIN_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, scoreGrain === v && styles.chipActive]}
                onPress={() => setScoreGrain(v)}
              >
                <Text style={[styles.chipText, scoreGrain === v && styles.chipTextActive]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.grainHint}>
            Ex. avec /{scoreMax} au grain {scoreGrain} : …{' '}
            {[...Array(4)].map((_, i) =>
              parseFloat((scoreMax - i * scoreGrain).toFixed(2))
            ).reverse().join(' · ')} · …
          </Text>
        </View>

        {/* Critères */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CRITÈRES DE NOTATION (optionnel)</Text>
          <Text style={styles.sectionHint}>
            Décompose la note en sous-critères. Ex : Scénario, Réalisation, Jeu d'acteur.
          </Text>

          {criteria.map((c, i) => (
            <View key={i} style={styles.criterionRow}>
              <View style={styles.criterionDot} />
              <Text style={styles.criterionLabel} numberOfLines={1}>{c}</Text>
              <TouchableOpacity onPress={() => removeCriterion(i)} style={styles.removeBtn}>
                <Ionicons name="close-circle" size={18} color="#C9C7BE" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.criterionInputRow}>
            <TextInput
              ref={criterionInputRef}
              style={styles.criterionInput}
              placeholder="Ajouter un critère…"
              placeholderTextColor="#B4B2A9"
              value={newCriterion}
              onChangeText={setNewCriterion}
              onSubmitEditing={addCriterion}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addCriterionBtn, !newCriterion.trim() && styles.addCriterionBtnDisabled]}
              onPress={addCriterion}
              disabled={!newCriterion.trim()}
            >
              <Ionicons name="add" size={20} color={newCriterion.trim() ? '#E24B4A' : '#C9C7BE'} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEmojiPicker(false)}>
          <View style={styles.emojiSheet}>
            <View style={styles.emojiHandle} />
            <Text style={styles.emojiTitle}>Choisir une icône</Text>
            <FlatList
              data={EMOJIS}
              numColumns={7}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.emojiItem, icon === item && styles.emojiItemSelected]}
                  onPress={() => { setIcon(item); setShowEmojiPicker(false); }}
                >
                  <Text style={styles.emojiItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7',
  },
  headerTitle: { fontSize: 16, fontWeight: '500', color: '#2C2C2A' },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 16, color: '#888780' },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#E24B4A', borderRadius: 8 },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 40 },

  previewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, backgroundColor: '#F8F7F4',
    borderRadius: 12, borderWidth: 0.5, borderColor: '#D3D1C7',
  },
  previewIcon: {
    width: 56, height: 56, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  previewEmoji: { fontSize: 28 },
  editBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#888780',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#F8F7F4',
  },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 17, fontWeight: '500', color: '#2C2C2A' },
  previewMeta: { fontSize: 13, color: '#888780', marginTop: 2 },

  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#B4B2A9', letterSpacing: 0.8 },
  sectionHint: { fontSize: 13, color: '#888780', marginTop: -4 },

  input: {
    borderWidth: 0.5, borderColor: '#D3D1C7', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#2C2C2A',
  },

  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5,
  },
  colorDotSelected: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 99, borderWidth: 0.5, borderColor: '#D3D1C7',
  },
  chipActive: { backgroundColor: '#FCEBEB', borderColor: '#F09595' },
  chipText: { fontSize: 14, color: '#888780' },
  chipTextActive: { color: '#A32D2D', fontWeight: '600' },
  grainHint: { fontSize: 12, color: '#B4B2A9', fontStyle: 'italic' },

  criterionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: '#F8F7F4', borderRadius: 8,
  },
  criterionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E24B4A' },
  criterionLabel: { flex: 1, fontSize: 14, color: '#2C2C2A' },
  removeBtn: { padding: 2 },

  criterionInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 0.5, borderColor: '#D3D1C7', borderRadius: 10,
    paddingLeft: 14, paddingRight: 8,
  },
  criterionInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: '#2C2C2A' },
  addCriterionBtn: { padding: 6 },
  addCriterionBtnDisabled: { opacity: 0.4 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  emojiSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 16, maxHeight: '60%',
  },
  emojiHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D3D1C7',
    alignSelf: 'center', marginBottom: 12,
  },
  emojiTitle: { fontSize: 15, fontWeight: '500', color: '#2C2C2A', marginBottom: 12, textAlign: 'center' },
  emojiItem: {
    flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, margin: 3,
  },
  emojiItemSelected: { backgroundColor: '#FCEBEB' },
  emojiItemText: { fontSize: 26 },
});
