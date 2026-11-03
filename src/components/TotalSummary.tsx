import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../constants/theme';
import type { Totals } from '../models/item';
import { formatCurrency } from '../utils/currency';

interface TotalSummaryProps {
  totals: Totals;
}

export function TotalSummary({ totals }: TotalSummaryProps) {
  const itemLabel = `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'itens'}`;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Resumo da lista: ${itemLabel}. Total ${formatCurrency(totals.totalCents)}. No carrinho ${formatCurrency(totals.cartCents)}. Pendentes ${formatCurrency(totals.pendingCents)}.`}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Total da lista</Text>
        <View style={styles.countBadge}>
          <Text style={styles.count}>{itemLabel}</Text>
        </View>
      </View>
      <Text style={styles.total}>{formatCurrency(totals.totalCents)}</Text>

      <View style={styles.divider} />
      <View style={styles.subtotals}>
        <View style={styles.subtotal}>
          <View style={styles.subtotalLabel}>
            <MaterialCommunityIcons name="cart-check" size={17} color={colors.onPrimaryMuted} />
            <Text style={styles.subtotalTitle}>No carrinho</Text>
          </View>
          <Text style={styles.subtotalValue}>{formatCurrency(totals.cartCents)}</Text>
          <Text style={styles.subtotalCount}>
            {totals.cartCount} {totals.cartCount === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        <View style={styles.subtotal}>
          <View style={styles.subtotalLabel}>
            <MaterialCommunityIcons name="clock-outline" size={17} color={colors.onPrimaryMuted} />
            <Text style={styles.subtotalTitle}>Pendentes</Text>
          </View>
          <Text style={styles.subtotalValue}>{formatCurrency(totals.pendingCents)}</Text>
          <Text style={styles.subtotalCount}>
            {totals.pendingCount} {totals.pendingCount === 1 ? 'item' : 'itens'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.onPrimaryMuted, fontSize: typography.body, fontWeight: '700' },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  count: { color: colors.onPrimary, fontSize: typography.caption, fontWeight: '800' },
  total: {
    color: colors.onPrimary,
    fontSize: typography.total,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  divider: { height: 1, backgroundColor: colors.primary, marginVertical: spacing.sm },
  subtotals: { flexDirection: 'row', gap: spacing.lg },
  subtotal: { flex: 1, gap: spacing.xs },
  subtotalLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  subtotalTitle: { color: colors.onPrimaryMuted, fontSize: typography.small, fontWeight: '700' },
  subtotalValue: { color: colors.onPrimary, fontSize: typography.subtitle, fontWeight: '800' },
  subtotalCount: { color: colors.onPrimaryMuted, fontSize: typography.caption },
});
