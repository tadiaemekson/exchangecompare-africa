import React, { useState, useEffect } from 'react';
import {
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { t, lang, changeLanguage } = useLanguage();

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

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      try {
        await logout();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    Alert.alert(
      lang === 'fr' ? 'Déconnexion' : 'Log Out',
      lang === 'fr' ? 'Êtes-vous sûr de vouloir vous déconnecter ?' : 'Are you sure you want to log out?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        { text: t.logout || 'Log Out', style: 'destructive', onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error(err);
            }
          }
        }
      ]
    );
  };

  const selectedFromCode = currencies.find(c => c.id.toString() === currencyFrom)?.code || '';
  const selectedToCode = currencies.find(c => c.id.toString() === currencyTo)?.code || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Title */}
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0F172A' }]}>{t.settings}</Text>

        {/* ================= SECTION 1: ACCOUNT / PROFILE ================= */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          👤 {lang === 'fr' ? 'Compte' : 'Account'}
        </Text>
        
        {user ? (
          /* Logged In Profile Card */
          <View style={[styles.profileCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, { color: isDark ? '#ffffff' : '#1E293B' }]}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#EF4444' : '#2563EB' }]}>
                    <Text style={styles.roleBadgeText}>{(user.role || 'user').toUpperCase()}</Text>
                  </View>
                  {subscription && subscription.plan && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{(subscription.plan.name || '').toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>{t.logout}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Guest Mode Card */
          <View style={[styles.profileCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
            <Text style={[styles.guestTitle, { color: isDark ? '#ffffff' : '#0F172A' }]}>
              {lang === 'fr' ? 'Mode Invité' : 'Guest Mode'}
            </Text>
            <Text style={styles.guestText}>
              {lang === 'fr' 
                ? 'Connectez-vous pour pouvoir créer des alertes de taux personnalisées et voir l\'historique de vos transferts.' 
                : 'Log in to create custom rate alerts and track your transfer conversion history.'}
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth')}>
              <Text style={styles.loginBtnText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= SECTION 2: LANGUAGE SELECTION ================= */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          🌐 {lang === 'fr' ? 'Langue de l\'application' : 'App Language'}
        </Text>
        <View style={styles.langSelectorRow}>
          <TouchableOpacity
            style={[
              styles.langCard,
              { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' },
              lang === 'fr' && styles.langCardActive
            ]}
            onPress={() => changeLanguage('fr')}
          >
            <Text style={styles.flagEmoji}>🇫🇷</Text>
            <Text style={[styles.langLabelText, { color: isDark ? '#ffffff' : '#0F172A' }]}>Français</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langCard,
              { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' },
              lang === 'en' && styles.langCardActive
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={styles.flagEmoji}>🇬🇧</Text>
            <Text style={[styles.langLabelText, { color: isDark ? '#ffffff' : '#0F172A' }]}>English</Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 3: RATES & ALERTS (AUTHENTICATED ONLY) ================= */}
        {user && (
          <>
            {/* Subscription SaaS Plans */}
            <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              💳 {t.saasSubscriptions}
            </Text>
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
            <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              🔔 {t.newAlert}
            </Text>
            <View style={[styles.cardForm, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
              
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>From</Text>
                  <TouchableOpacity style={styles.selectBtn} onPress={() => setFromModalOpen(true)}>
                    <Text style={styles.selectBtnText}>{selectedFromCode || 'Select'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>To</Text>
                  <TouchableOpacity style={styles.selectBtn} onPress={() => setToModalOpen(true)}>
                    <Text style={styles.selectBtnText}>{selectedToCode || 'Select'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.triggerCondition}</Text>
                <View style={styles.conditionRow}>
                  <TouchableOpacity 
                    style={[styles.condBtn, condition === 'above' && styles.condBtnActive]} 
                    onPress={() => setCondition('above')}
                  >
                    <Text style={[styles.condBtnText, condition === 'above' && styles.condBtnTextActive]}>
                      {t.aboveOrEqual}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.condBtn, condition === 'below' && styles.condBtnActive]} 
                    onPress={() => setCondition('below')}
                  >
                    <Text style={[styles.condBtnText, condition === 'below' && styles.condBtnTextActive]}>
                      {t.belowOrEqual}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.targetRate}</Text>
                <TextInput
                  style={[styles.inputField, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                  keyboardType="numeric"
                  placeholder={t.targetRatePlaceholder}
                  placeholderTextColor="#64748B"
                  value={targetRate}
                  onChangeText={setTargetRate}
                />
              </View>

              <TouchableOpacity style={styles.createBtn} onPress={handleAddAlert} disabled={savingAlert}>
                {savingAlert ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.createBtnText}>{t.createAlertBtn}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* List Active Alerts */}
            <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              🔔 {t.myConfiguredAlerts}
            </Text>
            <View style={[styles.cardForm, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
              {alerts.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <View>
                    <Text style={[styles.pairText, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {item.currency_from?.code} ➔ {item.currency_to?.code}
                    </Text>
                    <Text style={styles.ruleDetailText}>
                      {item.condition === 'above' ? '≥' : '≤'} {item.target_rate}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={[
                      styles.statusBadge, 
                      item.is_active ? styles.statusActive : styles.statusTriggered
                    ]}>
                      {item.is_active ? t.statusActive : t.statusTriggered}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteAlert(item.id)}>
                      <Text style={styles.deleteBtnText}>❌</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {alerts.length === 0 && (
                <Text style={styles.emptyText}>{t.noActiveAlerts}</Text>
              )}
            </View>

            {/* Conversion Histories */}
            <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              📜 {t.transferHistory}
            </Text>
            <View style={[styles.cardForm, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
              {conversions.map((conv) => (
                <View key={conv.id} style={styles.historyItem}>
                  <View>
                    <Text style={[styles.historyProv, { color: isDark ? '#ffffff' : '#000000' }]}>{conv.provider.name}</Text>
                    <Text style={styles.historyDate}>{new Date(conv.created_at).toLocaleDateString()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.historyAmount, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {conv.amount.toLocaleString()} {conv.currency_from?.code}
                    </Text>
                    <Text style={styles.historyReceived}>
                      ➔ {conv.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {conv.currency_to?.code}
                    </Text>
                  </View>
                </View>
              ))}
              {conversions.length === 0 && (
                <Text style={styles.emptyText}>{t.noTransfers}</Text>
              )}
            </View>
          </>
        )}

      </ScrollView>

      {/* Picker Modals */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  
  // Profile Card Styles
  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
    }),
    elevation: 3,
    marginBottom: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  planBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Guest card styles
  guestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  guestText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Language selectors
  langSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  langCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
    }),
    elevation: 2,
  },
  langCardActive: {
    borderColor: '#2563EB',
  },
  flagEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  langLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Form & Fields Styles
  cardForm: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formCol: {
    flex: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
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
  formGroup: {
    marginBottom: 12,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  condBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  condBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  condBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  condBtnTextActive: {
    color: '#2563EB',
  },
  inputField: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  createBtn: {
    backgroundColor: '#2563EB',
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Alerts Rules Item Styles
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
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    paddingVertical: 20,
  },

  // Plans details
  plansContainer: {
    marginBottom: 20,
  },
  planCard: {
    width: 200,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  activePlanCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 12,
  },
  planPeriod: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  planFeature: {
    fontSize: 11,
    color: '#cbd5e1',
    marginBottom: 6,
  },
  planBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  planBtnActive: {
    backgroundColor: '#10B981',
  },
  planBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planBtnTextActive: {
    color: '#ffffff',
  },

  // Conversions history details
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
  },
  historyReceived: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Picker Modals Styles
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
