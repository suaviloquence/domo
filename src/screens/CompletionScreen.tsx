import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { usePet } from '../context/PetContext';
import ReflectionModal from '../components/ReflectionModal';

interface CompletionScreenProps {
  navigation: any;
  route: any;
}

function calculateFocusRewards(totalSeconds: number) {
  const K = 1/10000;
  return {
    coinsShouldHave: Math.floor((totalSeconds / 600) / K), // 1 coin per 10 min, scaled by K
    foodShouldHave: Math.floor((totalSeconds / 1800) / K), // 1 food per 30 min, scaled by K
  };
}

export default function CompletionScreen({
  navigation,
  route,
}: CompletionScreenProps) {
  const {
    totalFocusSeconds,
    coinsEarnedFromFocus,
    foodEarnedFromFocus,
    coins,
    food,
    setCoinsEarnedFromFocus,
    setFood,
    setFoodEarnedFromFocus,
    addCoins,
    setTotalFocusSeconds,
    addJournalEntry,
  } = usePet();

  // Get data from route params
  const timeSpent = route?.params?.timeSpent || 25 * 60; // seconds
  const goal = route?.params?.goal || '';
  const streakExtended = route?.params?.streakExtended || false;
  const startTime = route?.params?.startTime || Date.now() - timeSpent * 1000; // timestamp in milliseconds

  // Use a ref to track which timeSpent we've already processed
  const processedTimeSpentRef = useRef<number | null>(null);

  useEffect(() => {
    // Only process if this is a new session (different timeSpent)
    if (processedTimeSpentRef.current === timeSpent) {
      return;
    }
    processedTimeSpentRef.current = timeSpent;

    // Capture current values at the time of processing
    const currentTotalSeconds = totalFocusSeconds;
    const currentCoinsEarned = coinsEarnedFromFocus;
    const currentFoodEarned = foodEarnedFromFocus;
    const currentFood = food;

    const newTotalSeconds = currentTotalSeconds + timeSpent;

    const { coinsShouldHave, foodShouldHave } =
      calculateFocusRewards(newTotalSeconds);

    const coinsToGrant = coinsShouldHave - currentCoinsEarned;
    const foodToGrant = foodShouldHave - currentFoodEarned;

    if (coinsToGrant > 0 || foodToGrant > 0) {
      setCoinsEarnedFromFocus(currentCoinsEarned + coinsToGrant);
      setFood(currentFood + foodToGrant);
      setFoodEarnedFromFocus(currentFoodEarned + foodToGrant);
    }
    setTotalFocusSeconds(newTotalSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeSpent]); // Only depend on timeSpent to detect new sessions

  // Calculate rewards
  const { coinsShouldHave, foodShouldHave } = calculateFocusRewards(timeSpent);
  const foodReward = foodShouldHave - foodEarnedFromFocus;
  const coinReward = coinsShouldHave - coinsEarnedFromFocus;

  const [reflected, setReflected] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleReflect = () => {
    setModalVisible(true);
  };

  const handleSaveReflection = async (stars: number, reflection: string) => {
    // Save to journal
    await addJournalEntry({
      startTime,
      duration: timeSpent,
      goal,
      stars,
      reflection: reflection || undefined,
    });

    // Grant coin reward
    await addCoins(1);
    setReflected(true);
    setModalVisible(false);
  };

  const handleCancelReflection = () => {
    setModalVisible(false);
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <View style={styles.container}>
      {/* Congratulatory Message */}
      <View style={styles.top}>
        <View style={styles.congratsContainer}>
          <MaterialIcons name="celebration" size={32} color="#3C5A49" />
          <Text style={styles.congrats}>Congratulations!</Text>
          <MaterialIcons name="celebration" size={32} color="#3C5A49" />
        </View>
        <Text style={styles.infoText}>
          You spent {formatTime(timeSpent)} on "{goal}"
        </Text>
      </View>

      {/* Reward Card */}
      <View style={styles.card}>
        <View style={styles.rewardRow}>
          <MaterialIcons name="restaurant" size={20} color="#3C5A49" />
          <Text style={styles.cardText}>+{foodReward} Food</Text>
        </View>
        <View style={styles.rewardRow}>
          <MaterialIcons name="monetization-on" size={20} color="#3C5A49" />
          <Text style={styles.cardText}>+{coinReward} Coins</Text>
        </View>
        {streakExtended && (
          <View style={styles.rewardRow}>
            <MaterialIcons name="local-fire-department" size={20} color="#FF6B35" />
            <Text style={styles.cardText}>Streak Extended!</Text>
          </View>
        )}
      </View>

      {/* Reflection Section */}
      <View style={styles.reflection}>
        <Text style={styles.reflectionText}>
          Take a moment to reflect on how it went:
        </Text>
        <TouchableOpacity
          style={[
            styles.reflectButton,
            { backgroundColor: reflected ? '#999' : '#6FAF8A' },
          ]}
          onPress={handleReflect}
          disabled={reflected}
        >
          <View style={styles.reflectButtonContent}>
            <Text style={styles.reflectButtonText}>
              {reflected ? 'Reflected' : 'Reflect for 30s'}
            </Text>
            {reflected && (
              <MaterialIcons name="check-circle" size={18} color="white" style={styles.checkIcon} />
            )}
            <Text style={styles.reflectButtonText}> (+1 Coin)</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Back Home */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>

      {/* Reflection Modal */}
      <ReflectionModal
        visible={modalVisible}
        onSave={handleSaveReflection}
        onCancel={handleCancelReflection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF7',
    padding: 24,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    marginTop: 40,
  },
  congratsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  congrats: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 18,
    color: '#3C5A49',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  reflectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginLeft: 4,
    marginRight: 4,
  },
  reflection: {
    marginTop: 32,
    alignItems: 'center',
  },
  reflectionText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  reflectButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  reflectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#6FAF8A',
    alignItems: 'center',
    marginBottom: 24,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
