import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { requestPermission } from './src/notifications';

import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import PickPetScreen from './src/screens/PickPetScreen';
import FocusScreen from './src/screens/FocusScreen';
import ShopScreen from './src/screens/ShopScreen';
import JournalScreen from './src/screens/JournalScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { PetProvider, usePet } from './src/context/PetContext';
import CompletionScreen from './src/screens/CompletionScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { selectedPetId, isReady } = usePet();

  if (!isReady) return <SplashScreen />;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={selectedPetId ? 'Home' : 'PickPet'}
    >
      <Stack.Screen name="PickPet" component={PickPetScreen} />

      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Focus" component={FocusScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Completion" component={CompletionScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <PetProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PetProvider>
  );
}
