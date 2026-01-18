// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { usePet } from '../context/PetContext';
import TimerModal from '../components/TimerModal';
import PetDisplay from '../components/PetDisplay';
import HungerBar from '../components/HungerBar';

const coinIcon = require('../assets/coin.png');
const journalIcon = require('../assets/journal.png');
const closetIcon = require('../assets/closet.png');
const foodIcon = require('../assets/food.png');

const NAME_KEY = 'petName';
const BUTTON_WIDTH = 300;

export default function HomeScreen({ navigation }: any) {
  const {
    selectedPetId,
    coins,
    streak,
    hunger,
    setHunger,
    food,
    setFood,
    feedPet,
  } = usePet();

  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [devMenuVisible, setDevMenuVisible] = useState(false);

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
    if (food <= 0 || hunger >= 5) return;
    await feedPet();
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/BACKGROUND.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay to dim the background */}
        <View style={styles.overlay} />
        {/* Top Status Bar */}
        <View style={styles.topBar}>
          <View style={styles.statusPill}>
            {/* Left: Hunger */}
            <View style={styles.hungerSection}>
              <HungerBar hunger={hunger} width={200} height={50} />
            </View>

            {/* Right: Coins & Streak with accent border */}
            <View style={styles.statsSection}>
              <Image
                source={coinIcon}
                style={styles.coinIcon}
                resizeMode="contain"
              />
              <Text style={styles.statText}>{coins}</Text>
              <View style={styles.statDivider} />
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color="#FF6B35"
              />
              <Text style={styles.statText}>{streak}</Text>
            </View>
          </View>
        </View>

        {/* Center Content */}
        <View style={styles.centerContent}>
          {/* Editable Pet Name */}
          <View style={styles.nameRow}>
            {isEditingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  value={petName}
                  onChangeText={setPetName}
                  style={styles.nameInput}
                  autoFocus
                  maxLength={16}
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  onBlur={saveName}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameDisplay}
                onPress={() => setIsEditingName(true)}
              >
                <Text style={styles.nameText}>{petName}</Text>
                <MaterialIcons
                  name="edit"
                  size={14}
                  color="#9BA8A0"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Pet Display */}
          <View style={styles.petContainer}>
            <PetDisplay selectedPetId={selectedPetId} size={240} />
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {/* Focus Button */}
          <TouchableOpacity
            style={styles.focusButton}
            onPress={() => setTimerModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="timer" size={20} color="white" />
            <Text style={styles.focusButtonText}>enter focus mode</Text>
          </TouchableOpacity>

          {/* Icon Button Row */}
          <View style={styles.iconButtonRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Journal')}
              activeOpacity={0.7}
            >
              <View style={styles.iconButtonInner}>
                <Image
                  source={journalIcon}
                  style={styles.iconButtonImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.iconButtonLabel}>journal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                (food <= 0 || hunger >= 5) && styles.iconButtonDisabled,
              ]}
              onPress={handleFeed}
              disabled={food <= 0 || hunger >= 5}
              activeOpacity={0.7}
            >
              <View style={styles.iconButtonInner}>
                <View style={styles.foodIconContainer}>
                  <Image
                    source={foodIcon}
                    style={styles.iconButtonImage}
                    resizeMode="contain"
                  />
                  <View
                    style={[
                      styles.foodBadge,
                      (food <= 0 || hunger >= 5) && styles.foodBadgeDisabled,
                    ]}
                  >
                    <Text style={styles.foodBadgeText}>{food}</Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.iconButtonLabel,
                  (food <= 0 || hunger >= 5) && styles.iconButtonLabelDisabled,
                ]}
              >
                feed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Shop')}
              activeOpacity={0.7}
            >
              <View style={styles.iconButtonInner}>
                <Image
                  source={closetIcon}
                  style={styles.iconButtonImage}
                  resizeMode="contain"
                  renderingMode="original"
                />
              </View>
              <Text style={styles.iconButtonLabel}>closet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <View style={styles.iconButtonInner}>
                <MaterialIcons name="settings" size={22} color="#3C5A49" />
              </View>
              <Text style={styles.iconButtonLabel}>settings</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <TouchableOpacity
              style={styles.devButton}
              onPress={() => setDevMenuVisible(true)}
            >
              <Text style={styles.devButtonText}>dev menu</Text>
            </TouchableOpacity>
          )}
        </View>

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

        {/* Dev Menu Overlay */}
        {__DEV__ && devMenuVisible && (
          <View style={styles.devModalOverlay}>
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
                  {[0, 1, 2, 3, 4, 5].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.devButtonSmall,
                        hunger === level ? styles.devButtonActive : null,
                      ]}
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
                  {[0, 5, 10, 50].map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.devButtonSmall}
                      onPress={() => setFood(amt)}
                    >
                      <Text style={styles.devButtonTextSmall}>{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF7',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center', // centers content vertically
    alignItems: 'center', // centers content horizontally
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // covers entire background
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // black with 50% opacity
  },

  /* Top Status Bar */
  topBar: {
    paddingTop: 60,
    // paddingHorizontal: 20,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hungerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C5A49',
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 8,
  },

  /* Center Content */
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3C5A49',
    letterSpacing: 0.5,
  },
  editIcon: {
    marginLeft: 8,
    opacity: 0.5,
  },
  nameEditContainer: {
    // backgroundColor: '#E7F3EC',
    // borderRadius: 14,
    // paddingHorizontal: 14,
    // paddingVertical: 6,
    // borderWidth: 1.5,
    // borderColor: '#D4E5DA',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3C5A49',
    textAlign: 'center',
    minWidth: 140,
    letterSpacing: 0.5,
  },
  petContainer: {
    alignItems: 'center',
  },

  /* Bottom Actions */
  bottomActions: {
    paddingBottom: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6FAF8A',
    borderRadius: 18,
    paddingVertical: 16,
    width: BUTTON_WIDTH,
    gap: 10,
    borderWidth: 2,
    borderColor: '#5A9A75',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  focusButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: BUTTON_WIDTH,
    marginTop: 20,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconButtonImage: {
    width: 36,
    height: 36,
    tintColor: '#3C5A49',
  },
  iconButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E5DA',

    // iOS
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,

    // Android
    elevation: 4,
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  iconButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7D73',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  iconButtonLabelDisabled: {
    color: '#B8C9BD',
  },
  foodIconContainer: {
    position: 'relative',
  },
  foodBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#3C5A49',
    borderColor: '#A0B5A8',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 1.5,
  },
  foodBadgeDisabled: {
    backgroundColor: '#B8C9BD',
    borderColor: '#A0B5A8',
  },
  foodBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Dev Button */
  devButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#7C4FE0',
  },
  devButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* Dev Modal */
  devModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(60, 90, 73, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  devModal: {
    backgroundColor: '#F6FAF7',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  devModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4E5DA',
  },
  devModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 0.3,
  },
  devModalSection: {
    marginBottom: 20,
  },
  devModalSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7D73',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  devButtonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  devButtonSmall: {
    backgroundColor: '#E7F3EC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 42,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
  },
  devButtonActive: {
    backgroundColor: '#6FAF8A',
    borderColor: '#5A9A75',
  },
  devButtonTextSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C5A49',
  },
  coinIcon: { width: 16, height: 16, borderRadius: 8 },
});
