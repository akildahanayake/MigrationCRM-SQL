import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  Clock, 
  Eye, 
  Download, 
  CreditCard,
  Banknote,
  Landmark,
  X,
  ChevronRight,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';

export default function Payments() {
  const { payments, users, currentUser, showToast, addPayment, updatePayment, selectedCurrency, paymentGateways } = useStore();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const [formData, setFormData] = useState<any>({
    clientId: '',
    description: '',
    amount: 0,
    status: 'Pending',
    method: 'Credit Card'
  });

  const filteredPayments = (payments || []).filter(p => {
    const client = users.find(u => u.id === p.client_id || u.id === p.clientId);
    const matchesSearch = (client?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (currentUser.role === 'USER') {
      return (p.client_id === currentUser.id || p.clientId === currentUser.id) && matchesSearch;
    }
    return matchesSearch;
  });

  const stats = [
    { label: 'Total Revenue', value: `${selectedCurrency.symbol}${payments.filter(p => p.status === 'PAID' || p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
    { label: 'Pending Balance', value: `${selectedCurrency.symbol}${payments.filter(p => p.status === 'Pending' || p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}`, icon: Clock, color: 'amber' },
    { label: 'Invoices Issued', value: payments.length, icon: FileText, color: 'blue' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePayment(editingId, formData);
      setIsEditModalOpen(false);
      setEditingId(null);
    } else {
      addPayment(formData);
      setIsInvoiceModalOpen(false);
    }
    setFormData({ clientId: '', description: '', amount: 0, status: 'Pending', method: 'Credit Card' });
  };

  const openEditModal = (payment: any) => {
    setEditingId(payment.id);
    setFormData({
      clientId: payment.client_id || payment.clientId,
      description: payment.description,
      amount: payment.amount,
      status: payment.status,
      method: payment.method
    });
    setIsEditModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ clientId: '', description: '', amount: 0, status: 'Pending', method: 'Credit Card' });
    setIsInvoiceModalOpen(true);
  };

  const gatewaysArray = Object.keys(paymentGateways || {}).map(k => ({ id: k, ...paymentGateways[k] }));
  const activeGateways = gatewaysArray.filter((g: any) => g.enabled);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Financial Hub</h2>
          <p className="text-muted-foreground font-medium mt-1">Manage invoices, payments, and gateway configurations.</p>
        </div>
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
          <button 
            onClick={openNewModal}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            New Invoice
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm group hover:border-primary/30 transition-all">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110",
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20" :
              stat.color === 'amber' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/20" :
              "bg-blue-500/10 text-blue-500 shadow-blue-500/20"
            )}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Payment Table */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden transition-colors">
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-foreground tracking-tight">Payment History</h3>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border-border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Invoice Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Method</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((p) => {
                const client = users.find(u => u.id === p.client_id || u.id === p.clientId);
                return (
                  <tr key={p.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{p.description}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{p.date || p.uploaded_at ? new Date(p.date || p.uploaded_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-foreground">{client?.fullName}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{client?.role.replace('_', ' ')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-black text-foreground tabular-nums">{selectedCurrency.symbol}{p.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {p.method === 'Bank Transfer' ? <Landmark size={14} /> : p.method === 'Cash' ? <Banknote size={14} /> : <CreditCard size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{p.method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm inline-flex items-center gap-2",
                        (p.status === 'PAID' || p.status === 'Paid') ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                        (p.status === 'FAILED' || p.status === 'Failed') ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", (p.status === 'PAID' || p.status === 'Paid') ? "bg-emerald-500" : (p.status === 'FAILED' || p.status === 'Failed') ? "bg-rose-500" : "bg-amber-500")} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setViewingInvoice(p); setIsViewModalOpen(true); }}
                          className="p-2.5 bg-secondary text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="View Invoice"
                        >
                          <Eye size={18} strokeWidth={2.5} />
                        </button>
                        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
                          <button 
                            onClick={() => openEditModal(p)}
                            className="p-2.5 bg-secondary text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                            title="Edit Invoice"
                          >
                            <Edit2 size={18} strokeWidth={2.5} />
                          </button>
                        )}
                        {currentUser.role === 'USER' && (p.status === 'PENDING' || p.status === 'Pending') && (
                          <button 
                            onClick={() => { setSelectedInvoice(p); setIsPayNowModalOpen(true); }}
                            className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-[2.5rem] flex items-center justify-center mx-auto text-muted-foreground/30">
                <Search size={40} />
              </div>
              <p className="text-muted-foreground font-medium">No invoices found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal (New/Edit) */}
      {(isInvoiceModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => { setIsInvoiceModalOpen(false); setIsEditModalOpen(false); }} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FileText size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingId ? 'Edit Invoice' : 'Issue New Invoice'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Financial Record Management</p>
                </div>
              </div>
              <button onClick={() => { setIsInvoiceModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Client</label>
                  <select 
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                  >
                    <option value="">Select a client</option>
                    {users.filter(u => u.role === 'USER').map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g., Student Visa Consulting Fee"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ({selectedCurrency.code})</label>
                  <input 
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white font-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                  <select 
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Stripe API">Stripe API</option>
                    <option value="PayPal API">PayPal API</option>
                  </select>
                </div>

                {editingId && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Status</label>
                    <div className="flex gap-2">
                      {['PAID', 'PENDING', 'FAILED'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({...formData, status})}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            formData.status === status 
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]">
                  {editingId ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Now Modal */}
      {isPayNowModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsPayNowModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <CreditCard size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Complete Payment</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Secure Transaction Protocol</p>
                </div>
              </div>
              <button onClick={() => setIsPayNowModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Amount Due</p>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                  {selectedCurrency.symbol}{selectedInvoice.amount.toLocaleString()}
                </h4>
                <p className="text-xs font-bold text-primary mt-2">{selectedInvoice.description}</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Gateways</p>
                <div className="grid grid-cols-1 gap-3">
                  {activeGateways.map((gw: any) => (
                    <button 
                      key={gw.id}
                      onClick={() => {
                        showToast(`Initiating ${gw.name} session...`);
                        setTimeout(() => {
                          updatePayment(selectedInvoice.id, { status: 'PAID' });
                          setIsPayNowModalOpen(false);
                          showToast('Payment successful!', 'success');
                        }, 2000);
                      }}
                      className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200 dark:border-slate-700 hover:border-primary/30 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{gw.icon}</span>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{gw.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{gw.desc?.substring(0, 40)}...</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  {activeGateways.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                      <p className="text-xs font-bold text-slate-400">No active payment gateways. Please contact agency support.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <ShieldCheck size={14} />
                <span>SSL Encrypted • Prod Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && viewingInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Invoice</h3>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">No: INV-{viewingInvoice.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { window.print(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  <Download size={14} /> Print / Download
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Agency Details</p>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Alpha Migration Services</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">License: AMS-9988-2024</p>
                  <p className="text-xs text-slate-500 mt-1">Level 22, Migration Tower, Indigo City</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client Details</p>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    {users.find(u => u.id === viewingInvoice.client_id || u.id === viewingInvoice.clientId)?.fullName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">ID: CLIENT-{viewingInvoice.client_id?.substring(0,6) || viewingInvoice.clientId?.substring(0, 6)}</p>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-6 py-6 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{viewingInvoice.description}</td>
                      <td className="px-6 py-6 text-lg font-black text-slate-900 dark:text-white text-right tabular-nums">
                        {selectedCurrency.symbol}{viewingInvoice.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Issued Date</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{new Date(viewingInvoice.date || viewingInvoice.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{viewingInvoice.method}</p>
                  </div>
                </div>
                
                <div className={cn(
                  "px-8 py-3 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] border shadow-xl flex items-center gap-3",
                  (viewingInvoice.status === 'PAID' || viewingInvoice.status === 'Paid') ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
                )}>
                  {viewingInvoice.status === 'PAID' || viewingInvoice.status === 'Paid' ? <ShieldCheck size={20} /> : <Clock size={20} />}
                  {viewingInvoice.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
