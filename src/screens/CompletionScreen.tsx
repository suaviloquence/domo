import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { usePet } from '../context/PetContext';
import ReflectionModal from '../components/ReflectionModal';

interface CompletionScreenProps {
  navigation: any;
  route: any;
}

function calculateFocusRewards(totalSeconds: number) {
  const K = 1 / 10000;
  return {
    coinsShouldHave: Math.floor(totalSeconds / 600 / K), // 1 coin per 10 min, scaled by K
    foodShouldHave: Math.floor(totalSeconds / 1800 / K), // 1 food per 30 min, scaled by K
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
    streak,
    completeFocusSession,
    checkAndDepleteHunger,
  } = usePet();

  // Get data from route params
  const timeSpent = route?.params?.timeSpent || 25 * 60; // seconds
  const goal = route?.params?.goal || '';
  const startTime = route?.params?.startTime || Date.now() - timeSpent * 1000; // timestamp in milliseconds

  // Track if streak was extended
  const [streakExtended, setStreakExtended] = useState(false);

  // Track rewards granted this session for display
  const [coinReward, setCoinReward] = useState(0);
  const [foodReward, setFoodReward] = useState(0);

  // Use a ref to track which timeSpent we've already processed
  const processedTimeSpentRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
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

      // Store rewards for display
      setCoinReward(coinsToGrant);
      setFoodReward(foodToGrant);

      if (coinsToGrant > 0) {
        await addCoins(coinsToGrant);
        await setCoinsEarnedFromFocus(currentCoinsEarned + coinsToGrant);
      }
      if (foodToGrant > 0) {
        await setFood(currentFood + foodToGrant);
        await setFoodEarnedFromFocus(currentFoodEarned + foodToGrant);
      }
      await setTotalFocusSeconds(newTotalSeconds);

      // Update streak
      const previousStreak = streak;
      await completeFocusSession();
      setStreakExtended(streak > previousStreak);

      // Check and deplete hunger
      await checkAndDepleteHunger();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeSpent]); // Only depend on timeSpent to detect new sessions

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
      {/* Food Icon Accent */}
      <View style={styles.foodIconContainer}>
        <Image source={require('../assets/food.png')} style={styles.foodIcon} />
      </View>

      {/* Congratulatory Message */}
      <View style={styles.top}>
        <View style={styles.congratsContainer}>
          <Text style={styles.congrats}>Great job!</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            You spent {formatTime(timeSpent)} on
          </Text>
          <Text style={styles.goalText}>"{goal}"</Text>
        </View>
      </View>

      {/* Reward Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rewards</Text>
        <View style={styles.rewardRow}>
          <View style={styles.rewardIconContainer}>
            <Image source={require('../assets/food.png')} style={styles.icons} />
            {/* <MaterialIcons name="restaurant" size={16} color="#3C5A49" /> */}
          </View>
          <Text style={styles.cardText}>+{foodReward} Food</Text>
        </View>
        <View style={styles.rewardRow}>
          <View style={styles.rewardIconContainer}>
            <Image source={require('../assets/coin.png')} style={styles.icons} />
            {/* <MaterialIcons name="monetization-on" size={16} color="#3C5A49" /> */}
          </View>
          <Text style={styles.cardText}>+{coinReward} Coins</Text>
        </View>
        {streakExtended && (
          <View style={styles.rewardRow}>
            <View style={[styles.rewardIconContainer, styles.streakIcon]}>
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color="#FF6B35"
              />
            </View>
            <Text style={styles.cardText}>Streak Extended!</Text>
          </View>
        )}
      </View>

      {/* Reflection Section */}
      <View style={styles.reflection}>
        <Text style={styles.reflectionText}>
          Take a moment to reflect on how it went
        </Text>
        <TouchableOpacity
          style={[styles.reflectButton, reflected && styles.reflectButtonDone]}
          onPress={handleReflect}
          disabled={reflected}
          activeOpacity={0.8}
        >
          <View style={styles.reflectButtonContent}>
            {reflected ? (
              <MaterialIcons
                name="check-circle"
                size={16}
                color="white"
                style={styles.checkIcon}
              />
            ) : (
              <MaterialIcons
                name="edit"
                size={16}
                color="white"
                style={styles.checkIcon}
              />
            )}
            <Text style={styles.reflectButtonText}>
              {reflected ? 'Reflected' : 'Reflect'}
            </Text>
            <Text style={styles.reflectButtonSubtext}>(+1 Coin)</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Back Home */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.8}
      >
        <MaterialIcons name="home" size={18} color="#3C5A49" />
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
    padding: 16,
    // justifyContent: 'space-between',
    gap: 16,
    justifyContent: 'center',
  },
  foodIconContainer: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E7F3EC',
    borderWidth: 2,
    borderColor: '#D4E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3C5A49',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  foodIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  top: {
    alignItems: 'center',
    marginTop: 8,
  },
  congratsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  congrats: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
    color: '#3C5A49',
    letterSpacing: 0.5,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#6B7D73',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  goalText: {
    fontSize: 16,
    color: '#3C5A49',
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#E7F3EC',
    borderRadius: 16,
    margin: 20,
    padding: 30,
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7D73',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  rewardIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D4E5DA',
  },
  streakIcon: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FFE0D4',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 0.2,
  },
  reflection: {
    alignItems: 'center',
  },
  reflectionText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#6B7D73',
    letterSpacing: 0.2,
  },
  reflectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#6FAF8A',
    borderWidth: 2,
    borderColor: '#5A9A75',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reflectButtonDone: {
    backgroundColor: '#6B7D73',
    borderColor: '#5A6B63',
  },
  reflectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 5,
  },
  reflectButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  reflectButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 5,
  },
  homeButton: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: '#5A9A75',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '60%',
    alignSelf: 'center',
  },
  homeButtonText: {
    color: '#3C5A49',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  icons: {
    width: 16,
    height: 16,
  },
});
