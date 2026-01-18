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
  const { selectedPetId, resetPet, coins, streak, addCoins, food, setFood, hunger, setHunger, checkAndDepleteHunger } = usePet();

  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [devMenuVisible, setDevMenuVisible] = useState(false);

  // editable name
  const [petName, setPetName] = useState('focus pal');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    (async () => {
      const savedName = await AsyncStorage.getItem(NAME_KEY);
      if (savedName) setPetName(savedName);
      // Check and deplete hunger on app start
      await checkAndDepleteHunger();
    })();
  }, []);

  const saveName = async () => {
    const trimmed = petName.trim() || 'focus pal';
    setPetName(trimmed);
    await AsyncStorage.setItem(NAME_KEY, trimmed);
    setIsEditingName(false);
  };

  const handleFeed = async () => {
    if (food > 0 && hunger < 5) {
      await setFood(food - 1);
      await setHunger(Math.min(5, hunger + 1));
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

        {/* Center: Hunger + Coins + Streak */}
        <View style={styles.centerStatus}>
          <View style={styles.statusRowBig}>
            <MaterialIcons name="restaurant" size={16} color="#3C5A49" />
            <View style={styles.hungerMeterContainer}>
              {[1, 2, 3, 4, 5].map((segment) => (
                <View
                  key={segment}
                  style={[
                    styles.hungerSegment,
                    segment <= hunger ? styles.hungerSegmentFull : styles.hungerSegmentEmpty
                  ]}
                />
              ))}
            </View>

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
        <Text style={styles.caption}>
          {hunger <= 2 ? "your pet is hungry..." : "your pet grows when you lock in"}
        </Text>
      </View>

      {/* Feed Button */}
      <TouchableOpacity
        style={[styles.feedButton, (food === 0 || hunger >= 5) && styles.feedButtonDisabled]}
        onPress={handleFeed}
        disabled={food === 0 || hunger >= 5}
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

      {__DEV__ && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#8B5CF6' }]}
          onPress={() => setDevMenuVisible(true)}
        >
          <Text style={styles.buttonText}>dev: state menu</Text>
        </TouchableOpacity>
      )}

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

      {/* Dev Menu Modal */}
      {__DEV__ && (
        <View style={[styles.devModalOverlay, { display: devMenuVisible ? 'flex' : 'none' }]}>
          <View style={styles.devModal}>
            <View style={styles.devModalHeader}>
              <Text style={styles.devModalTitle}>Dev State Menu</Text>
              <TouchableOpacity onPress={() => setDevMenuVisible(false)}>
                <MaterialIcons name="close" size={24} color="#3C5A49" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.devModalSection}>
              <Text style={styles.devModalSectionTitle}>Hunger</Text>
              <View style={styles.devButtonRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.devButtonSmall, hunger === level && styles.devButtonActive]}
                    onPress={() => setHunger(level)}
                  >
                    <Text style={styles.devButtonTextSmall}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.devModalSection}>
              <Text style={styles.devModalSectionTitle}>Food</Text>
              <View style={styles.devButtonRow}>
                <TouchableOpacity
                  style={styles.devButtonSmall}
                  onPress={() => setFood(0)}
                >
                  <Text style={styles.devButtonTextSmall}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devButtonSmall}
                  onPress={() => setFood(10)}
                >
                  <Text style={styles.devButtonTextSmall}>10</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devButtonSmall}
                  onPress={() => setFood(50)}
                >
                  <Text style={styles.devButtonTextSmall}>50</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.devModalSection}>
              <Text style={styles.devModalSectionTitle}>Coins</Text>
              <View style={styles.devButtonRow}>
                <TouchableOpacity
                  style={styles.devButtonSmall}
                  onPress={() => addCoins(-50)}
                >
                  <Text style={styles.devButtonTextSmall}>-50</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devButtonSmall}
                  onPress={() => addCoins(100)}
                >
                  <Text style={styles.devButtonTextSmall}>+100</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.devButtonSmall}
                  onPress={() => addCoins(500)}
                >
                  <Text style={styles.devButtonTextSmall}>+500</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.devModalSection}>
              <Text style={styles.devModalSectionTitle}>Actions</Text>
              <TouchableOpacity
                style={[styles.devButton, { backgroundColor: '#EF4444' }]}
                onPress={async () => {
                  await checkAndDepleteHunger();
                  setDevMenuVisible(false);
                }}
              >
                <Text style={styles.devButtonText}>Deplete Hunger Daily</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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

  hungerMeterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 2,
  },
  hungerSegment: {
    width: 12,
    height: 10,
    borderRadius: 2,
  },
  hungerSegmentFull: {
    backgroundColor: '#FF6B35',
  },
  hungerSegmentEmpty: {
    backgroundColor: '#DCE8E1',
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

  /* Dev Modal */
  devModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  devModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
  },
  devModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  devModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C5A49',
  },
  devModalSection: {
    marginBottom: 20,
  },
  devModalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C5A49',
    marginBottom: 8,
  },
  devButtonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  devButtonSmall: {
    backgroundColor: '#E7F3EC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  devButtonActive: {
    backgroundColor: '#6FAF8A',
  },
  devButtonTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C5A49',
  },
  devButton: {
    backgroundColor: '#6FAF8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  devButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
