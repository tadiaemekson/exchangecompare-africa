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
  provider?: { name: string };
  currency_from?: Currency;
  currency_to?: Currency;
  currencyFrom?: Currency;
  currencyTo?: Currency;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Data lists
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  
  // Global stats
  const [stats, setStats] = useState({ users: 2, providers: 0, rates: 0, conversions: 0 });

  // Dialog control states
  const [activeTab, setActiveTab] = useState('overview');
  
  const [providerOpen, setProviderOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [providerForm, setProviderForm] = useState({
    name: '', website: '', rating: 5.0, status: 'active', logo_url: '', is_active: true
  });
  
  const [currencyForm, setCurrencyForm] = useState({
    code: '', name: '', symbol: '', country: '', is_active: true
  });
  
  const [rateForm, setRateForm] = useState({
    provider_id: '', from_currency_id: '', to_currency_id: '', buy_rate: '', sell_rate: '', fee_percentage: '0', fixed_fee: '0'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [provRes, curRes, rateRes, convRes] = await Promise.all([
        api.get('/providers'),
        api.get('/currencies'),
        api.get('/rates'),
        api.get('/conversions')
      ]);

      setProviders(provRes.data);
      setCurrencies(curRes.data);
      setRates(rateRes.data);
      setConversions(convRes.data);

      setStats({
        users: 2, // Seeded Test User & Admin
        providers: provRes.data.length,
        rates: rateRes.data.length,
        conversions: convRes.data.length
      });
    } catch (err) {
      console.error(err);
      toast.error('Erreur', { description: 'Impossible de synchroniser les données d\'administration.' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Déconnexion réussie');
    navigate('/auth');
  };

  // PROVIDERS ACTIONS
  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/providers/${editingId}`, providerForm);
        toast.success('Fournisseur mis à jour');
      } else {
        await api.post('/providers', providerForm);
        toast.success('Fournisseur ajouté');
      }
      setProviderOpen(false);
      setEditingId(null);
      setProviderForm({ name: '', website: '', rating: 5.0, status: 'active', logo_url: '', is_active: true });
      fetchAllData();
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde du fournisseur.');
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;
    try {
      await api.delete(`/providers/${id}`);
      toast.success('Fournisseur supprimé');
      fetchAllData();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  // CURRENCIES ACTIONS
  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/currencies/${editingId}`, currencyForm);
        toast.success('Devise mise à jour');
      } else {
        await api.post('/currencies', currencyForm);
        toast.success('Devise ajoutée');
      }
      setCurrencyOpen(false);
      setEditingId(null);
      setCurrencyForm({ code: '', name: '', symbol: '', country: '', is_active: true });
      fetchAllData();
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde de la devise.');
    }
  };

  const handleDeleteCurrency = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette devise ?')) return;
    try {
      await api.delete(`/currencies/${id}`);
      toast.success('Devise supprimée');
      fetchAllData();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  // RATES ACTIONS
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/rates/${editingId}`, rateForm);
        toast.success('Taux mis à jour');
      } else {
        await api.post('/rates', rateForm);
        toast.success('Taux ajouté');
      }
      setRateOpen(false);
      setEditingId(null);
      setRateForm({ provider_id: '', from_currency_id: '', to_currency_id: '', buy_rate: '', sell_rate: '', fee_percentage: '0', fixed_fee: '0' });
      fetchAllData();
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde du taux.');
    }
  };

  const handleDeleteRate = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce taux ?')) return;
    try {
      await api.delete(`/rates/${id}`);
      toast.success('Taux supprimé');
      fetchAllData();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const openEditProvider = (p: Provider) => {
    setEditingId(p.id);
    setProviderForm({
      name: p.name, website: p.website || '', rating: p.rating, status: p.status, logo_url: p.logo_url || '', is_active: p.is_active
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
            EC Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Button 
            onClick={() => setActiveTab('overview')} 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <BarChart className="w-4 h-4 text-blue-500" /> Vue d'ensemble
          </Button>
          <Button 
            onClick={() => setActiveTab('providers')} 
            variant={activeTab === 'providers' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <Landmark className="w-4 h-4 text-emerald-500" /> Fournisseurs
          </Button>
          <Button 
            onClick={() => setActiveTab('currencies')} 
            variant={activeTab === 'currencies' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <Layers className="w-4 h-4 text-amber-500" /> Devises
          </Button>
          <Button 
            onClick={() => setActiveTab('rates')} 
            variant={activeTab === 'rates' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <RefreshCw className="w-4 h-4 text-purple-500" /> Taux de change
          </Button>
          <Button 
            onClick={() => setActiveTab('conversions')} 
            variant={activeTab === 'conversions' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-2 h-9 font-medium text-xs"
          >
            <Users className="w-4 h-4 text-pink-500" /> Global Transactions
          </Button>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs h-9" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">Console d'Administration</h1>
            <p className="text-xs text-slate-400">Gérez le comparateur de taux de change ExchangeCompare Africa en temps réel.</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1 h-9 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" /> Retour public
            </Button>
          </Link>
        </div>

        {/* Tab content renderer */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">Utilisateurs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.users}</div>
                </CardContent>
              </Card>
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">Fournisseurs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.providers}</div>
                </CardContent>
              </Card>
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">Taux connectés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.rates}</div>
                </CardContent>
              </Card>
              <Card className="border bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">Conversions sauvegardées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-pink-600 dark:text-pink-400">{stats.conversions}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border bg-white dark:bg-slate-900 p-6">
              <h3 className="font-bold text-lg mb-2">Instructions Générales</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Utilisez les menus sur la barre latérale pour administrer la plateforme. Vous pouvez ajouter des fournisseurs de transfert, déclarer de nouvelles devises avec leurs pays respectifs, et lier des taux de change spécifiques en configurant les frais fixes et variables. Les utilisateurs connectés pourront directement comparer les taux et enregistrer leurs transactions d'échange.
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'providers' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Fournisseurs de transfert</CardTitle>
                <CardDescription className="text-xs">Gérez les prestataires configurés dans le comparateur.</CardDescription>
              </div>
              
              <Dialog open={providerOpen} onOpenChange={(open) => { setProviderOpen(open); if(!open) setEditingId(null); }}>
                <DialogTrigger render={<Button onClick={() => setProviderForm({ name: '', website: '', rating: 5.0, status: 'active', logo_url: '', is_active: true })} className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold h-9 text-xs"><Plus className="w-4 h-4" /> Ajouter</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Modifier le Fournisseur' : 'Ajouter un Fournisseur'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveProvider} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nom</Label>
                      <Input required value={providerForm.name} onChange={(e) => setProviderForm({...providerForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Site Web</Label>
                      <Input value={providerForm.website} placeholder="https://..." onChange={(e) => setProviderForm({...providerForm, website: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Note Globale (0-5)</Label>
                      <Input type="number" step="0.1" min="0" max="5" required value={providerForm.rating} onChange={(e) => setProviderForm({...providerForm, rating: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Logo URL</Label>
                      <Input value={providerForm.logo_url} placeholder="https://..." onChange={(e) => setProviderForm({...providerForm, logo_url: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="provider_active" checked={providerForm.is_active} onChange={(e) => setProviderForm({...providerForm, is_active: e.target.checked})} />
                      <Label htmlFor="provider_active" className="text-xs font-semibold cursor-pointer">Marquer comme actif</Label>
                    </div>
                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold">{editingId ? 'Mettre à jour' : 'Ajouter'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Site Web</TableHead>
                    <TableHead>Fiabilité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">{p.name}</TableCell>
                      <TableCell className="text-slate-400 text-xs truncate max-w-[150px]">{p.website}</TableCell>
                      <TableCell>⭐ {p.rating.toFixed(2)}</TableCell>
                      <TableCell>
                        {p.is_active ? 
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">Actif</span> : 
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">Inactif</span>
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
                      <TableCell colSpan={5} className="text-center py-4 text-slate-400">Aucun fournisseur trouvé.</TableCell>
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
                <CardTitle className="text-xl">Devises</CardTitle>
                <CardDescription className="text-xs">Gérez les devises disponibles pour comparaison.</CardDescription>
              </div>
              
              <Dialog open={currencyOpen} onOpenChange={(open) => { setCurrencyOpen(open); if(!open) setEditingId(null); }}>
                <DialogTrigger render={<Button onClick={() => setCurrencyForm({ code: '', name: '', symbol: '', country: '', is_active: true })} className="bg-amber-600 hover:bg-amber-600/90 text-white font-bold h-9 text-xs"><Plus className="w-4 h-4" /> Ajouter</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Modifier la Devise' : 'Ajouter une Devise'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveCurrency} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Code ISO (ex: XAF, USD)</Label>
                      <Input required maxLength={3} placeholder="USD" value={currencyForm.code} onChange={(e) => setCurrencyForm({...currencyForm, code: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nom complet</Label>
                      <Input required placeholder="US Dollar" value={currencyForm.name} onChange={(e) => setCurrencyForm({...currencyForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Symbole (ex: $, €)</Label>
                      <Input placeholder="$" value={currencyForm.symbol} onChange={(e) => setCurrencyForm({...currencyForm, symbol: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pays d'origine</Label>
                      <Input required placeholder="États-Unis" value={currencyForm.country} onChange={(e) => setCurrencyForm({...currencyForm, country: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="currency_active" checked={currencyForm.is_active} onChange={(e) => setCurrencyForm({...currencyForm, is_active: e.target.checked})} />
                      <Label htmlFor="currency_active" className="text-xs font-semibold cursor-pointer">Marquer comme active</Label>
                    </div>
                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold">{editingId ? 'Mettre à jour' : 'Ajouter'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code ISO</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Symbole</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">Active</span> : 
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">Inactive</span>
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
                      <TableCell colSpan={6} className="text-center py-4 text-slate-400">Aucune devise trouvée.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'rates' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Taux de change & Frais</CardTitle>
                <CardDescription className="text-xs">Gérez les taux d'achat et de vente associés aux fournisseurs d'échange.</CardDescription>
              </div>
              
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
                    <Plus className="w-4 h-4" /> Ajouter
                  </Button>
                } />
                <DialogContent>
                  <DialogTitle>{editingId ? 'Modifier le Taux' : 'Ajouter un Taux'}</DialogTitle>
                  <form onSubmit={handleSaveRate} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Fournisseur</Label>
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
                        <Label className="text-xs">Devise Source</Label>
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
                        <Label className="text-xs">Devise Destination</Label>
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
                        <Label className="text-xs">Taux Achat</Label>
                        <Input type="number" step="0.000001" required value={rateForm.buy_rate} onChange={(e) => setRateForm({...rateForm, buy_rate: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Taux Vente</Label>
                        <Input type="number" step="0.000001" required value={rateForm.sell_rate} onChange={(e) => setRateForm({...rateForm, sell_rate: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Frais Variables (%)</Label>
                        <Input type="number" step="0.01" value={rateForm.fee_percentage} onChange={(e) => setRateForm({...rateForm, fee_percentage: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Frais Fixes (Devise Source)</Label>
                        <Input type="number" step="0.01" value={rateForm.fixed_fee} onChange={(e) => setRateForm({...rateForm, fixed_fee: e.target.value})} />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold">{editingId ? 'Mettre à jour' : 'Enregistrer'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Paire</TableHead>
                    <TableHead>Taux Achat</TableHead>
                    <TableHead>Taux Vente</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          {r.fixed_fee === 0 && r.fee_percentage === 0 ? 'Gratuit' : ''}
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
                      <TableCell colSpan={6} className="text-center py-4 text-slate-400">Aucun taux configuré.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'conversions' && (
          <Card className="border bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl">Historique Global des Transactions</CardTitle>
              <CardDescription className="text-xs">Consultez l'historique complet des conversions et transferts simulés par les utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Montant envoyé</TableHead>
                    <TableHead>Taux appliqué</TableHead>
                    <TableHead>Montant reçu</TableHead>
                    <TableHead>Date</TableHead>
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
                            <p className="text-xs">{conv.user?.name || 'Visiteur'}</p>
                            <p className="text-[10px] text-slate-400">{conv.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{conv.provider?.name}</TableCell>
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
                      <TableCell colSpan={6} className="text-center py-4 text-slate-400">Aucun historique d'échange enregistré.</TableCell>
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
