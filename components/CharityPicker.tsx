import { View, StyleSheet, FlatList, Modal, TouchableOpacity } from 'react-native';
import { Text, TextInput, Surface, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Charity } from '@/types';
import { charityService } from '@/services/charityService';

interface Props {
  selected: Charity | null;
  onSelect: (charity: Charity) => void;
  modal?: boolean;
  onDismiss?: () => void;
}

export function CharityPicker({ selected, onSelect, modal, onDismiss }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults(charityService.getFeatured());
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const found = await charityService.search(query);
      setResults(found);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleCustomSubmit = () => {
    if (!customName.trim()) return;
    const custom: Charity = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: 'Church / Custom Organization',
      isVerified: false,
      isCustom: true,
    };
    onSelect(custom);
    setShowCustom(false);
    setCustomName('');
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search charities or churches…"
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
          dense
        />
      </View>

      {selected && (
        <View style={styles.selectedRow}>
          <Text variant="labelMedium" style={styles.selectedLabel}>Selected: </Text>
          <Chip
            mode="flat"
            style={styles.selectedChip}
            icon={selected.isVerified ? 'check-decagram' : 'account-heart'}
            onClose={onDismiss}
          >
            {selected.name}
          </Chip>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#1B4332" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CharityRow
              charity={item}
              isSelected={selected?.id === item.id}
              onSelect={onSelect}
            />
          )}
          style={styles.list}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={styles.empty}>
              No results. Try a different name.
            </Text>
          }
        />
      )}

      {!showCustom ? (
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => setShowCustom(true)}
          style={styles.customButton}
        >
          Add Church or Custom Org
        </Button>
      ) : (
        <Surface style={styles.customForm} elevation={1}>
          <Text variant="labelMedium" style={styles.customLabel}>Organization Name</Text>
          <TextInput
            value={customName}
            onChangeText={setCustomName}
            placeholder="e.g. Grace Community Church"
            mode="outlined"
            dense
            style={styles.customInput}
          />
          <View style={styles.customActions}>
            <Button mode="text" onPress={() => setShowCustom(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCustomSubmit} disabled={!customName.trim()}>
              Add
            </Button>
          </View>
        </Surface>
      )}

      {modal && onDismiss && (
        <Button mode="text" onPress={onDismiss} style={styles.dismissButton}>
          Cancel
        </Button>
      )}
    </View>
  );

  if (modal) {
    return (
      <Modal visible animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>Choose a Cause</Text>
          </View>
          {content}
        </SafeAreaView>
      </Modal>
    );
  }

  return content;
}

function CharityRow({
  charity,
  isSelected,
  onSelect,
}: {
  charity: Charity;
  isSelected: boolean;
  onSelect: (c: Charity) => void;
}) {
  return (
    <TouchableOpacity onPress={() => onSelect(charity)}>
      <Surface
        style={[styles.row, isSelected && styles.rowSelected]}
        elevation={isSelected ? 2 : 0}
      >
        <View style={styles.rowLeft}>
          <Text variant="bodyMedium" style={styles.rowName}>{charity.name}</Text>
          <Text variant="labelSmall" style={styles.rowCategory}>{charity.category}</Text>
        </View>
        {charity.isVerified && (
          <Chip
            mode="flat"
            style={styles.verifiedChip}
            textStyle={styles.verifiedText}
            icon="check-decagram"
          >
            501(c)(3)
          </Chip>
        )}
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchRow: { marginBottom: 12 },
  searchInput: { backgroundColor: '#FFFFFF' },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLabel: { color: '#6C757D' },
  selectedChip: { backgroundColor: '#D8F3DC' },
  loader: { marginTop: 24 },
  list: { flex: 1 },
  empty: { color: '#6C757D', textAlign: 'center', marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  rowSelected: {
    backgroundColor: '#D8F3DC',
    borderWidth: 1,
    borderColor: '#40916C',
  },
  rowLeft: { flex: 1 },
  rowName: { color: '#212529', fontWeight: '500' },
  rowCategory: { color: '#6C757D', marginTop: 2 },
  verifiedChip: { backgroundColor: '#E8F4FD', height: 24, marginLeft: 8 },
  verifiedText: { fontSize: 10, color: '#0077B6' },
  checkmark: { color: '#1B4332', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  customButton: { marginTop: 12, borderRadius: 8 },
  customForm: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  customLabel: { color: '#212529', marginBottom: 8 },
  customInput: { marginBottom: 12 },
  customActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  dismissButton: { marginTop: 8 },
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: { color: '#1B4332', fontWeight: 'bold' },
});
