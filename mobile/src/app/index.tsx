import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  useColorScheme,
  Clipboard,
} from 'react-native';
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
  type?: string;
}

interface Provider {
  id: number;
  name: string;
  website: string;
  rating: number;
  logo_url: string;
  type: string;
}

interface ComparisonResult {
  provider: Provider;
  converted_amount: number;
  buy_rate: number;
  sell_rate: number;
  fees: number;
}

export default function HomeIndex() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { lang, changeLanguage, t } = useLanguage();
  const { token } = useAuth();

  // Core state
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencyFrom, setCurrencyFrom] = useState<Currency | null>(null);
  const [currencyTo, setCurrencyTo] = useState<Currency | null>(null);
  const [amount, setAmount] = useState('150000');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Picker/Modal controls
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);
  const [beneficiaryOpen, setBeneficiaryOpen] = useState(false);
  
  // Quick Alert States (FAB Widget)
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);
  const [quickAlertRate, setQuickAlertRate] = useState('');
  const [quickAlertCondition, setQuickAlertCondition] = useState('above');
  const [creatingQuickAlert, setCreatingQuickAlert] = useState(false);
  
  // Beneficiary details form
  const [selectedResult, setSelectedResult] = useState<ComparisonResult | null>(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    beneficiary_name: '',
    bank_operator_name: '',
    account_number: '',
    beneficiary_phone: ''
  });
  const [savingBeneficiary, setSavingBeneficiary] = useState(false);

  // Notifications State
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  // Market watch feed items
  const newsFeed = lang === 'fr' ? [
    { id: 1, title: "Taux EUR/XAF en hausse de +0.4% chez Express Link Direct.", source: "Marché CEMAC", time: "Il y a 5 min", trend: "up", symbol: "📈" },
    { id: 2, title: "L'adoption des transferts Crypto USDT progresse en Afrique centrale.", source: "Crypto News", time: "Il y a 20 min", trend: "up", symbol: "🪙" },
    { id: 3, title: "Ecobank ajuste les limites journalières de retrait sur guichet.", source: "Finance Infos", time: "Il y a 1h", trend: "neutral", symbol: "🏦" },
  ] : [
    { id: 1, title: "Wise EUR/XAF rate is up +0.4% at Express Link Direct.", source: "CEMAC Market", time: "5m ago", trend: "up", symbol: "📈" },
    { id: 2, title: "USDT crypto transfer adoption increases in Central Africa.", source: "Crypto News", time: "20m ago", trend: "up", symbol: "🪙" },
    { id: 3, title: "Ecobank adjusts daily OTC withdrawal limits for customers.", source: "Finance Info", time: "1h ago", trend: "neutral", symbol: "🏦" },
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

  // Run comparison
  const runComparison = async () => {
    if (!currencyFrom || !currencyTo || !amount) return;
    setLoading(true);
    try {
      const res = await api.get('/compare', {
        params: {
          amount,
          currency_from: currencyFrom.code,
          currency_to: currencyTo.code,
        }
      });
      setResults(res.data.recommendations);
    } catch (err) {
      console.error('Comparison error', err);
      Alert.alert(t.error, 'Failed to compare rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currencyFrom && currencyTo && amount) {
      const timer = setTimeout(() => {
        runComparison();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currencyFrom, currencyTo, amount]);

  // Filters results based on selected category tab
  const getFilteredResults = () => {
    if (selectedType === 'all') return results;
    return results.filter(r => r.provider.type === selectedType);
  };

  // Find best offer for a specific category
  const getBestOffer = (type: string) => {
    const matching = results.filter(r => r.provider.type === type);
    if (matching.length === 0) return null;
    return matching.reduce((prev, curr) => prev.converted_amount > curr.converted_amount ? prev : curr);
  };

  const handleTransfer = async (result: ComparisonResult) => {
    if (result.provider.type === 'agent') {
      setSelectedResult(result);
      setBeneficiaryForm({
        beneficiary_name: '',
        bank_operator_name: '',
        account_number: '',
        beneficiary_phone: ''
      });
      setBeneficiaryOpen(true);
      return;
    }

    const redirectToProvider = () => {
      if (result.provider.website) {
        Linking.openURL(result.provider.website);
      } else {
        Alert.alert(t.error, 'No website configured for provider.');
      }
    };

    if (!token) {
      Alert.alert(
        t.guestRedirect,
        '',
        [{ text: 'OK', onPress: redirectToProvider }]
      );
      return;
    }

    try {
      await api.post('/conversions', {
        amount,
        converted_amount: result.converted_amount,
        rate: result.buy_rate,
        provider_id: result.provider.id,
        currency_from_id: currencyFrom?.id,
        currency_to_id: currencyTo?.id,
      });
      Alert.alert(t.savedSuccess, '', [{ text: 'OK', onPress: redirectToProvider }]);
    } catch (err) {
      console.error('Failed to log conversion', err);
      redirectToProvider();
    }
  };

  const submitBeneficiary = async () => {
    if (!selectedResult || !currencyFrom || !currencyTo) return;
    const { beneficiary_name, bank_operator_name, account_number } = beneficiaryForm;
    if (!beneficiary_name || !bank_operator_name || !account_number) {
      Alert.alert('Error', 'Please fill in all mandatory fields.');
      return;
    }

    setSavingBeneficiary(true);
    try {
      await api.post('/conversions', {
        amount,
        converted_amount: selectedResult.converted_amount,
        rate: selectedResult.buy_rate,
        provider_id: selectedResult.provider.id,
        currency_from_id: currencyFrom.id,
        currency_to_id: currencyTo.id,
        beneficiary_details: beneficiaryForm,
      });

      // Format WhatsApp content based on selected language
      const formattedMsg = lang === 'fr'
        ? `Bonjour Express Link Direct,\nJe souhaite effectuer un transfert de *${parseFloat(amount).toLocaleString()} ${currencyFrom.code}* vers *${currencyTo.code}*.\n\n*Informations P2P Bénéficiaire:*\n- *Nom complet:* ${beneficiary_name}\n- *Banque/Opérateur:* ${bank_operator_name}\n- *N° Compte/Téléphone:* ${account_number}\n${beneficiaryForm.beneficiary_phone ? `- *Téléphone contact:* ${beneficiaryForm.beneficiary_phone}\n` : ''}\n*Détails financiers:*\n- *Taux:* ${selectedResult.buy_rate}\n- *Frais:* ${selectedResult.fees} ${currencyFrom.code}\n- *Montant estimé reçu:* ${selectedResult.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencyTo.code}\n\nMerci de me communiquer les coordonnées de dépôt.`
        : `Hello Express Link Direct,\nI would like to initiate a transfer of *${parseFloat(amount).toLocaleString()} ${currencyFrom.code}* to *${currencyTo.code}*.\n\n*Beneficiary P2P Details:*\n- *Full Name:* ${beneficiary_name}\n- *Bank/Operator:* ${bank_operator_name}\n- *Account/Phone Number:* ${account_number}\n${beneficiaryForm.beneficiary_phone ? `- *Contact Phone:* ${beneficiaryForm.beneficiary_phone}\n` : ''}\n*Financial Summary:*\n- *Rate:* ${selectedResult.buy_rate}\n- *Fees:* ${selectedResult.fees} ${currencyFrom.code}\n- *Estimated Amount Received:* ${selectedResult.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencyTo.code}\n\nThank you for sharing deposit coordinates.`;

      const providerUrl = selectedResult.provider.website || '';
      const isDirectWa = providerUrl.includes('wa.me') || providerUrl.includes('api.whatsapp.com');

      if (isDirectWa) {
        const encodedMsg = encodeURIComponent(formattedMsg);
        const waRedirectUrl = `${providerUrl}${providerUrl.includes('?') ? '&' : '?'}text=${encodedMsg}`;
        setBeneficiaryOpen(false);
        Linking.openURL(waRedirectUrl);
      } else {
        Clipboard.setString(formattedMsg);
        setBeneficiaryOpen(false);
        Alert.alert(
          t.copiedDirect,
          '',
          [{ text: 'OK', onPress: () => Linking.openURL(providerUrl) }]
        );
      }
    } catch (err) {
      console.error('Direct transfer error', err);
      Alert.alert(t.error, t.directFail);
    } finally {
      setSavingBeneficiary(false);
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
          { text: t.login, onPress: () => router.replace('/settings') }
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

  const bestFintech = getBestOffer('fintech');
  const bestBank = getBestOffer('bank');
  const bestCrypto = getBestOffer('crypto');
  const bestAgent = getBestOffer('agent');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <StatusBar style="auto" />
      
      {/* 1. App Header & Top Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
        <Text style={[styles.logoText, { color: isDark ? '#ffffff' : '#0F172A' }]}>
          EC <Text style={{ color: '#2563EB' }}>ExchangeCompare</Text>
          <Text style={{ color: '#10B981' }}>.africa</Text>
        </Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => {
              setShowNotificationBadge(false);
              Alert.alert(lang === 'fr' ? 'Notifications' : 'Notifications', lang === 'fr' ? 'Aucune nouvelle notification.' : 'No new notifications.');
            }}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {showNotificationBadge && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 2. Top Navigation Tabs Category Slider */}
        <View style={styles.topTabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topTabsScrollContainer}>
            <TouchableOpacity 
              style={[styles.topTabPill, selectedType === 'all' && styles.topTabPillActive]}
              onPress={() => setSelectedType('all')}
            >
              <Text style={[styles.topTabText, selectedType === 'all' && styles.topTabActiveText]}>
                🌍 {lang === 'fr' ? 'Tout' : 'All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topTabPill, selectedType === 'fintech' && styles.topTabPillActive]}
              onPress={() => setSelectedType('fintech')}
            >
              <Text style={[styles.topTabText, selectedType === 'fintech' && styles.topTabActiveText]}>
                🚀 Fintech
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topTabPill, selectedType === 'bank' && styles.topTabPillActive]}
              onPress={() => setSelectedType('bank')}
            >
              <Text style={[styles.topTabText, selectedType === 'bank' && styles.topTabActiveText]}>
                🏦 {lang === 'fr' ? 'Banques' : 'Banks'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topTabPill, selectedType === 'crypto' && styles.topTabPillActive]}
              onPress={() => setSelectedType('crypto')}
            >
              <Text style={[styles.topTabText, selectedType === 'crypto' && styles.topTabActiveText]}>
                🪙 Crypto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topTabPill, selectedType === 'agent' && styles.topTabPillActive]}
              onPress={() => setSelectedType('agent')}
            >
              <Text style={[styles.topTabText, selectedType === 'agent' && styles.topTabActiveText]}>
                👤 {lang === 'fr' ? 'Agents' : 'Agents'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 3. Feature Story / Hero Card */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setSelectedType('agent')}
          style={[styles.heroCard, { shadowColor: '#2563EB' }]}
        >
          <View style={styles.heroCardBadge}>
            <Text style={styles.heroCardBadgeText}>🔥 {lang === 'fr' ? 'MEILLEUR DEAL P2P' : 'BEST P2P RATE'}</Text>
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
            <Text style={styles.heroCardButtonText}>{lang === 'fr' ? 'Voir l\'offre →' : 'View Offer →'}</Text>
          </View>
        </TouchableOpacity>

        {/* 4. Calculator Card */}
        <View style={[styles.calcCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.sendAmount}</Text>
            <TextInput
              style={[styles.inputField, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.currencyRow}>
            <View style={styles.currencyCol}>
              <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>From</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setFromPickerOpen(true)}>
                <Text style={styles.selectBtnText}>{currencyFrom ? currencyFrom.code : 'Select'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.swapArrow}>→</Text>

            <View style={styles.currencyCol}>
              <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.destCurrency}</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setToPickerOpen(true)}>
                <Text style={styles.selectBtnText}>{currencyTo ? currencyTo.code : 'Select'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Categories Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <TouchableOpacity 
            style={[styles.summaryCard, selectedType === 'fintech' && styles.cardActiveFintech]}
            onPress={() => setSelectedType(selectedType === 'fintech' ? 'all' : 'fintech')}
          >
            <Text style={styles.cardHeader}>🚀 Fintech</Text>
            <Text style={styles.cardAmount}>
              {bestFintech ? `${bestFintech.converted_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : t.noOfferShort}
            </Text>
            {bestFintech && <Text style={styles.cardRate}>Taux: {bestFintech.buy_rate.toFixed(4)}</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.summaryCard, selectedType === 'bank' && styles.cardActiveBank]}
            onPress={() => setSelectedType(selectedType === 'bank' ? 'all' : 'bank')}
          >
            <Text style={styles.cardHeader}>🏦 Bank</Text>
            <Text style={styles.cardAmount}>
              {bestBank ? `${bestBank.converted_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : t.noOfferShort}
            </Text>
            {bestBank && <Text style={styles.cardRate}>Taux: {bestBank.buy_rate.toFixed(4)}</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.summaryCard, selectedType === 'crypto' && styles.cardActiveCrypto]}
            onPress={() => setSelectedType(selectedType === 'crypto' ? 'all' : 'crypto')}
          >
            <Text style={styles.cardHeader}>🪙 Crypto</Text>
            <Text style={styles.cardAmount}>
              {bestCrypto ? `${bestCrypto.converted_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : t.noOfferShort}
            </Text>
            {bestCrypto && <Text style={styles.cardRate}>Taux: {bestCrypto.buy_rate.toFixed(4)}</Text>}
          </TouchableOpacity>
        </View>

        {/* 6. Results Title */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>{t.availableOffers}</Text>
          <Text style={styles.resultsSubtitle}>{t.feesIncluded}</Text>
        </View>

        {/* 7. Detailed Offers List */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.offersList}>
            {getFilteredResults().map((res, index) => (
              <View 
                key={index} 
                style={[
                  styles.offerItem, 
                  { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' },
                  index === 0 && styles.firstOffer
                ]}
              >
                {index === 0 && (
                  <View style={styles.recommendationBadge}>
                    <Text style={styles.recommendationText}>{t.topOffer}</Text>
                  </View>
                )}
                
                <View style={styles.offerRow}>
                  <View>
                    <Text style={[styles.providerName, { color: isDark ? '#ffffff' : '#0F172A' }]}>{res.provider.name}</Text>
                    <Text style={styles.providerTypeText}>{res.provider.type.toUpperCase()}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.convertedAmountText}>
                      {res.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyTo?.code}
                    </Text>
                    <Text style={styles.rateDetailText}>
                      1 {currencyFrom?.code} = {res.buy_rate.toFixed(5)} {currencyTo?.code}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#e2e8f0' }]} />

                <View style={styles.offerRow}>
                  <Text style={styles.feesText}>
                    {t.transferFees}: {res.fees > 0 ? `${res.fees} ${currencyFrom?.code}` : t.free}
                  </Text>
                  <TouchableOpacity style={styles.transferBtn} onPress={() => handleTransfer(res)}>
                    <Text style={styles.transferBtnText}>{t.transferBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {getFilteredResults().length === 0 && (
              <Text style={styles.noOffersText}>{t.noOfferCategory}</Text>
            )}
          </View>
        )}

        {/* 8. News Feed List / Market Insights */}
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

      {/* 9. Floating FAB Action Button */}
      <TouchableOpacity 
        style={styles.floatingFab}
        onPress={() => setQuickAlertOpen(true)}
      >
        <Text style={styles.fabText}>+ 🔔</Text>
      </TouchableOpacity>

      {/* Currency Selection Modals */}
      {/* From Picker */}
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

      {/* To Picker */}
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

      {/* Beneficiary Details Modal */}
      <Modal visible={beneficiaryOpen} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff', width: '90%' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>{t.modalTitle}</Text>
            <Text style={styles.modalNotice}>{t.modalNotice}</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.fullName} *</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                value={beneficiaryForm.beneficiary_name}
                onChangeText={(val) => setBeneficiaryForm({...beneficiaryForm, beneficiary_name: val})}
                placeholder="e.g. John Doe"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.bankOperator} *</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                value={beneficiaryForm.bank_operator_name}
                onChangeText={(val) => setBeneficiaryForm({...beneficiaryForm, bank_operator_name: val})}
                placeholder="e.g. Orange Money, MTN, Bank"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.accountNumber} *</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                value={beneficiaryForm.account_number}
                onChangeText={(val) => setBeneficiaryForm({...beneficiaryForm, account_number: val})}
                placeholder="e.g. +237699999999"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.contactPhone}</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                value={beneficiaryForm.beneficiary_phone}
                onChangeText={(val) => setBeneficiaryForm({...beneficiaryForm, beneficiary_phone: val})}
                placeholder="Optional"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setBeneficiaryOpen(false)}>
                <Text style={styles.btnCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnConfirm]} onPress={submitBeneficiary} disabled={savingBeneficiary}>
                {savingBeneficiary ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnConfirmText}>{t.confirmTransfer}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB Quick alert modal */}
      <Modal visible={quickAlertOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff', width: '90%' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>{modalT.quickAlertTitle}</Text>
            <Text style={styles.modalNotice}>{modalT.quickAlertDesc}</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{lang === 'fr' ? 'Paire active' : 'Active pair'}</Text>
              <View style={styles.alertPairBox}>
                <Text style={[styles.alertPairText, { color: isDark ? '#ffffff' : '#000000' }]}>
                  {currencyFrom?.code} ➔ {currencyTo?.code}
                </Text>
              </View>
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
  
  // 1. App Header & Top Bar Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: { paddingTop: 4 },
      android: { paddingTop: 10 }
    })
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

  // 2. Top Navigation Category Pills
  topTabsWrapper: {
    marginVertical: 14,
  },
  topTabsScrollContainer: {
    gap: 8,
    paddingRight: 16,
  },
  topTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  topTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  topTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  topTabActiveText: {
    color: '#ffffff',
  },

  // 3. Feature Story / Hero Card
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

  // 4. Calculator Card Styles
  calcCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputField: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyCol: {
    flex: 1,
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  swapArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginHorizontal: 12,
    marginTop: 18,
  },

  // 5. Categories Summary Cards Grid
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  cardActiveFintech: {
    borderColor: '#10B981',
    backgroundColor: '#064e3b',
  },
  cardActiveBank: {
    borderColor: '#2563EB',
    backgroundColor: '#1e3a8a',
  },
  cardActiveCrypto: {
    borderColor: '#8B5CF6',
    backgroundColor: '#4c1d95',
  },
  cardHeader: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardRate: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
  },

  // 6. Results Header Styles
  resultsHeader: {
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // 7. Detailed Offers List Styles
  offersList: {
    gap: 12,
    marginBottom: 24,
  },
  offerItem: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  firstOffer: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  recommendationBadge: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 10,
  },
  recommendationText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  offerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  providerTypeText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: 'bold',
  },
  convertedAmountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  rateDetailText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  feesText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  transferBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  transferBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noOffersText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginVertical: 20,
  },

  // 8. News & Market Watch Feed
  newsSection: {
    marginTop: 10,
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

  // 9. Floating FAB button styles
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
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Modals Styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pickerItemText: {
    fontSize: 14,
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

  // FAB Quick Alert specific styles
  alertPairBox: {
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  alertPairText: {
    fontSize: 16,
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
});
