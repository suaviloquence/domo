import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import SplashScreen from "./src/screens/SplashScreen";
import PickPetScreen from "./src/screens/PickPetScreen";

import { PetProvider, usePet } from "./src/context/PetContext";
import FocusScreen from "./src/screens/FocusScreen";

import ShopScreen from "./src/screens/ShopScreen";




const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { selectedPetId, isReady } = usePet();

  if (!isReady) return <SplashScreen />;

  // debugging brooo kmss... 
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={selectedPetId ? "Home" : "PickPet"}
      key={selectedPetId ? "app" : "onboarding"}
    >
      <Stack.Screen name="PickPet" component={PickPetScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Focus" component={FocusScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
    </Stack.Navigator>
  );
  
}

export default function App() {
  return (
    <PetProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </NavigationContainer>
    </PetProvider>
  );
}
