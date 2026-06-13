import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  country: string;
}

export default function HomeFeedIndex() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { token } = useAuth();

  // Currencies state for Quick FAB Alert Modal
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencyFrom, setCurrencyFrom] = useState<Currency | null>(null);
  const [currencyTo, setCurrencyTo] = useState<Currency | null>(null);
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);

  // Quick Alert States (FAB Widget)
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);
  const [quickAlertRate, setQuickAlertRate] = useState('');
  const [quickAlertCondition, setQuickAlertCondition] = useState('above');
  const [creatingQuickAlert, setCreatingQuickAlert] = useState(false);
  
  // Notification State
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  // Market watch feed items
  const newsFeed = lang === 'fr' ? [
    { id: 1, title: "Taux EUR/XAF en hausse de +0.4% chez Express Link Direct.", source: "Marché CEMAC", time: "Il y a 5 min", trend: "up", symbol: "📈" },
    { id: 2, title: "L'adoption des transferts Crypto USDT progresse en Afrique centrale.", source: "Crypto News", time: "Il y a 20 min", trend: "up", symbol: "🪙" },
    { id: 3, title: "Ecobank ajuste les limites journalières de retrait sur guichet.", source: "Finance Infos", time: "Il y a 1h", trend: "neutral", symbol: "🏦" },
    { id: 4, title: "Frais réduits sur Orange Money Cameroun vers Gabon ce weekend.", source: "Opérateurs CEMAC", time: "Il y a 2h", trend: "up", symbol: "🚀" },
  ] : [
    { id: 1, title: "Wise EUR/XAF rate is up +0.4% at Express Link Direct.", source: "CEMAC Market", time: "5m ago", trend: "up", symbol: "📈" },
    { id: 2, title: "USDT crypto transfer adoption increases in Central Africa.", source: "Crypto News", time: "20m ago", trend: "up", symbol: "🪙" },
    { id: 3, title: "Ecobank adjusts daily OTC withdrawal limits for customers.", source: "Finance Info", time: "1h ago", trend: "neutral", symbol: "🏦" },
    { id: 4, title: "Reduced transfer fees Orange Money Cameroon to Gabon this weekend.", source: "CEMAC Operators", time: "2h ago", trend: "up", symbol: "🚀" },
  ];

  const modalT = {
    fr: {
      quickAlertTitle: "Créer une alerte de taux",
      quickAlertDesc: "Configurez une alerte instantanée pour être notifié par e-mail.",
      targetRate: "Taux cible",
      condition: "Condition",
      createBtn: "Créer l'alerte",
      loginRequired: "Connexion requise",
      loginRequiredDesc: "Veuillez vous connecter pour configurer vos alertes de taux.",
      alertCreated: "Alerte créée !",
      alertCreatedDesc: "Vous recevrez un email dès que le taux cible sera atteint.",
      alertCreateFail: "Échec de la création de l'alerte.",
    },
    en: {
      quickAlertTitle: "Create Rate Alert",
      quickAlertDesc: "Configure an instant alert to be notified via email.",
      targetRate: "Target rate",
      condition: "Condition",
      createBtn: "Create alert",
      loginRequired: "Login Required",
      loginRequiredDesc: "Please log in to configure rate alerts.",
      alertCreated: "Alert created!",
      alertCreatedDesc: "You will receive an email once the target rate is reached.",
      alertCreateFail: "Failed to create rate alert.",
    }
  }[lang === 'fr' ? 'fr' : 'en'];

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const res = await api.get('/currencies');
      const activeCurs = res.data.filter((c: Currency) => c.code);
      setCurrencies(activeCurs);
      if (activeCurs.length > 0) {
        setCurrencyFrom(activeCurs[0]);
        setCurrencyTo(activeCurs[1] || activeCurs[0]);
      }
    } catch (err) {
      console.error('Failed to load currencies', err);
    }
  };

  const handleCreateQuickAlert = async () => {
    if (!token) {
      setQuickAlertOpen(false);
      Alert.alert(
        modalT.loginRequired,
        modalT.loginRequiredDesc,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.login, onPress: () => router.push('/settings') }
        ]
      );
      return;
    }

    if (!currencyFrom || !currencyTo || !quickAlertRate) {
      Alert.alert('Error', 'Please fill in target rate.');
      return;
    }

    setCreatingQuickAlert(true);
    try {
      await api.post('/alerts', {
        currency_from_id: currencyFrom.id,
        currency_to_id: currencyTo.id,
        target_rate: quickAlertRate,
        condition: quickAlertCondition
      });
      Alert.alert(modalT.alertCreated, modalT.alertCreatedDesc);
      setQuickAlertRate('');
      setQuickAlertOpen(false);
    } catch (err) {
      Alert.alert(t.error, modalT.alertCreateFail);
    } finally {
      setCreatingQuickAlert(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <StatusBar style="auto" />
      
      {/* 1. App Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
        <Text style={[styles.logoText, { color: isDark ? '#ffffff' : '#0F172A' }]}>
          EC <Text style={{ color: '#2563EB' }}>ExchangeCompare</Text>
          <Text style={{ color: '#10B981' }}>.africa</Text>
        </Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => {
              setShowNotificationBadge(false);
              Alert.alert(
                lang === 'fr' ? 'Notifications' : 'Notifications', 
                lang === 'fr' ? 'Bienvenue sur la version mobile de ExchangeCompare Africa !' : 'Welcome to the mobile version of ExchangeCompare Africa!'
              );
            }}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {showNotificationBadge && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 2. Welcome Hero & Subtitle */}
        <View style={styles.welcomeHero}>
          <Text style={[styles.welcomeTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
            {lang === 'fr' ? 'Bonjour,' : 'Hello,'} 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {lang === 'fr' ? 'Trouvez le meilleur taux pour vos transferts vers l\'Afrique.' : 'Find the best rate for your transfers to Africa.'}
          </Text>
        </View>

        {/* 3. Feature Story / Hero Card */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push('/compare')}
          style={[styles.heroCard, Platform.select({ web: { boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)' }, default: { shadowColor: '#2563EB' } })]}
        >
          <View style={styles.heroCardBadge}>
            <Text style={styles.heroCardBadgeText}>🔥 {lang === 'fr' ? 'MEILLEUR TAUX AGENT' : 'BEST AGENT RATE'}</Text>
          </View>
          <Text style={styles.heroCardTitle}>
            {lang === 'fr' ? 'Express Link Direct propose le meilleur taux CEMAC' : 'Express Link Direct offers CEMAC\'s top yield'}
          </Text>
          <Text style={styles.heroCardDesc}>
            {lang === 'fr' 
              ? 'Transférez via WhatsApp avec 2.0% de spread et recevez des fonds instantanément.' 
              : 'Transfer via WhatsApp with a low 2.0% spread and receive your funds instantly.'}
          </Text>
          <View style={styles.heroCardFooter}>
            <Text style={styles.heroCardButtonText}>{lang === 'fr' ? 'Démarrer le transfert →' : 'Start transfer →'}</Text>
          </View>
        </TouchableOpacity>

        {/* 4. Compare Call-To-Action Card */}
        <View style={[styles.ctaCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          <View style={styles.ctaHeaderRow}>
            <Text style={styles.ctaEmoji}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ctaTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
                {lang === 'fr' ? 'Comparateur de Devises' : 'Currency Converter'}
              </Text>
              <Text style={styles.ctaDesc}>
                {lang === 'fr' ? 'Comparez les banques, fintechs et cryptos en temps réel.' : 'Compare banks, fintechs and cryptos in real-time.'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.ctaBtn}
            onPress={() => router.push('/compare')}
          >
            <Text style={styles.ctaBtnText}>
              {lang === 'fr' ? 'Comparer les taux maintenant' : 'Compare rates now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Live News & Market watch list */}
        <View style={styles.newsSection}>
          <Text style={[styles.newsSectionTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
            📊 {lang === 'fr' ? 'Market Watch & Actualités' : 'Market Watch & News'}
          </Text>
          <View style={styles.newsList}>
            {newsFeed.map((item) => (
              <View 
                key={item.id} 
                style={[styles.newsCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}
              >
                <View style={styles.newsIconBox}>
                  <Text style={{ fontSize: 22 }}>{item.symbol}</Text>
                </View>
                <View style={styles.newsContent}>
                  <Text style={[styles.newsTitleText, { color: isDark ? '#ffffff' : '#0F172A' }]}>
                    {item.title}
                  </Text>
                  <View style={styles.newsMeta}>
                    <Text style={styles.newsSource}>{item.source}</Text>
                    <Text style={styles.newsDot}>•</Text>
                    <Text style={styles.newsTime}>{item.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* 6. Floating FAB Alert Button */}
      <TouchableOpacity 
        style={styles.floatingFab}
        onPress={() => setQuickAlertOpen(true)}
      >
        <Text style={styles.fabText}>+ 🔔</Text>
      </TouchableOpacity>

      {/* Quick FAB Alert Modal */}
      <Modal visible={quickAlertOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff', width: '90%' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>{modalT.quickAlertTitle}</Text>
            <Text style={styles.modalNotice}>{modalT.quickAlertDesc}</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{lang === 'fr' ? 'De' : 'From'}</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setFromPickerOpen(true)}>
                <Text style={styles.selectBtnText}>{currencyFrom ? currencyFrom.code : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{lang === 'fr' ? 'À' : 'To'}</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setToPickerOpen(true)}>
                <Text style={styles.selectBtnText}>{currencyTo ? currencyTo.code : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{modalT.condition} *</Text>
              <View style={styles.alertConditionRow}>
                <TouchableOpacity 
                  style={[styles.alertCondBtn, quickAlertCondition === 'above' && styles.alertCondBtnActive]}
                  onPress={() => setQuickAlertCondition('above')}
                >
                  <Text style={[styles.alertCondBtnText, quickAlertCondition === 'above' && styles.alertCondBtnTextActive]}>
                    {t.aboveOrEqual.split(' ')[1] || '≥'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.alertCondBtn, quickAlertCondition === 'below' && styles.alertCondBtnActive]}
                  onPress={() => setQuickAlertCondition('below')}
                >
                  <Text style={[styles.alertCondBtnText, quickAlertCondition === 'below' && styles.alertCondBtnTextActive]}>
                    {t.belowOrEqual.split(' ')[1] || '≤'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{modalT.targetRate} *</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                keyboardType="numeric"
                value={quickAlertRate}
                onChangeText={setQuickAlertRate}
                placeholder={t.targetRatePlaceholder}
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setQuickAlertOpen(false)}>
                <Text style={styles.btnCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnConfirm]} onPress={handleCreateQuickAlert} disabled={creatingQuickAlert}>
                {creatingQuickAlert ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnConfirmText}>{modalT.createBtn}</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Picker Modals */}
      <Modal visible={fromPickerOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>Source Currency</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {currencies.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={styles.pickerItem} 
                  onPress={() => { setCurrencyFrom(c); setFromPickerOpen(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: isDark ? '#ffffff' : '#000000' }]}>{c.code} - {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setFromPickerOpen(false)}>
              <Text style={styles.closeBtnText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={toPickerOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>Destination Currency</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {currencies.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={styles.pickerItem} 
                  onPress={() => { setCurrencyTo(c); setToPickerOpen(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: isDark ? '#ffffff' : '#000000' }]}>{c.code} - {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setToPickerOpen(false)}>
              <Text style={styles.closeBtnText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  
  // App Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  // Welcome Hero
  welcomeHero: {
    marginVertical: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 18,
  },

  // Feature Card (Hero banner)
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#312E81', // Indigo deep background
    borderWidth: 1,
    borderColor: '#4338CA',
    elevation: 5,
  },
  heroCardBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroCardBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  heroCardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    lineHeight: 22,
  },
  heroCardDesc: {
    color: '#C7D2FE',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  heroCardFooter: {
    alignSelf: 'flex-start',
  },
  heroCardButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // CTA Card (Redirects to Compare)
  ctaCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    elevation: 2,
  },
  ctaHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  ctaEmoji: {
    fontSize: 28,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ctaDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  ctaBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // News Watch Section
  newsSection: {
    marginBottom: 10,
  },
  newsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  newsList: {
    gap: 10,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  newsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newsContent: {
    flex: 1,
  },
  newsTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
    marginBottom: 4,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  newsDot: {
    fontSize: 10,
    color: '#64748B',
    marginHorizontal: 5,
  },
  newsTime: {
    fontSize: 10,
    color: '#64748B',
  },

  // FAB button
  floatingFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 6px rgba(37, 99, 235, 0.3)',
      },
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
    elevation: 8,
    zIndex: 999,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Modals general styling
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    }),
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalNotice: {
    fontSize: 11,
    color: '#F59E0B',
    lineHeight: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  selectBtn: {
    height: 44,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertConditionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCondBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCondBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  alertCondBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  alertCondBtnTextActive: {
    color: '#2563EB',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#334155',
  },
  btnCancelText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  btnConfirm: {
    backgroundColor: '#10B981',
  },
  btnConfirmText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pickerItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
  },
  closeBtnText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
});
