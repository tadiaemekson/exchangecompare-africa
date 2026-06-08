import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'fr' | 'en';

const translations = {
  fr: {
    // Navigation
    comparator: "Comparateur",
    dashboard: "Tableau de bord",
    logout: "Quitter",
    login: "Se connecter",
    authTitle: "Authentification",
    profile: "Profil",
    language: "Langue",
    languageSettings: "Paramètres de Langue",
    chooseLanguage: "Choisissez votre langue",
    
    // Hero
    heroTitle: "Comparez les frais et les taux de change pour l'Afrique",
    heroSubtitle: "Comparez en temps réel les banques, fintechs et bureaux de change.",
    
    // Form
    sendAmount: "Montant à envoyer",
    destCurrency: "Devise de destination",
    fiatCurrencies: "Devises Fiat",
    cryptocurrencies: "Cryptomonnaies",
    comparing: "Calcul des meilleures offres...",
    compareBtn: "Comparer les taux",
    
    // Offers
    availableOffers: "Offres disponibles",
    feesIncluded: "Frais inclus dans le calcul",
    topOffer: "⭐ RECOMMANDATION PRINCIPALE",
    noOfferCategory: "Aucune offre disponible pour cette catégorie.",
    
    // Category Cards
    fintechCard: "🚀 Fintech & Transfert",
    bankCard: "🏦 Banque Traditionnelle",
    agentCard: "👤 Agents Directs (P2P)",
    cryptoCard: "🪙 Exchange Crypto",
    allOffers: "Toutes",
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
    modalNotice: "Ce prestataire effectue des virements directs. Veuillez renseigner précisément les informations de votre bénéficiaire.",
    fullName: "Nom complet du bénéficiaire",
    bankOperator: "Banque / Opérateur (ex: Orange Money)",
    accountNumber: "Numéro de compte ou de téléphone",
    contactPhone: "Téléphone de contact du bénéficiaire (facultatif)",
    cancel: "Annuler",
    confirmTransfer: "Confirmer le Transfert",
    saving: "Enregistrement...",
    
    // Toasts
    savedSuccess: "Conversion enregistrée !",
    directSuccess: "Demande de transfert direct enregistrée avec succès !",
    directFail: "Impossible d'enregistrer la demande.",
    copiedDirect: "Détails copiés ! Collez le message dans le groupe WhatsApp qui va s'ouvrir.",
    redirectingWa: "Redirection vers WhatsApp...",
    redirectingPlatform: "Redirection en cours...",
    guestRedirect: "Redirection... Connectez-vous pour enregistrer vos transferts.",
    
    // Dashboard & Subscriptions
    userDashboard: "Tableau de bord",
    myPlan: "Mon Plan:",
    saasSubscriptions: "Abonnements SaaS MVP",
    active: "ACTIF",
    perMonth: "/ mois",
    unlimitedComparisons: "Comparaisons de devises illimitées",
    alertsLimit3: "Jusqu'à 3 alertes actives",
    alertsLimit15: "Jusqu'à 15 alertes actives",
    alertsLimitUnlimited: "Alertes actives illimitées",
    standardUpdate: "Mise à jour standard (1h)",
    instantUpdate: "Mise à jour instantanée en temps réel",
    currentPlan: "Plan Actuel",
    subscribe: "S'abonner",
    newAlert: "Nouvelle Alerte",
    currencyPair: "Paire de devises",
    triggerCondition: "Condition",
    aboveOrEqual: "Est supérieur ou égal à (≥)",
    belowOrEqual: "Est inférieur ou égal à (≤)",
    targetRate: "Taux Cible",
    targetRatePlaceholder: "Ex: 0.00165",
    createAlertBtn: "Créer l'alerte",
    myConfiguredAlerts: "Mes alertes",
    noActiveAlerts: "Aucune alerte configurée.",
    statusActive: "Active",
    statusTriggered: "Déclenchée",
    transferHistory: "Historique de mes transferts",
    noTransfers: "Aucun transfert enregistré.",
    tableProvider: "Fournisseur",
    tableSentAmount: "Montant envoyé",
    tableAppliedRate: "Taux",
    tableConvertedAmount: "Reçu",
    tableTransferDate: "Date",
    
    // Auth Page
    loginTab: "Connexion",
    registerTab: "Inscription",
    emailLabel: "Email",
    passwordLabel: "Mot de passe",
    nameLabel: "Nom complet",
    phoneLabel: "Téléphone",
    loginSuccess: "Connexion réussie !",
    registerSuccess: "Inscription réussie !",
    loginErrorDefault: "Identifiants incorrects.",
    registerErrorDefault: "Erreur lors de l'inscription.",
    forgotPassword: "Mot de passe oublié ?",
    error: "Erreur",
    noOfferShort: "Aucune offre",
    alertCreated: "Alerte créée",
    alertCreatedDesc: "Vous serez notifié par email.",
    alertCreateFail: "Impossible de créer l'alerte.",
    alertDeleted: "Alerte supprimée",
    alertDeleteFail: "Échec de la suppression.",
    subUpdated: "Abonnement mis à jour !",
    subUpdatedDesc: "Vous êtes maintenant abonné au plan ",
    subUpdateFail: "Échec de la mise à jour de l'abonnement.",
    registerBtn: "Créer mon compte"
  },
  en: {
    // Navigation
    comparator: "Compare",
    dashboard: "Dashboard",
    logout: "Log Out",
    login: "Log In",
    authTitle: "Authentication",
    profile: "Profile",
    language: "Language",
    languageSettings: "Language Settings",
    chooseLanguage: "Choose your language",
    
    // Hero
    heroTitle: "Compare money transfer fees and exchange rates to Africa",
    heroSubtitle: "Compare banks, fintechs and exchange operators in real-time.",
    
    // Form
    sendAmount: "Amount to Send",
    destCurrency: "Destination Currency",
    fiatCurrencies: "Fiat Currencies",
    cryptocurrencies: "Cryptocurrencies",
    comparing: "Calculating best offers...",
    compareBtn: "Compare rates",
    
    // Offers
    availableOffers: "Available offers",
    feesIncluded: "Fees included in calculation",
    topOffer: "⭐ TOP RECOMMENDATION",
    noOfferCategory: "No offers available for this category.",
    
    // Category Cards
    fintechCard: "🚀 Fintech & Transfer",
    bankCard: "🏦 Traditional Bank",
    agentCard: "👤 Direct Agents (P2P)",
    cryptoCard: "🪙 Crypto Exchange",
    allOffers: "All",
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
    modalNotice: "This provider processes local manual or P2P transfers. Please specify the beneficiary information.",
    fullName: "Beneficiary's Full Name",
    bankOperator: "Bank / Mobile Operator (e.g. Orange Money)",
    accountNumber: "Account or Mobile Money Number",
    contactPhone: "Beneficiary contact number (optional)",
    cancel: "Cancel",
    confirmTransfer: "Confirm Transfer",
    saving: "Saving...",
    
    // Toasts
    savedSuccess: "Conversion saved!",
    directSuccess: "Direct transfer request saved successfully!",
    directFail: "Failed to save direct transfer request.",
    copiedDirect: "Details copied! Paste the message in the WhatsApp group that will open.",
    redirectingWa: "Redirecting to WhatsApp...",
    redirectingPlatform: "Redirecting...",
    guestRedirect: "Redirecting... Log in to track your transfers.",
    
    // Dashboard & Subscriptions
    userDashboard: "Dashboard",
    myPlan: "My Plan:",
    saasSubscriptions: "SaaS MVP Subscriptions",
    active: "ACTIVE",
    perMonth: "/ month",
    unlimitedComparisons: "Unlimited currency comparisons",
    alertsLimit3: "Up to 3 active alerts",
    alertsLimit15: "Up to 15 active alerts",
    alertsLimitUnlimited: "Unlimited active alerts",
    standardUpdate: "Standard update (1h)",
    instantUpdate: "Instant real-time update",
    currentPlan: "Current Plan",
    subscribe: "Subscribe",
    newAlert: "New Alert",
    currencyPair: "Currency Pair",
    triggerCondition: "Trigger Condition",
    aboveOrEqual: "Is greater than or equal to (≥)",
    belowOrEqual: "Is less than or equal to (≤)",
    targetRate: "Target Rate",
    targetRatePlaceholder: "E.g., 0.00165",
    createAlertBtn: "Create alert",
    myConfiguredAlerts: "My configured alerts",
    noActiveAlerts: "No active alerts configured.",
    statusActive: "Active",
    statusTriggered: "Triggered",
    transferHistory: "My transfer history",
    noTransfers: "No transfers recorded.",
    tableProvider: "Provider",
    tableSentAmount: "Sent Amount",
    tableAppliedRate: "Rate",
    tableConvertedAmount: "Received",
    tableTransferDate: "Date",
    
    // Auth Page
    loginTab: "Log In",
    registerTab: "Sign Up",
    emailLabel: "Email",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    phoneLabel: "Phone Number",
    loginSuccess: "Login successful!",
    registerSuccess: "Registration successful!",
    loginErrorDefault: "Incorrect email or password.",
    registerErrorDefault: "Registration error. Please try again.",
    forgotPassword: "Forgot password?",
    error: "Error",
    noOfferShort: "No offer",
    alertCreated: "Alert created",
    alertCreatedDesc: "You will be notified by email.",
    alertCreateFail: "Unable to create the alert.",
    alertDeleted: "Alert deleted",
    alertDeleteFail: "Failed to delete.",
    subUpdated: "Subscription updated!",
    subUpdatedDesc: "You are now subscribed to the plan ",
    subUpdateFail: "Failed to update subscription.",
    registerBtn: "Create Account"
  }
};

interface LanguageContextProps {
  lang: Language;
  changeLanguage: (newLang: Language) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('fr');

  useEffect(() => {
    AsyncStorage.getItem('lang').then((savedLang) => {
      if (savedLang === 'fr' || savedLang === 'en') {
        setLang(savedLang);
      }
    });
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    AsyncStorage.setItem('lang', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
