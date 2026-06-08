import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Title */}
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0F172A' }]}>
          {t.languageSettings}
        </Text>
        <Text style={styles.subtitle}>
          {t.chooseLanguage}
        </Text>

        {/* Card Options */}
        <View style={styles.cardContainer}>
          {/* French Card */}
          <TouchableOpacity
            style={[
              styles.langCard,
              { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' },
              lang === 'fr' && styles.activeCard,
            ]}
            onPress={() => changeLanguage('fr')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.flagText}>🇫🇷</Text>
              {lang === 'fr' && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
              Français
            </Text>
            <Text style={styles.cardDesc}>
              Activez la langue française sur toute l'interface.
            </Text>
          </TouchableOpacity>

          {/* English Card */}
          <TouchableOpacity
            style={[
              styles.langCard,
              { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' },
              lang === 'en' && styles.activeCard,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.flagText}>🇬🇧</Text>
              {lang === 'en' && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
              English
            </Text>
            <Text style={styles.cardDesc}>
              Enable English language across the entire application interface.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={[styles.infoBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <Text style={[styles.infoText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
            {lang === 'fr'
              ? '💡 Le changement de langue est appliqué instantanément et enregistré dans vos préférences locales.'
              : '💡 Language changes are applied instantly and saved to your local device preferences.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  cardContainer: {
    gap: 16,
    marginBottom: 32,
  },
  langCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  activeCard: {
    borderColor: '#2563EB',
    shadowOpacity: 0.1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagText: {
    fontSize: 36,
  },
  checkBadge: {
    backgroundColor: '#2563EB',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
