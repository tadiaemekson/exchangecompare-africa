import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Mail, Phone, Shield } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      toast.success('Connexion réussie !');
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Identifiants ou mot de passe incorrects.';
      setError(msg);
      toast.error('Échec de la connexion');
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
      
      toast.success('Inscription réussie !');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      setError(msg);
      toast.error('Échec de l\'inscription');
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
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ExchangeCompare
            </CardTitle>
            <CardDescription className="text-slate-500">
              Comparez les taux de change et configurez vos alertes
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger value="login" className="rounded-md">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md">Inscription</TabsTrigger>
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="nom@exemple.com" 
                      className="pl-9"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <a href="#" className="text-xs text-secondary hover:underline">Mot de passe oublié ?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      className="pl-9"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium" disabled={loading}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Jean Dupont" 
                      className="pl-9"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="nom@exemple.com" 
                      className="pl-9"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reg-phone" 
                      type="tel" 
                      placeholder="+237 6xx xx xx xx" 
                      className="pl-9"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe (min. 6 caractères)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder="••••••••"
                      className="pl-9"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-medium" disabled={loading}>
                  {loading ? 'Création en cours...' : 'Créer mon compte'}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 p-4 mt-4">
            <p className="text-[11px] text-slate-500 text-center max-w-xs">
              En continuant, vous acceptez nos <a href="#" className="underline hover:text-slate-700">Conditions d'utilisation</a> et notre <a href="#" className="underline hover:text-slate-700">Politique de confidentialité</a>.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
