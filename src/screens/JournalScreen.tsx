import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type JournalEntry = {
  id: string;
  text: string;
  createdAt: number;
};

const JOURNAL_KEY = 'journalEntries_v1';

export default function JournalScreen({ navigation }: any) {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(JOURNAL_KEY);
      if (raw) setEntries(JSON.parse(raw));
    })();
  }, []);

  const saveEntries = async (next: JournalEntry[]) => {
    setEntries(next);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
  };

  const onAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newEntry: JournalEntry = {
      id: String(Date.now()),
      text: trimmed,
      createdAt: Date.now(),
    };

    const next = [newEntry, ...entries];
    setText('');
    await saveEntries(next);
  };

  const onDelete = async (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    await saveEntries(next);
  };

  const prettyDate = useMemo(() => {
    return (ms: number) =>
      new Date(ms).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Text style={styles.icon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>journal</Text>

          <View style={styles.iconBtn} />
        </View>

        {/* Composer */}
        <View style={styles.composer}>
            <Text style={styles.prompt}>quick note</Text>
            <Text style={styles.subPrompt}>optional — write anything you want 🌿</Text>


          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="today i..."
            placeholderTextColor="#8AA197"
            style={styles.input}
            multiline
          />

          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>save</Text>
          </TouchableOpacity>
        </View>

        {/* Entries */}
        <FlatList
          contentContainerStyle={{ paddingBottom: 24 }}
          data={entries}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>no entries yet</Text>
              <Text style={styles.emptySub}>
                write your first note so future-you can smile 🫶
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.entryCard}>
              <Text style={styles.entryDate}>{prettyDate(item.createdAt)}</Text>
              <Text style={styles.entryText}>{item.text}</Text>

              <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const BG = '#F6FAF7';
const CARD = '#E7F3EC';
const GREEN = '#3C5A49';
const GREEN_MID = '#5E8768';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 80 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
    textTransform: 'lowercase',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18, color: GREEN, fontWeight: '800' },

  composer: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    gap: 10,
    marginBottom: 14,
  },
  prompt: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
  },
  input: {
    minHeight: 90,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: GREEN,
  },
  addBtn: {
    height: 44,
    borderRadius: 16,
    backgroundColor: '#6FAF8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: 'white', fontSize: 14, fontWeight: '800' },

  entryCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 12,
    color: GREEN_MID,
    marginBottom: 6,
    fontWeight: '600',
  },
  entryText: {
    fontSize: 14,
    color: GREEN,
    lineHeight: 20,
    fontWeight: '600',
  },
  subPrompt: {
    fontSize: 12,
    color: GREEN_MID,
    marginTop: -6,
    fontWeight: '600',
  },  
  deleteBtn: { marginTop: 10, alignSelf: 'flex-start' },
  deleteText: { color: '#7B8E85', fontSize: 12, fontWeight: '700' },

  empty: { paddingTop: 30, alignItems: 'center' },
  emptyTitle: { color: GREEN, fontWeight: '800', fontSize: 16 },
  emptySub: { color: GREEN_MID, marginTop: 6, textAlign: 'center' },
});
