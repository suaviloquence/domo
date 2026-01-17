import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PetDisplay, { petImages } from '../components/PetDisplay';
import { usePet } from '../context/PetContext';

export default function PickPetScreen({ navigation }: any) {
  const { choosePet } = usePet();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick your pet</Text>
      <Text style={styles.sub}>This will be your focus buddy 🧃</Text>

      <View style={styles.row}>
        {Object.keys(petImages).map(p => (
          <Pressable
            key={p}
            style={styles.card}
            hitSlop={10}
            onPress={async () => {
              console.log('picked:', p);
              await choosePet(p);
              navigation.replace('Home');
            }}
          >
            <PetDisplay selectedPetId={p} imageStyle={styles} />
            <Text style={styles.name}>{p}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 6, marginBottom: 18, opacity: 0.6 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  card: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  img: { width: 90, height: 90 },
  name: { marginTop: 10, fontWeight: '700' },
});
