import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { usePet } from '../context/PetContext';
import TimerModal from '../components/TimerModal';
import PetDisplay from '../components/PetDisplay';

const NAME_KEY = 'petName';

export default function HomeScreen({ navigation }: any) {
  const { selectedPetId, resetPet, coins, streak, addCoins, food, setFood } = usePet();

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

  const handleFeed = async () => {
    if (food > 0) {
      await setFood(food - 1);
      // You could add visual feedback here (animation, sound, etc.)
    }
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
          <MaterialIcons name="menu-book" size={22} color="#3C5A49" />
        </TouchableOpacity>

        {/* Center: Food + Coins + Streak */}
        <View style={styles.centerStatus}>
          <View style={styles.statusRowBig}>
            <MaterialIcons name="restaurant" size={16} color="#3C5A49" />
            <View style={styles.foodMeterContainer}>
              <View style={[styles.foodMeterFill, { width: `${Math.min((food / 100) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.foodAmount}>{food}</Text>

            <MaterialIcons name="monetization-on" size={16} color="#3C5A49" style={styles.statusIconSpacing} />
            <Text style={styles.statusTextBig}>{coins}</Text>
            <Text style={styles.statusDividerBig}>•</Text>
            <MaterialIcons name="local-fire-department" size={16} color="#FF6B35" style={styles.statusIconSpacing} />
            <Text style={styles.statusTextBig}>{streak}</Text>
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
              <MaterialIcons name="check" size={16} color="#3C5A49" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{petName}</Text>
            <TouchableOpacity
              onPress={() => setIsEditingName(true)}
              style={styles.editBtn}
            >
              <MaterialIcons name="edit" size={16} color="#3C5A49" style={styles.editIconSpacing} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Pet Card */}
      <View style={styles.card}>
        <PetDisplay selectedPetId={selectedPetId} size={220} />
        <Text style={styles.caption}>your pet grows when you lock in</Text>
      </View>

      {/* Feed Button */}
      <TouchableOpacity
        style={[styles.feedButton, food === 0 && styles.feedButtonDisabled]}
        onPress={handleFeed}
        disabled={food === 0}
      >
        <MaterialIcons name="restaurant-menu" size={18} color="white" />
        <Text style={styles.feedButtonText}>Feed Pet (1 food)</Text>
      </TouchableOpacity>

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
  },
  statusTextBig: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C5A49',
    marginLeft: 4,
  },
  statusDividerBig: { 
    fontSize: 15, 
    color: '#6B7D73',
    marginHorizontal: 4,
  },
  statusIconSpacing: {
    marginLeft: 4,
  },

  foodMeterContainer: {
    width: 90,
    height: 10,
    backgroundColor: '#DCE8E1',
    borderRadius: 999,
    overflow: 'hidden',
    marginLeft: 4,
  },
  foodMeterFill: {
    height: '100%',
    backgroundColor: '#6FAF8A',
    borderRadius: 999,
  },
  foodAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C5A49',
    marginLeft: 4,
    minWidth: 30,
  },

  /* Title / name */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 10,
  },
  editIconSpacing: {
    marginLeft: 0,
  },

  /* Card */
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#E7F3EC',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    color: '#3C5A49',
  },

  /* Buttons */
  feedButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  feedButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  feedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  button: {
    backgroundColor: '#6FAF8A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 12,
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
