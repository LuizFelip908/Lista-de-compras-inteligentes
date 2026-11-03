import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';

export function LoadingState() {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Restaurando sua lista…</Text>
      <Text style={styles.message}>Buscando os itens salvos neste dispositivo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: { fontSize: typography.subtitle, fontWeight: '800', color: colors.text },
  message: { fontSize: typography.body, color: colors.textSecondary, textAlign: 'center' },
});
