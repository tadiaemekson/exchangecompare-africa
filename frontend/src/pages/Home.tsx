import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, TrendingUp, Info, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Provider {
  id: number;
  name: string;
  website: string;
  rating: number;
  logo_url: string;
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
}

export default function Home() {
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [amount, setAmount] = useState('100000');
  const [currencyFrom, setCurrencyFrom] = useState('XAF');
  const [currencyTo, setCurrencyTo] = useState('USD');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load currencies
    api.get('/currencies')
      .then(res => {
        if (res.data.length > 0) {
          setCurrencies(res.data);
        }
      })
      .catch(err => console.error("Erreur chargement devises", err));

    // Get current user session
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
      toast.success('Comparaison actualisée !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la comparaison.');
      setLoading(false);
    }
  };

  const handleTransfer = async (result: ComparisonResult) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Veuillez vous connecter pour enregistrer cette conversion.');
      navigate('/auth');
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

      toast.success(`Conversion enregistrée ! Redirection vers ${result.provider.name}...`);
      
      // Redirect to provider website after 1.5s
      setTimeout(() => {
        if (result.provider.website) {
          window.open(result.provider.website, '_blank');
        } else {
          window.open('https://google.com', '_blank');
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error("Impossible d'enregistrer la transaction.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    toast.success('Déconnexion réussie');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            <span className="text-[#2563EB] font-black text-2xl">EC</span>
            ExchangeCompare<span className="text-[#10B981]">.africa</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB]">
              Comparateur
            </Link>
            {user && (
              <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB] flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                Tableau de bord
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB] flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
            
            <div className="border-l border-slate-200 dark:border-slate-800 h-6 mx-1" />
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 font-medium">
                  {user.name}
                </span>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-500 hover:text-red-500 gap-1.5 h-8">
                  <LogOut className="w-4 h-4" />
                  Quitter
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-medium h-9 px-4 text-sm rounded-lg">
                  Se connecter
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        
        {/* Hero title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Comparez les frais et les taux de change pour l'Afrique
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Comparez en temps réel les banques, fintechs et bureaux de change pour minimiser vos frais et maximiser votre argent reçu.
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-6 rounded-2xl">
          <form onSubmit={handleCompare} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="amount" className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Montant à envoyer</Label>
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
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-1 flex items-center justify-center p-2 text-slate-400">
                <ArrowRightLeft className="w-5 h-5 hidden md:block" />
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="currencyTo" className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Devise de destination</Label>
                <select 
                  id="currencyTo"
                  value={currencyTo} 
                  onChange={(e) => setCurrencyTo(e.target.value)}
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-bold text-[#0F172A] dark:text-white"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.country})</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold h-11 rounded-xl text-base shadow-sm">
              {loading ? 'Calcul des meilleures offres...' : 'Comparer les taux'}
            </Button>
          </form>
        </Card>

        {/* Results Section */}
        {results.length > 0 ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white font-display">
                <TrendingUp className="text-[#10B981]" />
                Offres disponibles ({results.length})
              </h2>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Frais inclus dans le calcul
              </span>
            </div>

            <div className="grid gap-4">
              {results.map((result, idx) => (
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
                      ⭐ RECOMMANDATION PRINCIPALE (ÉCONOMIE MAXIMALE)
                    </div>
                  )}

                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Provider Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-extrabold text-[#0F172A] dark:text-white border border-slate-200/50">
                        {result.provider.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{result.provider.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>⭐ {result.provider.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Rates Detail */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Taux Achat</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{result.buy_rate.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Taux Vente</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{result.sell_rate.toFixed(6)}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Frais de Transfert</p>
                        <p className="font-semibold text-red-500">
                          {result.fixed_fee > 0 ? `${result.fixed_fee.toFixed(2)} ${currencyFrom}` : ''}
                          {result.fixed_fee > 0 && result.fee_percentage > 0 ? ' + ' : ''}
                          {result.fee_percentage > 0 ? `${result.fee_percentage}%` : ''}
                          {result.fixed_fee === 0 && result.fee_percentage === 0 ? 'Gratuit' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Converted Amount */}
                    <div className="text-left md:text-right min-w-[150px]">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Le destinataire reçoit</p>
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
                      Transférer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              Saisissez un montant et lancez la comparaison pour trouver la meilleure offre.
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 mt-24">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 ExchangeCompare Africa. Tous droits réservés. Architecture API First.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Conditions</a>
            <a href="#" className="hover:underline">Confidentialité</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
