"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Loader2,
  X,
  Lock,
  LogOut,
  User as UserIcon,
  Tag,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface Booking {
  id: string;
  customer_name: string;
  service_name: string;
  handyman_name: string;
  amount: number;
  status: string;
  date: string;
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab switching state
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Dynamic datasets from MongoDB
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Search and Filter states
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [providerSearch, setProviderSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('All');

  // Success/Error toast messages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Booking creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [handymanName, setHandymanName] = useState('Unassigned');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [bookingDate, setBookingDate] = useState('');

  // Service modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('1 Hour');
  
  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Register Provider modal states
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [provUsername, setProvUsername] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provFirstName, setProvFirstName] = useState('');
  const [provLastName, setProvLastName] = useState('');
  const [provType, setProvType] = useState('provider');
  const [provContact, setProvContact] = useState('');
  const [provAddress, setProvAddress] = useState('');
  const [provPassword, setProvPassword] = useState('password123');

  // Edit Service states
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editServiceId, setEditServiceId] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');
  const [editServiceCategory, setEditServiceCategory] = useState('');
  const [editServiceDuration, setEditServiceDuration] = useState('1 Hour');

  // Edit Category states
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Edit Provider Wallet Balance states
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [newBalanceValue, setNewBalanceValue] = useState('');

  // Payout states
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutProviderId, setPayoutProviderId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [payoutError, setPayoutError] = useState('');

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Check auth state on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  // Sync data whenever activeTab changes or login status changes
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'bookings') {
        fetchBookings();
        fetchProviders();
        fetchServicesAndCategories();
      } else if (activeTab === 'providers') {
        fetchProviders();
      } else if (activeTab === 'services') {
        fetchServicesAndCategories();
      } else if (activeTab === 'transactions') {
        fetchTransactions();
        fetchProviders();
      }
    }
  }, [activeTab, isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      showToast('Failed to load providers', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchServicesAndCategories = async () => {
    try {
      setTabLoading(true);
      const [srvResponse, catResponse] = await Promise.all([
        apiClient.get('/services'),
        apiClient.get('/categories')
      ]);
      setServices(srvResponse.data);
      setCategories(catResponse.data);
      if (catResponse.data.length > 0 && !newServiceCategory) {
        setNewServiceCategory(catResponse.data[0].name);
      }
    } catch (error) {
      console.error('Error fetching services/categories:', error);
      showToast('Failed to load catalog data', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Failed to load transactions', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await apiClient.post('/login', {
        username,
        password
      });
      
      const { access_token, user_data } = response.data;
      if (user_data.user_type !== 'admin') {
        throw new Error('Access denied. Admin role required.');
      }
      
      localStorage.setItem('token', access_token);
      setIsAuthenticated(true);
      setActiveTab('bookings');
      showToast('Sign in successful!');
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || 'Login failed. Please check credentials.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    showToast('Signed out successfully');
  };

  // ------------------ CRUD BOOKINGS ------------------
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customer_name: customerName,
        service_name: serviceName,
        handyman_name: handymanName,
        amount: parseFloat(amount) || 0.0,
        status: status,
        date: bookingDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
      
      await apiClient.post('/bookings', payload);
      setIsModalOpen(false);
      
      // Reset form
      setCustomerName('');
      setServiceName('');
      setHandymanName('Unassigned');
      setAmount('');
      setStatus('Pending');
      setBookingDate('');
      
      fetchBookings();
      showToast('Booking created successfully');
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast('Failed to create booking', 'error');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await apiClient.put(`/bookings/${bookingId}`, { status: newStatus });
      fetchBookings();
      showToast(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      showToast('Failed to update booking status', 'error');
    }
  };

  const handleUpdateBookingHandyman = async (bookingId: string, handyman: string) => {
    try {
      await apiClient.put(`/bookings/${bookingId}`, { handyman_name: handyman });
      fetchBookings();
      showToast(`Handyman assigned: ${handyman}`);
    } catch (error) {
      console.error('Error assigning handyman:', error);
      showToast('Failed to assign handyman', 'error');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await apiClient.delete(`/bookings/${bookingId}`);
      fetchBookings();
      showToast('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showToast('Failed to delete booking', 'error');
    }
  };

  // ------------------ CRUD PROVIDERS ------------------
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        username: provUsername,
        email: provEmail,
        first_name: provFirstName,
        last_name: provLastName,
        password: provPassword,
        user_type: provType,
        contact_number: provContact,
        address: provAddress,
        referral_code: '',
      };
      await apiClient.post('/register', payload);
      setIsProviderModalOpen(false);
      
      // Reset fields
      setProvUsername('');
      setProvEmail('');
      setProvFirstName('');
      setProvLastName('');
      setProvContact('');
      setProvAddress('');
      
      fetchProviders();
      showToast('Provider registered successfully');
    } catch (error: any) {
      console.error('Error creating provider:', error);
      const msg = error.response?.data?.detail || 'Failed to register provider';
      showToast(msg, 'error');
    }
  };

  const handleToggleProviderStatus = async (providerId: string, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await apiClient.put(`/providers/${providerId}`, { status: newStatus });
      fetchProviders();
      showToast(`Provider status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('Error toggling provider status:', error);
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleOpenBalanceModal = (providerId: string, currentBalance: number) => {
    setSelectedProviderId(providerId);
    setNewBalanceValue(currentBalance.toString());
    setIsBalanceModalOpen(true);
  };

  const handleUpdateProviderBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/providers/${selectedProviderId}`, { wallet_balance: parseFloat(newBalanceValue) || 0.0 });
      setIsBalanceModalOpen(false);
      setNewBalanceValue('');
      fetchProviders();
      showToast('Wallet balance updated');
    } catch (error) {
      console.error('Error updating provider balance:', error);
      showToast('Failed to update balance', 'error');
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!window.confirm("Are you sure you want to delete this provider/handyman?")) return;
    try {
      await apiClient.delete(`/providers/${providerId}`);
      fetchProviders();
      showToast('Provider deleted successfully');
    } catch (error) {
      console.error('Error deleting provider:', error);
      showToast('Failed to delete provider', 'error');
    }
  };

  // ------------------ CRUD SERVICES ------------------
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newServiceName,
        category: newServiceCategory || (categories[0]?.name || 'Plumbing'),
        price: parseFloat(newServicePrice) || 0.0,
        duration: newServiceDuration,
        status: 1
      };
      await apiClient.post('/services', payload);
      setIsServiceModalOpen(false);
      setNewServiceName('');
      setNewServicePrice('');
      fetchServicesAndCategories();
      showToast('Service item added');
    } catch (error) {
      console.error('Error creating service:', error);
      showToast('Failed to create service', 'error');
    }
  };

  const handleEditServiceClick = (service: any) => {
    setEditServiceId(service.id);
    setEditServiceName(service.name);
    setEditServicePrice(service.price.toString());
    setEditServiceCategory(service.category);
    setEditServiceDuration(service.duration);
    setIsEditServiceModalOpen(true);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/services/${editServiceId}`, {
        name: editServiceName,
        price: parseFloat(editServicePrice) || 0.0,
        category: editServiceCategory,
        duration: editServiceDuration
      });
      setIsEditServiceModalOpen(false);
      fetchServicesAndCategories();
      showToast('Service item updated');
    } catch (error) {
      console.error('Error updating service:', error);
      showToast('Failed to update service', 'error');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service item?")) return;
    try {
      await apiClient.delete(`/services/${serviceId}`);
      fetchServicesAndCategories();
      showToast('Service deleted');
    } catch (error) {
      console.error('Error deleting service:', error);
      showToast('Failed to delete service', 'error');
    }
  };

  // ------------------ CRUD CATEGORIES ------------------
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCatName,
        description: newCatDesc,
        status: 1
      };
      await apiClient.post('/categories', payload);
      setIsCategoryModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchServicesAndCategories();
      showToast('Category created');
    } catch (error) {
      console.error('Error creating category:', error);
      showToast('Failed to create category', 'error');
    }
  };

  const handleEditCategoryClick = (category: any) => {
    setEditCategoryId(category.id);
    setEditCatName(category.name);
    setEditCatDesc(category.description || '');
    setIsEditCategoryModalOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/categories/${editCategoryId}`, {
        name: editCatName,
        description: editCatDesc
      });
      setIsEditCategoryModalOpen(false);
      fetchServicesAndCategories();
      showToast('Category updated');
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await apiClient.delete(`/categories/${categoryId}`);
      fetchServicesAndCategories();
      showToast('Category deleted');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  // ------------------ PAYOUT PROCESS ------------------
  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError('');
    try {
      const res = await apiClient.post('/payouts', {
        provider_id: payoutProviderId,
        amount: parseFloat(payoutAmount) || 0.0,
        payment_method: payoutMethod
      });
      setIsPayoutModalOpen(false);
      setPayoutProviderId('');
      setPayoutAmount('');
      fetchTransactions();
      showToast(`Payout recorded: $${parseFloat(payoutAmount).toFixed(2)}`);
    } catch (error: any) {
      setPayoutError(error.response?.data?.detail || 'Payout failed. Please verify provider wallet balance.');
    }
  };

  // Auto price detection when selecting a service in "New Booking"
  const handleServiceSelect = (selectedSvcName: string) => {
    setServiceName(selectedSvcName);
    const matched = services.find(s => s.name === selectedSvcName);
    if (matched) {
      setAmount(matched.price.toString());
    }
  };

  // ------------------ DYNAMIC FILTERS ------------------
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.service_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.handyman_name.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesFilter = bookingFilter === 'All' || b.status.toLowerCase() === bookingFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredProviders = providers.filter(p => {
    const fullName = p.display_name || `${p.first_name} ${p.last_name}`;
    const matchesSearch = fullName.toLowerCase().includes(providerSearch.toLowerCase()) || 
                          p.username.toLowerCase().includes(providerSearch.toLowerCase());
    const matchesFilter = providerFilter === 'All' || 
                          (providerFilter === 'Providers Only' && p.user_type === 'provider') ||
                          (providerFilter === 'Handymen Only' && p.user_type === 'handyman');
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.customer_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.payment_method.toLowerCase().includes(txSearch.toLowerCase());
    const matchesFilter = txFilter === 'All' || t.type.toLowerCase() === txFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalRevenue = bookings.filter(b => b.status === 'Completed').reduce((sum, b) => sum + b.amount, 0);
  const activeHandymen = providers.filter(p => p.user_type === 'handyman' && p.status === 1).length;
  
  const stats = [
    { label: "Total Bookings", value: bookings.length.toString(), icon: Calendar, change: "Live from MongoDB", color: "bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400" },
    { label: "Accrued Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "Completed orders only", color: "bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400" },
    { label: "Active Handymen", value: activeHandymen.toString(), icon: Wrench, change: "Status active in system", color: "bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400" },
    { label: "Total Partners", value: providers.length.toString(), icon: Users, change: "Atlas database connection", color: "bg-sky-50 dark:bg-sky-950/35 text-sky-600 dark:text-sky-400" },
  ];

  const getStatusStyle = (statusVal: string) => {
    switch (statusVal) {
      case "Completed":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900";
      case "Ongoing":
        return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900";
      case "Pending":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900";
      case "Accepted":
        return "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900";
      default:
        return "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="flex justify-center">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/30 animate-bounce">
              <Wrench className="w-8 h-8" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
            Handyman Pro Operations
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Sign in to access your admin control panel
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="bg-zinc-900/60 backdrop-blur-xl py-8 px-4 border border-zinc-800/80 shadow-2xl rounded-3xl sm:px-10">
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">Error:</span> {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Admin Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <UserIcon className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all disabled:opacity-55"
                >
                  {loginLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Access Admin Panel"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 animate-fade-in font-sans">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl transition-all duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-x-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/10">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">Handyman Pro</span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
                activeTab === 'bookings'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('providers')}
              className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
                activeTab === 'providers'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Service Providers</span>
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
                activeTab === 'services'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Services Catalog</span>
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-all ${
                activeTab === 'transactions'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Transactions & Payouts</span>
            </button>
          </nav>
        </div>

        <div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium text-sm text-left transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
              {activeTab === 'bookings' && "Admin Operations Control"}
              {activeTab === 'providers' && "Service Providers Catalog"}
              {activeTab === 'services' && "Services & Categories Catalog"}
              {activeTab === 'transactions' && "Transactions Ledger"}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
              {activeTab === 'bookings' && "Real-time statistics & bookings tracking dashboard"}
              {activeTab === 'providers' && "Manage and monitor registered Handymen & Service Providers"}
              {activeTab === 'services' && "Manage service items and system-wide service categories"}
              {activeTab === 'transactions' && "Wallet transactions history and system payout logs"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
            </button>
            
            {activeTab === 'bookings' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </button>
            )}
            {activeTab === 'providers' && (
              <button 
                onClick={() => setIsProviderModalOpen(true)}
                className="flex items-center justify-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                <Plus className="w-4 h-4" />
                <span>Register Provider</span>
              </button>
            )}
            {activeTab === 'services' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center justify-center gap-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all border border-zinc-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
                <button 
                  onClick={() => setIsServiceModalOpen(true)}
                  className="flex items-center justify-center gap-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>
            )}
            {activeTab === 'transactions' && (
              <button 
                onClick={() => setIsPayoutModalOpen(true)}
                className="flex items-center justify-center gap-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10"
              >
                <Plus className="w-4 h-4" />
                <span>Record Payout</span>
              </button>
            )}
          </div>
        </header>

        {/* -------------------- 1. BOOKINGS / DASHBOARD TAB -------------------- */}
        {activeTab === 'bookings' && (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                      <div className={`p-2.5 rounded-xl ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mb-1">{stat.value}</h3>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-x-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      {stat.change}
                    </span>
                  </div>
                );
              })}
            </section>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search bookings by customer, handyman, or service name..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-250 dark:border-zinc-800">
                  {['All', 'Pending', 'Ongoing', 'Completed', 'Cancelled'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        bookingFilter === f 
                          ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Bookings Table */}
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 dark:border-zinc-800 px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Live Booking Pipeline</h3>
                <button 
                  onClick={fetchBookings} 
                  className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-sm text-slate-400">Loading bookings from MongoDB...</span>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    No bookings found. Click "New Booking" to seed some records.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-50/50 dark:bg-zinc-900/50">
                        <th className="px-6 py-4">Booking ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Handyman Assignment</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                      {filteredBookings.map((booking, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-zinc-50">
                            {booking.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800 dark:text-zinc-200">{booking.customer_name}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">{booking.service_name}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                            <select 
                              value={booking.handyman_name || 'Unassigned'}
                              onChange={(e) => handleUpdateBookingHandyman(booking.id, e.target.value)}
                              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500 text-slate-700 dark:text-zinc-300 font-medium"
                            >
                              <option value="Unassigned">Unassigned</option>
                              {providers.filter(p => p.user_type === 'handyman' || p.user_type === 'provider').map((p, pIdx) => {
                                const name = p.display_name || `${p.first_name} ${p.last_name}`;
                                return <option key={pIdx} value={name}>{name} ({p.user_type})</option>;
                              })}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-slate-400 dark:text-zinc-500">{booking.date}</td>
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">${booking.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(booking.status)} outline-none`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all inline-block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

        {/* -------------------- 2. SERVICE PROVIDERS TAB -------------------- */}
        {activeTab === 'providers' && (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search providers by display name, username..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-250 dark:border-zinc-800">
                  {['All', 'Providers Only', 'Handymen Only'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setProviderFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        providerFilter === f 
                          ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 dark:border-zinc-800 px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Registered Providers & Handymen</h3>
                <button 
                  onClick={fetchProviders} 
                  className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                {tabLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-sm text-slate-400">Loading providers list...</span>
                  </div>
                ) : filteredProviders.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    No providers found in MongoDB.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-50/50 dark:bg-zinc-900/50">
                        <th className="px-6 py-4">Display Name</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Contact Number</th>
                        <th className="px-6 py-4">City / Address</th>
                        <th className="px-6 py-4">Wallet Balance</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                      {filteredProviders.map((provider, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-100">
                            {provider.display_name || `${provider.first_name} ${provider.last_name}`}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-mono">@{provider.username}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                              provider.user_type === 'provider' 
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' 
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {provider.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">{provider.contact_number || "N/A"}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">{provider.address || "N/A"}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-zinc-200">
                                ${(provider.wallet_balance || 0).toFixed(2)}
                              </span>
                              <button 
                                onClick={() => handleOpenBalanceModal(provider.id, provider.wallet_balance || 0)}
                                className="text-[10px] text-indigo-500 hover:underline hover:text-indigo-600 font-semibold"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleProviderStatus(provider.id, provider.status)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                                provider.status === 1 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 hover:border-rose-100' 
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500'
                              }`}
                            >
                              {provider.status === 1 ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all inline-block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

        {/* -------------------- 3. SERVICES CATALOG TAB -------------------- */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Categories list */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-6 h-fit">
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                Service Categories
              </h3>
              
              {tabLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-slate-400 text-sm py-6 text-center">No categories found.</div>
              ) : (
                <div className="space-y-3">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 relative group">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{cat.name}</h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditCategoryClick(cat)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-zinc-850"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-zinc-850"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{cat.description || "No description provided."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Services list */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 dark:border-zinc-800 px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  Service Items Catalog
                </h3>
                <button 
                  onClick={fetchServicesAndCategories} 
                  className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                {tabLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">No services cataloged yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-50/50 dark:bg-zinc-900/50">
                        <th className="px-6 py-4">Service Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Pricing</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                      {services.map((service, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-zinc-100">{service.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-xs font-medium">
                              {service.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">${service.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {service.duration}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">Active</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleEditServiceClick(service)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-all inline-block"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteService(service.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all inline-block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* -------------------- 4. TRANSACTIONS TAB -------------------- */}
        {activeTab === 'transactions' && (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search ledger by transaction party name, payment method..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-250 dark:border-zinc-800">
                  {['All', 'Payment', 'Payout'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTxFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        txFilter === f 
                          ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 dark:border-zinc-800 px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Transaction History</h3>
                <button 
                  onClick={fetchTransactions} 
                  className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                {tabLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">No transactions recorded.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-50/50 dark:bg-zinc-900/50">
                        <th className="px-6 py-4">Party Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Payment Method</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                      {filteredTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-100">{tx.customer_name}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              tx.type === 'Payment' 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400'
                            }`}>
                              {tx.type === 'Payment' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">${tx.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">{tx.payment_method}</td>
                          <td className="px-6 py-4 text-slate-400 dark:text-zinc-500">{tx.date}</td>
                          <td className="px-6 py-4">
                            <span className="text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900 text-xs">Completed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

      </main>

      {/* -------------------- CREATE BOOKING MODAL -------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Create New Booking</h3>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Select Service</label>
                <select 
                  value={serviceName}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  required
                >
                  <option value="">-- Choose Service --</option>
                  {services.map((svc, idx) => (
                    <option key={idx} value={svc.name}>{svc.name} (${svc.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150 font-bold"
                    placeholder="99.99"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Handyman Assignment</label>
                <select 
                  value={handymanName}
                  onChange={(e) => setHandymanName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                >
                  <option value="Unassigned">Unassigned (Let provider self-claim)</option>
                  {providers.filter(p => p.user_type === 'handyman' || p.user_type === 'provider').map((p, pIdx) => {
                    const name = p.display_name || `${p.first_name} ${p.last_name}`;
                    return <option key={pIdx} value={name}>{name} ({p.user_type})</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Booking Date</label>
                <input 
                  type="text" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  placeholder="June 16, 2026 at 10:00 AM"
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Save Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- REGISTER PROVIDER MODAL -------------------- */}
      {isProviderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsProviderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Register Service Provider</h3>
            
            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={provFirstName}
                    onChange={(e) => setProvFirstName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={provLastName}
                    onChange={(e) => setProvLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Username</label>
                  <input 
                    type="text" 
                    value={provUsername}
                    onChange={(e) => setProvUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="johndoe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Role Type</label>
                  <select 
                    value={provType}
                    onChange={(e) => setProvType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  >
                    <option value="provider">Provider</option>
                    <option value="handyman">Handyman</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Contact No</label>
                  <input 
                    type="text" 
                    value={provContact}
                    onChange={(e) => setProvContact(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="+12345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Default Password</label>
                  <input 
                    type="text" 
                    value={provPassword}
                    onChange={(e) => setProvPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="password123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Address / City</label>
                <input 
                  type="text" 
                  value={provAddress}
                  onChange={(e) => setProvAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  placeholder="New York, NY"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Register Partner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- ADD SERVICE MODAL -------------------- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Add New Service Item</h3>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  placeholder="e.g. Deep Sofa Cleaning"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="80.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Duration</label>
                  <input 
                    type="text" 
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    placeholder="e.g. 2 Hours"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                <select 
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Create Service
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- EDIT SERVICE MODAL -------------------- */}
      {isEditServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsEditServiceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Edit Service Item</h3>
            
            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editServicePrice}
                    onChange={(e) => setEditServicePrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Duration</label>
                  <input 
                    type="text" 
                    value={editServiceDuration}
                    onChange={(e) => setEditServiceDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                <select 
                  value={editServiceCategory}
                  onChange={(e) => setEditServiceCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- ADD CATEGORY MODAL -------------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Add New Category</h3>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  placeholder="e.g. Painting"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                <textarea 
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors h-24 resize-none text-slate-800 dark:text-zinc-150"
                  placeholder="Describe category..."
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- EDIT CATEGORY MODAL -------------------- */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsEditCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Edit Category</h3>
            
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                <textarea 
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors h-24 resize-none text-slate-800 dark:text-zinc-150"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- EDIT WALLET BALANCE MODAL -------------------- */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-sm border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsBalanceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Modify Wallet Balance</h3>
            
            <form onSubmit={handleUpdateProviderBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Wallet Balance ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newBalanceValue}
                  onChange={(e) => setNewBalanceValue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150 font-bold"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
              >
                Update Balance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- RECORD PAYOUT MODAL -------------------- */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setIsPayoutModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-50 mb-6">Record Partner Payout</h3>

            {payoutError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{payoutError}</span>
              </div>
            )}
            
            <form onSubmit={handleCreatePayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Select Partner / Handyman</label>
                <select 
                  value={payoutProviderId}
                  onChange={(e) => setPayoutProviderId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                  required
                >
                  <option value="">-- Select Partner --</option>
                  {providers.map((p, idx) => {
                    const name = p.display_name || `${p.first_name} ${p.last_name}`;
                    return (
                      <option key={idx} value={p.id}>
                        {name} (Bal: ${ (p.wallet_balance || 0).toFixed(2) })
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Payout Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150 font-bold"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Payment Method</label>
                <select 
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash payment</option>
                  <option value="PayPal">PayPal payout</option>
                  <option value="Stripe Payout">Stripe Transfer</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
              >
                Disburse Payout
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
