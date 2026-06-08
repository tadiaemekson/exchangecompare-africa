import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { login, register, user, logout } = useAuth();
  const { t, lang } = useLanguage();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        Alert.alert(t.loginSuccess);
        router.replace('/');
      } else {
        await register(name, email, phone, password);
        Alert.alert(t.registerSuccess);
        router.replace('/');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || (isLogin ? t.loginErrorDefault : t.registerErrorDefault));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    Alert.alert('Logged out');
  };

  if (user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
        <View style={styles.centeredContent}>
          <Text style={[styles.welcomeText, { color: isDark ? '#ffffff' : '#0F172A' }]}>
            {lang === 'fr' ? 'Bienvenue,' : 'Welcome,'} {user.name}!
          </Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <Text style={styles.roleText}>{lang === 'fr' ? 'Rôle:' : 'Role:'} {user.role.toUpperCase()}</Text>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.logoutBtnText}>{t.logout}</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#070b16' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Title */}
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0F172A' }]}>{t.authTitle}</Text>
        
        {/* Tabs Selector */}
        <View style={[styles.tabList, { backgroundColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          <TouchableOpacity 
            style={[styles.tabTrigger, isLogin && styles.tabActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>{t.loginTab}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabTrigger, !isLogin && styles.tabActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>{t.registerTab}</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Forms */}
        <View style={[styles.authCard, { backgroundColor: isDark ? '#0F172A' : '#ffffff', borderColor: isDark ? '#1E293B' : '#e2e8f0' }]}>
          
          {!isLogin && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.nameLabel} *</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                value={name}
                onChangeText={setName}
                placeholder={lang === 'fr' ? 'Nom complet' : 'Full name'}
                placeholderTextColor="#64748B"
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.emailLabel} *</Text>
            <TextInput
              style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@example.com"
              placeholderTextColor="#64748B"
            />
          </View>

          {!isLogin && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.phoneLabel}</Text>
              <TextInput
                style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+237 6..."
                placeholderTextColor="#64748B"
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.formLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>{t.passwordLabel} *</Text>
              {isLogin && (
                <TouchableOpacity>
                  <Text style={styles.forgotText}>{t.forgotPassword}</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.formInput, { color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#1E293B' : '#cbd5e1' }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor="#64748B"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isLogin ? t.loginTab : t.registerBtn || t.registerTab}
              </Text>
            )}
          </TouchableOpacity>

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
    padding: 16,
    justifyContent: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabList: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  authCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
