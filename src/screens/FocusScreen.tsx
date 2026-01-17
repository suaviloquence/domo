import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { usePet } from "../context/PetContext";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function FocusScreen({ navigation, route }: any) {
  const { completeFocusSession } = usePet();

  // Demo-friendly default : 10 minutes maybe we can change to 25 * 60 later.
  const initialSeconds = useMemo(() => {
    const fromRoute = route?.params?.seconds;
    return typeof fromRoute === "number" ? fromRoute : 10 * 60;
  }, [route?.params?.seconds]);

  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isDone, setIsDone] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || isDone) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, isDone]);

  useEffect(() => {
    if (secondsLeft === 0 && !isDone) {
      setIsRunning(false);
      setIsDone(true);
    }
  }, [secondsLeft, isDone]);

  const onFinish = async () => {
    await completeFocusSession(); // awards coins + streak
    navigation.goBack();
  };

  const onReset = () => {
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
    setIsDone(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>focus session</Text>

      <View style={styles.timerCard}>
        <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
        <Text style={styles.subtitle}>
          {isDone ? "session complete 🎉" : isRunning ? "locked in…" : "paused"}
        </Text>
      </View>

      {!isDone ? (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isRunning ? "#999" : "#6FAF8A" }]}
            onPress={() => setIsRunning((v) => !v)}
          >
            <Text style={styles.buttonText}>{isRunning ? "pause" : "resume"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: "#6FAF8A" }]} onPress={onReset}>
            <Text style={styles.buttonText}>reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: "#6FAF8A" }]} onPress={onFinish}>
          <Text style={styles.buttonText}>collect rewards</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.linkButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.linkText}>back to home</Text>
      </TouchableOpacity>
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
    gap: 18,
  },
  title: { fontSize: 22, fontWeight: "700" },
  timerCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#E7F3EC",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    gap: 8,
  },
  timer: { fontSize: 52, fontWeight: "800" },
  subtitle: { fontSize: 14, color: "#3C5A49" },
  row: { flexDirection: "row", gap: 12, width: "100%", maxWidth: 340 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  linkButton: { paddingTop: 6 },
  linkText: { color: "#6B7D73", textDecorationLine: "underline" },
});
