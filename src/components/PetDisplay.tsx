import React from 'react';
import {
  Image,
  Text,
  StyleSheet,
  View,
  ImageStyle,
  TextStyle,
} from 'react-native';

export const petImages: Record<string, any> = {
  Rugy: require('../assets/RUGY.png'),
  Strawb: require('../assets/STRAWB.png'),
  Ceviche: require('../assets/CEVICHE.png'),
};

type PetDisplayProps = {
  selectedPetId?: string | null;
  imageStyle?: ImageStyle;
  emojiStyle?: TextStyle;
};

export default function PetDisplay({
  selectedPetId,
  imageStyle,
  emojiStyle,
}: PetDisplayProps) {
  if (selectedPetId && petImages[selectedPetId]) {
    return (
      <Image
        source={petImages[selectedPetId]}
        style={[styles.petImage, imageStyle]}
        accessibilityLabel="Your pet"
      />
    );
  }
  // fallback emoji if no pet selected
  return (
    <Text style={[styles.pet, emojiStyle]} accessibilityLabel="Egg pet">
      🐣
    </Text>
  );
}

const styles = StyleSheet.create({
  pet: { fontSize: 64 },
  petImage: { width: 256, height: 256 },
});
