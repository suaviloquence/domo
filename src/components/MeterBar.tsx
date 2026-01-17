import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const pastelLattePalette = {
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

interface MeterBarProps {
  value: number;
  color: string;
  icon: string;
}

const MAX_METER = 100;

const MeterBar: FC<MeterBarProps> = ({ value, color, icon }) => {
  return (
    <View style={styles.barBackground}>
      <View
        style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]}
      />
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.percent}>{Math.round(value)}%</Text>
    </View>
  );
};

export default MeterBar;

const styles = StyleSheet.create({
  barBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    width: 90,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: pastelLattePalette.brown,
    backgroundColor: pastelLattePalette.gray,
    overflow: 'hidden',
    marginHorizontal: 4,
    position: 'relative',
    paddingLeft: 6,
    paddingRight: 6,
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 14,
    zIndex: 0,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
    zIndex: 2,
  },
  percent: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 2,
  },
});
