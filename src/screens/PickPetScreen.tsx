import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { usePet } from "../context/PetContext";

const pets = [
  { id: "pet1", name: "ronnie", img: require("../assets/koala.gif") },
  { id: "pet2", name: "lingling", img: require("../assets/bear.gif") },
  { id: "pet3", name: "joebama", img: require("../assets/hamster.gif") },
] as const;

export default function PickPetScreen({ navigation }: any) {
  const { choosePet } = usePet();

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Pick your pet</Text>
      <Text style={styles.sub}>This will be your focus buddy 🧃</Text>

      <View style={styles.row}>
        {pets.map((p) => (
          <Pressable
          key={p.id}
          style={styles.card}
          hitSlop={10}
          onPress={async () => {
            console.log("picked:", p.id);
            await choosePet(p.id);
            navigation.replace("Home");
          }}
        >
        
            <Image source={p.img} style={styles.img} />
            <Text style={styles.name}>{p.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 6, marginBottom: 18, opacity: 0.6 },
  row: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  card: { flex: 1, backgroundColor: "#f3f3f3", borderRadius: 18, padding: 14, alignItems: "center" },
  img: { width: 90, height: 90 },
  name: { marginTop: 10, fontWeight: "700" },
});
