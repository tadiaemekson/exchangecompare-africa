import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Mail, Phone, Shield } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

const translations = {
  fr: {
    subtitle: "Comparez les taux de change et configurez vos alertes",
    loginTab: "Connexion",
    registerTab: "Inscription",
    emailLabel: "Email",
    emailPlaceholder: "nom@exemple.com",
    passwordLabel: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    passwordPlaceholder: "••••••••",
    loginBtn: "Se connecter",
    loggingIn: "Connexion en cours...",
    nameLabel: "Nom complet",
    namePlaceholder: "Jean Dupont",
    phoneLabel: "Téléphone",
    phonePlaceholder: "+237 6xx xx xx xx",
    passwordMinLength: "Mot de passe (min. 6 caractères)",
    registerBtn: "Créer mon compte",
    registering: "Création en cours...",
    agreeNotice: "En continuant, vous acceptez nos",
    terms: "Conditions d'utilisation",
    and: "et notre",
    privacy: "Politique de confidentialité",
    loginSuccess: "Connexion réussie !",
    loginErrorDefault: "Identifiants ou mot de passe incorrects.",
    loginFailed: "Échec de la connexion",
    registerSuccess: "Inscription réussie !",
    registerErrorDefault: "Erreur lors de l'inscription. Veuillez réessayer.",
    registerFailed: "Échec de l'inscription"
  },
  en: {
    subtitle: "Compare exchange rates and set up your alerts",
    loginTab: "Log In",
    registerTab: "Sign Up",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    passwordPlaceholder: "••••••••",
    loginBtn: "Log In",
    loggingIn: "Logging in...",
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+237 6xx xx xx xx",
    passwordMinLength: "Password (min. 6 characters)",
    registerBtn: "Create Account",
    registering: "Creating account...",
    agreeNotice: "By continuing, you agree to our",
    terms: "Terms of Use",
    and: "and our",
    privacy: "Privacy Policy",
    loginSuccess: "Login successful!",
    loginErrorDefault: "Incorrect email or password.",
    loginFailed: "Login failed",
    registerSuccess: "Registration successful!",
    registerErrorDefault: "Registration error. Please try again.",
    registerFailed: "Registration failed"
  }
};

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang: 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = translations[lang];

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', loginData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(t.loginSuccess);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || t.loginErrorDefault;
      setError(msg);
      toast.error(t.loginFailed);
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/register', registerData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(t.registerSuccess);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || t.registerErrorDefault;
      setError(msg);
      toast.error(t.registerFailed);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] flex items-center justify-center p-4 font-sans">
      <div className="bg-gradient-glow w-[300px] h-[300px] bg-secondary rounded-full top-[10%] left-[10%]" />
      <div className="bg-gradient-glow w-[300px] h-[300px] bg-accent rounded-full bottom-[10%] right-[10%]" />

      <Card className="w-full max-w-md shadow-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md relative z-10">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-between items-center mb-3">
              <div className="w-10"></div> {/* Spacer */}
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              
              {/* Mini Language Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => changeLanguage('fr')}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-all ${lang === 'fr' ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
                >
                  EN
                </button>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="ExchangeCompare Africa Logo" className="h-12 w-auto object-contain bg-white rounded-md p-1 border border-slate-200/50" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center">
              ExchangeCompare
            </CardTitle>
            <CardDescription className="text-slate-500">
              {t.subtitle}
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger value="login" className="rounded-md">{t.loginTab}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md">{t.registerTab}</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="pt-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mb-4 border border-red-200/30">
                {error}
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.emailLabel}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={t.emailPlaceholder} 
                      className="pl-9"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t.passwordLabel}</Label>
                    <a href="#" className="text-xs text-secondary hover:underline">{t.forgotPassword}</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder={t.passwordPlaceholder}
                      className="pl-9"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium" disabled={loading}>
                  {loading ? t.loggingIn : t.loginBtn}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.nameLabel}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder={t.namePlaceholder} 
                      className="pl-9"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t.emailLabel}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder={t.emailPlaceholder} 
                      className="pl-9"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">{t.phoneLabel}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reg-phone" 
                      type="tel" 
                      placeholder={t.phonePlaceholder} 
                      className="pl-9"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t.passwordMinLength}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder={t.passwordPlaceholder}
                      className="pl-9"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-medium" disabled={loading}>
                  {loading ? t.registering : t.registerBtn}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 p-4 mt-4">
            <p className="text-[11px] text-slate-500 text-center max-w-xs">
              {t.agreeNotice} <a href="#" className="underline hover:text-slate-700">{t.terms}</a> {t.and} <a href="#" className="underline hover:text-slate-700">{t.privacy}</a>.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
