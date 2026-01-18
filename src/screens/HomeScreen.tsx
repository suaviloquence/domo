import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { usePet } from '../context/PetContext';
import TimerModal from '../components/TimerModal';
import PetDisplay from '../components/PetDisplay';

const NAME_KEY = 'petName';

export default function HomeScreen({ navigation }: any) {
  const { selectedPetId, resetPet, coins, streak, addCoins } = usePet();

  const [timerModalVisible, setTimerModalVisible] = useState(false);

  // editable name
  const [petName, setPetName] = useState('focus pal');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    (async () => {
      const savedName = await AsyncStorage.getItem(NAME_KEY);
      if (savedName) setPetName(savedName);
    })();
  }, []);

  const saveName = async () => {
    const trimmed = petName.trim() || 'focus pal';
    setPetName(trimmed);
    await AsyncStorage.setItem(NAME_KEY, trimmed);
    setIsEditingName(false);
  };

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

        {/* Center: Hunger + Coins + Streak */}
        <View style={styles.centerStatus}>
          <View style={styles.statusRowBig}>
            <Text style={styles.statusIconBig}>🍖</Text>
            <View style={styles.hungerContainer}>
              <View style={[styles.hungerFill, { width: '70%' }]} />
            </View>

            <Text style={styles.statusTextBig}>🪙 {coins}</Text>
            <Text style={styles.statusDividerBig}>•</Text>
            <Text style={styles.statusTextBig}>🔥 {streak}</Text>
          </View>
        </View>

        {/* Right spacer so center stays visually centered */}
        <View style={styles.rightSpacer} />
      </View>

      {/* Editable Title */}
      <View style={styles.titleRow}>
        {isEditingName ? (
          <>
            <TextInput
              value={petName}
              onChangeText={setPetName}
              style={styles.titleInput}
              autoFocus
              maxLength={16}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <TouchableOpacity onPress={saveName} style={styles.editBtn}>
              <Text style={styles.editIcon}>✅</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{petName}</Text>
            <TouchableOpacity
              onPress={() => setIsEditingName(true)}
              style={styles.editBtn}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Pet Card */}
      <View style={styles.card}>
        <PetDisplay selectedPetId={selectedPetId} size={220} />
        <Text style={styles.caption}>your pet grows when you lock in</Text>
      </View>

      {/* Actions */}
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

      {/* Dev buttons */}
      {__DEV__ && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#999', marginTop: 12 }]}
          onPress={resetPet}
        >
          <Text style={styles.buttonText}>dev: reset pet</Text>
        </TouchableOpacity>
      )}

      {__DEV__ && (
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

      {/* Timer Modal */}
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

  /* Top bar */
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
  topBarButton: { padding: 8 },
  topBarIcon: { fontSize: 22 },

  // keeps the center block centered since we removed the right button
  rightSpacer: { width: 22 + 16 }, // ~icon size + padding feel

  centerStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRowBig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusIconBig: { fontSize: 16 },
  statusTextBig: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C5A49',
  },
  statusDividerBig: { fontSize: 15, color: '#6B7D73' },

  hungerContainer: {
    width: 90,
    height: 10,
    backgroundColor: '#DCE8E1',
    borderRadius: 999,
    overflow: 'hidden',
  },
  hungerFill: {
    height: '100%',
    backgroundColor: '#6FAF8A',
    borderRadius: 999,
  },

  /* Title / name */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#E7F3EC',
    color: '#3C5A49',
    minWidth: 160,
    textAlign: 'center',
  },
  editBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#E7F3EC',
  },
  editIcon: { fontSize: 16 },

  /* Card */
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#E7F3EC',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  caption: {
    fontSize: 14,
    color: '#3C5A49',
  },

  /* Buttons */
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
});
