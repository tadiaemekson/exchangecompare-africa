import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Users, Globe, LogOut, Plus, Edit, Trash2, ArrowLeft, Landmark, RefreshCw, Layers } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';

interface Provider {
  id: number;
  name: string;
  website: string;
  rating: number;
  status: string;
  type?: string;
  logo_url: string;
  is_active: boolean;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  country: string;
  is_active: boolean;
}

interface ExchangeRate {
  id: number;
  provider_id: number;
  from_currency_id: number;
  to_currency_id: number;
  buy_rate: number;
  sell_rate: number;
  fee_percentage: number;
  fixed_fee: number;
  provider?: Provider;
  currency_from?: Currency;
  currency_to?: Currency;
  currencyFrom?: Currency;
  currencyTo?: Currency;
}

interface Conversion {
  id: number;
  amount: number;
  converted_amount: number;
  rate: number;
  created_at: string;
  user?: { name: string; email: string };
  provider?: { name: string; type?: string };
  currency_from?: Currency;
  currency_to?: Currency;
  currencyFrom?: Currency;
  currencyTo?: Currency;
  beneficiary_details?: {
    beneficiary_name: string;
    bank_operator_name: string;
    account_number: string;
    beneficiary_phone?: string;
  };
}

const translations = {
  fr: {
    // Router & Verify
    accessDenied: "Accès refusé",
    pleaseLoginAdmin: "Veuillez vous connecter en tant qu'administrateur.",
    zoneReservedAdmin: "Cette zone est réservée aux administrateurs.",
    invalidSession: "Session invalide",
    pleaseReconnect: "Veuillez vous reconnecter.",
    sessionExpired: "Session expirée",
    syncDataError: "Impossible de synchroniser les données d'administration.",
    logoutSuccess: "Déconnexion réussie",
    error: "Erreur",
    tableProvider: "Fournisseur",
    
    // Sidebar
    logoTitle: "EC Admin",
    overview: "Vue d'ensemble",
    providers: "Fournisseurs",
    currencies: "Devises",
    rates: "Taux de change",
    globalConversions: "Global Transactions",
    logout: "Déconnexion",
    
    // Header
    consoleTitle: "Console d'Administration",
    consoleSubtitle: "Gérez le comparateur de taux de change ExchangeCompare Africa en temps réel.",
    publicReturn: "Retour public",
    
    // Overview tab
    statsUsers: "Utilisateurs",
    statsProviders: "Fournisseurs",
    statsRates: "Taux connectés",
    statsConversions: "Conversions sauvegardées",
    instructionsTitle: "Instructions Générales",
    instructionsBody: "Utilisez les menus sur la barre latérale pour administrer la plateforme. Vous pouvez ajouter des fournisseurs de transfert, déclarer de nouvelles devises avec leurs pays respectifs, et lier des taux de change spécifiques en configurant les frais fixes et variables. Les utilisateurs connectés pourront directement comparer les taux et enregistrer leurs transactions d'échange.",
    
    // Actions: general
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    status: "Statut",
    actions: "Actions",
    active: "Actif",
    inactive: "Inactif",
    
    // Providers Tab
    providersTitle: "Fournisseurs de transfert",
    providersDesc: "Gérez les prestataires configurés dans le comparateur.",
    addProvider: "Ajouter un Fournisseur",
    editProvider: "Modifier le Fournisseur",
    name: "Nom",
    providerType: "Type de Fournisseur",
    website: "Site Web",
    rating: "Note Globale (0-5)",
    logoUrl: "Logo URL",
    markActive: "Marquer comme actif",
    update: "Mettre à jour",
    fintechType: "🚀 Fintech & Transfert",
    bankType: "🏦 Banque Traditionnelle",
    cryptoType: "🪙 Crypto Exchange",
    agentType: "👤 Agent Direct (P2P)",
    noProviders: "Aucun fournisseur trouvé.",
    confirmDeleteProv: "Êtes-vous sûr de vouloir supprimer ce fournisseur ?",
    provSaved: "Fournisseur enregistré !",
    provUpdated: "Fournisseur mis à jour !",
    provDeleteSuccess: "Fournisseur supprimé",
    provSaveFail: "Erreur lors de la sauvegarde du fournisseur.",
    provDeleteFail: "Erreur lors de la suppression.",
    
    // Currencies Tab
    currenciesTitle: "Devises",
    currenciesDesc: "Gérez les devises disponibles pour comparaison.",
    addCurrency: "Ajouter une Devise",
    editCurrency: "Modifier la Devise",
    isoCode: "Code ISO (ex: XAF, USD)",
    fullName: "Nom complet",
    symbol: "Symbole (ex: $, €)",
    originCountry: "Pays d'origine",
    markCurrencyActive: "Marquer comme active",
    currencyActive: "Active",
    currencyInactive: "Inactive",
    noCurrencies: "Aucune devise trouvée.",
    confirmDeleteCur: "Êtes-vous sûr de vouloir supprimer cette devise ?",
    curSaved: "Devise enregistrée !",
    curUpdated: "Devise mise à jour !",
    curDeleteSuccess: "Devise supprimée",
    curSaveFail: "Erreur lors de la sauvegarde de la devise.",
    curDeleteFail: "Erreur lors de la suppression.",
    
    // Rates Tab
    ratesTitle: "Taux de change & Frais",
    ratesDesc: "Gérez les taux d'achat et de vente associés aux fournisseurs d'échange.",
    ratesDescCount: "taux au total",
    addRate: "Ajouter un Taux",
    editRate: "Modifier le Taux",
    sourceCurrency: "Devise Source",
    destCurrency: "Devise Destination",
    buyRate: "Taux Achat",
    sellRate: "Taux Vente",
    variableFees: "Frais Variables (%)",
    fixedFees: "Frais Fixes (Devise Source)",
    filterAllProviders: "Tous les fournisseurs",
    loadingRates: "Chargement des taux de change...",
    pair: "Paire",
    fees: "Frais",
    free: "Gratuit",
    noRates: "Aucun taux configuré.",
    paginationShowing: "Affichage de la page",
    paginationOf: "sur",
    paginationRates: "taux",
    prev: "Précédent",
    next: "Suivant",
    confirmDeleteRate: "Êtes-vous sûr de vouloir supprimer ce taux ?",
    rateSaved: "Taux enregistré !",
    rateUpdated: "Taux mis à jour !",
    rateDeleteSuccess: "Taux supprimé",
    rateSaveFail: "Erreur lors de la sauvegarde du taux.",
    rateDeleteFail: "Erreur lors de la suppression.",
    
    // Global Conversions Tab
    globalTransTitle: "Historique Global des Transactions",
    globalTransDesc: "Consultez l'historique complet des conversions et transferts simulés par les utilisateurs.",
    tableUser: "Utilisateur",
    tableSent: "Montant envoyé",
    tableRate: "Taux appliqué",
    tableReceived: "Montant reçu",
    tableDate: "Date",
    guestUser: "Visiteur",
    directP2PBadge: "Transfert Direct P2P",
    p2pName: "Nom :",
    p2pOperator: "Opérateur :",
    p2pAccount: "N° Compte :",
    p2pPhone: "Tél :",
    noHistory: "Aucun historique d'échange enregistré."
  },
  en: {
    // Router & Verify
    accessDenied: "Access denied",
    pleaseLoginAdmin: "Please log in as an administrator.",
    zoneReservedAdmin: "This zone is reserved for administrators.",
    invalidSession: "Invalid session",
    pleaseReconnect: "Please log in again.",
    sessionExpired: "Session expired",
    syncDataError: "Unable to synchronize administrator data.",
    logoutSuccess: "Logout successful",
    error: "Error",
    tableProvider: "Provider",
    
    // Sidebar
    logoTitle: "EC Admin",
    overview: "Overview",
    providers: "Providers",
    currencies: "Currencies",
    rates: "Exchange Rates",
    globalConversions: "Global Transactions",
    logout: "Log Out",
    
    // Header
    consoleTitle: "Admin Console",
    consoleSubtitle: "Manage the ExchangeCompare Africa exchange rate comparator in real-time.",
    publicReturn: "Public site",
    
    // Overview tab
    statsUsers: "Users",
    statsProviders: "Providers",
    statsRates: "Connected Rates",
    statsConversions: "Saved Conversions",
    instructionsTitle: "General Instructions",
    instructionsBody: "Use the sidebar menus to administer the platform. You can add transfer providers, define new currencies with their respective countries, and link specific exchange rates by setting variable and fixed fees. Logged-in users will be able to directly compare rates and save their exchange transactions.",
    
    // Actions: general
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    
    // Providers Tab
    providersTitle: "Transfer Providers",
    providersDesc: "Manage the providers configured in the comparator.",
    addProvider: "Add Provider",
    editProvider: "Edit Provider",
    name: "Name",
    providerType: "Provider Type",
    website: "Website",
    rating: "Overall Rating (0-5)",
    logoUrl: "Logo URL",
    markActive: "Mark as active",
    update: "Update",
    fintechType: "🚀 Fintech & Transfer",
    bankType: "🏦 Traditional Bank",
    cryptoType: "🪙 Crypto Exchange",
    agentType: "👤 Direct Agent (P2P)",
    noProviders: "No providers found.",
    confirmDeleteProv: "Are you sure you want to delete this provider?",
    provSaved: "Provider saved!",
    provUpdated: "Provider updated!",
    provDeleteSuccess: "Provider deleted",
    provSaveFail: "Error saving provider.",
    provDeleteFail: "Error deleting provider.",
    
    // Currencies Tab
    currenciesTitle: "Currencies",
    currenciesDesc: "Manage currencies available for comparison.",
    addCurrency: "Add Currency",
    editCurrency: "Edit Currency",
    isoCode: "ISO Code (e.g. XAF, USD)",
    fullName: "Full Name",
    symbol: "Symbol (e.g. $, €)",
    originCountry: "Country of Origin",
    markCurrencyActive: "Mark as active",
    currencyActive: "Active",
    currencyInactive: "Inactive",
    noCurrencies: "No currencies found.",
    confirmDeleteCur: "Are you sure you want to delete this currency?",
    curSaved: "Currency saved!",
    curUpdated: "Currency updated!",
    curDeleteSuccess: "Currency deleted",
    curSaveFail: "Error saving currency.",
    curDeleteFail: "Error deleting currency.",
    
    // Rates Tab
    ratesTitle: "Exchange Rates & Fees",
    ratesDesc: "Manage buy and sell rates associated with exchange providers.",
    ratesDescCount: "rates total",
    addRate: "Add Rate",
    editRate: "Edit Rate",
    sourceCurrency: "Source Currency",
    destCurrency: "Destination Currency",
    buyRate: "Buy Rate",
    sellRate: "Sell Rate",
    variableFees: "Variable Fees (%)",
    fixedFees: "Fixed Fees (Source Currency)",
    filterAllProviders: "All providers",
    loadingRates: "Loading exchange rates...",
    pair: "Pair",
    fees: "Fees",
    free: "Free",
    noRates: "No rates configured.",
    paginationShowing: "Showing page",
    paginationOf: "of",
    paginationRates: "rates",
    prev: "Previous",
    next: "Next",
    confirmDeleteRate: "Are you sure you want to delete this rate?",
    rateSaved: "Rate saved!",
    rateUpdated: "Rate updated!",
    rateDeleteSuccess: "Rate deleted",
    rateSaveFail: "Error saving rate.",
    rateDeleteFail: "Error deleting rate.",
    
    // Global Conversions Tab
    globalTransTitle: "Global Transactions History",
    globalTransDesc: "Consult the complete history of user conversions and simulated transfers.",
    tableUser: "User",
    tableSent: "Sent Amount",
    tableRate: "Applied Rate",
    tableReceived: "Received Amount",
    tableDate: "Date",
    guestUser: "Visitor",
    directP2PBadge: "Direct P2P Transfer",
    p2pName: "Name:",
    p2pOperator: "Operator:",
    p2pAccount: "Account No.:",
    p2pPhone: "Phone:",
    noHistory: "No exchange history recorded."
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  
  // Data lists
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  
  // Global stats
  const [stats, setStats] = useState({ users: 2, providers: 0, rates: 0, conversions: 0 });

  // Pagination and filter states
  const [ratesPage, setRatesPage] = useState(1);
  const [ratesLastPage, setRatesLastPage] = useState(1);
  const [ratesTotal, setRatesTotal] = useState(0);
  const [ratesPerPage] = useState(50);
  const [filterProvider, setFilterProvider] = useState('');
  const [filterFromCurrency, setFilterFromCurrency] = useState('');
  const [filterToCurrency, setFilterToCurrency] = useState('');
  const [loadingRates, setLoadingRates] = useState(false);

  // Dialog control states
  const [activeTab, setActiveTab] = useState('overview');
  
  const [providerOpen, setProviderOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [providerForm, setProviderForm] = useState({
    name: '', website: '', rating: 5.0, status: 'active', type: 'fintech', logo_url: '', is_active: true
  });
  
  const [currencyForm, setCurrencyForm] = useState({
    code: '', name: '', symbol: '', country: '', is_active: true
  });
  
  const [rateForm, setRateForm] = useState({
    provider_id: '', from_currency_id: '', to_currency_id: '', buy_rate: '', sell_rate: '', fee_percentage: '0', fixed_fee: '0'
  });

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    let activeLang = 'fr';
    if (savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang);
      activeLang = savedLang;
    }
    
    const tCurrent = translations[activeLang as 'fr' | 'en'];
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      toast.error(tCurrent.accessDenied, { description: tCurrent.pleaseLoginAdmin });
      navigate('/auth');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        toast.error(tCurrent.accessDenied, { description: tCurrent.zoneReservedAdmin });
        navigate('/');
        return;
      }
    } catch (e) {
      toast.error(tCurrent.invalidSession, { description: tCurrent.pleaseReconnect });
      localStorage.clear();
      navigate('/auth');
      return;
    }

    fetchAllData();
  }, []);

  const changeLanguage = (newLang: 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = translations[lang];

  const fetchRates = async (page = 1) => {
    setLoadingRates(true);
    try {
      const response = await api.get('/rates', {
        params: {
          page,
          per_page: ratesPerPage,
          provider_id: filterProvider || undefined,
          currency_from: filterFromCurrency || undefined,
          currency_to: filterToCurrency || undefined,
        }
      });
      setRates(response.data.data);
      setRatesPage(response.data.current_page);
      setRatesLastPage(response.data.last_page);
      setRatesTotal(response.data.total);

      setStats(prev => ({
        ...prev,
        rates: response.data.total
      }));
    } catch (err: any) {
      console.error(err);
      toast.error(t.error, { description: t.loadingRates });
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' && activeTab === 'rates') {
          fetchRates(1);
        }
      } catch (e) {}
    }
  }, [filterProvider, filterFromCurrency, filterToCurrency, activeTab]);

  const fetchAllData = async () => {
    try {
      const [provRes, curRes, convRes, usersRes] = await Promise.all([
        api.get('/providers'),
        api.get('/currencies'),
        api.get('/conversions'),
        api.get('/admin/users-count')
      ]);

      setProviders(provRes.data);
      setCurrencies(curRes.data);
      setConversions(convRes.data);

      await fetchRates(1);

      setStats(prev => ({
        ...prev,
        users: usersRes.data.count,
        providers: provRes.data.length,
        conversions: convRes.data.length
      }));
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        toast.error(t.sessionExpired, { description: t.pleaseReconnect });
        localStorage.clear();
        navigate('/auth');
      } else {
        toast.error(t.error, { description: t.syncDataError });
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success(t.logoutSuccess);
    navigate('/auth');
  };

  // PROVIDERS ACTIONS
  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/providers/${editingId}`, providerForm);
        toast.success(t.provUpdated);
      } else {
        await api.post('/providers', providerForm);
        toast.success(t.provSaved);
      }
      setProviderOpen(false);
      setEditingId(null);
      setProviderForm({ name: '', website: '', rating: 5.0, status: 'active', type: 'fintech', logo_url: '', is_active: true });
      fetchAllData();
    } catch (err) {
      toast.error(t.provSaveFail);
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm(t.confirmDeleteProv)) return;
    try {
      await api.delete(`/providers/${id}`);
      toast.success(t.provDeleteSuccess);
      fetchAllData();
    } catch (err) {
      toast.error(t.provDeleteFail);
    }
  };

  // CURRENCIES ACTIONS
  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/currencies/${editingId}`, currencyForm);
        toast.success(t.curUpdated);
      } else {
        await api.post('/currencies', currencyForm);
        toast.success(t.curSaved);
      }
      setCurrencyOpen(false);
      setEditingId(null);
      setCurrencyForm({ code: '', name: '', symbol: '', country: '', is_active: true });
      fetchAllData();
    } catch (err) {
      toast.error(t.curSaveFail);
    }
  };

  const handleDeleteCurrency = async (id: number) => {
    if (!confirm(t.confirmDeleteCur)) return;
    try {
      await api.delete(`/currencies/${id}`);
      toast.success(t.curDeleteSuccess);
      fetchAllData();
    } catch (err) {
      toast.error(t.curDeleteFail);
    }
  };

  // RATES ACTIONS
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/rates/${editingId}`, rateForm);
        toast.success(t.rateUpdated);
      } else {
        await api.post('/rates', rateForm);
        toast.success(t.rateSaved);
      }
      setRateOpen(false);
      setEditingId(null);
      setRateForm({ provider_id: '', from_currency_id: '', to_currency_id: '', buy_rate: '', sell_rate: '', fee_percentage: '0', fixed_fee: '0' });
      fetchAllData();
    } catch (err) {
      toast.error(t.rateSaveFail);
    }
  };

  const handleDeleteRate = async (id: number) => {
    if (!confirm(t.confirmDeleteRate)) return;
    try {
      await api.delete(`/rates/${id}`);
      toast.success(t.rateDeleteSuccess);
      fetchAllData();
    } catch (err) {
      toast.error(t.rateDeleteFail);
    }
  };

  const openEditProvider = (p: Provider) => {
    setEditingId(p.id);
    setProviderForm({
      name: p.name, website: p.website || '', rating: p.rating, status: p.status, type: p.type || 'fintech', logo_url: p.logo_url || '', is_active: p.is_active
    });
    setProviderOpen(true);
  };

  const openEditCurrency = (c: Currency) => {
    setEditingId(c.id);
    setCurrencyForm({
      code: c.code, name: c.name, symbol: c.symbol || '', country: c.country || '', is_active: c.is_active
    });
    setCurrencyOpen(true);
  };

  const openEditRate = (r: ExchangeRate) => {
    setEditingId(r.id);
    setRateForm({
      provider_id: r.provider_id.toString(),
      from_currency_id: r.from_currency_id.toString(),
      to_currency_id: r.to_currency_id.toString(),
      buy_rate: r.buy_rate.toString(),
      sell_rate: r.sell_rate.toString(),
      fee_percentage: r.fee_percentage.toString(),
      fixed_fee: r.fixed_fee.toString()
    });
    setRateOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="text-[#2563EB]" />
            {t.logoTitle}
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Button 
            onClick={() => setActiveTab('overview')} 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <BarChart className="w-4 h-4 text-blue-500" /> {t.overview}
          </Button>
          <Button 
            onClick={() => setActiveTab('providers')} 
            variant={activeTab === 'providers' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <Landmark className="w-4 h-4 text-emerald-500" /> {t.providers}
          </Button>
          <Button 
            onClick={() => setActiveTab('currencies')} 
            variant={activeTab === 'currencies' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <Layers className="w-4 h-4 text-amber-500" /> {t.currencies}
          </Button>
          <Button 
            onClick={() => setActiveTab('rates')} 
            variant={activeTab === 'rates' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <RefreshCw className="w-4 h-4 text-purple-500" /> {t.rates}
          </Button>
          <Button 
            onClick={() => setActiveTab('conversions')} 
            variant={activeTab === 'conversions' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <Users className="w-4 h-4 text-pink-500" /> {t.globalConversions}
          </Button>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs h-9" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> {t.logout}
          </Button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">{t.consoleTitle}</h1>
            <p className="text-xs text-slate-400">{t.consoleSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => changeLanguage('fr')}
                className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-all ${lang === 'fr' ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
              >
                EN
              </button>
            </div>

            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1 h-9 text-xs font-semibold">
                <ArrowLeft className="w-4 h-4" /> {t.publicReturn}
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab content renderer */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">{t.statsUsers}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.users}</div>
                </CardContent>
              </Card>
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">{t.statsProviders}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.providers}</div>
                </CardContent>
              </Card>
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">{t.statsRates}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.rates}</div>
                </CardContent>
              </Card>
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">{t.statsConversions}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-pink-600 dark:text-pink-400">{stats.conversions}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border bg-white dark:bg-slate-900 p-6">
              <h3 className="font-bold text-lg mb-2">{t.instructionsTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.instructionsBody}
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'providers' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{t.providersTitle}</CardTitle>
                <CardDescription className="text-xs">{t.providersDesc}</CardDescription>
              </div>
              
              <Dialog open={providerOpen} onOpenChange={(open) => { setProviderOpen(open); if(!open) setEditingId(null); }}>
                <DialogTrigger render={<Button onClick={() => setProviderForm({ name: '', website: '', rating: 5.0, status: 'active', type: 'fintech', logo_url: '', is_active: true })} className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold h-9 text-xs"><Plus className="w-4 h-4" /> {t.add}</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? t.editProvider : t.addProvider}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveProvider} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.name}</Label>
                      <Input required value={providerForm.name} onChange={(e) => setProviderForm({...providerForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.providerType}</Label>
                      <select 
                        value={providerForm.type} 
                        onChange={(e) => setProviderForm({...providerForm, type: e.target.value})}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-[#0F172A] dark:text-white"
                      >
                        <option value="fintech">{t.fintechType}</option>
                        <option value="bank">{t.bankType}</option>
                        <option value="crypto">{t.cryptoType}</option>
                        <option value="agent">{t.agentType}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.website}</Label>
                      <Input value={providerForm.website} placeholder="https://..." onChange={(e) => setProviderForm({...providerForm, website: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.rating}</Label>
                      <Input type="number" step="0.1" min="0" max="5" required value={providerForm.rating} onChange={(e) => setProviderForm({...providerForm, rating: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.logoUrl}</Label>
                      <Input value={providerForm.logo_url} placeholder="https://..." onChange={(e) => setProviderForm({...providerForm, logo_url: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="provider_active" checked={providerForm.is_active} onChange={(e) => setProviderForm({...providerForm, is_active: e.target.checked})} />
                      <Label htmlFor="provider_active" className="text-xs font-semibold cursor-pointer">{t.markActive}</Label>
                    </div>
                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold">{editingId ? t.update : t.add}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.name}</TableHead>
                    <TableHead>{t.website}</TableHead>
                    <TableHead>{lang === 'fr' ? 'Fiabilité' : 'Reliability'}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">
                        <div>
                          <p>{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                            {p.type === 'fintech' && '🚀 Fintech'}
                            {p.type === 'bank' && (lang === 'fr' ? '🏦 Banque' : '🏦 Bank')}
                            {p.type === 'crypto' && '🪙 Crypto'}
                            {p.type === 'agent' && (lang === 'fr' ? '👤 Agent Direct' : '👤 Direct Agent')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs truncate max-w-[150px]">{p.website}</TableCell>
                      <TableCell>⭐ {p.rating.toFixed(2)}</TableCell>
                      <TableCell>
                        {p.is_active ? 
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">{t.active}</span> : 
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">{t.inactive}</span>
                        }
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditProvider(p)}><Edit className="w-4 h-4 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProvider(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {providers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-slate-400">{t.noProviders}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'currencies' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{t.currenciesTitle}</CardTitle>
                <CardDescription className="text-xs">{t.currenciesDesc}</CardDescription>
              </div>
              
              <Dialog open={currencyOpen} onOpenChange={(open) => { setCurrencyOpen(open); if(!open) setEditingId(null); }}>
                <DialogTrigger render={<Button onClick={() => setCurrencyForm({ code: '', name: '', symbol: '', country: '', is_active: true })} className="bg-amber-600 hover:bg-amber-600/90 text-white font-bold h-9 text-xs"><Plus className="w-4 h-4" /> {t.add}</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? t.editCurrency : t.addCurrency}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveCurrency} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.isoCode}</Label>
                      <Input required maxLength={3} placeholder="USD" value={currencyForm.code} onChange={(e) => setCurrencyForm({...currencyForm, code: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.fullName}</Label>
                      <Input required placeholder="US Dollar" value={currencyForm.name} onChange={(e) => setCurrencyForm({...currencyForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.symbol}</Label>
                      <Input placeholder="$" value={currencyForm.symbol} onChange={(e) => setCurrencyForm({...currencyForm, symbol: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.originCountry}</Label>
                      <Input required placeholder="États-Unis" value={currencyForm.country} onChange={(e) => setCurrencyForm({...currencyForm, country: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="currency_active" checked={currencyForm.is_active} onChange={(e) => setCurrencyForm({...currencyForm, is_active: e.target.checked})} />
                      <Label htmlFor="currency_active" className="text-xs font-semibold cursor-pointer">{t.markCurrencyActive}</Label>
                    </div>
                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold">{editingId ? t.update : t.add}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.isoCode}</TableHead>
                    <TableHead>{t.fullName}</TableHead>
                    <TableHead>{t.symbol}</TableHead>
                    <TableHead>{lang === 'fr' ? 'Pays' : 'Country'}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold">{c.code}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="font-medium text-slate-500">{c.symbol}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{c.country}</TableCell>
                      <TableCell>
                        {c.is_active ? 
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">{t.currencyActive}</span> : 
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">{t.currencyInactive}</span>
                        }
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditCurrency(c)}><Edit className="w-4 h-4 text-slate-400" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCurrency(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {currencies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-slate-400">{t.noCurrencies}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'rates' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{t.ratesTitle}</CardTitle>
                <CardDescription className="text-xs">{t.ratesDesc} ({ratesTotal} {t.ratesDescCount})</CardDescription>
              </div>
              
              <div className="flex items-center gap-2 self-end">
                <Dialog open={rateOpen} onOpenChange={(open) => { setRateOpen(open); if(!open) setEditingId(null); }}>
                  <DialogTrigger render={
                    <Button onClick={() => {
                      const firstProv = providers[0]?.id.toString() || '';
                      const firstCur = currencies[0]?.id.toString() || '';
                      const secondCur = currencies[1]?.id.toString() || currencies[0]?.id.toString() || '';
                      setRateForm({
                        provider_id: firstProv,
                        from_currency_id: firstCur,
                        to_currency_id: secondCur,
                        buy_rate: '',
                        sell_rate: '',
                        fee_percentage: '0',
                        fixed_fee: '0'
                      });
                    }} className="bg-purple-600 hover:bg-purple-600/90 text-white font-bold h-9 text-xs">
                      <Plus className="w-4 h-4" /> {t.add}
                    </Button>
                  } />
                  <DialogContent>
                    <DialogTitle>{editingId ? t.editRate : t.addRate}</DialogTitle>
                    <form onSubmit={handleSaveRate} className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">{t.tableProvider}</Label>
                        <select 
                          required
                          value={rateForm.provider_id}
                          onChange={(e) => setRateForm({...rateForm, provider_id: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white"
                        >
                          {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t.sourceCurrency}</Label>
                          <select 
                            required
                            value={rateForm.from_currency_id}
                            onChange={(e) => setRateForm({...rateForm, from_currency_id: e.target.value})}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white"
                          >
                            {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.destCurrency}</Label>
                          <select 
                            required
                            value={rateForm.to_currency_id}
                            onChange={(e) => setRateForm({...rateForm, to_currency_id: e.target.value})}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white"
                          >
                            {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t.buyRate}</Label>
                          <Input type="number" step="0.000001" required value={rateForm.buy_rate} onChange={(e) => setRateForm({...rateForm, buy_rate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.sellRate}</Label>
                          <Input type="number" step="0.000001" required value={rateForm.sell_rate} onChange={(e) => setRateForm({...rateForm, sell_rate: e.target.value})} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t.variableFees}</Label>
                          <Input type="number" step="0.01" value={rateForm.fee_percentage} onChange={(e) => setRateForm({...rateForm, fee_percentage: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t.fixedFees}</Label>
                          <Input type="number" step="0.01" value={rateForm.fixed_fee} onChange={(e) => setRateForm({...rateForm, fixed_fee: e.target.value})} />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold">{editingId ? t.update : t.save}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search & Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t.tableProvider}</Label>
                  <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-[#0F172A] dark:text-white"
                  >
                    <option value="">{t.filterAllProviders}</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t.sourceCurrency}</Label>
                  <Input 
                    placeholder="Ex: USD, XAF" 
                    value={filterFromCurrency} 
                    onChange={(e) => setFilterFromCurrency(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t.destCurrency}</Label>
                  <Input 
                    placeholder="Ex: EUR, NGN" 
                    value={filterToCurrency} 
                    onChange={(e) => setFilterToCurrency(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-bold"
                  />
                </div>
              </div>

              {loadingRates ? (
                <div className="text-center py-20 text-slate-400">{t.loadingRates}</div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.tableProvider}</TableHead>
                        <TableHead>{t.pair}</TableHead>
                        <TableHead>{t.buyRate}</TableHead>
                        <TableHead>{t.sellRate}</TableHead>
                        <TableHead>{t.fees}</TableHead>
                        <TableHead className="text-right">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.map((r) => {
                        const fromCode = r.currencyFrom?.code || r.currency_from?.code;
                        const toCode = r.currencyTo?.code || r.currency_to?.code;
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-bold">{r.provider?.name}</TableCell>
                            <TableCell className="font-medium text-slate-500">
                              {fromCode} → {toCode}
                            </TableCell>
                            <TableCell>{r.buy_rate}</TableCell>
                            <TableCell>{r.sell_rate}</TableCell>
                            <TableCell className="text-xs text-red-500">
                              {r.fixed_fee > 0 ? `${r.fixed_fee} ${fromCode}` : ''}
                              {r.fixed_fee > 0 && r.fee_percentage > 0 ? ' + ' : ''}
                              {r.fee_percentage > 0 ? `${r.fee_percentage}%` : ''}
                              {r.fixed_fee === 0 && r.fee_percentage === 0 ? t.free : ''}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditRate(r)}><Edit className="w-4 h-4 text-slate-400" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteRate(r.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {rates.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-slate-400">{t.noRates}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  {ratesLastPage > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">
                        {t.paginationShowing} <span className="font-bold text-slate-900 dark:text-white">{ratesPage}</span> {t.paginationOf} <span className="font-bold text-slate-900 dark:text-white">{ratesLastPage}</span> ({ratesTotal} {t.paginationRates})
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fetchRates(ratesPage - 1)} 
                          disabled={ratesPage === 1}
                          className="h-8 text-xs font-semibold"
                        >
                          {t.prev}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fetchRates(ratesPage + 1)} 
                          disabled={ratesPage === ratesLastPage}
                          className="h-8 text-xs font-semibold"
                        >
                          {t.next}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'conversions' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl">{t.globalTransTitle}</CardTitle>
              <CardDescription className="text-xs">{t.globalTransDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableUser}</TableHead>
                    <TableHead>{t.tableProvider}</TableHead>
                    <TableHead>{t.tableSent}</TableHead>
                    <TableHead>{t.tableRate}</TableHead>
                    <TableHead>{t.tableReceived}</TableHead>
                    <TableHead>{t.tableDate}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((conv) => {
                    const fromCode = conv.currencyFrom?.code || conv.currency_from?.code;
                    const toCode = conv.currencyTo?.code || conv.currency_to?.code;
                    return (
                      <TableRow key={conv.id}>
                        <TableCell className="font-bold">
                          <div>
                            <p className="text-xs">{conv.user?.name || t.guestUser}</p>
                            <p className="text-[10px] text-slate-400">{conv.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium min-w-[200px]">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{conv.provider?.name}</p>
                            {conv.beneficiary_details && (
                              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 space-y-0.5 shadow-sm animate-in fade-in duration-200">
                                <p className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                                  <span>👤</span> {t.directP2PBadge}
                                </p>
                                <p><span className="font-semibold text-slate-500">{t.p2pName}</span> {conv.beneficiary_details.beneficiary_name}</p>
                                <p><span className="font-semibold text-slate-500">{t.p2pOperator}</span> {conv.beneficiary_details.bank_operator_name}</p>
                                <p><span className="font-semibold text-slate-500">{t.p2pAccount}</span> {conv.beneficiary_details.account_number}</p>
                                {conv.beneficiary_details.beneficiary_phone && (
                                  <p><span className="font-semibold text-slate-500">{t.p2pPhone}</span> {conv.beneficiary_details.beneficiary_phone}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{conv.amount.toLocaleString()} {fromCode}</TableCell>
                        <TableCell className="text-slate-400 text-xs">{conv.rate}</TableCell>
                        <TableCell className="font-bold text-[#10B981]">
                          {conv.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {toCode}
                        </TableCell>
                        <TableCell className="text-[10px] text-slate-400">
                          {new Date(conv.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {conversions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-slate-400">{t.noHistory}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
