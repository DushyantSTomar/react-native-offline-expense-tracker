import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import Icon from '../components/Icon';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }: any) => (
    <TouchableOpacity
        style={{
            top: -20,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
    >
        <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#212529',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {children}
        </View>
    </TouchableOpacity>
);

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    backgroundColor: '#ffffff',
                    borderRadius: 15,
                    height: 90,
                    ...styles.shadow
                }
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
                            <Icon name="home" size={24} color={focused ? '#212529' : '#ADB5BD'} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Add"
                component={View} // Placeholder
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Icon name="plus" size={30} color="#fff" />
                    ),
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props} />
                    )
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('AddExpense');
                    },
                })}
            />
            <Tab.Screen
                name="StatsTab"
                component={StatsScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
                            <Icon name="chart" size={24} color={focused ? '#212529' : '#ADB5BD'} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#7F5DF0',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5
    }
});

export default TabNavigator;
