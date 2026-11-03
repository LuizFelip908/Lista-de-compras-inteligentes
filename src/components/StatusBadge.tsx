import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../constants/theme';
import type { ItemStatus } from '../models/item';

interface StatusBadgeProps {
  status: ItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isInCart = status === 'no_carrinho';

  return (
    <View style={[styles.badge, isInCart ? styles.cartBadge : styles.pendingBadge]}>
      <MaterialCommunityIcons
        name={isInCart ? 'check-circle' : 'clock-outline'}
        size={14}
        color={isInCart ? colors.cart : colors.pending}
      />
      <Text style={[styles.label, isInCart ? styles.cartLabel : styles.pendingLabel]}>
        {isInCart ? 'No carrinho' : 'Pendente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  cartBadge: { backgroundColor: colors.cartSoft },
  pendingBadge: { backgroundColor: colors.pendingSoft },
  label: { fontSize: typography.caption, fontWeight: '700' },
  cartLabel: { color: colors.cart },
  pendingLabel: { color: colors.pending },
});
