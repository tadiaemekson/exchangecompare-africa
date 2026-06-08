import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Platform } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';

export default function AppTabs() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { t } = useLanguage();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} isDark={isDark} t={t} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="compare" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen 
        name="auth" 
        options={{
          href: null, // Hide auth from tab bar
        }}
      />
    </Tabs>
  );
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  isDark: boolean;
  t: any;
}

function CustomTabBar({ state, descriptors, navigation, isDark, t }: CustomTabBarProps) {
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.capsule, 
          { 
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          }
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          
          // Hide hidden routes
          if (options.href === null || route.name === 'auth' || route.name === '_sitemap' || route.name === '+not-found') {
            return null;
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Label and Icon config
          let label = route.name;
          let icon = '❓';
          
          if (route.name === 'index') {
            label = t.home || 'Home';
            icon = '🏠';
          } else if (route.name === 'compare') {
            label = t.comparator || 'Compare';
            icon = '🔄';
          } else if (route.name === 'settings') {
            label = t.settings || 'Settings';
            icon = '⚙️';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && (isDark ? styles.tabItemActiveDark : styles.tabItemActiveLight)
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                {icon}
              </Text>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24, // floating spacing
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  capsule: {
    flexDirection: 'row',
    borderRadius: 35,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%', // centered pill size
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 25,
    marginHorizontal: 4,
  },
  tabItemActiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // dark active highlight capsule
  },
  tabItemActiveLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)', // light active highlight capsule
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  tabIconActive: {
    // active styling
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8', // inactive color
  },
  tabLabelActive: {
    color: '#06B6D4', // Cyan active text color to match the Translate style
  },
});
