import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface SevenSegmentTimerProps {
  secondsLeft: number;
  goal?: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * SevenSegmentTimer displays a MM:SS countdown in a style reminiscent of a seven-segment display.
 * For best results, use a monospace font (Menlo, Courier, etc).
 */
const SevenSegmentTimer: React.FC<SevenSegmentTimerProps> = ({
  secondsLeft,
  goal,
}) => {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return (
    <View style={styles.container}>
      <View style={styles.cuteBg}>
        <Text style={styles.emoji}>⏰</Text>
        <Text style={styles.cuteTimer}>
          {pad(minutes)}
          <Text style={styles.cuteColon}>:</Text>
          {pad(seconds)}
        </Text>
      </View>
      {goal ? (
        <Text style={styles.goalText} numberOfLines={2} ellipsizeMode="tail">
          {goal}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuteBg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED', // Latte base
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 28,
    shadowColor: '#FFD6EC', // Pastel pink
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#EAD7C2', // Pastel brown
  },
  emoji: {
    fontSize: 34,
    marginRight: 10,
    marginTop: 2,
  },
  cuteTimer: {
    fontFamily: Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif-medium',
      default: 'Arial Rounded MT Bold',
    }),
    fontSize: 44,
    color: '#E6E6FF', // Pastel purple
    letterSpacing: 1,
    fontWeight: '800',
    textShadowColor: '#D6F0FF', // Pastel blue
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cuteColon: {
    color: '#FFD6EC', // Pastel pink
    fontSize: 44,
    fontWeight: '900',
    marginHorizontal: 2,
  },
  goalText: {
    marginTop: 6,
    fontSize: 14,
    color: '#EAD7C2', // Pastel brown
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 220,
    opacity: 0.85,
  },
});

export default SevenSegmentTimer;
