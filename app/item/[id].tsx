import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useItemsStore } from '../../src/store/itemsStore';
import { useCategoriesStore } from '../../src/store/categoriesStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../src/constants/statuses';
import { roundToGrain } from '../../src/utils/scoring';
import type { Category, Item, Criterion, ItemCriterionScore } from '../../src/db/schema';

const STATUS_IDS = [1, 2, 3, 4];

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = parseInt(id, 10);

  const { items, updateItem, deleteItem, saveCriterionScore, getCriterionScores } = useItemsStore();
  const { categories, getCriteria } = useCategoriesStore();

  const [item, setItem] = useState<Item | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [criteriaScores, setCriteriaScores] = useState<Record<number, number>>({});
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingField, setEditingField] = useState<'title' | 'subtitle' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Charger les données
  useFocusEffect(
    useCallback(() => {
      const found = items.find(i => i.id === itemId);
      if (found) {
        setItem(found);
        setGlobalScore(found.score ?? null);
        const cat = categories.find(c => c.id === found.categoryId);
        if (cat) setCategory(cat);

        // Charger critères + scores
        getCriteria(found.categoryId).then(setCriteria);
        getCriterionScores(itemId).then(scores => {
          const map: Record<number, number> = {};
          scores.forEach(s => { map[s.criterionId] = s.score; });
          setCriteriaScores(map);
        });
      }
    }, [itemId, items])
  );

  // ── Notation ────────────────────────────────────────────────────────────────

  const grain = category?.scoreGrain ?? 0.5;
  const max = category?.scoreMax ?? 10;

  const handleCriterionChange = (criterionId: number, value: number) => {
    const rounded = roundToGrain(value, grain);
    setCriteriaScores(prev => ({ ...prev, [criterionId]: rounded }));
  };

  const handleCriterionRelease = async (criterionId: number, value: number) => {
    const rounded = roundToGrain(value, grain);
    await saveCriterionScore(itemId, criterionId, rounded);

    // Calcul auto de la moyenne si tous les critères sont notés
    if (criteria.length > 0) {
      const allScores = { ...criteriaScores, [criterionId]: rounded };
      const notedAll = criteria.every(c => allScores[c.id] != null);
      if (notedAll) {
        const avg = criteria.reduce((sum, c) => sum + (allScores[c.id] ?? 0), 0) / criteria.length;
        const avgRounded = roundToGrain(avg, grain);
        setGlobalScore(avgRounded);
        await updateItem(itemId, { score: avgRounded });
      }
    }
  };

  const handleGlobalScoreChange = (value: number) => {
    setGlobalScore(roundToGrain(value, grain));
  };

  const handleGlobalScoreRelease = async (value: number) => {
    const rounded = roundToGrain(value, grain);
    setGlobalScore(rounded);
    await updateItem(itemId, { score: rounded });
  };

  const handleResetScore = () => {
    Alert.alert('Réinitialiser', 'Supprimer toutes les notes de cet élément ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Réinitialiser', style: 'destructive',
        onPress: async () => {
          setGlobalScore(null);
          setCriteriaScores({});
          await updateItem(itemId, { score: null });
        },
      },
    ]);
  };

  // ── Statut ───────────────────────────────────────────────────────────────────

  const handleStatusChange = async (newStatusId: number) => {
    setShowStatusModal(false);
    if (!item) return;
    setItem(prev => prev ? { ...prev, statusId: newStatusId } : prev);
    await updateItem(itemId, { statusId: newStatusId });
  };

  // ── Édition inline ───────────────────────────────────────────────────────────

  const startEdit = (field: 'title' | 'subtitle' | 'description') => {
    if (!item) return;
    setEditValue(item[field] ?? '');
    setEditingField(field);
  };

  const saveEdit = async () => {
    if (!editingField || !item) return;
    if (editingField === 'title' && !editValue.trim()) {
      Alert.alert('Titre requis');
      return;
    }
    const updated = { [editingField]: editValue.trim() || null };
    setItem(prev => prev ? { ...prev, ...updated } : prev);
    await updateItem(itemId, updated);
    setEditingField(null);
  };

  // ── Suppression ──────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert('Supprimer', `Supprimer "${item?.title}" définitivement ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await deleteItem(itemId);
          router.back();
        },
      },
    ]);
  };

  // ── Rendu ────────────────────────────────────────────────────────────────────

  if (!item || !category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.mutedText}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = item.statusId ? STATUS_COLORS[item.statusId] : STATUS_COLORS[3];
  const statusLabel = item.statusId ? STATUS_LABELS[item.statusId] : STATUS_LABELS[3];
  const scorePercent = globalScore != null ? globalScore / max : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2C2C2A" />
        </TouchableOpacity>
        <View style={[styles.headerIconBox, { backgroundColor: category.color ?? '#F1EFE8' }]}>
          <Text style={{ fontSize: 18 }}>{category.icon ?? '📁'}</Text>
        </View>
        <Text style={styles.headerCatName}>{category.name}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#C9C7BE" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Titre + sous-titre éditables */}
        <View style={styles.titleBlock}>
          <TouchableOpacity onPress={() => startEdit('title')} activeOpacity={0.7}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => startEdit('subtitle')} activeOpacity={0.7}>
            <Text style={styles.itemSubtitle}>
              {item.subtitle || <Text style={styles.placeholderText}>Ajouter un sous-titre…</Text>}
            </Text>
          </TouchableOpacity>

          {/* Statut */}
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
            onPress={() => setShowStatusModal(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor.text }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>{statusLabel}</Text>
            <Ionicons name="chevron-down" size={12} color={statusColor.text} />
          </TouchableOpacity>
        </View>

        {/* Score global */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardTop}>
            <View>
              <Text style={styles.scoreCardLabel}>NOTE GLOBALE</Text>
              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreValue}>
                  {globalScore != null ? globalScore : '—'}
                </Text>
                <Text style={styles.scoreMax}>/{max}</Text>
              </View>
            </View>
            {globalScore != null && (
              <TouchableOpacity onPress={handleResetScore} style={styles.resetBtn}>
                <Ionicons name="refresh" size={16} color="#B4B2A9" />
              </TouchableOpacity>
            )}
          </View>

          {/* Barre de progression */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {
              width: `${scorePercent * 100}%`,
              backgroundColor: scorePercent >= 0.8 ? '#639922' : scorePercent >= 0.5 ? '#EF9F27' : '#E24B4A',
            }]} />
          </View>

          {/* Slider global */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={max}
            step={grain}
            value={globalScore ?? 0}
            onValueChange={handleGlobalScoreChange}
            onSlidingComplete={handleGlobalScoreRelease}
            minimumTrackTintColor="#E24B4A"
            maximumTrackTintColor="#E8E6DE"
            thumbTintColor="#E24B4A"
          />
          <View style={styles.sliderBounds}>
            <Text style={styles.sliderBoundText}>0</Text>
            <Text style={styles.sliderBoundText}>{max}</Text>
          </View>
        </View>

        {/* Critères */}
        {criteria.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CRITÈRES</Text>
            {criteria.map(criterion => {
              const score = criteriaScores[criterion.id];
              const pct = score != null ? score / max : 0;
              return (
                <View key={criterion.id} style={styles.criterionCard}>
                  <View style={styles.criterionTop}>
                    <Text style={styles.criterionLabel}>{criterion.label}</Text>
                    <Text style={styles.criterionScore}>
                      {score != null ? score : '—'}
                      <Text style={styles.criterionMax}>/{max}</Text>
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={max}
                    step={grain}
                    value={score ?? 0}
                    onValueChange={(v) => handleCriterionChange(criterion.id, v)}
                    onSlidingComplete={(v) => handleCriterionRelease(criterion.id, v)}
                    minimumTrackTintColor={pct >= 0.8 ? '#639922' : pct >= 0.5 ? '#EF9F27' : '#E24B4A'}
                    maximumTrackTintColor="#E8E6DE"
                    thumbTintColor="#2C2C2A"
                  />
                </View>
              );
            })}
            {criteria.every(c => criteriaScores[c.id] != null) && (
              <View style={styles.autoAvgHint}>
                <Ionicons name="sparkles" size={13} color="#639922" />
                <Text style={styles.autoAvgText}>Moyenne calculée automatiquement</Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <TouchableOpacity
            style={styles.descriptionBox}
            onPress={() => startEdit('description')}
            activeOpacity={0.7}
          >
            <Text style={item.description ? styles.descriptionText : styles.placeholderText}>
              {item.description || 'Ajouter des notes, impressions…'}
            </Text>
            <Ionicons name="pencil" size={14} color="#C9C7BE" style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        {/* Métadonnées */}
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>
            Ajouté le {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '—'}
          </Text>
          {item.updatedAt && item.updatedAt !== item.createdAt && (
            <Text style={styles.metaText}>
              Modifié le {new Date(item.updatedAt).toLocaleDateString('fr-FR')}
            </Text>
          )}
        </View>

      </ScrollView>

      {/* Modal changement de statut */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatusModal(false)}>
          <View style={styles.statusSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Changer le statut</Text>
            {STATUS_IDS.map(sid => {
              const color = STATUS_COLORS[sid];
              const isActive = item.statusId === sid;
              return (
                <TouchableOpacity
                  key={sid}
                  style={[styles.statusOption, isActive && { backgroundColor: color.bg }]}
                  onPress={() => handleStatusChange(sid)}
                >
                  <View style={[styles.statusDot, { backgroundColor: color.text }]} />
                  <Text style={[styles.statusOptionText, isActive && { color: color.text, fontWeight: '600' }]}>
                    {STATUS_LABELS[sid]}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color={color.text} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* Modal édition inline */}
      <Modal
        visible={editingField !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingField(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditingField(null)}>
          <View style={styles.editSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingField === 'title' ? 'Titre' : editingField === 'subtitle' ? 'Sous-titre' : 'Description'}
            </Text>
            <TextInput
              style={[styles.editInput, editingField === 'description' && styles.editTextarea]}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              multiline={editingField === 'description'}
              numberOfLines={editingField === 'description' ? 5 : 1}
              textAlignVertical={editingField === 'description' ? 'top' : 'center'}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.editCancelBtn} onPress={() => setEditingField(null)}>
                <Text style={styles.editCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editSaveBtn} onPress={saveEdit}>
                <Text style={styles.editSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mutedText: { fontSize: 14, color: '#888780' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7',
  },
  backBtn: { padding: 4 },
  headerIconBox: {
    width: 30, height: 30, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCatName: { flex: 1, fontSize: 14, color: '#888780' },
  deleteBtn: { padding: 6 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 48 },

  titleBlock: { gap: 8 },
  itemTitle: { fontSize: 22, fontWeight: '600', color: '#2C2C2A', lineHeight: 28 },
  itemSubtitle: { fontSize: 15, color: '#888780' },
  placeholderText: { color: '#C9C7BE', fontStyle: 'italic' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 99,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },

  scoreCard: {
    padding: 16, borderRadius: 14,
    borderWidth: 0.5, borderColor: '#D3D1C7',
    backgroundColor: '#FAFAF8', gap: 10,
  },
  scoreCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  scoreCardLabel: { fontSize: 10, fontWeight: '700', color: '#B4B2A9', letterSpacing: 1 },
  scoreDisplay: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 4 },
  scoreValue: { fontSize: 40, fontWeight: '600', color: '#2C2C2A', lineHeight: 46 },
  scoreMax: { fontSize: 18, color: '#B4B2A9' },
  resetBtn: { padding: 8 },

  progressTrack: {
    height: 6, borderRadius: 3, backgroundColor: '#E8E6DE', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  slider: { width: '100%', height: 36, marginHorizontal: -8 },
  sliderBounds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  sliderBoundText: { fontSize: 11, color: '#C9C7BE' },

  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#B4B2A9', letterSpacing: 0.8 },

  criterionCard: {
    padding: 12, borderRadius: 10,
    backgroundColor: '#F8F7F4', gap: 4,
  },
  criterionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  criterionLabel: { fontSize: 14, fontWeight: '500', color: '#2C2C2A' },
  criterionScore: { fontSize: 16, fontWeight: '600', color: '#2C2C2A' },
  criterionMax: { fontSize: 11, color: '#B4B2A9', fontWeight: '400' },

  autoAvgHint: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 4,
  },
  autoAvgText: { fontSize: 12, color: '#639922' },

  descriptionBox: {
    padding: 14, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#D3D1C7',
    flexDirection: 'row', gap: 8,
  },
  descriptionText: { flex: 1, fontSize: 14, color: '#2C2C2A', lineHeight: 20 },
  editIcon: { marginTop: 2 },

  metaBox: { gap: 3, paddingTop: 4 },
  metaText: { fontSize: 11, color: '#C9C7BE' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  statusSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 4,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D3D1C7',
    alignSelf: 'center', marginBottom: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '500', color: '#2C2C2A', marginBottom: 8 },
  statusOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 10,
  },
  statusOptionText: { flex: 1, fontSize: 15, color: '#2C2C2A' },

  editSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 12,
  },
  editInput: {
    borderWidth: 0.5, borderColor: '#D3D1C7', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#2C2C2A',
  },
  editTextarea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  editActions: { flexDirection: 'row', gap: 10 },
  editCancelBtn: {
    flex: 1, padding: 13, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#D3D1C7', alignItems: 'center',
  },
  editCancelText: { fontSize: 15, color: '#888780' },
  editSaveBtn: {
    flex: 1, padding: 13, borderRadius: 10,
    backgroundColor: '#E24B4A', alignItems: 'center',
  },
  editSaveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
