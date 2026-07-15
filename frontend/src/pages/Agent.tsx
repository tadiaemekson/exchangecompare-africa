import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  CreditCard, 
  Send, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Ban, 
  Loader2,
  ArrowLeftRight
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

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
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  p2p_agent_id: number | null;
  chat_messages: ChatMessage[] | null;
  beneficiary_details?: any;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  } | null;
  provider: {
    id: number;
    name: string;
  };
  currency_from: {
    code: string;
  };
  currency_to: {
    code: string;
  };
}

const translations = {
  fr: {
    consoleTitle: "Console Agent P2P",
    consoleSubtitle: "Examinez les demandes de transfert direct et discutez avec les utilisateurs.",
    noConversions: "Aucune transaction P2P trouvée.",
    selectToExamine: "Sélectionnez une transaction pour l'examiner",
    userInformation: "Informations de l'utilisateur",
    beneficiaryDetails: "Détails du bénéficiaire",
    transactionDetails: "Détails de la transaction",
    status: "Statut",
    actions: "Actions",
    typeMessage: "Tapez votre message...",
    send: "Envoyer",
    markProcessing: "Marquer comme En cours",
    markCompleted: "Valider le Transfert (Terminé)",
    markCancelled: "Annuler (Fraude/Erreur)",
    pending: "En attente",
    processing: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
    client: "Client",
    agent: "Agent",
    statusUpdated: "Statut mis à jour",
    messageSent: "Message envoyé",
    errUpdate: "Impossible de modifier le statut",
    errSend: "Impossible d'envoyer le message",
    backToPublic: "Retour",
    provider: "Prestataire",
    amountSent: "Montant envoyé",
    amountReceived: "Montant à recevoir",
    rateApplied: "Taux appliqué",
    date: "Date de demande",
    phone: "Téléphone",
    email: "Email",
    name: "Nom",
    benefName: "Bénéficiaire",
    benefOperator: "Opérateur/Banque",
    benefAccount: "N° Compte/Téléphone",
    benefPhone: "Tél Contact",
  },
  en: {
    consoleTitle: "P2P Agent Console",
    consoleSubtitle: "Review direct transfer requests and chat with users.",
    noConversions: "No P2P transactions found.",
    selectToExamine: "Select a transaction to examine details",
    userInformation: "User Information",
    beneficiaryDetails: "Beneficiary Details",
    transactionDetails: "Transaction Details",
    status: "Status",
    actions: "Actions",
    typeMessage: "Type your message...",
    send: "Send",
    markProcessing: "Mark as Processing",
    markCompleted: "Validate Transfer (Completed)",
    markCancelled: "Cancel (Fraud/Error)",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
    client: "Client",
    agent: "Agent",
    statusUpdated: "Status updated",
    messageSent: "Message sent",
    errUpdate: "Failed to update status",
    errSend: "Failed to send message",
    backToPublic: "Back",
    provider: "Provider",
    amountSent: "Amount Sent",
    amountReceived: "Amount to Receive",
    rateApplied: "Rate Applied",
    date: "Request Date",
    phone: "Phone",
    email: "Email",
    name: "Name",
    benefName: "Beneficiary Name",
    benefOperator: "Operator/Bank",
    benefAccount: "Account/Mobile No.",
    benefPhone: "Contact Phone",
  }
};

export default function AgentConsole() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang);
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      toast.error("Access denied");
      navigate('/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== 'agent' && parsedUser.role !== 'admin') {
        toast.error("Access denied: P2P Agent only");
        navigate('/');
        return;
      }
    } catch (e) {
      navigate('/auth');
      return;
    }

    fetchConversions();
  }, []);

  useEffect(() => {
    // Auto-scroll chat to bottom when messages update
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversions, selectedId]);

  const changeLanguage = (newLang: 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const fetchConversions = async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/agent/conversions');
      setConversions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    setSubmittingAction(true);
    try {
      const res = await api.put(`/conversions/${id}/status`, { status: newStatus });
      toast.success(t.statusUpdated);
      setConversions(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (err) {
      toast.error(t.errUpdate);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !messageText.trim()) return;

    const currentMsg = messageText;
    setMessageText('');

    try {
      const res = await api.post(`/conversions/${selectedId}/messages`, { message: currentMsg });
      setConversions(prev => prev.map(c => c.id === selectedId ? res.data : c));
    } catch (err) {
      toast.error(t.errSend);
    }
  };

  const activeConversion = conversions.find(c => c.id === selectedId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'processing': return <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'cancelled': return <Ban className="w-3.5 h-3.5 text-red-500" />;
      default: return null;
    }
  };

  const parseBenefDetails = (details: any) => {
    if (!details) return null;
    if (typeof details === 'string') {
      try {
        return JSON.parse(details);
      } catch (e) {
        return null;
      }
    }
    return details;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      <Navbar currentLang={lang} onChangeLanguage={changeLanguage} />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 flex flex-col gap-6 w-full">
        
        {/* Header Console Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              {t.consoleTitle}
            </h1>
            <p className="text-xs text-slate-400">{t.consoleSubtitle}</p>
          </div>
          <Button onClick={fetchConversions} variant="outline" size="sm" className="gap-1.5 self-start md:self-auto h-9 font-semibold text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Console Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          
          {/* Left panel: Transactions list */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Transactions</h2>
            
            <Card className="flex-1 overflow-hidden border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex flex-col max-h-[600px]">
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-850">
                {loadingList && conversions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : conversions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-20">{t.noConversions}</p>
                ) : (
                  conversions.map((conv) => {
                    const isSelected = conv.id === selectedId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedId(conv.id)}
                        className={`p-4 cursor-pointer transition-colors flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border-l-4 border-[#2563EB]' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                            {conv.amount.toLocaleString()} {conv.currency_from.code}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(conv.status)}`}>
                            {getStatusIcon(conv.status)}
                            {t[conv.status]}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            → {conv.converted_amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {conv.currency_to.code}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 truncate font-medium">
                          {conv.user ? `${conv.user.name} (${conv.user.email})` : 'Guest'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Right panel: Inspection & Chat details */}
          <div className="lg:col-span-8 flex flex-col">
            {activeConversion ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Review & Operations Card */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Inspection</h2>
                    
                    {/* User info */}
                    <Card className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 space-y-2 text-xs">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-450 border-b pb-1.5 flex items-center gap-1.5 dark:border-slate-800/80">
                        <User className="w-3.5 h-3.5" />
                        {t.userInformation}
                      </CardTitle>
                      {activeConversion.user ? (
                        <div className="space-y-1">
                          <p><span className="font-semibold text-slate-400">{t.name}:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{activeConversion.user.name}</span></p>
                          <p><span className="font-semibold text-slate-400">{t.email}:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{activeConversion.user.email}</span></p>
                          {activeConversion.user.phone && (
                            <p><span className="font-semibold text-slate-400">{t.phone}:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{activeConversion.user.phone}</span></p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">Guest User</span>
                      )}
                    </Card>

                    {/* Beneficiary Details */}
                    {activeConversion.beneficiary_details && (
                      <Card className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 space-y-2 text-xs">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-450 border-b pb-1.5 flex items-center gap-1.5 dark:border-slate-800/80">
                          <CreditCard className="w-3.5 h-3.5" />
                          {t.beneficiaryDetails}
                        </CardTitle>
                        {(() => {
                          const details = parseBenefDetails(activeConversion.beneficiary_details);
                          if (!details) return <p className="text-slate-400">Error parsing details</p>;
                          return (
                            <div className="space-y-1">
                              <p><span className="font-semibold text-slate-400">{t.benefName}:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{details.beneficiary_name}</span></p>
                              <p><span className="font-semibold text-slate-400">{t.benefOperator}:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{details.bank_operator_name}</span></p>
                              <p><span className="font-semibold text-slate-400">{t.benefAccount}:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{details.account_number}</span></p>
                              {details.beneficiary_phone && (
                                <p><span className="font-semibold text-slate-400">{t.benefPhone}:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{details.beneficiary_phone}</span></p>
                              )}
                            </div>
                          );
                        })()}
                      </Card>
                    )}

                    {/* Transaction Details */}
                    <Card className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 space-y-2 text-xs">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-450 border-b pb-1.5 flex items-center gap-1.5 dark:border-slate-800/80">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        {t.transactionDetails}
                      </CardTitle>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.amountSent}</span>
                          <span className="font-extrabold text-sm text-slate-850 dark:text-slate-150">{activeConversion.amount.toLocaleString()} {activeConversion.currency_from.code}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.amountReceived}</span>
                          <span className="font-extrabold text-sm text-[#10B981]">{activeConversion.converted_amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {activeConversion.currency_to.code}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.rateApplied}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{activeConversion.rate.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.provider}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{activeConversion.provider.name}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Actions status panel */}
                  <Card className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">{t.actions}</span>
                    <div className="flex flex-col gap-2">
                      <Button
                        disabled={submittingAction || activeConversion.status === 'processing'}
                        onClick={() => handleStatusUpdate(activeConversion.id, 'processing')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t.markProcessing}
                      </Button>
                      <Button
                        disabled={submittingAction || activeConversion.status === 'completed'}
                        onClick={() => handleStatusUpdate(activeConversion.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.markCompleted}
                      </Button>
                      <Button
                        disabled={submittingAction || activeConversion.status === 'cancelled'}
                        onClick={() => handleStatusUpdate(activeConversion.id, 'cancelled')}
                        variant="destructive"
                        className="font-bold h-9 text-xs justify-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {t.markCancelled}
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Direct Live Chat Box */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Chat Support</h2>
                  
                  <Card className="flex-1 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex flex-col overflow-hidden max-h-[600px]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                      {activeConversion.chat_messages && activeConversion.chat_messages.length > 0 ? (
                        activeConversion.chat_messages.map((msg, index) => {
                          const isAgent = msg.sender_role === 'agent' || msg.sender_role === 'admin';
                          return (
                            <div
                              key={index}
                              className={`flex flex-col max-w-[85%] ${isAgent ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                            >
                              <span className="text-[9px] font-bold text-slate-400 mb-0.5">
                                {isAgent ? t.agent : t.client}: {msg.sender_name}
                              </span>
                              <div
                                className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                                  isAgent
                                    ? 'bg-[#2563EB] text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/80 rounded-tl-none shadow-xs'
                                }`}
                              >
                                {msg.message}
                              </div>
                              <span className="text-[8px] text-slate-400/80 mt-0.5">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-1.5 text-center px-4">
                          <span className="text-lg">💬</span>
                          <p className="text-xs font-semibold">No messages yet.</p>
                          <p className="text-[10px] text-slate-400 max-w-[200px]">Send a message to update the client about their P2P request.</p>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={t.typeMessage}
                        className="flex-1 text-xs h-9 bg-slate-50 dark:bg-slate-950 font-medium"
                      />
                      <Button type="submit" size="icon" className="w-9 h-9 shrink-0 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </Card>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-slate-400 gap-2">
                <span className="text-3xl">👤</span>
                <p className="text-xs font-bold tracking-wide">{t.selectToExamine}</p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
