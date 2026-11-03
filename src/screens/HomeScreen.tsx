import { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { AddEditItemModal } from '../components/AddEditItemModal';
import { EmptyList } from '../components/EmptyList';
import { HydrationErrorState } from '../components/HydrationErrorState';
import { LoadingState } from '../components/LoadingState';
import { SectionGroup } from '../components/SectionGroup';
import { TotalSummary } from '../components/TotalSummary';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { Item, ItemInput } from '../models/item';
import {
  hydrateListStore,
  retryListHydration,
  selectTotals,
  useListStore,
} from '../store/useListStore';
import { groupItemsBySection } from '../utils/grouping';

type ModalState = { item: Item | null } | null;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const items = useListStore((state) => state.items);
  const hydrationStatus = useListStore((state) => state.hydrationStatus);
  const persistenceError = useListStore((state) => state.persistenceError);
  const addItem = useListStore((state) => state.addItem);
  const updateItem = useListStore((state) => state.updateItem);
  const deleteItem = useListStore((state) => state.deleteItem);
  const toggleItem = useListStore((state) => state.toggleItem);
  const totals = useListStore(useShallow(selectTotals));
  const [modalState, setModalState] = useState<ModalState>(null);
  const groups = useMemo(() => groupItemsBySection(items), [items]);

  useEffect(() => {
    void hydrateListStore();
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      toggleItem(id);
      // O feedback tátil é progressivo: sua ausência não impede a alternância do status.
      void Haptics.selectionAsync().catch(() => undefined);
    },
    [toggleItem],
  );

  const handleDelete = useCallback(
    (item: Item) => {
      Alert.alert('Excluir item?', `“${item.name}” será removido da sua lista.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteItem(item.id) },
      ]);
    },
    [deleteItem],
  );

  const handleSave = useCallback(
    (input: ItemInput, id?: string) => {
      if (id === undefined) {
        addItem(input);
      } else {
        updateItem(id, input);
      }
      setModalState(null);
    },
    [addItem, updateItem],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {hydrationStatus === 'loading' ? (
        <LoadingState />
      ) : hydrationStatus === 'error' ? (
        <HydrationErrorState onRetry={() => void retryListHydration()} />
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="basket-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>LISTA INTELIGENTE</Text>
              <Text style={styles.title}>Minha lista</Text>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <TotalSummary totals={totals} />
          </View>

          {persistenceError ? (
            <View style={styles.persistenceWarning} accessibilityLiveRegion="assertive">
              <MaterialCommunityIcons name="alert-circle-outline" size={19} color={colors.danger} />
              <Text style={styles.persistenceWarningText}>
                Alteração mantida em memória, mas não foi possível salvar no dispositivo.
              </Text>
            </View>
          ) : null}

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Itens por seção</Text>
            <Text style={styles.sectionCount}>
              {groups.length} {groups.length === 1 ? 'seção' : 'seções'}
            </Text>
          </View>

          <FlatList
            data={groups}
            keyExtractor={(group) => group.section.id}
            renderItem={({ item: group }) => (
              <SectionGroup
                group={group}
                onToggle={handleToggle}
                onEdit={(item) => setModalState({ item })}
                onDelete={handleDelete}
              />
            )}
            ListEmptyComponent={EmptyList}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ListSeparator}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <Pressable
              onPress={() => setModalState({ item: null })}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Adicionar item"
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.onPrimary} />
              <Text style={styles.addButtonText}>Adicionar item</Text>
            </Pressable>
          </View>

          {modalState ? (
            <AddEditItemModal
              item={modalState.item ?? undefined}
              onClose={() => setModalState(null)}
              onSave={handleSave}
            />
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  title: { fontSize: typography.title, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  summaryContainer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  persistenceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
  },
  persistenceWarningText: {
    flex: 1,
    fontSize: typography.small,
    lineHeight: 18,
    color: colors.danger,
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listTitle: { fontSize: typography.subtitle, fontWeight: '800', color: colors.text },
  sectionCount: { fontSize: typography.small, color: colors.textSecondary, fontWeight: '600' },
  listContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  separator: { height: spacing.xl },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  addButtonText: { color: colors.onPrimary, fontSize: typography.bodyLarge, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
