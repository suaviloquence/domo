import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { usePet, PetId } from "../context/PetContext";

const { width } = Dimensions.get("window");

const pets: ReadonlyArray<{
  id: PetId;
  name: string;
  desc: string;
  img: any;
}> = [
  {
    id: "Strawb",
    name: "Strawb",
    desc: "Chill and sleepy\nLoves long sessions",
    img: require("../assets/STRAWB.png"),
  },
  {
    id: "Rugy",
    name: "Rugy",
    desc: "Gentle and grounding\nYour steady companion",
    img: require("../assets/RUGY.png"),
  },
  {
    id: "Ceviche",
    name: "Ceviche",
    desc: "Quick bursts of energy\nPerfect for sprints",
    img: require("../assets/CEVICHE.png"),
  },
];

export default function PickPetScreen({ navigation }: any) {
  const { choosePet } = usePet();
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const selectedPet = pets[index];

  const onContinue = async () => {
    await choosePet(selectedPet.id); // ✅ no casting needed
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Choose Your Pal</Text>
        <Text style={styles.subtitle}>They&apos;ll grow with every focus session</Text>

        <FlatList
          ref={flatRef}
          data={pets}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.img} style={styles.img} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          )}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {pets.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        {/* CTA */}
        <Pressable style={styles.cta} onPress={onContinue}>
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG = "#EAF3EC";
const GREEN = "#3E6E4B";
const GREEN_MID = "#5E8768";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
  },

  title: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: "800",
    color: GREEN,
    paddingTop: 48,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: GREEN_MID,
  },

  card: {
    width,
    alignItems: "center",
    paddingTop: 40,
  },
  img: {
    width: 288,
    height: 288,
    resizeMode: "contain",
  },
  name: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "800",
    color: GREEN,
  },
  desc: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    color: GREEN_MID,
    fontWeight: "600",
  },

  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C9D8CE",
  },
  dotActive: {
    width: 18,
    backgroundColor: GREEN,
  },

  cta: {
    marginTop: 24,
    width: "85%",
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
});
