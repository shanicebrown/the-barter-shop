import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme';

import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import MatchScreen from '../screens/Match/MatchScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<Exclude<keyof MainTabParamList, 'Barter'>, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'home', default: 'home-outline' },
  Search: { focused: 'location', default: 'location-outline' },
  Messages: { focused: 'chatbubbles', default: 'chatbubbles-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Barter') {
            return (
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/BarterLogo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            );
          }

          const icons = TAB_ICONS[route.name as Exclude<keyof MainTabParamList, 'Barter'>];
          const iconName = focused ? icons.focused : icons.default;

          // Messages and Profile tabs use coral/red when active
          const activeColor = (route.name === 'Messages' || route.name === 'Profile')
            ? '#FF4444'
            : colors.primary;

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={focused ? activeColor : '#888'}
            />
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Barter" component={MatchScreen} />
      <Tab.Screen name="Messages" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
});
