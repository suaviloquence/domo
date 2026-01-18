import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { usePet, JournalEntry } from '../context/PetContext';

interface JournalScreenProps {
  navigation: any;
}

type GroupedEntries = {
  [date: string]: JournalEntry[];
};

export default function JournalScreen({ navigation }: JournalScreenProps) {
  const { getJournalEntries } = usePet();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({});

  useEffect(() => {
    loadEntries();
  }, []);

  // Reload entries when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });
    return unsubscribe;
  }, [navigation]);

  const loadEntries = async () => {
    const journalEntries = await getJournalEntries();
    setEntries(journalEntries);

    // Group entries by date
    const grouped: GroupedEntries = {};
    journalEntries.forEach((entry) => {
      const date = new Date(entry.startTime);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    // Sort entries within each day by start time (newest first)
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => b.startTime - a.startTime);
    });

    setGroupedEntries(grouped);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderStars = (stars: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <MaterialIcons
            key={index}
            name={index <= stars ? 'star' : 'star-border'}
            size={18}
            color={index <= stars ? '#FFB800' : '#CCC'}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    // Sort dates descending (newest first)
    return b.localeCompare(a);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#6FAF8A" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="menu-book" size={24} color="#3C5A49" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Journal</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Journal Entries */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              No journal entries yet.{'\n'}Complete a focus session and reflect
              to see your entries here!
            </Text>
          </View>
        ) : (
          sortedDates.map((dateKey) => (
            <View key={dateKey} style={styles.daySection}>
              <Text style={styles.dayHeader}>{formatDate(dateKey)}</Text>
              {groupedEntries[dateKey].map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryTimeRow}>
                      <Text style={styles.entryTime}>
                        {formatTime(entry.startTime)}
                      </Text>
                      <Text style={styles.entryDuration}>
                        {formatDuration(entry.duration)}
                      </Text>
                    </View>
                    {renderStars(entry.stars)}
                  </View>

                  {entry.goal && (
                    <View style={styles.entryGoalContainer}>
                      <MaterialIcons name="flag" size={16} color="#3C5A49" />
                      <Text style={styles.entryGoal}>{entry.goal}</Text>
                    </View>
                  )}

                  {entry.reflection && (
                    <View style={styles.reflectionContainer}>
                      <Text style={styles.reflectionLabel}>Reflection:</Text>
                      <Text style={styles.reflectionText}>
                        {entry.reflection}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F6FAF7',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6FAF8A',
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3C5A49',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  daySection: {
    marginBottom: 32,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3C5A49',
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6FAF8A',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C5A49',
    marginRight: 8,
  },
  entryDuration: {
    fontSize: 14,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 2,
  },
  entryGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  entryGoal: {
    fontSize: 15,
    color: '#3C5A49',
    marginLeft: 6,
    fontWeight: '500',
  },
  reflectionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  reflectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    color: '#3C5A49',
    lineHeight: 20,
  },
});
