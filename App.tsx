import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { getDBConnection, createTables } from './src/db/Database';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await getDBConnection();
        await createTables(db);
        setDbLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  if (!dbLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading Database...</Text>
      </View>
    );
  }

  // ... inside App component
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
