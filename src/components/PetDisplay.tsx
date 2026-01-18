import React from 'react';
import { View, Image, StyleSheet, ImageStyle } from 'react-native';
import { PetId, usePet } from '../context/PetContext';
import { ITEMS, ItemId } from '../data/items';

const PET_IMAGES: Record<PetId, any> = {
  Strawb: require('../assets/STRAWB.png'),
  Rugy: require('../assets/RUGY.png'),
  Ceviche: require('../assets/CEVICHE.png'),
};

const PET_IMAGES_SAD: Record<PetId, any> = {
  Rugy: require('../assets/RUGY_sad.png'),
  Strawb: require('../assets/STRAWB_sad.png'),
  Ceviche: require('../assets/CEVICHE_sad.png'),
};

function findItemImg(itemId?: ItemId) {
  return ITEMS.find(it => it.id === itemId)?.img;
}

type PetDisplayProps = {
  selectedPetId?: PetId | null;
  size?: number;
  imageStyle?: ImageStyle;
  forceSad?: boolean;
};

export default function PetDisplay({
  selectedPetId,
  size = 220,
  imageStyle,
  forceSad = false,
}: PetDisplayProps) {
  const ctx = usePet();
  const petId = selectedPetId ?? ctx.selectedPetId;
  const isSad = forceSad || (ctx.hunger !== undefined && ctx.hunger <= 2);

  if (!petId) return null;

  const eq = ctx.equippedByPet[petId] || {};
  const baseImg = isSad ? PET_IMAGES_SAD[petId] : PET_IMAGES[petId];

  return (
    <View style={[styles.wrap, { width: size, height: size }, imageStyle]}>
      <Image
        source={baseImg}
        style={styles.layer}
        accessibilityLabel={isSad ? 'Your sad pet' : 'Your pet'}
      />

      {eq.shoes && (
        <Image source={findItemImg(eq.shoes)} style={styles.layer} />
      )}
      {eq.hat && <Image source={findItemImg(eq.hat)} style={styles.layer} />}
      {eq.glasses && (
        <Image source={findItemImg(eq.glasses)} style={styles.layer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  layer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
