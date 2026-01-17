import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MeterBar from './MeterBar';

// Pastel Latte Palette
const palette = {
  base: '#FFF7ED', // Latte base
  pink: '#FFD6EC', // Accent, buttons, highlights
  yellow: '#FFFACD', // Journal button, icons
  blue: '#D6F0FF', // Info, secondary backgrounds
  green: '#DFFFE0', // Success, hunger meter
  purple: '#E6E6FF', // Happiness meter, accents
  orange: '#FFE5B4', // Food meter
  brown: '#EAD7C2', // Borders, text, latte accent
  gray: '#F3F3F3', // Card backgrounds, containers
};

interface StatusBarSectionProps {
  hunger: number;
  happiness: number;
  onHibernate: () => void;
  onJournal: () => void;
}

const StatusBarSection: React.FC<StatusBarSectionProps> = ({
  hunger,
  happiness,
  onHibernate,
  onJournal,
}) => (
  <View style={styles.statusBar}>
    <TouchableOpacity style={styles.journalButton} onPress={onJournal}>
      <Text style={styles.journalEmoji}>📔</Text>
    </TouchableOpacity>
    <MeterBar value={hunger} color={palette.orange} icon="🍔" />
    <MeterBar value={happiness} color={palette.purple} icon="😃" />
    <TouchableOpacity style={styles.hibernateButton} onPress={onHibernate}>
      <Text style={styles.hibernateEmoji}>🌙</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 4, // Reduced to move closer to top
    backgroundColor: palette.base,
  },
  journalButton: {
    backgroundColor: palette.yellow,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: palette.brown,
  },
  journalEmoji: {
    fontSize: 20,
    color: palette.brown,
  },
  hibernateButton: {
    backgroundColor: palette.pink,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: palette.brown,
  },
  hibernateEmoji: {
    fontSize: 20,
    color: palette.brown,
  },
});

export default StatusBarSection;
