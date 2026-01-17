import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';

interface MainActionButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  label: string;
  style?: ViewStyle;
}

const MainActionButton: FC<MainActionButtonProps> = ({ onPress, label, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default MainActionButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff6f61',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
