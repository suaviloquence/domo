import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { PetId, usePet } from "../context/PetContext";
import { ITEMS, ItemId } from "../data/items";

const baseImgs: Record<PetId, any> = {
  Strawb: require("../assets/STRAWB.png"),
  Rugy: require("../assets/RUGY.png"),
  Ceviche: require("../assets/CEVICHE.png"),
};

function findItemImg(itemId?: ItemId) {
  return ITEMS.find((it) => it.id === itemId)?.img;
}

export default function PetDisplay({
  selectedPetId,
  size = 220,
}: {
  selectedPetId: PetId | null;
  size?: number;
}) {
  const { equippedByPet } = usePet();
  if (!selectedPetId) return null;

  const eq = equippedByPet[selectedPetId] || {};

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image source={baseImgs[selectedPetId]} style={styles.layer} />

      {eq.shoes && <Image source={findItemImg(eq.shoes)} style={styles.layer} />}
      {eq.hat && <Image source={findItemImg(eq.hat)} style={styles.layer} />}
      {eq.glasses && <Image source={findItemImg(eq.glasses)} style={styles.layer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  layer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
