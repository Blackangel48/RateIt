import { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategoriesStore } from '@/store/categoriesStore';
import type { Category } from '@/db/schema';

export default function HomeScreen() {
  const router = useRouter();
  const { categories, fetchCategories } = useCategoriesStore();

  useEffect(() => { fetchCategories(); }, []);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/category/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color ?? '#F1EFE8' }]}>
        <Text style={styles.iconText}>{item.icon ?? '📁'}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardMeta}>barème /{item.scoreMax} · grain {item.scoreGrain}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#B4B2A9" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>RateIt</Text>
          <Text style={styles.subtitle}>{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/category/new')}>
          <Ionicons name="add" size={24} color="#E24B4A" />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune catégorie pour l'instant.</Text>
            <TouchableOpacity onPress={() => router.push('/category/new')}>
              <Text style={styles.emptyLink}>Créer ma première catégorie →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#D3D1C7',
  },
  title: { fontSize: 22, fontWeight: '500', color: '#2C2C2A' },
  subtitle: { fontSize: 12, color: '#888780', marginTop: 2 },
  addBtn: { padding: 6 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 0.5, borderColor: '#D3D1C7',
    backgroundColor: '#fff',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '500', color: '#2C2C2A' },
  cardMeta: { fontSize: 12, color: '#888780', marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#888780' },
  emptyLink: { fontSize: 14, color: '#E24B4A' },
});
