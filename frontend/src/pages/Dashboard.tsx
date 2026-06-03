import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Trash2, ArrowLeft, CreditCard, History, LayoutDashboard, Check } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

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

interface Conversion {
  id: number;
  amount: number;
  converted_amount: number;
  rate: number;
  created_at: string;
  provider: { name: string };
  currency_from?: { code: string };
  currency_to?: { code: string };
  currencyFrom?: { code: string };
  currencyTo?: { code: string };
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

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  // Form state
  const [currencyFrom, setCurrencyFrom] = useState('');
  const [currencyTo, setCurrencyTo] = useState('');
  const [targetRate, setTargetRate] = useState('');
  const [condition, setCondition] = useState('above');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      toast.success('Alerte créée', { description: 'Vous serez notifié par email.' });
      setTargetRate('');
      fetchData();
    } catch (err) {
      toast.error('Erreur', { description: "Impossible de créer l'alerte." });
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.delete(`/alerts/${id}`);
      toast.success('Alerte supprimée');
      fetchData();
    } catch (err) {
      toast.error('Erreur', { description: 'Échec de la suppression.' });
    }
  };

  const handleSubscribe = async (planId: number) => {
    setLoading(true);
    try {
      const res = await api.post('/subscribe', { plan_id: planId });
      setSubscription(res.data);
      toast.success('Abonnement mis à jour !', { description: `Vous êtes maintenant abonné au plan ${res.data.plan.name}` });
      setLoading(false);
    } catch (err) {
      toast.error("Échec de la mise à jour de l'abonnement.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Retour au comparateur
          </Link>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#2563EB]" />
            <span className="font-extrabold text-base tracking-tight font-display">Dashboard Utilisateur</span>
          </div>
          {subscription && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mon Plan:</span>
              <span className="text-xs font-extrabold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200/20">
                {subscription.plan.name}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        
        {/* Row 1: Subscriptions plans */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
            <CreditCard className="text-[#2563EB]" />
            Abonnements SaaS MVP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isActive = subscription?.plan_id === plan.id;
              return (
                <Card key={plan.id} className={`border relative overflow-hidden transition-all ${
                  isActive 
                    ? 'border-[#2563EB] shadow-md shadow-blue-100 dark:shadow-none bg-blue-50/10 dark:bg-slate-900' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}>
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-[#2563EB] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg">
                      ACTIF
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price.toFixed(2)} $</span>
                      <span className="text-slate-400 text-xs ml-1">/ mois</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-xs text-slate-500 space-y-2">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#10B981]" /> Comparaisons de devises illimitées</li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />{' '}
                        {plan.price === 0 ? 'Jusqu\'à 3 alertes actives' : plan.price < 20 ? 'Jusqu\'à 15 alertes actives' : 'Alertes actives illimitées'}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />{' '}
                        {plan.price === 0 ? 'Mise à jour standard (1h)' : 'Mise à jour instantanée en temps réel'}
                      </li>
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading || isActive}
                      className={`w-full h-9 font-bold text-xs ${
                        isActive 
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-default' 
                          : 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white'
                      }`}
                    >
                      {isActive ? 'Plan Actuel' : 'S\'abonner'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Row 2: Alert rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Alert rule */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
              <Bell className="text-[#F59E0B]" />
              Nouvelle Alerte
            </h2>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-xl">
              <form onSubmit={handleAddAlert} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Paire de devises</Label>
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
                  <Label className="text-xs font-semibold">Condition de déclenchement</Label>
                  <select 
                    value={condition} 
                    onChange={(e) => setCondition(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F172A] dark:text-white font-medium"
                  >
                    <option value="above">Est supérieur ou égal à (≥)</option>
                    <option value="below">Est inférieur ou égal à (≤)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Taux Cible</Label>
                  <Input 
                    type="number" 
                    step="0.000001"
                    value={targetRate} 
                    onChange={(e) => setTargetRate(e.target.value)} 
                    placeholder="Ex: 0.00165"
                    className="h-10"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-10 gap-2">
                  <Plus className="w-4 h-4" /> Créer l'alerte
                </Button>
              </form>
            </Card>
          </div>

          {/* Active Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
              <Bell className="text-[#2563EB]" />
              Mes alertes configurées ({alerts.length})
            </h2>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 rounded-xl">
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-center py-12 text-sm">Aucune alerte active configurée.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paire de devises</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Taux cible</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Supprimer</TableHead>
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
                            {alert.condition === 'above' ? '≥ Supérieur ou égal' : '≤ Inférieur ou égal'}
                          </TableCell>
                          <TableCell className="font-bold text-[#2563EB]">{alert.target_rate}</TableCell>
                          <TableCell>
                            {alert.is_active ? (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">Active</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">Déclenchée</span>
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
            Historique de mes transferts ({conversions.length})
          </h2>
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 rounded-xl">
            {conversions.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-sm">Aucun transfert enregistré.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Montant envoyé</TableHead>
                    <TableHead>Taux appliqué</TableHead>
                    <TableHead>Montant converti</TableHead>
                    <TableHead>Date du transfert</TableHead>
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
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                          {conv.amount.toLocaleString()} {from}
                        </TableCell>
                        <TableCell className="text-slate-500">{conv.rate}</TableCell>
                        <TableCell className="font-bold text-[#10B981]">
                          {conv.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {to}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {new Date(conv.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </section>

      </main>
    </div>
  );
}
