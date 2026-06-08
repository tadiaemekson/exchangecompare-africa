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
  
  // Beneficiary details form
  const [selectedResult, setSelectedResult] = useState<ComparisonResult | null>(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    beneficiary_name: '',
    bank_operator_name: '',
    account_number: '',
    beneficiary_phone: ''
  });
  const [savingBeneficiary, setSavingBeneficiary] = useState(false);

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

  const bestFintech = getBestOffer('fintech');
  const bestBank = getBestOffer('bank');
  const bestCrypto = getBestOffer('crypto');
  const bestAgent = getBestOffer('agent');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Navigation */}
        <View style={styles.header}>
          <Text style={[styles.logoText, { color: isDark ? '#ffffff' : '#0F172A' }]}>
            EC <Text style={{ color: '#2563EB' }}>ExchangeCompare</Text>
            <Text style={{ color: '#10B981' }}>.africa</Text>
          </Text>
          
          {/* Language Switcher */}
          <View style={[styles.langToggle, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
            <TouchableOpacity 
              onPress={() => changeLanguage('fr')} 
              style={[styles.langBtn, lang === 'fr' && styles.langBtnActive]}
            >
              <Text style={[styles.langText, lang === 'fr' && styles.langTextActive]}>FR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => changeLanguage('en')} 
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>{t.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
        </View>

        {/* Calculator Card */}
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

        {/* Categories Summary Cards */}
        <View style={styles.summaryGrid}>
          {/* Fintech */}
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

          {/* Bank */}
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

          {/* Crypto */}
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

        {/* Results Title & Filter Indicator */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>{t.availableOffers}</Text>
          <Text style={styles.resultsSubtitle}>{t.feesIncluded}</Text>
        </View>

        {/* Detailed Offers List */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 40 }} />
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

      </ScrollView>

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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: '#ffffff',
  },
  langText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  langTextActive: {
    color: '#2563EB',
  },
  heroSection: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
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
  offersList: {
    gap: 12,
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
    width: '80%',
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
});
