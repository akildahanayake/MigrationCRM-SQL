import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  Globe, 
  CreditCard,
  Building2,
  Menu,
  X,
  Search,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import { User, Document, Message, Meeting, Payment, Agency, ApplicationStatus, PaymentGateway } from './types';
import { cn } from './utils/cn';
import { getProfilePic } from './utils/user';
import { Auth } from './components/Auth';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import Agents from './components/Agents';
import Documents from './components/Documents';
import Chat from './components/Chat';
import Meetings from './components/Meetings';
import Payments from './components/Payments';
import Agencies from './components/Agencies';
import Profiles from './components/Profiles';
import Settings from './components/Settings';

const API_URL = 'http://localhost:5000/api';

// --- Context & State Management ---
interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface StoreContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  payments: any[];
  agencies: Agency[];
  setAgencies: React.Dispatch<React.SetStateAction<Agency[]>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedUserProfileId: string | null;
  setSelectedUserProfileId: (id: string | null) => void;
  selectedChatContactId: string | null;
  setSelectedChatContactId: (id: string | null) => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  assignAgent: (userId: string, agentId: string) => void;
  updateMeetingStatus: (meetingId: string, status: Meeting['status']) => void;
  updateApplicationStatus: (userId: string, status: ApplicationStatus) => void;
  updateDocumentStatus: (docId: string, status: Document['status']) => void;
  rejectAgentRequest: (userId: string) => void;
  requestAgent: (agentId: string) => Promise<void>;
  acceptClient: (userId: string) => void;
  addUser: (user: any) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  deleteDocument: (docId: string) => void;
  addPayment: (payment: any) => void;
  updatePayment: (paymentId: string, updates: any) => void;
  destinations: string[];
  setDestinations: (d: string[]) => void;
  currencies: {code: string, symbol: string}[];
  setCurrencies: (c: {code: string, symbol: string}[]) => void;
  visaTypes: string[];
  setVisaTypes: (v: string[]) => void;
  documentTypes: string[];
  setDocumentTypes: (dt: string[]) => void;
  pipelineStages: string[];
  setPipelineStages: (ps: string[]) => void;
  selectedCurrency: {code: string, symbol: string};
  setSelectedCurrency: (c: {code: string, symbol: string}) => void;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (pref: 'light' | 'dark' | 'system') => void;
  paymentGateways: any;
  setPaymentGateways: (g: any) => void;
  refreshData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [selectedChatContactId, setSelectedChatContactId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [destinations, setDestinations] = useState<string[]>(['Australia', 'Canada', 'UK', 'USA']);
  const [currencies, setCurrencies] = useState<{code: string, symbol: string}[]>([{code: 'USD', symbol: '$'}]);
  const [selectedCurrency, setSelectedCurrency] = useState<{code: string, symbol: string}>({code: 'USD', symbol: '$'});
  const [visaTypes, setVisaTypes] = useState<string[]>(['Student Visa', 'Migration Visa']);
  const [documentTypes, setDocumentTypes] = useState<string[]>(['Passport', 'Academic certificate']);
  const [pipelineStages, setPipelineStages] = useState<string[]>(['Registration', 'Approved']);
  const [paymentGateways, setPaymentGateways] = useState<any>({
    stripe: { enabled: false, publishableKey: '', secretKey: '', webhookSecret: '' },
    paypal: { enabled: false, clientId: '', secretKey: '', sandbox: true },
    bankTransfer: { enabled: false, bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
    cash: { enabled: false, instructions: '' }
  });

  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('migratehub_theme_preference');
    return (saved as 'light' | 'dark' | 'system') || 'light';
  });

  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'checking'>('checking');

  const checkHealth = async () => {
    try {
      const res = await fetch('http://localhost:5000/health');
      const data = await res.json();
      if (data.status === 'ok') setDbStatus('connected');
      else setDbStatus('error');
    } catch (err) {
      setDbStatus('error');
    }
  };

  const fetchData = async () => {
    try {
      const [usersRes, agenciesRes, docsRes, msgsRes, meetingsRes, invoicesRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/users`).then(r => r.json()),
        fetch(`${API_URL}/agencies`).then(r => r.json()),
        fetch(`${API_URL}/documents`).then(r => r.json()),
        fetch(`${API_URL}/messages`).then(r => r.json()),
        fetch(`${API_URL}/meetings`).then(r => r.json()),
        fetch(`${API_URL}/invoices`).then(r => r.json()),
        fetch(`${API_URL}/settings`).then(r => r.json())
      ]);

      setUsers(usersRes.map((u: any) => ({ ...u, fullName: u.name })));
      setAgencies(agenciesRes);
      setDocuments(docsRes);
      setMessages(msgsRes);
      setMeetings(meetingsRes);
      setPayments(invoicesRes);
      
      if (settingsRes.visa_types) setVisaTypes(settingsRes.visa_types);
      if (settingsRes.destinations) setDestinations(settingsRes.destinations);
      if (settingsRes.currencies) setCurrencies(settingsRes.currencies);
      if (settingsRes.active_currency) setSelectedCurrency(settingsRes.active_currency);
      if (settingsRes.pipeline_stages) setPipelineStages(settingsRes.pipeline_stages);
      if (settingsRes.doc_types) setDocumentTypes(settingsRes.doc_types);
      if (settingsRes.gateways) setPaymentGateways(settingsRes.gateways);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchData().then(() => {
      const savedSession = localStorage.getItem('migratehub_auth');
      if (savedSession) {
        const { user } = JSON.parse(savedSession);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      setIsReady(true);
    });
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = async (email: string, password: string) => {
    // Hardcoded Superadmin Login
    if (email === 'admin' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        fullName: 'Super Admin',
        email: 'admin',
        role: 'SUPER_ADMIN',
        applicationStatus: 'Approved',
        phone: '+1 000 000 000',
        whatsapp: '+1 000 000 000',
        address: 'System Headquarters',
        gender: 'Other',
        age: 99,
        dob: '1970-01-01',
        nationality: 'Global',
        mailingAddress: 'Digital Void 101',
        maritalStatus: 'Single',
        currentLivingCountry: 'Global',
        registrationDate: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('migratehub_auth', JSON.stringify({ user: adminUser, token: 'offline-admin-token' }));
      showToast("Welcome back, Super Admin");
      return true;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
        return false;
      }
      const user = { ...data.user, fullName: data.user.name };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('migratehub_auth', JSON.stringify({ user, token: data.token }));
      showToast(`Welcome back, ${user.fullName}`);
      return true;
    } catch (err) {
      showToast('Login failed', 'error');
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
        return false;
      }
      const user = { ...data.user, fullName: data.user.name };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('migratehub_auth', JSON.stringify({ user, token: data.token }));
      showToast(`Registration successful! Welcome, ${user.fullName}`);
      fetchData();
      return true;
    } catch (err) {
      showToast('Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    localStorage.removeItem('migratehub_auth');
    showToast('Signed out successfully');
  };

  const saveSettings = async (updates: any) => {
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.setProperty('color-scheme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.setProperty('color-scheme', 'light');
      }
    };

    if (themePreference === 'system') {
      const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(systemMediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      systemMediaQuery.addEventListener('change', handler);
      cleanup = () => systemMediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(themePreference === 'dark');
    }

    localStorage.setItem('migratehub_theme_preference', themePreference);
    return () => cleanup?.();
  }, [themePreference]);

  const assignAgent = async (userId: string, agentId: string) => {
    await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedAgentId: agentId, applicationStatus: 'Document Collection' })
    });
    fetchData();
    showToast("Agent assigned successfully");
  };

  const updateMeetingStatus = async (meetingId: string, status: Meeting['status']) => {
    await fetch(`${API_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
    showToast(`Meeting ${status.toLowerCase()}`);
  };

  const updateApplicationStatus = async (userId: string, status: ApplicationStatus) => {
    await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationStatus: status })
    });
    fetchData();
    showToast("Application status updated");
  };

  const updateDocumentStatus = async (docId: string, status: Document['status']) => {
    await fetch(`${API_URL}/documents/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
    showToast(`Document status: ${status}`);
  };

  const rejectAgentRequest = async (userId: string) => {
    await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedAgentId: null })
    });
    fetchData();
    showToast("Agent request rejected");
  };

  const acceptClient = (userId: string) => {
    updateApplicationStatus(userId, 'Document Collection' as any);
    showToast("Client accepted");
  };

  const addUser = async (userData: any) => {
    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    fetchData();
    showToast("User added successfully");
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const apiUpdates: any = { ...updates };
    if (updates.fullName) apiUpdates.name = updates.fullName;
    await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiUpdates)
    });
    if (currentUser?.id === userId) {
      const res = await fetch(`${API_URL}/users/${userId}`);
      const updated = await res.json();
      setCurrentUser({ ...updated, fullName: updated.name });
    }
    fetchData();
    showToast("Profile updated successfully");
  };

  const deleteUser = async (userId: string) => {
    await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
    if (currentUser?.id === userId) logout();
    fetchData();
    showToast("User deleted completely");
  };

  const deleteDocument = async (docId: string) => {
    await fetch(`${API_URL}/documents/${docId}`, { method: 'DELETE' });
    fetchData();
    showToast("Document deleted");
  };

  const addPayment = async (payment: any) => {
    await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payment, client_id: payment.clientId })
    });
    fetchData();
    showToast("Invoice created");
  };

  const updatePayment = async (paymentId: string, updates: any) => {
    await fetch(`${API_URL}/invoices/${paymentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchData();
    showToast("Payment updated");
  };

  const value: any = {
    currentUser, isAuthenticated, login, logout, register,
    users, setUsers, documents, setDocuments, messages, setMessages, meetings, setMeetings,
    payments, agencies, setAgencies, activeTab, setActiveTab,
    selectedUserProfileId, setSelectedUserProfileId, selectedChatContactId, setSelectedChatContactId,
    toast, showToast, assignAgent, updateMeetingStatus, updateApplicationStatus, updateDocumentStatus,
    rejectAgentRequest, acceptClient, addUser, updateUser, deleteUser, deleteDocument, addPayment, updatePayment,
    destinations, setDestinations: (d: any) => { setDestinations(d); saveSettings({ destinations: d }); },
    currencies, setCurrencies: (c: any) => { setCurrencies(c); saveSettings({ currencies: c }); },
    visaTypes, setVisaTypes: (v: any) => { setVisaTypes(v); saveSettings({ visa_types: v }); },
    documentTypes, setDocumentTypes: (dt: any) => { setDocumentTypes(dt); saveSettings({ doc_types: dt }); },
    pipelineStages, setPipelineStages: (ps: any) => { setPipelineStages(ps); saveSettings({ pipeline_stages: ps }); },
    selectedCurrency, setSelectedCurrency: (c: any) => { setSelectedCurrency(c); saveSettings({ active_currency: c }); },
    themePreference, setThemePreference,
    paymentGateways, setPaymentGateways: (g: any) => { setPaymentGateways(g); saveSettings({ gateways: g }); },
    refreshData: fetchData
  };

  if (!isReady) return null;

  if (!isAuthenticated || !currentUser) {
    return (
      <StoreContext.Provider value={value}>
        <Auth />
        {toast && (
          <div className={cn("fixed bottom-8 right-8 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300", toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">{toast.type === 'success' ? '✓' : '!'}</div>
            <p className="font-medium">{toast.message}</p>
          </div>
        )}
      </StoreContext.Provider>
    );
  }

  const selectedUser = users.find(u => u.id === selectedUserProfileId);

  return (
    <StoreContext.Provider value={value}>
      <div className={cn("flex h-screen overflow-hidden font-sans transition-colors duration-300 bg-background text-foreground")}>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedUserProfileId(null)} />
            <div className="relative bg-white dark:bg-slate-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 transition-colors scrollbar-hide">
              <button onClick={() => setSelectedUserProfileId(null)} className="absolute top-8 right-8 z-10 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl text-slate-500 dark:text-slate-400 hover:text-vibrant-red border border-slate-100 dark:border-slate-800 transition-all hover:rotate-90">
                <X size={24} strokeWidth={2.5} />
              </button>
              <div className="p-0"><Profiles user={selectedUser} /></div>
            </div>
          </div>
        )}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 z-20 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg lg:hidden">
                <Menu size={20} className="text-muted-foreground" />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-foreground capitalize">{activeTab.replace('-', ' ')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
                dbStatus === 'connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : 
                dbStatus === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-600" : 
                "bg-secondary border-border text-muted-foreground"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  dbStatus === 'connected' ? "bg-emerald-500" : dbStatus === 'error' ? "bg-rose-500" : "bg-slate-400"
                )} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  SQLite: {dbStatus === 'connected' ? 'Connected' : dbStatus === 'error' ? 'Offline' : 'Checking'}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full border border-border">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider">Demo Role:</span>
                <select className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer" value={currentUser?.id} onChange={(e) => { const selected = users.find(u => u.id === e.target.value); if (selected) { setCurrentUser(selected); setActiveTab('dashboard'); } }}>
                  {users.map(u => <option key={u.id} value={u.id} className="bg-card">{u.fullName} ({u.role})</option>)}
                </select>
              </div>
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Bell size={20} /></button>
              <div className="flex items-center gap-3 pl-4 border-l border-border text-right hidden sm:block">
                  <p className="text-sm font-bold leading-tight text-foreground">{currentUser?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{currentUser?.role.replace('_', ' ')}</p>
              </div>
              <img src={getProfilePic(currentUser?.fullName || '', currentUser?.photoUrl)} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-border shadow-sm object-cover" />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 lg:p-8"><ContentRenderer /></div>
          {toast && (
            <div className={cn("fixed bottom-8 right-8 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300", toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">{toast.type === 'success' ? '✓' : '!'}</div>
              <p className="font-medium">{toast.message}</p>
            </div>
          )}
        </main>
      </div>
    </StoreContext.Provider>
  );
}

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const { activeTab, setActiveTab, currentUser, logout } = useStore();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'clients', label: 'Client CRM', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT'] },
    { id: 'find-agent', label: 'Find Agent', icon: Search, roles: ['USER'] },
    { id: 'agents', label: 'Agents', icon: Globe, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'documents', label: 'Documents', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'messaging', label: 'Messages', icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'meetings', label: 'Meetings', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'payments', label: 'Payments', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
    { id: 'agencies', label: 'Agencies', icon: Building2, roles: ['SUPER_ADMIN'] },
    { id: 'profile', label: 'My Profile', icon: UserIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER'] },
  ];
  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 lg:hidden z-30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 w-72 z-40 transition-transform duration-300 lg:static lg:translate-x-0 border-r flex flex-col shadow-2xl transition-colors bg-card dark:bg-card/80 dark:backdrop-blur-xl text-card-foreground border-border/50", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-8 flex items-center gap-4 bg-primary/5 border-b border-border/50">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-violet-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-12 transition-transform duration-500"><Globe className="text-primary-foreground" size={28} /></div>
          <div><h2 className="text-foreground font-black text-2xl tracking-tighter leading-none">MigrateHub</h2><p className="text-[10px] text-primary mt-1.5 uppercase tracking-[0.2em] font-black opacity-80">Migration CRM</p></div>
        </div>
        <nav className="flex-1 mt-8 px-5 space-y-2 overflow-y-auto scrollbar-hide pb-10">
          {filteredItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setIsOpen(false); }} className={cn("w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden", activeTab === item.id ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]" : "hover:bg-primary/10 text-muted-foreground hover:text-foreground hover:translate-x-1")}>
              <item.icon size={20} className={cn("transition-all stroke-[2.5px] relative z-10", activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary group-hover:scale-110")} />
              <span className="font-black text-sm tracking-tight relative z-10 uppercase tracking-widest text-[11px]">{item.label}</span>
              {activeTab === item.id && <><div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 opacity-100" /><div className="absolute right-0 w-1.5 h-6 bg-white/40 rounded-l-full blur-[1px]" /></>}
            </button>
          ))}
        </nav>
        <div className="p-4 bg-secondary/30 border-t border-border mt-auto">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><LogOut size={16} className="stroke-[3px]" /><span>Sign Out</span></button>
        </div>
      </aside>
    </>
  );
}

function ContentRenderer() {
  const { activeTab } = useStore();
  switch (activeTab) {
    case 'dashboard': return <Dashboard />;
    case 'clients': return <UserList />;
    case 'find-agent': return <Agents mode="market" />;
    case 'agents': return <Agents mode="manage" />;
    case 'documents': return <Documents />;
    case 'messaging': return <Chat />;
    case 'meetings': return <Meetings />;
    case 'payments': return <Payments />;
    case 'agencies': return <Agencies />;
    case 'profile': return <Profiles />;
    case 'settings': return <Settings />;
    default: return <Dashboard />;
  }
}
