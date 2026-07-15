import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Trash2, History, MessageSquare, Send, Clock, CheckCircle2, Ban, RefreshCw } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Alert {
  id: number;
  currency_from_id: number;
  currency_to_id: number;
  target_rate: number;
  condition: string;
  is_active: boolean;
  currency_from?: { code: string };
  currency_to?: { code: string };
  currencyFrom?: { code: string };
  currencyTo?: { code: string };
}

interface ChatMessage {
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

interface Conversion {
  id: number;
  amount: number;
  converted_amount: number;
  rate: number;
  created_at: string;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  chat_messages?: ChatMessage[] | null;
  provider: { id: number; name: string; type?: string };
  currency_from?: { code: string };
  currency_to?: { code: string };
  currencyFrom?: { code: string };
  currencyTo?: { code: string };
}





interface Currency {
  id: number;
  code: string;
}

const translations = {
  fr: {
    backToComparator: "Retour au comparateur",
    userDashboard: "Dashboard Utilisateur",
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
    triggerCondition: "Condition de déclenchement",
    aboveOrEqual: "Est supérieur ou égal à (≥)",
    belowOrEqual: "Est inférieur ou égal à (≤)",
    targetRate: "Taux Cible",
    targetRatePlaceholder: "Ex: 0.00165",
    createAlertBtn: "Créer l'alerte",
    myConfiguredAlerts: "Mes alertes configurées",
    noActiveAlerts: "Aucune alerte active configurée.",
    tableCurrencyPair: "Paire de devises",
    tableCondition: "Condition",
    tableTargetRate: "Taux cible",
    tableStatus: "Statut",
    tableDelete: "Supprimer",
    condAbove: "≥ Supérieur ou égal",
    condBelow: "≤ Inférieur ou égal",
    statusActive: "Active",
    statusTriggered: "Déclenchée",
    transferHistory: "Historique de mes transferts",
    noTransfers: "Aucun transfert enregistré.",
    tableProvider: "Fournisseur",
    tableSentAmount: "Montant envoyé",
    tableAppliedRate: "Taux appliqué",
    tableConvertedAmount: "Montant converti",
    tableTransferDate: "Date du transfert",
    
    // Toasts
    alertCreated: "Alerte créée",
    alertCreatedDesc: "Vous serez notifié par email.",
    error: "Erreur",
    alertCreateFail: "Impossible de créer l'alerte.",
    alertDeleted: "Alerte supprimée",
    alertDeleteFail: "Échec de la suppression.",
    subUpdated: "Abonnement mis à jour !",
    subUpdatedDesc: "Vous êtes maintenant abonné au plan ",
    subUpdateFail: "Échec de la mise à jour de l'abonnement."
  },
  en: {
    backToComparator: "Back to comparator",
    userDashboard: "User Dashboard",
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
    tableCurrencyPair: "Currency Pair",
    tableCondition: "Condition",
    tableTargetRate: "Target Rate",
    tableStatus: "Status",
    tableDelete: "Delete",
    condAbove: "≥ Greater or equal",
    condBelow: "≤ Less or equal",
    statusActive: "Active",
    statusTriggered: "Triggered",
    transferHistory: "My transfer history",
    noTransfers: "No transfers recorded.",
    tableProvider: "Provider",
    tableSentAmount: "Sent Amount",
    tableAppliedRate: "Applied Rate",
    tableConvertedAmount: "Converted Amount",
    tableTransferDate: "Transfer Date",
    
    // Toasts
    alertCreated: "Alert created",
    alertCreatedDesc: "You will be notified by email.",
    error: "Error",
    alertCreateFail: "Unable to create the alert.",
    alertDeleted: "Alert deleted",
    alertDeleteFail: "Failed to delete.",
    subUpdated: "Subscription updated!",
    subUpdatedDesc: "You are now subscribed to the plan ",
    subUpdateFail: "Failed to update subscription."
  }
};

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatMsgText, setChatMsgText] = useState('');

  // Form state
  const [currencyFrom, setCurrencyFrom] = useState('');
  const [currencyTo, setCurrencyTo] = useState('');
  const [targetRate, setTargetRate] = useState('');
  const [condition, setCondition] = useState('above');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    if (!chatOpen || !activeChatId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get('/conversions');
        setConversions(res.data);
      } catch (err) {
        console.error("Error refreshing conversions status", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [chatOpen, activeChatId]);

  const sendUserChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !chatMsgText.trim()) return;

    const currentMsg = chatMsgText;
    setChatMsgText('');

    try {
      const res = await api.post(`/conversions/${activeChatId}/messages`, { message: currentMsg });
      setConversions(prev => prev.map(c => c.id === activeChatId ? res.data : c));
    } catch (err) {
      toast.error("Impossible d'envoyer le message.");
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang);
    }
    fetchData();
  }, []);

  const changeLanguage = (newLang: 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = translations[lang];

  const fetchData = async () => {
    try {
      const [alertsRes, curRes, convRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/currencies'),
        api.get('/conversions')
      ]);

      setAlerts(alertsRes.data);
      setCurrencies(curRes.data);
      setConversions(convRes.data);

      if (curRes.data.length > 0) {
        setCurrencyFrom(curRes.data[0].id.toString());
        setCurrencyTo(curRes.data[1] ? curRes.data[1].id.toString() : curRes.data[0].id.toString());
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données", err);
    }
  };

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/alerts', {
        currency_from_id: currencyFrom,
        currency_to_id: currencyTo,
        target_rate: targetRate,
        condition
      });
      toast.success(t.alertCreated, { description: t.alertCreatedDesc });
      setTargetRate('');
      fetchData();
    } catch (err) {
      toast.error(t.error, { description: t.alertCreateFail });
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.delete(`/alerts/${id}`);
      toast.success(t.alertDeleted);
      fetchData();
    } catch (err) {
      toast.error(t.error, { description: t.alertDeleteFail });
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      <Navbar currentLang={lang} onChangeLanguage={changeLanguage} />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        

        {/* Row 2: Alert rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Alert rule */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
              <Bell className="text-[#F59E0B]" />
              {t.newAlert}
            </h2>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-xl">
              <form onSubmit={handleAddAlert} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t.currencyPair}</Label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={currencyFrom} 
                      onChange={(e) => setCurrencyFrom(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white font-bold"
                    >
                      {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                    </select>
                    <span className="text-slate-400 font-bold">→</span>
                    <select 
                      value={currencyTo} 
                      onChange={(e) => setCurrencyTo(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white font-bold"
                    >
                      {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t.triggerCondition}</Label>
                  <select 
                    value={condition} 
                    onChange={(e) => setCondition(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white font-medium"
                  >
                    <option value="above">{t.aboveOrEqual}</option>
                    <option value="below">{t.belowOrEqual}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t.targetRate}</Label>
                  <Input 
                    type="number" 
                    step="0.000001"
                    value={targetRate} 
                    onChange={(e) => setTargetRate(e.target.value)} 
                    placeholder={t.targetRatePlaceholder}
                    className="h-10"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-10 gap-2">
                  <Plus className="w-4 h-4" /> {t.createAlertBtn}
                </Button>
              </form>
            </Card>
          </div>

          {/* Active Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
              <Bell className="text-[#2563EB]" />
              {t.myConfiguredAlerts} ({alerts.length})
            </h2>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 rounded-xl">
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-center py-12 text-sm">{t.noActiveAlerts}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.tableCurrencyPair}</TableHead>
                      <TableHead>{t.tableCondition}</TableHead>
                      <TableHead>{t.tableTargetRate}</TableHead>
                      <TableHead>{t.tableStatus}</TableHead>
                      <TableHead className="text-right">{t.tableDelete}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => {
                      const from = alert.currencyFrom?.code || alert.currency_from?.code;
                      const to = alert.currencyTo?.code || alert.currency_to?.code;
                      return (
                        <TableRow key={alert.id}>
                          <TableCell className="font-bold text-slate-900 dark:text-white">
                            {from} → {to}
                          </TableCell>
                          <TableCell className="text-xs">
                            {alert.condition === 'above' ? t.condAbove : t.condBelow}
                          </TableCell>
                          <TableCell className="font-bold text-[#2563EB]">{alert.target_rate}</TableCell>
                          <TableCell>
                            {alert.is_active ? (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">{t.statusActive}</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">{t.statusTriggered}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>

        </div>

        {/* Row 3: History of Conversions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
            <History className="text-[#10B981]" />
            {t.transferHistory} ({conversions.length})
          </h2>
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 rounded-xl">
            {conversions.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-sm">{t.noTransfers}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableProvider}</TableHead>
                    <TableHead>{t.tableSentAmount}</TableHead>
                    <TableHead>{t.tableAppliedRate}</TableHead>
                    <TableHead>{t.tableConvertedAmount}</TableHead>
                    <TableHead>{t.tableTransferDate}</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((conv) => {
                    const from = conv.currencyFrom?.code || conv.currency_from?.code;
                    const to = conv.currencyTo?.code || conv.currency_to?.code;
                    return (
                      <TableRow key={conv.id}>
                        <TableCell className="font-bold text-slate-900 dark:text-white">
                          {conv.provider.name}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 dark:text-slate-350">
                          {conv.amount.toLocaleString()} {from}
                        </TableCell>
                        <TableCell className="text-slate-500">{conv.rate}</TableCell>
                        <TableCell className="font-bold text-[#10B981]">
                          {conv.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {to}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {new Date(conv.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 capitalize ${
                            conv.status === 'pending' || !conv.status
                              ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30'
                              : conv.status === 'processing'
                              ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30'
                              : conv.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
                              : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
                          }`}>
                            {conv.status || 'pending'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {conv.provider.type === 'agent' && (
                            <Button
                              onClick={() => {
                                setActiveChatId(conv.id);
                                setChatOpen(true);
                              }}
                              className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-8 text-[10px] px-3 gap-1 rounded-lg"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Chat & Suivi
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </section>

        {/* P2P Chat & Track Dialog */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-md w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
                <MessageSquare className="text-[#2563EB]" />
                Suivi de transfert P2P
              </DialogTitle>
            </DialogHeader>

            {(() => {
              const activeConv = conversions.find(c => c.id === activeChatId);
              if (!activeConv) return null;
              return (
                <div className="space-y-4 mt-2">
                  {/* Status Indicator */}
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Statut du transfert</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {activeConv.status || 'En attente'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      activeConv.status === 'pending' || !activeConv.status
                        ? 'bg-amber-100 text-amber-805 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30'
                        : activeConv.status === 'processing'
                        ? 'bg-blue-105 text-blue-805 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30'
                        : activeConv.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-805 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
                        : 'bg-red-105 text-red-805 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
                    }`}>
                      {activeConv.status === 'pending' || !activeConv.status ? <Clock className="w-3.5 h-3.5" /> : null}
                      {activeConv.status === 'processing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      {activeConv.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {activeConv.status === 'cancelled' ? <Ban className="w-3.5 h-3.5" /> : null}
                      {activeConv.status || 'pending'}
                    </span>
                  </div>

                  {/* Chat window */}
                  <div className="h-64 overflow-y-auto p-3.5 rounded-xl border border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/20 space-y-3 flex flex-col">
                    {activeConv.chat_messages && activeConv.chat_messages.length > 0 ? (
                      activeConv.chat_messages.map((msg, index) => {
                        const isMe = msg.sender_role === 'user';
                        return (
                          <div
                            key={index}
                            className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[9px] font-bold text-slate-400 mb-0.5">
                              {msg.sender_name} ({msg.sender_role})
                            </span>
                            <div
                              className={`p-3 rounded-2xl text-xs font-semibold ${
                                isMe
                                  ? 'bg-[#2563EB] text-white rounded-tr-none'
                                  : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-805 shadow-2xs rounded-tl-none'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center gap-1.5 py-12">
                        <span className="text-2xl">💬</span>
                        <p className="text-xs font-bold text-slate-500">Pas encore de messages.</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">Échangez ici avec l'agent pour valider votre virement ou poser des questions.</p>
                      </div>
                    )}
                  </div>

                  {/* Text sender input */}
                  <form onSubmit={sendUserChatMessage} className="flex gap-2">
                    <Input
                      value={chatMsgText}
                      onChange={(e) => setChatMsgText(e.target.value)}
                      placeholder="Posez votre question à l'agent P2P..."
                      className="flex-1 text-xs h-9 bg-slate-50 dark:bg-slate-950 font-medium border-slate-200 dark:border-slate-800"
                    />
                    <Button type="submit" size="icon" className="w-9 h-9 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
