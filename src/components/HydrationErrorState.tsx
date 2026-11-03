import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '../constants/theme';

interface HydrationErrorStateProps {
  onRetry: () => void;
}

export function HydrationErrorState({ onRetry }: HydrationErrorStateProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="assertive">
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="alert-circle-outline" size={42} color={colors.danger} />
      </View>
      <Text style={styles.title}>Não foi possível carregar</Text>
      <Text style={styles.message}>
        Houve um problema ao ler os dados salvos. Seus dados não foram alterados.
      </Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Tentar carregar a lista novamente"
      >
        <Text style={styles.buttonText}>Tentar novamente</Text>
      </Pressable>
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
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    minHeight: minimumTouchTarget,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.onPrimary, fontSize: typography.bodyLarge, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
