import React from 'react';
import { Tabs } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { 
  useColorScheme, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <NavigationWrapper isDark={isDark} />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function NavigationWrapper({ isDark }: { isDark: boolean }) {
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
      <Tabs.Screen name="research" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen 
        name="auth" 
        options={{
          href: null, // Hide auth stack from primary navigation
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
          } else if (route.name === 'research') {
            label = t.research || 'Research';
            icon = '🔍';
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
              <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : { color: isDark ? '#94A3B8' : '#64748B' }]}>
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
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // active highlight capsule
  },
  tabItemActiveLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)', // active highlight capsule
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
  },
  tabLabelActive: {
    color: '#06B6D4', // Cyan active text color to match translate style
  },
});
