import React, { FC } from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface CharacterDisplayProps {
  imageUrl: string;
  size?: number;
}

const CharacterDisplay: FC<CharacterDisplayProps> = ({ imageUrl, size = 200 }) => (
  <View style={styles.container}>
    <Image
      source={{ uri: imageUrl }}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default CharacterDisplay;
