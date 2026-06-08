import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  country: string;
  type?: string;
}

export default function ResearchScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { lang, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/currencies');
      setCurrencies(res.data.filter((c: Currency) => c.code));
    } catch (err) {
      console.error('Failed to load currencies', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCurrencies = () => {
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Mock trend data
  const trends = lang === 'fr' ? [
    { pair: "EUR ➔ XAF", rate: "655.95", change: "Stable", isUp: null, text: "Taux fixe de la zone Franc CFA." },
    { pair: "USD ➔ XAF", rate: "604.20", change: "+0.45%", isUp: true, text: "Forte demande de dollars sur le marché local." },
    { pair: "USD ➔ NGN", rate: "1480.00", change: "-1.20%", isUp: false, text: "Fluctuation importante de la Naira nigériane." },
    { pair: "BTC ➔ USD", rate: "68,450.00", change: "+2.15%", isUp: true, text: "Hausse générale des marchés cryptos." },
  ] : [
    { pair: "EUR ➔ XAF", rate: "655.95", change: "Stable", isUp: null, text: "Fixed parity rate for the CFA Franc." },
    { pair: "USD ➔ XAF", rate: "604.20", change: "+0.45%", isUp: true, text: "Strong USD demand in regional CEMAC hubs." },
    { pair: "USD ➔ NGN", rate: "1480.00", change: "-1.20%", isUp: false, text: "High volatility in Nigerian Naira corridors." },
    { pair: "BTC ➔ USD", rate: "68,450.00", change: "+2.15%", isUp: true, text: "Bullish triggers across main crypto corridors." },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      
      {/* Search Bar Container */}
      <View style={[styles.searchHeader, { backgroundColor: isDark ? '#070b16' : '#F8FAFC', borderBottomColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0F172A' }]}>
          {t.research}
        </Text>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#ffffff' : '#000000' }]}
            placeholder={lang === 'fr' ? "Rechercher une devise..." : "Search a currency..."}
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Market Trends Section */}
        {searchQuery === '' && (
          <View style={styles.trendsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
              📈 {lang === 'fr' ? 'Tendance des Devises' : 'Currency Trends'}
            </Text>
            {trends.map((tr, index) => (
              <View 
                key={index}
                style={[styles.trendCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}
              >
                <View style={styles.trendRow}>
                  <Text style={[styles.trendPair, { color: isDark ? '#ffffff' : '#0F172A' }]}>{tr.pair}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.trendRate, { color: isDark ? '#ffffff' : '#0F172A' }]}>{tr.rate}</Text>
                    <Text style={[
                      styles.trendChange,
                      tr.isUp === true && styles.changeUp,
                      tr.isUp === false && styles.changeDown,
                      tr.isUp === null && styles.changeStable,
                    ]}>
                      {tr.change}
                    </Text>
                  </View>
                </View>
                <Text style={styles.trendDesc}>{tr.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Currency List Catalog */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
          🗂️ {lang === 'fr' ? 'Catalogue des devises' : 'Currencies Catalog'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.currenciesList}>
            {getFilteredCurrencies().map((cur) => (
              <View 
                key={cur.id} 
                style={[styles.currencyCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}
              >
                <View style={styles.currencyFlagBox}>
                  <Text style={styles.currencyCodeText}>{cur.code.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currencyName, { color: isDark ? '#ffffff' : '#0F172A' }]}>
                    {cur.code} - {cur.name}
                  </Text>
                  <Text style={styles.currencyMetaText}>
                    📍 {cur.country || 'Global'}
                  </Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {cur.code === 'BTC' || cur.code === 'USDT' || cur.code === 'ETH' || cur.code === 'SOL'
                      ? 'CRYPTO' 
                      : 'FIAT'}
                  </Text>
                </View>
              </View>
            ))}
            {getFilteredCurrencies().length === 0 && (
              <Text style={styles.emptyText}>
                {lang === 'fr' ? 'Aucune devise ne correspond.' : 'No matching currencies.'}
              </Text>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
  },
  
  // Market watch trends styles
  trendsSection: {
    marginBottom: 16,
  },
  trendCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendPair: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  trendRate: {
    fontSize: 16,
    fontWeight: '900',
  },
  trendChange: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  changeUp: {
    color: '#10B981',
  },
  changeDown: {
    color: '#EF4444',
  },
  changeStable: {
    color: '#94A3B8',
  },
  trendDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },

  // Currency Catalog lists
  currenciesList: {
    gap: 10,
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  currencyFlagBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencyCodeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  currencyName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  currencyMetaText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginVertical: 20,
  },
});
