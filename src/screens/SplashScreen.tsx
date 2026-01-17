// this is like the loading screen ig
import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home"); // prevents back to splash
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/miffy.gif")}
        style={styles.avatar}
      />
      <Text style={styles.text}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 180,
    height: 180,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
  },
});
