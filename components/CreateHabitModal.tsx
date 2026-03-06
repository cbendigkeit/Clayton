import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, Surface, SegmentedButtons, Chip } from 'react-native-paper';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabitStore } from '@/store/useHabitStore';
import type { SpendingCategory } from '@/types';

const CATEGORIES: { value: SpendingCategory; label: string }[] = [
  { value: 'coffee_shops', label: 'Coffee Shops' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'alcohol_bars', label: 'Bars & Alcohol' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'travel', label: 'Travel' },
  { value: 'gas', label: 'Gas' },
  { value: 'other', label: 'Other' },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function CreateHabitModal({ visible, onDismiss }: Props) {
  const { createHabit } = useHabitStore();

  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<'merchant' | 'category'>('merchant');
  const [merchantValue, setMerchantValue] = useState('');
  const [categoryValue, setCategoryValue] = useState<SpendingCategory>('coffee_shops');
  const [pledgeType, setPledgeType] = useState<'percentage' | 'fixed'>('fixed');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  const reset = () => {
    setName('');
    setTargetType('merchant');
    setMerchantValue('');
    setCategoryValue('coffee_shops');
    setPledgeType('fixed');
    setPledgeAmount('');
    setNameError('');
    setAmountError('');
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  const handleSubmit = () => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Habit name is required');
      valid = false;
    } else {
      setNameError('');
    }

    const amount = parseFloat(pledgeAmount);
    if (!pledgeAmount || isNaN(amount) || amount <= 0) {
      setAmountError('Enter a valid amount greater than 0');
      valid = false;
    } else {
      setAmountError('');
    }

    if (!valid) return;

    createHabit({
      name: name.trim(),
      targetType,
      targetValue:
        targetType === 'merchant' ? merchantValue.trim().toLowerCase() : categoryValue,
      pledgeType,
      pledgeAmount: amount,
    });

    handleDismiss();
  };

  const isSubmitDisabled =
    !name.trim() ||
    !pledgeAmount ||
    (targetType === 'merchant' && !merchantValue.trim());

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>New Habit</Text>
            <Button mode="text" onPress={handleDismiss} textColor="#ADB5BD">
              Cancel
            </Button>
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <Surface style={styles.section} elevation={1}>
              <Text variant="labelLarge" style={styles.sectionLabel}>Habit Name</Text>
              <TextInput
                value={name}
                onChangeText={(t) => { setName(t); setNameError(''); }}
                placeholder="e.g. No Starbucks, No takeout..."
                mode="outlined"
                error={!!nameError}
                style={styles.input}
              />
              {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
            </Surface>

            {/* Track By */}
            <Surface style={styles.section} elevation={1}>
              <Text variant="labelLarge" style={styles.sectionLabel}>Track By</Text>
              <SegmentedButtons
                value={targetType}
                onValueChange={(v) => setTargetType(v as 'merchant' | 'category')}
                buttons={[
                  { value: 'merchant', label: 'Merchant', icon: 'store' },
                  { value: 'category', label: 'Category', icon: 'tag' },
                ]}
                style={styles.segmented}
              />

              {targetType === 'merchant' ? (
                <TextInput
                  value={merchantValue}
                  onChangeText={setMerchantValue}
                  placeholder="e.g. Starbucks, DoorDash..."
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="store" />}
                />
              ) : (
                <View style={styles.categories}>
                  {CATEGORIES.map((cat) => (
                    <Chip
                      key={cat.value}
                      mode="flat"
                      selected={categoryValue === cat.value}
                      onPress={() => setCategoryValue(cat.value)}
                      style={[
                        styles.categoryChip,
                        categoryValue === cat.value && styles.categoryChipSelected,
                      ]}
                    >
                      {cat.label}
                    </Chip>
                  ))}
                </View>
              )}
            </Surface>

            {/* Pledge */}
            <Surface style={styles.section} elevation={1}>
              <Text variant="labelLarge" style={styles.sectionLabel}>Pledge Per Violation</Text>
              <SegmentedButtons
                value={pledgeType}
                onValueChange={(v) => setPledgeType(v as 'percentage' | 'fixed')}
                buttons={[
                  { value: 'fixed', label: 'Fixed $', icon: 'currency-usd' },
                  { value: 'percentage', label: '% of purchase', icon: 'percent' },
                ]}
                style={styles.segmented}
              />
              <TextInput
                value={pledgeAmount}
                onChangeText={(t) => { setPledgeAmount(t); setAmountError(''); }}
                placeholder={pledgeType === 'fixed' ? 'e.g. 5.00' : 'e.g. 10'}
                mode="outlined"
                keyboardType="decimal-pad"
                error={!!amountError}
                style={styles.input}
                left={<TextInput.Icon icon={pledgeType === 'fixed' ? 'currency-usd' : 'percent'} />}
              />
              {amountError ? <Text style={styles.error}>{amountError}</Text> : null}
              <Text variant="labelSmall" style={styles.hint}>
                {pledgeType === 'fixed'
                  ? `You'll pledge $${pledgeAmount || '0'} to charity each time this habit is broken.`
                  : `You'll pledge ${pledgeAmount || '0'}% of the transaction amount each time.`}
              </Text>
            </Surface>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              style={styles.submitButton}
              contentStyle={styles.submitContent}
            >
              Create Habit
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
  },
  title: { color: '#1B4332', fontWeight: 'bold' },
  scroll: { flex: 1, padding: 16 },
  section: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  sectionLabel: { color: '#1B4332', marginBottom: 12, fontWeight: '600' },
  input: { backgroundColor: '#FFFFFF' },
  segmented: { marginBottom: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { backgroundColor: '#F8F9FA' },
  categoryChipSelected: { backgroundColor: '#D8F3DC' },
  error: { color: '#D62828', fontSize: 12, marginTop: 4, marginLeft: 4 },
  hint: { color: '#6C757D', marginTop: 8, fontStyle: 'italic' },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  submitButton: { borderRadius: 8, backgroundColor: '#1B4332' },
  submitContent: { paddingVertical: 8 },
});
