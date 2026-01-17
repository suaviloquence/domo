import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>focus monster big chungus 🌱</Text>

      <View style={styles.card}>
        <Text style={styles.pet}>🐣</Text>
        <Text style={styles.caption}>your pet grows when you lock in</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>start focus session</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>coins: 0 • streak: 0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FAF7",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#E7F3EC",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  pet: { fontSize: 64 },
  caption: {
    fontSize: 14,
    color: "#3C5A49",
  },
  button: {
    backgroundColor: "#6FAF8A",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    fontSize: 13,
    color: "#6B7D73",
    marginTop: 8,
  },
});
