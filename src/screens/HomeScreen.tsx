import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePet } from '../context/PetContext';
import TimerModal from '../components/TimerModal';
import PetDisplay from '../components/PetDisplay';

export default function HomeScreen({ navigation }: any) {
  const { selectedPetId, resetPet, coins, streak, addCoins } = usePet(); // adding this so we can reset the pets

  // State for TimerModal visibility
  const [timerModalVisible, setTimerModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Left: Journal */}
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={styles.topBarIcon}>📓</Text>
        </TouchableOpacity>

        {/* Middle: Hunger + Streak + Coins */}
        <View style={styles.centerStatus}>
          {/* Hunger */}
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>🍖</Text>
            <View style={styles.hungerContainer}>
              <View style={[styles.hungerFill, { width: '70%' }]} />
            </View>
          </View>

          {/* Streak + Coins */}
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>🔥 {streak}</Text>
            <Text style={styles.statusDivider}>•</Text>
            <Text style={styles.statusText}>🪙 {coins}</Text>
          </View>
        </View>

        {/* Right: Hibernate */}
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => navigation.navigate('Hibernate')}
        >
          <Text style={styles.topBarIcon}>💤</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>focus pal</Text>

      <View style={styles.card}>
        <PetDisplay selectedPetId={selectedPetId} />
        <Text style={styles.caption}>your pet grows when you lock in</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setTimerModalVisible(true)}
      >
        <Text style={styles.buttonText}>start focus session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3C5A49' }]}
        onPress={() => navigation.navigate('Shop')}
      >
        <Text style={styles.buttonText}>closet</Text>
      </TouchableOpacity>

      {__DEV__ && ( // RESET BUTTON
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#999', marginTop: 12 }]}
          onPress={resetPet}
        >
          <Text style={styles.buttonText}>dev: reset pet</Text>
        </TouchableOpacity>
      )}

      {__DEV__ && ( // COINS
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#3C5A49' }]}
          onPress={() => addCoins(50)}
        >
          <Text style={styles.buttonText}>dev: +50 coins</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.footer}>
        coins: {coins} • streak: {streak}
      </Text>
      <TimerModal
        visible={timerModalVisible}
        onStart={(minutes, seconds, goal) => {
          setTimerModalVisible(false);
          navigation.navigate('Focus', {
            seconds: minutes * 60 + seconds,
            goal,
          });
        }}
        onCancel={() => setTimerModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#E7F3EC',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  pet: { fontSize: 64 },
  petImage: { width: 96, height: 96 },
  caption: {
    fontSize: 14,
    color: '#3C5A49',
  },
  button: {
    backgroundColor: '#6FAF8A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 13,
    color: '#6B7D73',
    marginTop: 8,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  topBarButton: {
    padding: 8,
  },

  topBarIcon: {
    fontSize: 22,
  },

  centerStatus: {
    alignItems: 'center',
    gap: 6,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusIcon: {
    fontSize: 14,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C5A49',
  },

  statusDivider: {
    fontSize: 13,
    color: '#6B7D73',
  },

  hungerContainer: {
    width: 80,
    height: 8,
    backgroundColor: '#DCE8E1',
    borderRadius: 999,
    overflow: 'hidden',
  },

  hungerFill: {
    height: '100%',
    backgroundColor: '#6FAF8A',
    borderRadius: 999,
  },
});
