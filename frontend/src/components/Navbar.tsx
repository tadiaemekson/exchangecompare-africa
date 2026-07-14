import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  ChevronDown,
  ArrowRightLeft,
  Globe
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface NavbarProps {
  currentLang: 'fr' | 'en';
  onChangeLanguage: (lang: 'fr' | 'en') => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Subscription {
  id: number;
  plan_id: number;
  plan: {
    id: number;
    name: string;
    price: number;
  };
}

interface Plan {
  id: number;
  name: string;
  price: number;
}

const navbarTranslations = {
  fr: {
    comparator: "Comparateur",
    dashboard: "Tableau de bord",
    admin: "Admin",
    logout: "Se déconnecter",
    login: "Se connecter",
    profile: "Mon Profil",
    currentPlan: "Plan Actuel",
    noPlan: "Aucun plan actif",
    userInfo: "Informations de l'utilisateur",
    menu: "Menu principal",
    email: "Email",
    phone: "Téléphone",
    role: "Rôle",
    loggedOut: "Déconnexion réussie",
    plansTitle: "Changer de Plan",
    subscribe: "S'abonner",
    activePlan: "Plan Actuel",
    subUpdated: "Abonnement mis à jour !",
    subUpdatedDesc: "Vous êtes maintenant abonné au plan ",
    subUpdateFail: "Échec de la mise à jour de l'abonnement."
  },
  en: {
    comparator: "Comparator",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Log Out",
    login: "Log In",
    profile: "My Profile",
    currentPlan: "Current Plan",
    noPlan: "No active plan",
    userInfo: "User Information",
    menu: "Main Menu",
    email: "Email",
    phone: "Phone",
    role: "Role",
    loggedOut: "Logged out successfully",
    plansTitle: "Change Plan",
    subscribe: "Subscribe",
    activePlan: "Active Plan",
    subUpdated: "Subscription updated!",
    subUpdatedDesc: "You are now subscribed to the plan ",
    subUpdateFail: "Failed to update subscription."
  }
};

export default function Navbar({ currentLang, onChangeLanguage }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const t = navbarTranslations[currentLang];

  useEffect(() => {
    // Read user data from localStorage
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const parsedUser = JSON.parse(userDataStr);
        setUser(parsedUser);
        
        // Fetch subscription and plans if logged in
        Promise.all([
          api.get('/subscription'),
          api.get('/plans')
        ])
          .then(([subRes, plansRes]) => {
            if (subRes.data) {
              setSubscription(subRes.data);
            }
            if (plansRes.data) {
              setPlans(plansRes.data);
            }
          })
          .catch(err => {
            console.error("Error fetching subscription or plans details", err);
          });
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleSubscribe = async (planId: number) => {
    setLoadingSub(true);
    try {
      const res = await api.post('/subscribe', { plan_id: planId });
      setSubscription(res.data);
      toast.success(t.subUpdated, { description: `${t.subUpdatedDesc}${res.data.plan.name}` });
    } catch (err) {
      toast.error(t.subUpdateFail);
    } finally {
      setLoadingSub(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSubscription(null);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    toast.success(t.loggedOut);
    navigate('/auth');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md sticky top-0 z-50 w-full transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="ExchangeCompare Africa Logo" 
            className="h-11 w-auto object-contain bg-white rounded-md p-1 border border-slate-200/50 dark:border-slate-800/80" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 py-1 ${
              isActive('/') 
                ? 'text-[#2563EB] border-b-2 border-[#2563EB]' 
                : 'text-slate-600 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-[#2563EB]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {t.comparator}
          </Link>
          
          {user && (
            <Link 
              to="/dashboard" 
              className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 py-1 ${
                isActive('/dashboard') 
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]' 
                  : 'text-slate-600 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-[#2563EB]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t.dashboard}
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 py-1 ${
                isActive('/admin') 
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]' 
                  : 'text-slate-600 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-[#2563EB]'
              }`}
            >
              <Settings className="w-4 h-4" />
              {t.admin}
            </Link>
          )}
        </nav>

        {/* Desktop Actions & User Menu */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => onChangeLanguage('fr')}
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-all duration-200 ${
                currentLang === 'fr' 
                  ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-all duration-200 ${
                currentLang === 'en' 
                  ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              EN
            </button>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-800 h-5" />

          {/* Auth Button or User Dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors duration-155"
              >
                <div className="w-5 h-5 rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/25 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold truncate max-w-[120px]">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Box */}
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-20 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                    <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.profile}</p>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{user.name}</p>
                      <p className="text-xs text-slate-450 dark:text-slate-400 truncate">{user.email}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350 mt-3">
                          <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span className="font-semibold">{t.currentPlan}:</span>
                          <span className="font-extrabold px-2 py-0.5 bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-blue-400 rounded-full">
                            {subscription?.plan?.name || t.noPlan}
                          </span>
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{t.phone}:</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{user.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Subscription plans list (Desktop) */}
                      {plans.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-2 mt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.plansTitle}</p>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                            {plans.map((plan) => {
                              const isActivePlan = subscription?.plan_id === plan.id;
                              return (
                                <div key={plan.id} className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                                  <div className="truncate max-w-[130px]">
                                    <span className="font-bold text-slate-850 dark:text-slate-200 block truncate">{plan.name}</span>
                                    <span className="text-[9px] text-slate-400 font-medium block">{plan.price.toFixed(2)} $ / mo</span>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={isActivePlan || loadingSub}
                                    onClick={() => handleSubscribe(plan.id)}
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-all duration-150 ${
                                      isActivePlan
                                        ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-450 cursor-default'
                                        : 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-xs'
                                    }`}
                                  >
                                    {isActivePlan ? t.activePlan : t.subscribe}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors duration-150"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <button className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-9 px-4 text-xs rounded-lg shadow-sm transition-all duration-150">
                {t.login}
              </button>
            </Link>
          )}

        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-hidden transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-205">
          
          {/* Menu Title */}
          <div className="px-1 py-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.menu}</span>
          </div>

          {/* Primary Navigation Options */}
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-bold flex items-center gap-2 py-2.5 px-3 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-slate-50 dark:bg-slate-900 text-[#2563EB]' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
              {t.comparator}
            </Link>
            
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-bold flex items-center gap-2 py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-slate-50 dark:bg-slate-900 text-[#2563EB]' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                {t.dashboard}
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-bold flex items-center gap-2 py-2.5 px-3 rounded-lg transition-colors ${
                  isActive('/admin') 
                    ? 'bg-slate-50 dark:bg-slate-900 text-[#2563EB]' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <Settings className="w-4 h-4" text-slate-500 />
                {t.admin}
              </Link>
            )}
          </div>

          {/* Profile Card Container & User Information */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-905">
            {user ? (
              <div className="space-y-4">
                {/* Profile Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/25 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.profile}</h4>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{user.name}</h3>
                    </div>
                  </div>
                  
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{t.email}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{t.phone}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{user.phone}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#2563EB] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{t.currentPlan}</span>
                        <span className="font-extrabold inline-block mt-0.5 px-2.5 py-0.5 bg-[#2563EB]/15 text-[#2563EB] dark:bg-[#2563EB]/25 dark:text-blue-400 rounded-full text-[10px]">
                          {subscription?.plan?.name || t.noPlan}
                        </span>
                      </div>
                    </div>

                    {/* Subscription plans list (Mobile) */}
                    {plans.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/65 space-y-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{t.plansTitle}</span>
                        <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                          {plans.map((plan) => {
                            const isActivePlan = subscription?.plan_id === plan.id;
                            return (
                              <div key={plan.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{plan.name}</span>
                                  <span className="text-[9px] text-slate-400 font-medium block">{plan.price.toFixed(2)} $ / mo</span>
                                </div>
                                <button
                                  type="button"
                                  disabled={isActivePlan || loadingSub}
                                  onClick={() => handleSubscribe(plan.id)}
                                  className={`text-[9px] font-extrabold px-2.5 py-1 rounded transition-all duration-150 ${
                                    isActivePlan
                                      ? 'bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-450 cursor-default'
                                      : 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-xs'
                                  }`}
                                >
                                  {isActivePlan ? t.activePlan : t.subscribe}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-10 px-4 text-sm rounded-lg shadow-sm">
                  <User className="w-4 h-4" />
                  {t.login}
                </button>
              </Link>
            )}
          </div>

          {/* Language Switcher Footer inside mobile menu */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Langue / Language
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => {
                  onChangeLanguage('fr');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all duration-150 ${
                  currentLang === 'fr' 
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeLanguage('en');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all duration-150 ${
                  currentLang === 'en' 
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>
      )}
    </header>
  );
}
