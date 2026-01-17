import React, { FC } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';

const MainPage: FC = () => {
  // Button handlers
  const handleHibernate = () => Alert.alert('Zzz...', 'Hibernating!');
  const handleStart = () => Alert.alert('Start', 'Start pressed!');
  const handleFood = () => Alert.alert('Food', 'Nom nom!');
  const handleClothes = () => Alert.alert('Clothes', 'Dress up!');

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#6a0dad" />
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>❤️ 100 | 💧 80 | 😄 90</Text>
        <TouchableOpacity
          style={styles.hibernateButton}
          onPress={handleHibernate}
        >
          <Text style={styles.hibernateText}>Hibernate</Text>
        </TouchableOpacity>
      </View>

      {/* Character */}
      <View style={styles.characterContainer}>
        <Image
          source={{ uri: 'https://i.imgur.com/4AiXzf8.png' }}
          style={styles.character}
          resizeMode="contain"
        />
      </View>

      {/* Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>

      {/* Food & Clothes Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFood}>
          <Text style={styles.actionText}>Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleClothes}>
          <Text style={styles.actionText}>Clothes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0e5ff',
    paddingTop: 40,
    alignItems: 'center',
  },
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  hibernateButton: {
    backgroundColor: '#6a0dad',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  hibernateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  character: {
    width: 200,
    height: 200,
  },
  startButton: {
    backgroundColor: '#ff6f61',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
