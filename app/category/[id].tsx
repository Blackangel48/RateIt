import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategoriesStore } from '../../src/store/categoriesStore';
import { useItemsStore } from '../../src/store/itemsStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../src/constants/statuses';
import type { Item, Category } from '../../src/db/schema';

const ALL_FILTER = 0; // 0 = tous

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = parseInt(id, 10);

  const { categories, fetchCategories, deleteCategory } = useCategoriesStore();
  const { items, fetchItems, deleteItem } = useItemsStore();

  const [filterStatus, setFilterStatus] = useState<number>(ALL_FILTER);

  const category: Category | undefined = categories.find(c => c.id === categoryId);

  // Recharge les items à chaque fois qu'on revient sur cet écran
  useFocusEffect(
    useCallback(() => {
      fetchItems(categoryId);
      if (categories.length === 0) fetchCategories();
    }, [categoryId])
  );

  // Filtrage local
  const filteredItems = filterStatus === ALL_FILTER
    ? items
    : items.filter(i => i.statusId === filterStatus);

  const handleDeleteCategory = () => {
    Alert.alert(
      'Supprimer la catégorie',
      `Supprimer "${category?.name}" et tous ses éléments ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            await deleteCategory(categoryId);
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${item.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteItem(item.id) },
      ]
    );
  };

  const formatScore = (score: number | null | undefined) => {
    if (score == null) return '—';
    return `${score}`;
  };

  const renderItem = ({ item }: { item: Item }) => {
    const statusColor = item.statusId ? STATUS_COLORS[item.statusId] : null;
    const statusLabel = item.statusId ? STATUS_LABELS[item.statusId] : null;

    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => router.push(`/item/${item.id}`)}
        onLongPress={() => handleDeleteItem(item)}
        activeOpacity={0.7}
      >
        {/* Image ou placeholder */}
        <View style={[styles.itemImg, { backgroundColor: category?.color ?? '#F1EFE8' }]}>
          <Text style={styles.itemImgEmoji}>{category?.icon ?? '📁'}</Text>
        </View>

        <View style={styles.itemBody}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.itemSubRow}>
            {item.subtitle ? (
              <Text style={styles.itemSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            ) : null}
            {statusLabel && statusColor ? (
              <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                <Text style={[styles.badgeText, { color: statusColor.text }]}>{statusLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemScore}>{formatScore(item.score)}</Text>
          {category && item.score != null && (
            <Text style={styles.itemScoreMax}>/{category.scoreMax}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Catégorie introuvable</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2C2C2A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: category.color ?? '#F1EFE8' }]}>
            <Text style={{ fontSize: 18 }}>{category.icon ?? '📁'}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{category.name}</Text>
            <Text style={styles.headerMeta}>
              {items.length} élément{items.length !== 1 ? 's' : ''} · /{category.scoreMax} · grain {category.scoreGrain}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDeleteCategory} style={styles.moreBtn}>
          <Ionicons name="trash-outline" size={20} color="#C9C7BE" />
        </TouchableOpacity>
      </View>

      {/* Filtres par statut */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === ALL_FILTER && styles.filterChipActive]}
          onPress={() => setFilterStatus(ALL_FILTER)}
        >
          <Text style={[styles.filterChipText, filterStatus === ALL_FILTER && styles.filterChipTextActive]}>
            Tous ({items.length})
          </Text>
        </TouchableOpacity>
        {[1, 2, 3, 4].map(statusId => {
          const count = items.filter(i => i.statusId === statusId).length;
          if (count === 0) return null;
          const color = STATUS_COLORS[statusId];
          const isActive = filterStatus === statusId;
          return (
            <TouchableOpacity
              key={statusId}
              style={[styles.filterChip, isActive && { backgroundColor: color.bg, borderColor: color.text + '40' }]}
              onPress={() => setFilterStatus(isActive ? ALL_FILTER : statusId)}
            >
              <View style={[styles.filterDot, { backgroundColor: color.text }]} />
              <Text style={[styles.filterChipText, isActive && { color: color.text, fontWeight: '600' }]}>
                {STATUS_LABELS[statusId]} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Liste */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {filterStatus !== ALL_FILTER
                ? 'Aucun élément avec ce statut.'
                : 'Aucun élément pour l\'instant.'}
            </Text>
            {filterStatus === ALL_FILTER && (
              <TouchableOpacity onPress={() => router.push({ pathname: '/item/new', params: { categoryId } })}>
                <Text style={styles.linkText}>Ajouter le premier →</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/item/new', params: { categoryId } })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 80 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7',
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 38, height: 38, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '500', color: '#2C2C2A' },
  headerMeta: { fontSize: 11, color: '#888780', marginTop: 1 },
  moreBtn: { padding: 6 },

  filterBar: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    gap: 8, flexWrap: 'wrap',
    borderBottomWidth: 0.5, borderBottomColor: '#F1EFE8',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 99, borderWidth: 0.5, borderColor: '#D3D1C7',
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#FCEBEB', borderColor: '#F09595' },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterChipText: { fontSize: 12, color: '#888780' },
  filterChipTextActive: { color: '#A32D2D', fontWeight: '600' },

  list: { padding: 12, paddingBottom: 96 },
  separator: { height: 8 },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#D3D1C7',
    backgroundColor: '#fff',
  },
  itemImg: {
    width: 42, height: 42, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  itemImgEmoji: { fontSize: 20 },
  itemBody: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 14, fontWeight: '500', color: '#2C2C2A' },
  itemSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  itemSubtitle: { fontSize: 12, color: '#888780', flexShrink: 1 },
  badge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: { fontSize: 10, fontWeight: '600' },
  itemRight: { alignItems: 'flex-end' },
  itemScore: { fontSize: 16, fontWeight: '500', color: '#2C2C2A' },
  itemScoreMax: { fontSize: 10, color: '#B4B2A9' },

  emptyText: { fontSize: 14, color: '#888780', textAlign: 'center' },
  linkText: { fontSize: 14, color: '#E24B4A' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#E24B4A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#E24B4A', shadowOpacity: 0.4,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
