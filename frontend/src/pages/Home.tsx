import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, TrendingUp, Info } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';

const translations = {
  fr: {
    // Navigation
    comparator: "Comparateur",
    dashboard: "Tableau de bord",
    admin: "Admin",
    logout: "Quitter",
    login: "Se connecter",
    
    // Hero
    heroTitle: "Comparez les frais et les taux de change pour l'Afrique",
    heroSubtitle: "Comparez en temps réel les banques, fintechs et bureaux de change pour minimiser vos frais et maximiser votre argent reçu.",
    
    // Form
    sendAmount: "Montant à envoyer",
    destCurrency: "Devise de destination",
    fiatCurrencies: "Devises Fiat",
    cryptocurrencies: "Cryptomonnaies",
    comparing: "Calcul des meilleures offres...",
    compareBtn: "Comparer les taux",
    compareSuccess: "Comparaison actualisée !",
    compareError: "Erreur lors de la comparaison.",
    
    // Offers
    availableOffers: "Offres disponibles",
    feesIncluded: "Frais inclus dans le calcul",
    topOffer: "⭐ RECOMMANDATION PRINCIPALE (ÉCONOMIE MAXIMALE)",
    noOfferCategory: "Aucune offre disponible pour cette catégorie.",
    noOfferCompare: "Saisissez un montant et lancez la comparaison pour trouver la meilleure offre.",
    
    // Category Cards
    fintechCard: "🚀 Fintech & Transfert",
    bankCard: "🏦 Banque Traditionnelle",
    agentCard: "👤 Agents Directs (P2P)",
    cryptoCard: "🪙 Exchange Crypto",
    allOffers: "Toutes",
    fintechOffers: "Transfert & Fintech",
    bankOffers: "Banques",
    cryptoOffers: "Cryptomonnaies",
    agentOffers: "Agents Directs",
    noOfferShort: "Aucune offre",
    receiverReceives: "Destinataire reçoit :",
    
    // Result Card
    buyRate: "Taux Achat",
    sellRate: "Taux Vente",
    transferFees: "Frais de Transfert",
    free: "Gratuit",
    receiverGets: "Le destinataire reçoit",
    transferBtn: "Transférer",
    
    // Modal
    modalTitle: "Détails du bénéficiaire",
    modalNotice: "Ce prestataire effectue des virements manuels locaux ou P2P. Veuillez renseigner précisément les informations de votre bénéficiaire.",
    fullName: "Nom complet du bénéficiaire",
    bankOperator: "Banque / Opérateur (ex: Orange Money, MTN, UBA)",
    accountNumber: "Numéro de compte ou de téléphone mobile",
    contactPhone: "Téléphone de contact du bénéficiaire (facultatif)",
    cancel: "Annuler",
    confirmTransfer: "Confirmer le Transfert",
    saving: "Enregistrement...",
    
    // Toasts & Messages
    savedSuccess: "Conversion enregistrée ! Redirection vers ",
    directSuccess: "Demande de transfert direct enregistrée avec succès !",
    directFail: "Impossible d'enregistrer la demande de transfert direct.",
    saveError: "Impossible d'enregistrer la transaction. Redirection en cours...",
    guestRedirect: "Redirection vers ",
    guestRedirectSub: "... Connectez-vous pour enregistrer vos transferts.",
    copiedDirect: "Détails copiés ! Collez le message dans le groupe WhatsApp qui va s'ouvrir.",
    redirectingWa: "Demande enregistrée ! Redirection vers WhatsApp...",
    redirectingPlatform: "Demande enregistrée ! Redirection en cours...",
    
    // Footer
    footerRights: "© 2026 ExchangeCompare Africa. Tous droits réservés. Architecture API First.",
    footerTerms: "Conditions",
    footerPrivacy: "Confidentialité",
    footerContact: "Contact"
  },
  en: {
    // Navigation
    comparator: "Compare",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Log Out",
    login: "Log In",
    
    // Hero
    heroTitle: "Compare money transfer fees and exchange rates to Africa",
    heroSubtitle: "Compare banks, fintechs and money transfer operators in real-time to minimize fees and maximize money received.",
    
    // Form
    sendAmount: "Amount to Send",
    destCurrency: "Destination Currency",
    fiatCurrencies: "Fiat Currencies",
    cryptocurrencies: "Cryptocurrencies",
    comparing: "Calculating best offers...",
    compareBtn: "Compare rates",
    compareSuccess: "Comparison updated!",
    compareError: "Error during comparison.",
    
    // Offers
    availableOffers: "Available offers",
    feesIncluded: "Fees included in calculation",
    topOffer: "⭐ TOP RECOMMENDATION (MAXIMUM SAVINGS)",
    noOfferCategory: "No offers available for this category.",
    noOfferCompare: "Enter an amount and click compare to find the best offer.",
    
    // Category Cards
    fintechCard: "🚀 Fintech & Transfer",
    bankCard: "🏦 Traditional Bank",
    agentCard: "👤 Direct Agents (P2P)",
    cryptoCard: "🪙 Crypto Exchange",
    allOffers: "All",
    fintechOffers: "Transfer & Fintech",
    bankOffers: "Banks",
    cryptoOffers: "Cryptocurrencies",
    agentOffers: "Direct Agents",
    noOfferShort: "No offers",
    receiverReceives: "Receiver gets:",
    
    // Result Card
    buyRate: "Buy Rate",
    sellRate: "Sell Rate",
    transferFees: "Transfer Fees",
    free: "Free",
    receiverGets: "The recipient receives",
    transferBtn: "Transfer",
    
    // Modal
    modalTitle: "Beneficiary Details",
    modalNotice: "This provider processes local manual or P2P transfers. Please specify the beneficiary information carefully.",
    fullName: "Beneficiary's Full Name",
    bankOperator: "Bank / Mobile Operator (e.g., Orange Money, MTN, UBA)",
    accountNumber: "Account or Mobile Money Number",
    contactPhone: "Beneficiary contact number (optional)",
    cancel: "Cancel",
    confirmTransfer: "Confirm Transfer",
    saving: "Saving...",
    
    // Toasts & Messages
    savedSuccess: "Conversion saved! Redirecting to ",
    directSuccess: "Direct transfer request saved successfully!",
    directFail: "Failed to save direct transfer request.",
    saveError: "Failed to save transaction. Redirecting anyway...",
    guestRedirect: "Redirecting to ",
    guestRedirectSub: "... Log in to track your transfers.",
    copiedDirect: "Details copied! Paste the message in the WhatsApp group that will open.",
    redirectingWa: "Request saved! Redirecting to WhatsApp...",
    redirectingPlatform: "Request saved! Redirecting...",
    
    // Footer
    footerRights: "© 2026 ExchangeCompare Africa. All rights reserved. API First Architecture.",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
    footerContact: "Contact"
  }
};

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
  buy_rate: number;
  sell_rate: number;
  fee_percentage: number;
  fixed_fee: number;
  total_fees_source: number;
  total_fees_dest: number;
  amount_received: number;
  from_currency_id: number;
  to_currency_id: number;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  country: string;
  type: string;
}

export default function Home() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [amount, setAmount] = useState('100000');
  const [currencyFrom, setCurrencyFrom] = useState('XAF');
  const [currencyTo, setCurrencyTo] = useState('USD');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  
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

  const [selectedResult, setSelectedResult] = useState<ComparisonResult | null>(null);
  const [beneficiaryOpen, setBeneficiaryOpen] = useState(false);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    beneficiary_name: '',
    bank_operator_name: '',
    account_number: '',
    beneficiary_phone: ''
  });
  const [submittingBeneficiary, setSubmittingBeneficiary] = useState(false);

  const filteredResults = results.filter(r => {
    if (selectedType === 'all') return true;
    return r.provider.type === selectedType;
  });

  const bestFintech = results.find(r => r.provider.type === 'fintech');
  const bestBank = results.find(r => r.provider.type === 'bank');
  const bestCrypto = results.find(r => r.provider.type === 'crypto');
  const bestAgent = results.find(r => r.provider.type === 'agent');

  useEffect(() => {
    // Load currencies
    api.get('/currencies')
      .then(res => {
        if (res.data.length > 0) {
          setCurrencies(res.data);
        }
      })
      .catch(err => console.error("Erreur chargement devises", err));
  }, []);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get('/compare', { 
        params: { 
          amount, 
          currency_from: currencyFrom, 
          currency_to: currencyTo 
        } 
      });
      setResults(response.data.recommendations);
      setLoading(false);
      toast.success(t.compareSuccess);
    } catch (error) {
      console.error(error);
      toast.error(t.compareError);
      setLoading(false);
    }
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

    const token = localStorage.getItem('token');
    
    const redirectToProvider = () => {
      if (result.provider.website) {
        window.open(result.provider.website, '_blank');
      } else {
        window.open('https://google.com', '_blank');
      }
    };

    if (!token) {
      toast.info(`${t.guestRedirect}${result.provider.name}${t.guestRedirectSub}`, {
        duration: 3000
      });
      setTimeout(redirectToProvider, 1500);
      return;
    }

    try {
      // Save conversion to DB
      await api.post('/conversions', {
        amount: amount,
        best_provider_id: result.provider.id,
        from_currency_id: result.from_currency_id,
        to_currency_id: result.to_currency_id,
        converted_amount: result.amount_received,
        rate: result.buy_rate
      });

      toast.success(`${t.savedSuccess}${result.provider.name}...`);
      setTimeout(redirectToProvider, 1500);

    } catch (err) {
      console.error(err);
      toast.error(t.saveError);
      setTimeout(redirectToProvider, 2000);
    }
  };

  const handleBeneficiarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult) return;
    setSubmittingBeneficiary(true);

    try {
      await api.post('/conversions', {
        amount: amount,
        best_provider_id: selectedResult.provider.id,
        from_currency_id: selectedResult.from_currency_id,
        to_currency_id: selectedResult.to_currency_id,
        converted_amount: selectedResult.amount_received,
        rate: selectedResult.buy_rate,
        beneficiary_details: beneficiaryForm
      });

      // Format details message for WhatsApp chat / group P2P (multilingual support)
      const formattedMsg = lang === 'fr'
        ? `Bonjour ${selectedResult.provider.name},\n` +
          `Je souhaite effectuer un transfert direct :\n` +
          `- Montant envoyé : ${parseFloat(amount).toLocaleString()} ${currencyFrom}\n` +
          `- Montant à recevoir : ${selectedResult.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyTo}\n` +
          `- Taux appliqué : ${selectedResult.buy_rate.toFixed(5)}\n\n` +
          `Informations du bénéficiaire :\n` +
          `- Nom complet : ${beneficiaryForm.beneficiary_name}\n` +
          `- Banque/Opérateur : ${beneficiaryForm.bank_operator_name}\n` +
          `- Numéro de compte/tél : ${beneficiaryForm.account_number}\n` +
          (beneficiaryForm.beneficiary_phone ? `- Téléphone contact : ${beneficiaryForm.beneficiary_phone}\n` : '') +
          `\nMerci de traiter ma demande.`
        : `Hello ${selectedResult.provider.name},\n` +
          `I would like to make a direct transfer:\n` +
          `- Amount sent: ${parseFloat(amount).toLocaleString()} ${currencyFrom}\n` +
          `- Amount to receive: ${selectedResult.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyTo}\n` +
          `- Applied rate: ${selectedResult.buy_rate.toFixed(5)}\n\n` +
          `Beneficiary details:\n` +
          `- Full name: ${beneficiaryForm.beneficiary_name}\n` +
          `- Bank/Operator: ${beneficiaryForm.bank_operator_name}\n` +
          `- Account/Mobile money number: ${beneficiaryForm.account_number}\n` +
          (beneficiaryForm.beneficiary_phone ? `- Contact phone: ${beneficiaryForm.beneficiary_phone}\n` : '') +
          `\nThank you for processing my request.`;

      const providerLink = selectedResult.provider.website || '';
      let cleanLink = providerLink;
      if (cleanLink && !cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
        cleanLink = `https://${cleanLink}`;
      }

      const isDirectWhatsApp = cleanLink.includes('wa.me') || cleanLink.includes('api.whatsapp.com');

      if (isDirectWhatsApp) {
        try {
          const urlObj = new URL(cleanLink);
          urlObj.searchParams.set('text', formattedMsg);
          const targetUrl = urlObj.toString();
          
          toast.success(t.redirectingWa);
          setTimeout(() => window.open(targetUrl, '_blank'), 1500);
        } catch (urlErr) {
          // Fallback if URL object parsing failed
          const targetUrl = cleanLink + (cleanLink.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(formattedMsg);
          toast.success(t.redirectingWa);
          setTimeout(() => window.open(targetUrl, '_blank'), 1500);
        }
      } else {
        // Fallback for WhatsApp Group invitation link or other platforms
        try {
          await navigator.clipboard.writeText(formattedMsg);
          toast.success(t.copiedDirect, {
            duration: 5000
          });
        } catch (clipErr) {
          console.warn("Could not copy text to clipboard", clipErr);
          toast.success(t.redirectingPlatform);
        }

        setTimeout(() => {
          if (cleanLink) {
            window.open(cleanLink, '_blank');
          } else {
            window.open('https://google.com', '_blank');
          }
        }, 2000);
      }

      setBeneficiaryOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t.directFail);
    } finally {
      setSubmittingBeneficiary(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      <Navbar currentLang={lang} onChangeLanguage={changeLanguage} />

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        
        {/* Hero title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-6 rounded-2xl">
          <form onSubmit={handleCompare} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="amount" className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.sendAmount}</Label>
                <div className="flex gap-2 relative">
                  <Input 
                    id="amount" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="text-lg font-bold h-11"
                    placeholder="0.00"
                    required
                  />
                  <select 
                    value={currencyFrom} 
                    onChange={(e) => setCurrencyFrom(e.target.value)}
                    className="flex h-11 w-[110px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-bold text-[#0F172A] dark:text-white"
                  >
                    <optgroup label={t.fiatCurrencies}>
                      {currencies.filter(c => c.type !== 'crypto').map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t.cryptocurrencies}>
                      {currencies.filter(c => c.type === 'crypto').map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="md:col-span-1 flex items-center justify-center p-2 text-slate-400">
                <ArrowRightLeft className="w-5 h-5 hidden md:block" />
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="currencyTo" className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.destCurrency}</Label>
                <select 
                  id="currencyTo"
                  value={currencyTo} 
                  onChange={(e) => setCurrencyTo(e.target.value)}
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-bold text-[#0F172A] dark:text-white"
                >
                  <optgroup label={t.fiatCurrencies}>
                    {currencies.filter(c => c.type !== 'crypto').map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.country})</option>
                    ))}
                  </optgroup>
                  <optgroup label={t.cryptocurrencies}>
                    {currencies.filter(c => c.type === 'crypto').map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.country})</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-11 rounded-xl text-base shadow-sm">
              {loading ? t.comparing : t.compareBtn}
            </Button>
          </form>
        </Card>

        {/* Results Section */}
        {results.length > 0 ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
                <TrendingUp className="text-[#10B981]" />
                {t.availableOffers} ({results.length})
              </h2>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> {t.feesIncluded}
              </span>
            </div>

            {/* Quick Category Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Fintech Card */}
              <div 
                onClick={() => setSelectedType('fintech')}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-36 relative overflow-hidden shadow-sm ${
                  selectedType === 'fintech'
                    ? 'border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-355 dark:hover:border-slate-705 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t.fintechCard}</span>
                    {bestFintech && results[0] === bestFintech && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold tracking-widest uppercase">TOP</span>
                    )}
                  </div>
                  {bestFintech ? (
                    <div className="mt-2.5">
                      <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{bestFintech.provider.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{lang === 'fr' ? 'Taux' : 'Rate'}: {bestFintech.buy_rate.toFixed(5)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2.5">{t.noOfferShort}</p>
                  )}
                </div>
                {bestFintech && (
                  <div className="text-left mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.receiverReceives}</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {bestFintech.amount_received.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-bold">{currencyTo}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Bank Card */}
              <div 
                onClick={() => setSelectedType('bank')}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-36 relative overflow-hidden shadow-sm ${
                  selectedType === 'bank'
                    ? 'border-blue-500 bg-blue-50/15 dark:bg-blue-950/20 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-355 dark:hover:border-slate-705 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t.bankCard}</span>
                    {bestBank && results[0] === bestBank && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-extrabold tracking-widest uppercase">TOP</span>
                    )}
                  </div>
                  {bestBank ? (
                    <div className="mt-2.5">
                      <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{bestBank.provider.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{lang === 'fr' ? 'Taux' : 'Rate'}: {bestBank.buy_rate.toFixed(5)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2.5">{t.noOfferShort}</p>
                  )}
                </div>
                {bestBank && (
                  <div className="text-left mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.receiverReceives}</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {bestBank.amount_received.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-bold">{currencyTo}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Agent Card */}
              <div 
                onClick={() => setSelectedType('agent')}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-36 relative overflow-hidden shadow-sm ${
                  selectedType === 'agent'
                    ? 'border-amber-500 bg-amber-50/15 dark:bg-amber-950/20 ring-1 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-355 dark:hover:border-slate-705 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t.agentCard}</span>
                    {bestAgent && results[0] === bestAgent && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold tracking-widest uppercase">TOP</span>
                    )}
                  </div>
                  {bestAgent ? (
                    <div className="mt-2.5">
                      <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{bestAgent.provider.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{lang === 'fr' ? 'Taux' : 'Rate'}: {bestAgent.buy_rate.toFixed(5)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2.5">{t.noOfferShort}</p>
                  )}
                </div>
                {bestAgent && (
                  <div className="text-left mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.receiverReceives}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {bestAgent.amount_received.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-bold">{currencyTo}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Crypto Card */}
              <div 
                onClick={() => setSelectedType('crypto')}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-36 relative overflow-hidden shadow-sm ${
                  selectedType === 'crypto'
                    ? 'border-purple-500 bg-purple-50/15 dark:bg-purple-950/20 ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-355 dark:hover:border-slate-705 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t.cryptoCard}</span>
                    {bestCrypto && results[0] === bestCrypto && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-extrabold tracking-widest uppercase">TOP</span>
                    )}
                  </div>
                  {bestCrypto ? (
                    <div className="mt-2.5">
                      <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{bestCrypto.provider.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{lang === 'fr' ? 'Taux' : 'Rate'}: {bestCrypto.buy_rate.toFixed(5)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2.5">{t.noOfferShort}</p>
                  )}
                </div>
                {bestCrypto && (
                  <div className="text-left mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.receiverReceives}</span>
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                      {bestCrypto.amount_received.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-bold">{currencyTo}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'all'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.allOffers} ({results.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('fintech')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'fintech'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.fintechOffers} ({results.filter(r => r.provider.type === 'fintech').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('bank')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'bank'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.bankOffers} ({results.filter(r => r.provider.type === 'bank').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('crypto')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'crypto'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.cryptoOffers} ({results.filter(r => r.provider.type === 'crypto').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('agent')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'agent'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.agentOffers} ({results.filter(r => r.provider.type === 'agent').length})
              </button>
            </div>

            <div className="grid gap-4">
              {filteredResults.length > 0 ? (
                filteredResults.map((result, idx) => (
                  <Card 
                    key={idx} 
                    className={`overflow-hidden border transition-all duration-300 hover:shadow-md ${
                      idx === 0 
                        ? 'border-[#10B981] bg-emerald-50/20 dark:bg-emerald-950/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {idx === 0 && (
                      <div className="bg-[#10B981] text-white text-[10px] font-extrabold px-4 py-1 text-center tracking-widest uppercase">
                        {t.topOffer}
                      </div>
                    )}

                    <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {/* Provider Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-extrabold text-[#0F172A] dark:text-white border border-slate-200/50">
                          {result.provider.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{result.provider.name}</h3>
                            {result.provider.type === 'bank' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/20">
                                {lang === 'fr' ? 'Banque' : 'Bank'}
                              </span>
                            )}
                            {result.provider.type === 'fintech' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/20">
                                Fintech
                              </span>
                            )}
                            {result.provider.type === 'crypto' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/20">
                                Crypto Exchange
                              </span>
                            )}
                            {result.provider.type === 'agent' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/20">
                                {lang === 'fr' ? 'Agent Direct (P2P)' : 'Direct Agent (P2P)'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>⭐ {result.provider.rating}/5</span>
                          </div>
                        </div>
                      </div>

                    {/* Rates Detail */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{t.buyRate}</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{result.buy_rate.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{t.sellRate}</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{result.sell_rate.toFixed(6)}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{t.transferFees}</p>
                        <p className="font-semibold text-red-500">
                          {result.fixed_fee > 0 ? `${result.fixed_fee.toFixed(2)} ${currencyFrom}` : ''}
                          {result.fixed_fee > 0 && result.fee_percentage > 0 ? ' + ' : ''}
                          {result.fee_percentage > 0 ? `${result.fee_percentage}%` : ''}
                          {result.fixed_fee === 0 && result.fee_percentage === 0 ? t.free : ''}
                        </p>
                      </div>
                    </div>

                    {/* Converted Amount */}
                    <div className="text-left md:text-right min-w-[150px]">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{t.receiverGets}</p>
                      <p className="text-2xl font-extrabold text-[#10B981] dark:text-[#10B981]">
                        {result.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                        <span className="text-sm font-bold">{currencyTo}</span>
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleTransfer(result)}
                      className={`w-full md:w-auto h-9 font-semibold text-sm ${
                        idx === 0 
                          ? 'bg-[#10B981] hover:bg-[#10B981]/90 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.transferBtn}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {t.noOfferCategory}
              </div>
            )}
            </div>
          </div>
        ) : (
          results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              {t.noOfferCompare}
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 mt-24">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>{t.footerRights}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">{t.footerTerms}</a>
            <a href="#" className="hover:underline">{t.footerPrivacy}</a>
            <a href="#" className="hover:underline">{t.footerContact}</a>
          </div>
        </div>
      </footer>

      <Dialog open={beneficiaryOpen} onOpenChange={setBeneficiaryOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-[#10B981]">👤</span> {t.modalTitle}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleBeneficiarySubmit} className="space-y-4 mt-2">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">{lang === 'fr' ? 'Transfert direct via Agent :' : 'Direct Transfer via Agent :'}</span> {t.modalNotice}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="beneficiary_name" className="text-xs font-semibold text-slate-650 dark:text-slate-300">{t.fullName}</Label>
              <Input
                id="beneficiary_name"
                value={beneficiaryForm.beneficiary_name}
                onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, beneficiary_name: e.target.value })}
                placeholder={lang === 'fr' ? 'Ex: Jean Dupont' : 'E.g., John Doe'}
                className="h-10 text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bank_operator_name" className="text-xs font-semibold text-slate-650 dark:text-slate-300">{t.bankOperator}</Label>
              <Input
                id="bank_operator_name"
                value={beneficiaryForm.bank_operator_name}
                onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, bank_operator_name: e.target.value })}
                placeholder={lang === 'fr' ? 'Ex: Orange Money Cameroun' : 'E.g., Orange Money Cameroon'}
                className="h-10 text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account_number" className="text-xs font-semibold text-slate-650 dark:text-slate-300">{t.accountNumber}</Label>
              <Input
                id="account_number"
                value={beneficiaryForm.account_number}
                onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, account_number: e.target.value })}
                placeholder={lang === 'fr' ? 'Ex: +237699999999 ou RIB Banque' : 'E.g., +237699999999 or bank details'}
                className="h-10 text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="beneficiary_phone" className="text-xs font-semibold text-slate-650 dark:text-slate-300">{t.contactPhone}</Label>
              <Input
                id="beneficiary_phone"
                value={beneficiaryForm.beneficiary_phone}
                onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, beneficiary_phone: e.target.value })}
                placeholder="Ex: +237655555555"
                className="h-10 text-sm font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBeneficiaryOpen(false)}
                className="h-9 px-4 text-xs font-semibold"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={submittingBeneficiary}
                className="bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold h-9 px-4 text-xs"
              >
                {submittingBeneficiary ? t.saving : t.confirmTransfer}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
