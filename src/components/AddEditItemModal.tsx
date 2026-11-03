import { useRef, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SECTIONS } from '../constants/sections';
import { colors, minimumTouchTarget, radii, spacing, typography } from '../constants/theme';
import type { Item, ItemFormErrors, ItemFormValues, ItemInput } from '../models/item';
import { validateItemForm } from '../utils/validation';

interface AddEditItemModalProps {
  item?: Item | undefined;
  onClose: () => void;
  onSave: (input: ItemInput, id?: string) => void;
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <Text style={styles.error}>{message}</Text> : null;
}

export function AddEditItemModal({ item, onClose, onSave }: AddEditItemModalProps) {
  const insets = useSafeAreaInsets();
  const quantityRef = useRef<TextInputInstance>(null);
  const priceRef = useRef<TextInputInstance>(null);
  const isEditing = item !== undefined;
  const [values, setValues] = useState<ItemFormValues>(() =>
    item
      ? {
          name: item.name,
          sectionId: item.sectionId,
          quantity: String(item.quantity),
          unitPrice: (item.unitPriceCents / 100).toFixed(2).replace('.', ','),
        }
      : { name: '', sectionId: 'hortifruti', quantity: '1', unitPrice: '' },
  );
  const [errors, setErrors] = useState<ItemFormErrors>({});

  function updateField<Field extends keyof ItemFormValues>(
    field: Field,
    value: ItemFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit() {
    const result = validateItemForm(values);
    setErrors(result.errors);
    if (result.data) {
      onSave(result.data, item?.id);
    }
  }

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{isEditing ? 'Editar item' : 'Adicionar item'}</Text>
              <Text style={styles.subtitle}>Organize sua compra por seção.</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Fechar formulário"
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.field}>
              <Text style={styles.label}>Nome do item</Text>
              <TextInput
                value={values.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Ex.: Maçã nacional"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, errors.name ? styles.inputError : null]}
                autoCapitalize="sentences"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => quantityRef.current?.focus()}
                maxLength={120}
                accessibilityLabel="Nome do item"
              />
              <FieldError message={errors.name} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Seção do supermercado</Text>
              <View style={styles.sections} accessibilityRole="radiogroup">
                {SECTIONS.map((section) => {
                  const selected = values.sectionId === section.id;
                  return (
                    <Pressable
                      key={section.id}
                      onPress={() => updateField('sectionId', section.id)}
                      style={({ pressed }) => [
                        styles.sectionChip,
                        selected && styles.sectionChipSelected,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Seção ${section.label}`}
                    >
                      <MaterialCommunityIcons
                        name={section.icon}
                        size={19}
                        color={selected ? colors.primary : section.color}
                      />
                      <Text style={[styles.sectionLabel, selected && styles.sectionLabelSelected]}>
                        {section.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <FieldError message={errors.sectionId} />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput
                  ref={quantityRef}
                  value={values.quantity}
                  onChangeText={(text) => updateField('quantity', text)}
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, errors.quantity ? styles.inputError : null]}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  selectTextOnFocus
                  returnKeyType="next"
                  onSubmitEditing={() => priceRef.current?.focus()}
                  accessibilityLabel="Quantidade"
                  accessibilityHint="Número inteiro maior ou igual a um."
                />
                <FieldError message={errors.quantity} />
              </View>
              <View style={[styles.field, styles.flex]}>
                <Text style={styles.label}>Preço unitário (R$)</Text>
                <TextInput
                  ref={priceRef}
                  value={values.unitPrice}
                  onChangeText={(text) => updateField('unitPrice', text)}
                  placeholder="0,00"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, errors.unitPrice ? styles.inputError : null]}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  selectTextOnFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Preço unitário em reais"
                  accessibilityHint="Use vírgula para centavos, por exemplo 12,34."
                />
                <FieldError message={errors.unitPrice} />
              </View>
            </View>
            <Text style={styles.helper}>Aceita vírgula decimal. Exemplo: 12,34.</Text>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edição"
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? 'Salvar alterações' : 'Salvar item'}
            >
              <MaterialCommunityIcons name="check" size={20} color={colors.onPrimary} />
              <Text style={styles.saveText}>{isEditing ? 'Salvar alterações' : 'Salvar item'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '95%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  headerText: { flex: 1, gap: spacing.xs },
  title: { fontSize: typography.heading, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: typography.small, color: colors.textSecondary },
  closeButton: {
    width: minimumTouchTarget,
    height: minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  formScroll: { flexGrow: 0 },
  form: { gap: spacing.lg, paddingBottom: spacing.lg },
  field: { gap: spacing.sm },
  label: { fontSize: typography.body, fontWeight: '700', color: colors.text },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.danger },
  error: { fontSize: typography.caption, color: colors.danger, lineHeight: 17 },
  sections: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minimumTouchTarget,
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
  },
  sectionLabel: {
    flex: 1,
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionLabelSelected: { color: colors.primary, fontWeight: '800' },
  rowFields: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  helper: { fontSize: typography.caption, color: colors.textSecondary },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textSecondary },
  saveButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  saveText: { fontSize: typography.bodyLarge, fontWeight: '800', color: colors.onPrimary },
});
