import { memo } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '../constants/theme';
import type { Item } from '../models/item';
import { formatCurrency } from '../utils/currency';
import { calculateItemTotalCents } from '../utils/totals';
import { StatusBadge } from './StatusBadge';

interface ItemRowProps {
  item: Item;
  onToggle: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export const ItemRow = memo(function ItemRow({ item, onToggle, onEdit, onDelete }: ItemRowProps) {
  const isInCart = item.status === 'no_carrinho';
  const statusText = isInCart ? 'no carrinho' : 'pendente';
  const itemTotal = formatCurrency(calculateItemTotalCents(item));

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <Pressable
          onPress={() => onToggle(item.id)}
          style={({ pressed }) => [styles.statusButton, pressed && styles.pressed]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isInCart }}
          accessibilityLabel={`${item.name}, ${item.quantity} unidades, ${itemTotal}, ${statusText}. Toque para alternar o status.`}
          accessibilityHint="Alterna entre pendente e no carrinho."
        >
          <View style={[styles.checkbox, isInCart && styles.checkboxChecked]}>
            {isInCart ? (
              <MaterialCommunityIcons name="check" size={18} color={colors.onPrimary} />
            ) : null}
          </View>
          <View style={styles.itemText}>
            <Text style={[styles.name, isInCart && styles.nameInCart]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.detail}>
              {item.quantity} × {formatCurrency(item.unitPriceCents)}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${item.name}`}
          hitSlop={4}
        >
          <MaterialCommunityIcons name="pencil-outline" size={21} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => onDelete(item)}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${item.name}`}
          hitSlop={4}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={21} color={colors.danger} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={item.status} />
        <Text style={[styles.total, isInCart && styles.totalInCart]}>{itemTotal}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mainRow: { flexDirection: 'row', alignItems: 'center' },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.65 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemText: { flex: 1, gap: 2 },
  name: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.text },
  nameInCart: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  detail: { fontSize: typography.small, color: colors.textSecondary },
  iconButton: {
    width: minimumTouchTarget,
    height: minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 38,
    paddingBottom: spacing.xs,
  },
  total: { fontSize: typography.bodyLarge, fontWeight: '800', color: colors.text },
  totalInCart: { color: colors.cart },
});
