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
            size={16}
            color={index <= stars ? '#FFB800' : '#D4E5DA'}
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
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color="#3C5A49" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>journal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Journal Entries */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="menu-book" size={48} color="#B8C9BD" />
            </View>
            <Text style={styles.emptyStateText}>
              No journal entries yet.{'\n'}Complete a focus session to see your entries here!
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
                      <View style={styles.durationBadge}>
                        <Text style={styles.entryDuration}>
                          {formatDuration(entry.duration)}
                        </Text>
                      </View>
                    </View>
                    {renderStars(entry.stars)}
                  </View>

                  {entry.goal && (
                    <View style={styles.entryGoalContainer}>
                      <MaterialIcons name="flag" size={14} color="#6FAF8A" />
                      <Text style={styles.entryGoal}>{entry.goal}</Text>
                    </View>
                  )}

                  {entry.reflection && (
                    <View style={styles.reflectionContainer}>
                      <Text style={styles.reflectionLabel}>Reflection</Text>
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
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 44,
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
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7D73',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  daySection: {
    marginBottom: 28,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C5A49',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  entryCard: {
    backgroundColor: '#E7F3EC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    borderLeftWidth: 4,
    borderLeftColor: '#6FAF8A',
    shadowColor: '#3C5A49',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C5A49',
    marginRight: 10,
    letterSpacing: 0.3,
  },
  durationBadge: {
    backgroundColor: '#F6FAF7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4E5DA',
  },
  entryDuration: {
    fontSize: 12,
    color: '#6B7D73',
    fontWeight: '500',
    letterSpacing: 0.2,
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
    marginTop: 6,
    marginBottom: 4,
  },
  entryGoal: {
    fontSize: 14,
    color: '#3C5A49',
    marginLeft: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  reflectionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D4E5DA',
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7D73',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    color: '#3C5A49',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});
