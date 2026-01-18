import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { usePet } from '../context/PetContext';

export default function SettingsScreen({ navigation }: any) {
  const { hungerLossPerDay, setHungerLossPerDay, resetPet } = usePet();
  const [isResetting, setIsResetting] = useState(false);

  const increment = () => {
    if (hungerLossPerDay < 5) {
      setHungerLossPerDay(hungerLossPerDay + 1);
    }
  };

  const decrement = () => {
    if (hungerLossPerDay > 0) {
      setHungerLossPerDay(hungerLossPerDay - 1);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Everything',
      'This will delete all your progress including:\n\n• Your selected pet\n• Coins and food\n• Streak and journal entries\n• Purchased items\n\nYou will be taken back to choose a new pet. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await resetPet();
              navigation.navigate("PickPet")
            } catch (error) {
              console.error('Reset failed:', error);
              Alert.alert('Error', 'Failed to reset. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {/* Hunger Loss Per Day Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <MaterialIcons name="restaurant" size={18} color="#3C5A49" />
            <Text style={styles.settingTitle}>Hunger Loss Per Day</Text>
          </View>
          <Text style={styles.settingDescription}>
            How much hunger your pet loses each day. Set to 0 to disable hunger decay.
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepperButton, hungerLossPerDay <= 0 && styles.stepperButtonDisabled]}
              onPress={decrement}
              disabled={hungerLossPerDay <= 0}
              activeOpacity={0.7}
            >
              <MaterialIcons name="remove" size={22} color={hungerLossPerDay <= 0 ? '#B8C9BD' : '#3C5A49'} />
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperValueText}>{hungerLossPerDay}</Text>
            </View>
            <TouchableOpacity
              style={[styles.stepperButton, hungerLossPerDay >= 5 && styles.stepperButtonDisabled]}
              onPress={increment}
              disabled={hungerLossPerDay >= 5}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={22} color={hungerLossPerDay >= 5 ? '#B8C9BD' : '#3C5A49'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Everything Setting */}
        <View style={[styles.settingCard, styles.dangerCard]}>
          <View style={styles.settingHeader}>
            <MaterialIcons name="warning" size={18} color="#DC2626" />
            <Text style={[styles.settingTitle, styles.dangerTitle]}>Reset Everything</Text>
          </View>
          <Text style={styles.settingDescription}>
            Delete all progress and start over with a new pet. This action cannot be undone.
          </Text>
          <TouchableOpacity
            style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
            onPress={handleReset}
            disabled={isResetting}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="refresh" 
              size={18} 
              color={isResetting ? '#FCA5A5' : 'white'} 
            />
            <Text style={[styles.resetButtonText, isResetting && styles.resetButtonTextDisabled]}>
              {isResetting ? 'Resetting...' : 'Reset Everything'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  settingCard: {
    backgroundColor: '#E7F3EC',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C5A49',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7D73',
    marginBottom: 20,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F6FAF7',
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
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  stepperValue: {
    width: 70,
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 0.5,
  },
  dangerCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  dangerTitle: {
    color: '#DC2626',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: '#B91C1C',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonDisabled: {
    backgroundColor: '#FCA5A5',
    borderColor: '#F87171',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  resetButtonTextDisabled: {
    color: '#FCA5A5',
  },
});
