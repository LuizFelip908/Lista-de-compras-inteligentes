import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../constants/theme';
import type { Item } from '../models/item';
import type { SectionGroupData } from '../utils/grouping';
import { ItemRow } from './ItemRow';

interface SectionGroupProps {
  group: SectionGroupData;
  onToggle: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function SectionGroup({ group, onToggle, onEdit, onDelete }: SectionGroupProps) {
  const countLabel = `${group.items.length} ${group.items.length === 1 ? 'item' : 'itens'}`;

  return (
    <View style={styles.group}>
      <View style={styles.header} accessibilityRole="header">
        <View style={[styles.iconBox, { backgroundColor: group.section.backgroundColor }]}>
          <MaterialCommunityIcons name={group.section.icon} size={21} color={group.section.color} />
        </View>
        <Text style={styles.title}>{group.section.label}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.count}>{countLabel}</Text>
        </View>
      </View>
      <View style={styles.items}>
        {group.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: typography.subtitle, fontWeight: '800', color: colors.text },
  countBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  count: { fontSize: typography.caption, fontWeight: '700', color: colors.textSecondary },
  items: { gap: spacing.sm },
});
