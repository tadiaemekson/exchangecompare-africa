import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useColorScheme,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AlertRule {
  id: number;
  currency_from_id: number;
  currency_to_id: number;
  target_rate: number;
  condition: string;
  is_active: boolean;
  currencyFrom?: { code: string };
  currencyTo?: { code: string };
  currency_from?: { code: string };
  currency_to?: { code: string };
}

interface Conversion {
  id: number;
  amount: number;
  converted_amount: number;
  rate: number;
  created_at: string;
  provider: { name: string };
  currencyFrom?: { code: string };
  currencyTo?: { code: string };
  currency_from?: { code: string };
  currency_to?: { code: string };
}

interface Plan {
  id: number;
  name: string;
  price: number;
}

interface Subscription {
  id: number;
  plan_id: number;
  plan: Plan;
}

interface Currency {
  id: number;
  code: string;
}

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { token, user } = useAuth();
  const { t } = useLanguage();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  // Loader status
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [savingAlert, setSavingAlert] = useState(false);

  // Form states for new Alert
  const [currencyFrom, setCurrencyFrom] = useState('');
  const [currencyTo, setCurrencyTo] = useState('');
  const [targetRate, setTargetRate] = useState('');
  const [condition, setCondition] = useState('above');
  
  // Modals triggers
  const [fromModalOpen, setFromModalOpen] = useState(false);
  const [toModalOpen, setToModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [alertsRes, curRes, convRes, plansRes, subRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/currencies'),
        api.get('/conversions'),
        api.get('/plans'),
        api.get('/subscription')
      ]);

      setAlerts(alertsRes.data);
      setCurrencies(curRes.data);
      setConversions(convRes.data);
      setPlans(plansRes.data);
      setSubscription(subRes.data);

      if (curRes.data.length > 0) {
        setCurrencyFrom(curRes.data[0].id.toString());
        setCurrencyTo(curRes.data[1] ? curRes.data[1].id.toString() : curRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async () => {
    if (!currencyFrom || !currencyTo || !targetRate) {
      Alert.alert('Error', 'Please fill in target rate.');
      return;
    }

    setSavingAlert(true);
    try {
      await api.post('/alerts', {
        currency_from_id: currencyFrom,
        currency_to_id: currencyTo,
        target_rate: targetRate,
        condition
      });
      Alert.alert(t.alertCreated, t.alertCreatedDesc);
      setTargetRate('');
      // Refresh list
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      Alert.alert(t.error, t.alertCreateFail);
    } finally {
      setSavingAlert(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.delete(`/alerts/${id}`);
      Alert.alert(t.alertDeleted);
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      Alert.alert(t.error, t.alertDeleteFail);
    }
  };

  const handleSubscribe = async (planId: number) => {
    setSubscribing(true);
    try {
      const res = await api.post('/subscribe', { plan_id: planId });
      setSubscription(res.data);
      Alert.alert(t.subUpdated, `${t.subUpdatedDesc}${res.data.plan.name}`);
    } catch (err) {
      Alert.alert(t.error, t.subUpdateFail);
    } finally {
      setSubscribing(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
        <View style={styles.centeredContent}>
          <Text style={[styles.noticeText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t.loginTab === 'Connexion' 
              ? 'Veuillez vous connecter pour configurer vos alertes de taux et consulter votre historique.'
              : 'Please log in to configure rate alerts and consult your transaction history.'}
          </Text>
          <TouchableOpacity style={styles.loginNavBtn} onPress={() => router.replace('/auth')}>
            <Text style={styles.loginNavBtnText}>{t.login}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  const selectedFromCode = currencies.find(c => c.id.toString() === currencyFrom)?.code || '';
  const selectedToCode = currencies.find(c => c.id.toString() === currencyTo)?.code || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Title */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0F172A' }]}>{t.userDashboard}</Text>
          {subscription && (
            <View style={styles.activePlanBadge}>
              <Text style={styles.activePlanLabel}>{t.myPlan} {subscription.plan.name}</Text>
            </View>
          )}
        </View>

        {/* Subscription SaaS Plans */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>{t.saasSubscriptions}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansContainer}>
          {plans.map((plan) => {
            const isActive = subscription?.plan_id === plan.id;
            return (
              <View 
                key={plan.id} 
                style={[
                  styles.planCard, 
                  { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' },
                  isActive && styles.activePlanCard
                ]}
              >
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price.toFixed(2)} $ <Text style={styles.planPeriod}>{t.perMonth}</Text></Text>
                
                <Text style={styles.planFeature}>✓ {t.unlimitedComparisons}</Text>
                <Text style={styles.planFeature}>
                  ✓ {plan.price === 0 ? t.alertsLimit3 : plan.price < 20 ? t.alertsLimit15 : t.alertsLimitUnlimited}
                </Text>

                <TouchableOpacity 
                  style={[styles.planBtn, isActive && styles.planBtnActive]} 
                  disabled={isActive || subscribing}
                  onPress={() => handleSubscribe(plan.id)}
                >
                  <Text style={[styles.planBtnText, isActive && styles.planBtnTextActive]}>
                    {isActive ? t.currentPlan : t.subscribe}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Create Rate Alert Form */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>{t.newAlert}</Text>
        <View style={[styles.formCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          <View style={styles.currencyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>{t.currencyPair} (From)</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setFromModalOpen(true)}>
                <Text style={styles.selectBtnText}>{selectedFromCode || 'Select'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.swapArrow}>→</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>{t.currencyPair} (To)</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setToModalOpen(true)}>
                <Text style={styles.selectBtnText}>{selectedToCode || 'Select'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.formLabel}>{t.triggerCondition}</Text>
            <View style={styles.conditionRow}>
              <TouchableOpacity 
                style={[styles.condBtn, condition === 'above' && styles.condBtnActive]}
                onPress={() => setCondition('above')}
              >
                <Text style={[styles.condText, condition === 'above' && styles.condTextActive]}>
                  {t.aboveOrEqual}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.condBtn, condition === 'below' && styles.condBtnActive]}
                onPress={() => setCondition('below')}
              >
                <Text style={[styles.condText, condition === 'below' && styles.condTextActive]}>
                  {t.belowOrEqual}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.formLabel}>{t.targetRate}</Text>
            <TextInput
              style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
              keyboardType="numeric"
              value={targetRate}
              onChangeText={setTargetRate}
              placeholder={t.targetRatePlaceholder}
              placeholderTextColor="#64748B"
            />
          </View>

          <TouchableOpacity style={styles.createAlertBtn} onPress={handleAddAlert} disabled={savingAlert}>
            {savingAlert ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.createAlertBtnText}>{t.createAlertBtn}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Alerts List */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>{t.myConfiguredAlerts}</Text>
        <View style={[styles.listCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          {alerts.length === 0 ? (
            <Text style={styles.emptyText}>{t.noActiveAlerts}</Text>
          ) : (
            alerts.map((alert) => {
              const fromCode = alert.currencyFrom?.code || alert.currency_from?.code;
              const toCode = alert.currencyTo?.code || alert.currency_to?.code;
              return (
                <View key={alert.id} style={styles.listItem}>
                  <View>
                    <Text style={[styles.pairText, { color: isDark ? '#ffffff' : '#000000' }]}>{fromCode} → {toCode}</Text>
                    <Text style={styles.ruleDetailText}>
                      {alert.condition === 'above' ? '≥' : '≤'} {alert.target_rate}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={[
                      styles.statusBadge, 
                      alert.is_active ? styles.statusActive : styles.statusTriggered
                    ]}>
                      {alert.is_active ? t.statusActive : t.statusTriggered}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteAlert(alert.id)}>
                      <Text style={styles.deleteBtnText}>{lang === 'fr' ? 'Suppr.' : 'Del.'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Conversions / Transfer History */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>{t.transferHistory}</Text>
        <View style={[styles.listCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          {conversions.length === 0 ? (
            <Text style={styles.emptyText}>{t.noTransfers}</Text>
          ) : (
            conversions.map((conv) => {
              const fromCode = conv.currencyFrom?.code || conv.currency_from?.code;
              const toCode = conv.currencyTo?.code || conv.currency_to?.code;
              return (
                <View key={conv.id} style={styles.historyItem}>
                  <View>
                    <Text style={[styles.historyProv, { color: isDark ? '#ffffff' : '#000000' }]}>{conv.provider.name}</Text>
                    <Text style={styles.historyDate}>{new Date(conv.created_at).toLocaleDateString()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.historyAmount}>{conv.amount.toLocaleString()} {fromCode}</Text>
                    <Text style={styles.historyReceived}>
                      → {conv.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {toCode}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* Currency Selection Modals for Alerts */}
      <Modal visible={fromModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>Source Currency</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {currencies.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={styles.pickerItem} 
                  onPress={() => { setCurrencyFrom(c.id.toString()); setFromModalOpen(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: isDark ? '#ffffff' : '#000000' }]}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setFromModalOpen(false)}>
              <Text style={styles.closeBtnText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={toModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#0F172A' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>Destination Currency</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {currencies.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={styles.pickerItem} 
                  onPress={() => { setCurrencyTo(c.id.toString()); setToModalOpen(false); }}
                >
                  <Text style={[styles.pickerItemText, { color: isDark ? '#ffffff' : '#000000' }]}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setToModalOpen(false)}>
              <Text style={styles.closeBtnText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const lang = 'fr'; // Placeholder layout

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  activePlanBadge: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
  },
  activePlanLabel: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
  },
  plansContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  planCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  activePlanCard: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  planPeriod: {
    fontSize: 12,
    color: '#94A3B8',
  },
  planFeature: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  planBtn: {
    backgroundColor: '#2563EB',
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  planBtnActive: {
    backgroundColor: '#334155',
  },
  planBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planBtnTextActive: {
    color: '#94A3B8',
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectBtn: {
    height: 40,
    backgroundColor: '#334155',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  swapArrow: {
    fontSize: 20,
    color: '#94A3B8',
    marginHorizontal: 12,
    marginTop: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  condBtn: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  condBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37,99,235,0.1)',
  },
  condText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  condTextActive: {
    color: '#2563EB',
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  createAlertBtn: {
    backgroundColor: '#2563EB',
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAlertBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    paddingVertical: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  pairText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  ruleDetailText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  statusActive: {
    color: '#064e3b',
    backgroundColor: '#d1fae5',
  },
  statusTriggered: {
    color: '#64748B',
    backgroundColor: '#cbd5e1',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  historyProv: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  historyReceived: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginNavBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginNavBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
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
