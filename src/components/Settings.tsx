import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Monitor, 
  MapPin, 
  CreditCard, 
  FileText, 
  ChevronRight, 
  Save, 
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Building2,
  Lock,
  Globe,
  Wallet
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';

export default function Settings() {
  const { 
    currentUser, 
    destinations, setDestinations,
    currencies, setCurrencies,
    selectedCurrency, setSelectedCurrency,
    visaTypes, setVisaTypes,
    documentTypes, setDocumentTypes,
    pipelineStages, setPipelineStages,
    themePreference, setThemePreference,
    paymentGateways, setPaymentGateways,
    showToast
  } = useStore();

  const [activeSection, setActiveTab] = useState('destinations');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully!', 'success');
    }, 1500);
  };

  const sections = [
    { id: 'destinations', label: 'Destinations', icon: Globe, adminOnly: true },
    { id: 'currencies', label: 'Currencies', icon: Wallet, adminOnly: true },
    { id: 'visa-types', label: 'Visa Types', icon: Shield, adminOnly: true },
    { id: 'doc-types', label: 'Documents', icon: FileText, adminOnly: true },
    { id: 'gateways', label: 'Payment Gateways', icon: CreditCard, adminOnly: true },
    { id: 'pipeline', label: 'Pipeline Stages', icon: RefreshCw, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, adminOnly: false },
    { id: 'theme', label: 'Display & Theme', icon: Monitor, adminOnly: false },
  ];

  const visibleSections = sections.filter(s => !s.adminOnly || isAdmin);

  const addItem = (list: any[], setList: Function, value: any) => {
    if (!value) return;
    setList([...list, value]);
  };

  const removeItem = (list: any[], setList: Function, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-20">
      {/* Settings Sidebar */}
      <div className="w-full lg:w-80 space-y-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                activeSection === section.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-4">
                <section.icon size={20} className={cn(
                  "transition-colors",
                  activeSection === section.id ? "text-white" : "group-hover:text-primary"
                )} />
                <span className="text-sm font-black uppercase tracking-widest text-[11px]">{section.label}</span>
              </div>
              <ChevronRight size={16} className={cn(
                "transition-transform",
                activeSection === section.id ? "translate-x-0 opacity-100" : "opacity-0 -translate-x-2"
              )} />
            </button>
          ))}
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90 text-white p-5 rounded-[2rem] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
        >
          {isSaving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} className="group-hover:scale-110 transition-transform" />
          )}
          {isSaving ? 'Synchronizing...' : 'Update Settings'}
        </button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {sections.find(s => s.id === activeSection)?.label}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Configure your agency's operational protocols and workspace defaults.</p>
        </div>

        <div className="flex-1 p-10 overflow-y-auto">
          {activeSection === 'destinations' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((dest, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-primary" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{dest}</span>
                    </div>
                    <button onClick={() => removeItem(destinations, setDestinations, i)} className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const val = prompt('Enter new destination country:');
                    if (val) addItem(destinations, setDestinations, val);
                  }}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/50 transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Add Country</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'currencies' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Agency Currency</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Set the global billing standard</p>
                  </div>
                </div>
                <select 
                  value={selectedCurrency.code}
                  onChange={(e) => {
                    const c = currencies.find(curr => curr.code === e.target.value);
                    if (c) setSelectedCurrency(c);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-lg dark:text-white"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.map((c, i) => (
                  <div key={c.code} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-primary shadow-sm">{c.symbol}</span>
                      <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">{c.code}</span>
                    </div>
                    <button onClick={() => removeItem(currencies, setCurrencies, i)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const code = prompt('Currency Code (e.g. EUR):');
                    const symbol = prompt('Currency Symbol (e.g. €):');
                    if (code && symbol) addItem(currencies, setCurrencies, { code, symbol });
                  }}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/50 transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Add Currency</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'visa-types' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visaTypes.map((type, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Shield size={18} />
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{type}</span>
                    </div>
                    <button onClick={() => removeItem(visaTypes, setVisaTypes, i)} className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const val = prompt('Enter new visa category:');
                    if (val) addItem(visaTypes, setVisaTypes, val);
                  }}
                  className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/50 transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Add Visa Type</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'doc-types' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentTypes.map((type, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{type}</span>
                    </div>
                    <button onClick={() => removeItem(documentTypes, setDocumentTypes, i)} className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const val = prompt('New document category:');
                    if (val) addItem(documentTypes, setDocumentTypes, val);
                  }}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/50 transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">New Type</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'gateways' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {Object.keys(paymentGateways).map((id) => {
                const gateway = paymentGateways[id];
                return (
                  <div key={id} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-primary shadow-lg">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{id.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gateway Configuration</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = { ...paymentGateways };
                          updated[id].enabled = !updated[id].enabled;
                          setPaymentGateways(updated);
                        }}
                        className={cn(
                          "w-14 h-7 rounded-full p-1 transition-all duration-500 relative",
                          gateway.enabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 absolute top-1",
                          gateway.enabled ? "left-8" : "left-1"
                        )} />
                      </button>
                    </div>

                    {gateway.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                        {Object.keys(gateway).filter(k => k !== 'enabled' && k !== 'sandbox').map((key) => (
                          <div key={key} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <input 
                              type={key.toLowerCase().includes('secret') ? 'password' : 'text'}
                              value={gateway[key]}
                              onChange={(e) => {
                                const updated = { ...paymentGateways };
                                updated[id][key] = e.target.value;
                                setPaymentGateways(updated);
                              }}
                              className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeSection === 'pipeline' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                {pipelineStages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary shadow-sm">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{stage.replace(/_/g, ' ')}</p>
                    </div>
                    <button onClick={() => removeItem(pipelineStages, setPipelineStages, i)} className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const val = prompt('New Pipeline Stage:');
                    if (val) addItem(pipelineStages, setPipelineStages, val.toUpperCase().replace(/ /g, '_'));
                  }}
                  className="w-full flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/50 transition-all group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Append New Stage</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'theme' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'light', label: 'Light Mode', icon: Monitor, color: 'bg-white', border: 'border-slate-200' },
                  { id: 'dark', label: 'Dark Mode', icon: Lock, color: 'bg-slate-900', border: 'border-slate-800' },
                  { id: 'system', label: 'System Default', icon: RefreshCw, color: 'bg-gradient-to-br from-white to-slate-900', border: 'border-slate-200' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setThemePreference(mode.id as any)}
                    className={cn(
                      "flex flex-col items-center p-6 rounded-[2.5rem] border-4 transition-all duration-500 relative overflow-hidden group",
                      themePreference === mode.id 
                        ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" 
                        : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn("w-24 h-16 rounded-xl mb-4 shadow-inner border", mode.color, mode.border)} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{mode.label}</span>
                    {themePreference === mode.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
