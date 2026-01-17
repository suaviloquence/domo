import React from "react";
import { Image, Text, StyleSheet, ImageStyle, TextStyle } from "react-native";
import { PetId, usePet } from "../context/PetContext";

const PET_IMAGES: Record<PetId, any> = {
  Rugy: require("../assets/RUGY.png"),
  Strawb: require("../assets/STRAWB.png"),
  Ceviche: require("../assets/CEVICHE.png"),
};

type PetDisplayProps = {
  // Optional: if not provided, we’ll use context
  selectedPetId?: PetId | null;
  size?: number;
  imageStyle?: ImageStyle;
  emojiStyle?: TextStyle;
};

export default function PetDisplay({
  selectedPetId,
  size = 256,
  imageStyle,
  emojiStyle,
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
    <Text style={[styles.petEmoji, emojiStyle]} accessibilityLabel="Egg pet">
      🐣
    </Text>
  );
}

const styles = StyleSheet.create({
  petEmoji: { fontSize: 64 },
  petImage: { width: 256, height: 256 },
});
