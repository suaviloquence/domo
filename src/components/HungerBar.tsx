import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Props = {
  hunger: number; // 0..5
  width?: number;
  height?: number;
};

// path
const BARS = {
  20: require('../assets/hunger/healthbar_20.png'),
  40: require('../assets/hunger/healthbar_40.png'),
  60: require('../assets/hunger/healthbar_60.png'),
  80: require('../assets/hunger/healthbar_80.png'),
  100: require('../assets/hunger/healthbar_100.png'),
} as const;

function hungerToPct(hunger: number): 20 | 40 | 60 | 80 | 100 {
  const h = Math.max(0, Math.min(5, Math.floor(hunger)));
  if (h <= 1) return 20; // 0 or 1 → 20%
  if (h === 2) return 40;
  if (h === 3) return 60;
  if (h === 4) return 80;
  return 100;
}

export default function HungerBar({ hunger, width = 200, height = 50 }: Props) {
  const pct = hungerToPct(hunger);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Image
        key={pct}
        source={BARS[pct]}
        style={styles.img}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%' },
});
