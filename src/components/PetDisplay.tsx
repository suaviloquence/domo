import React from "react";
import { Image, View, StyleSheet, ImageStyle } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PetId, usePet } from "../context/PetContext";

const PET_IMAGES: Record<PetId, any> = {
  Rugy: require("../assets/RUGY.png"),
  Strawb: require("../assets/STRAWB.png"),
  Ceviche: require("../assets/CEVICHE.png"),
};

type PetDisplayProps = {
  // Optional: if not provided, we'll use context
  selectedPetId?: PetId | null;
  size?: number;
  imageStyle?: ImageStyle;
};

export default function PetDisplay({
  selectedPetId,
  size = 256,
  imageStyle,
}: PetDisplayProps) {
  const ctx = usePet();
  const petId = selectedPetId ?? ctx.selectedPetId;

  if (petId) {
    return (
      <Image
        source={PET_IMAGES[petId]}
        style={[styles.petImage, { width: size, height: size }, imageStyle]}
        resizeMode="contain"
        accessibilityLabel="Your pet"
      />
    );
  }

  return (
    <View style={styles.petIconContainer} accessibilityLabel="Egg pet">
      <MaterialIcons name="egg" size={64} color="#3C5A49" />
    </View>
  );
}

const styles = StyleSheet.create({
  petIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: { width: 256, height: 256 },
});
