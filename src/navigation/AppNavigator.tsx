import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
                <Stack.Screen
                    name="Tabs"
                    component={TabNavigator}
                />
                <Stack.Screen
                    name="AddExpense"
                    component={AddExpenseScreen}
                    options={{ presentation: 'modal' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
