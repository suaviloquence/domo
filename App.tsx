import React, { FC } from 'react';
import { SafeAreaView } from 'react-native';
import MainPage from './src/screens/MainPage';

const App: FC = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <MainPage />
  </SafeAreaView>
);

export default App;
