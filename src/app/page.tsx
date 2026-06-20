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
  CheckCircle,
  Phone,
  Globe,
  Moon,
  Sun,
  ChevronDown,
  Heart,
  Star,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  ExternalLink,
  Shield,
  ShoppingBag,
  Award,
  Download,
  Sparkles,
  Menu
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

  const prefillRole = (role: 'admin' | 'provider' | 'handyman') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'provider') {
      setUsername('sarah@provider.com');
      setPassword('password123');
    } else if (role === 'handyman') {
      setUsername('david@handyman.com');
      setPassword('password123');
    }
  };

  // Landing page states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [landingSearchQuery, setLandingSearchQuery] = useState('');
  const [landingLocationQuery, setLandingLocationQuery] = useState('Current Location');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

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

  // Check auth state on load and fetch catalog data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(true);
    }
    setAuthLoading(false);
    fetchProviders();
    fetchServicesAndCategories();
  }, []);

  // Sync dark mode class on html tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
  };

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

  // Render Landing Page if not authenticated
  if (!isAuthenticated) {
    const defaultCategories = [
      { id: "c1", name: "AC CoolCare", description: "Experience Enhanced Comfort With Our AC CoolCare Service..." },
      { id: "c2", name: "Plumber", description: "Professional plumbing repairs, pipe fixing, and leak detection." },
      { id: "c3", name: "Smart Home", description: "Configure, automate, and upgrade your home entertainment system." },
      { id: "c4", name: "Security Guard", description: "Personal protection, event security, and asset guarding." },
      { id: "c5", name: "Sanitization", description: "Complete home and office sanitization, disinfection, and cleaning." }
    ];

    const defaultServices = [
      {
        id: "s1",
        name: "Bodyguard Services",
        price: 40.00,
        duration: "20 Min",
        category: "Security Guard",
        handyman_name: "Danny Mark",
        rating: 5,
        reviews: 0,
        image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "s2",
        name: "Home Theater Setup",
        price: 12.00,
        duration: "26 Min",
        category: "Smart Home",
        handyman_name: "Jennifer Davis",
        rating: 5,
        reviews: 0,
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "s3",
        name: "Garment Restoration",
        price: 42.00,
        duration: "25 Min",
        category: "Sanitization",
        handyman_name: "Jennifer Davis",
        rating: 5,
        reviews: 0,
        image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=600&q=80",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "s4",
        name: "Family Style Dinner Chef",
        price: 32.00,
        duration: "20 Min",
        category: "Sanitization",
        handyman_name: "Jennifer Davis",
        rating: 5,
        reviews: 0,
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      }
    ];

    const defaultShops = [
      { id: "sh1", name: "The Handyman Hub", provider: "Aamar raje Harris", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
      { id: "sh2", name: "Apex Home Services", provider: "Daniel Williams", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80" },
      { id: "sh3", name: "Elite Property Care", provider: "Katie Brown", image: "https://images.unsplash.com/photo-1558904541-efa8c1a68f6a?auto=format&fit=crop&w=600&q=80" },
      { id: "sh4", name: "Sterling Repairs", provider: "Jennifer Davis", image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80" }
    ];

    const defaultHandymen = [
      { name: "Jennifer Davis", rating: 5, reviews: 0, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", bgColor: "bg-sky-200/90 text-zinc-950 dark:bg-sky-950 dark:text-sky-100" },
      { name: "Ricahard Gross", rating: 5, reviews: 0, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80", bgColor: "bg-zinc-200/90 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-100" },
      { name: "Daniel Williams", rating: 5, reviews: 0, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80", bgColor: "bg-teal-100/90 text-zinc-950 dark:bg-teal-950 dark:text-teal-100" }
    ];

    const displayCategories = categories.length > 0 ? categories : defaultCategories;
    const displayServices = services.length > 0 ? services.map(s => {
      return {
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        category: s.category,
        handyman_name: s.handyman_name || "Jennifer Davis",
        rating: 5,
        reviews: 0,
        image: s.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      }
    }) : defaultServices;

    const filteredLandingServices = displayServices.filter(s => {
      const matchesCategory = selectedCategoryFilter === 'All' || s.category === selectedCategoryFilter;
      const matchesSearch = s.name.toLowerCase().includes(landingSearchQuery.toLowerCase()) || 
                            s.category.toLowerCase().includes(landingSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const toggleFavorite = (svcId: string) => {
      if (favorites.includes(svcId)) {
        setFavorites(favorites.filter(id => id !== svcId));
        showToast("Removed from bookmarks");
      } else {
        setFavorites([...favorites, svcId]);
        showToast("Added to bookmarks!");
      }
    };

    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-colors duration-300 font-sans">
        
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

        {/* 1st Banner: Gold info */}
        <div className="bg-[#ffdb58] text-zinc-900 text-[11px] md:text-xs font-semibold py-2.5 px-4 text-center select-none shadow-sm relative z-20">
          Welcome to our service! For more information, visit our About Us page.
        </div>

        {/* 2nd Bar: Purple info */}
        <div className="bg-[#5e4ae3] text-white text-xs py-2 px-4 md:px-12 flex justify-between items-center select-none font-medium relative z-20">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>+15265897485</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
            <Globe className="w-3.5 h-3.5" />
            <span>EN</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/70" />
          </div>
        </div>

        {/* 3rd Header: Main Navbar */}
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-4 px-4 md:px-12 sticky top-0 z-30 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setLandingSearchQuery(''); setSelectedCategoryFilter('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Handyman Pro</span>
            </div>

            {/* Menu Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-650 dark:text-zinc-300">
              <a href="#home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a>
              <a href="#categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Categories</a>
              <a href="#services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Services</a>
              <a href="#shops" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shops</a>
              <a href="#download" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">App</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-xl text-zinc-500 hover:text-indigo-600 dark:text-zinc-450 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>

              {/* Login Button */}
              <button 
                onClick={() => { setLoginError(''); setShowLoginModal(true); }}
                className="flex items-center gap-2 border border-slate-200 dark:border-zinc-700 hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-850 text-sm font-bold px-4 py-2.5 rounded-2xl transition-all text-slate-700 dark:text-white"
              >
                <UserIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Login</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="relative py-12 md:py-20 px-4 md:px-12 overflow-hidden bg-slate-100/50 dark:bg-zinc-950 transition-colors duration-300">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white leading-[1.1] tracking-tight">
                Your Instant Link To The <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400">Perfect Handyman</span> Service
              </h1>
              
              <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium">
                Experience the Ease: Trust Our Handyman Service. From Fixes to Installs, Count on Us to Have You Covered. Your Ultimate Household Helper!
              </p>

              {/* Search Inputs */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-2 md:p-3 shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 px-3 py-2 flex-1 border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800">
                  <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                  <input 
                    type="text" 
                    value={landingLocationQuery}
                    onChange={(e) => setLandingLocationQuery(e.target.value)}
                    className="bg-transparent text-sm text-slate-850 dark:text-white outline-none w-full font-bold"
                    placeholder="Enter location"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 flex-1">
                  <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                  <input 
                    type="text" 
                    value={landingSearchQuery}
                    onChange={(e) => setLandingSearchQuery(e.target.value)}
                    className="bg-transparent text-sm text-slate-850 dark:text-white outline-none w-full font-bold"
                    placeholder="Search Service..."
                  />
                </div>
                <button 
                  onClick={() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    showToast(`Searching for "${landingSearchQuery || 'All'}" in ${landingLocationQuery}`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Tags suggestions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-500 dark:text-zinc-450 font-bold">
                <span>Popular:</span>
                {['Tailor', 'Smart Home', 'Security Guard', 'Sanitization'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => {
                      setLandingSearchQuery(tag);
                      const el = document.getElementById('services');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      showToast(`Filtered by tag "${tag}"`);
                    }}
                    className="px-3.5 py-1.5 bg-slate-200/50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-slate-300/30 dark:border-zinc-700/50"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column Handymen cards */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 h-[480px] flex items-center justify-center">
              {/* Jennifer Davis card (Left) */}
              <div className="absolute left-[2%] bottom-[12%] w-[150px] md:w-[170px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.05] hover:z-20">
                <div className="relative h-[210px] bg-sky-200/90 dark:bg-sky-950/40">
                  <img src={defaultHandymen[0].image} alt="Jennifer Davis" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-3 text-center bg-zinc-950 dark:bg-zinc-900 text-white border-t border-zinc-900">
                  <h4 className="font-extrabold text-[12px] tracking-tight">{defaultHandymen[0].name}</h4>
                  <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[9px] text-zinc-400 font-semibold ml-1">(0)</span>
                  </div>
                </div>
              </div>

              {/* Ricahard Gross card (Center) */}
              <div className="absolute left-[34%] top-[8%] w-[150px] md:w-[170px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.05] hover:z-20">
                <div className="relative h-[210px] bg-zinc-300 dark:bg-zinc-800/80">
                  <img src={defaultHandymen[1].image} alt="Ricahard Gross" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-3 text-center bg-zinc-950 dark:bg-zinc-900 text-white border-t border-zinc-900">
                  <h4 className="font-extrabold text-[12px] tracking-tight">{defaultHandymen[1].name}</h4>
                  <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[9px] text-zinc-400 font-semibold ml-1">(0)</span>
                  </div>
                </div>
              </div>

              {/* Daniel Williams card (Right) */}
              <div className="absolute right-[2%] bottom-[12%] w-[150px] md:w-[170px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.05] hover:z-20">
                <div className="relative h-[210px] bg-teal-100 dark:bg-teal-950/40">
                  <img src={defaultHandymen[2].image} alt="Daniel Williams" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-3 text-center bg-zinc-950 dark:bg-zinc-900 text-white border-t border-zinc-900">
                  <h4 className="font-extrabold text-[12px] tracking-tight">{defaultHandymen[2].name}</h4>
                  <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[9px] text-zinc-400 font-semibold ml-1">(0)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Our Top Categories</h2>
                <div className="h-1.5 w-16 bg-indigo-600 rounded-full mt-2"></div>
              </div>
              <button 
                onClick={() => { setSelectedCategoryFilter('All'); showToast('Showing all categories'); }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {/* All category filter item */}
              <div 
                onClick={() => { setSelectedCategoryFilter('All'); }}
                className={`cursor-pointer p-6 rounded-3xl text-center border transition-all duration-300 ${
                  selectedCategoryFilter === 'All'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-600/5'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/30 hover:scale-[1.03] hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black">
                  ★
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">All Categories</h3>
                <p className="text-[10px] text-slate-500 mt-1">Show every service</p>
              </div>

              {displayCategories.map((cat: any) => (
                <div 
                  key={cat.id || cat.name}
                  onClick={() => { setSelectedCategoryFilter(cat.name); }}
                  className={`cursor-pointer p-6 rounded-3xl text-center border transition-all duration-300 ${
                    selectedCategoryFilter === cat.name
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-600/5'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/30 hover:scale-[1.03] hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {cat.name.includes("AC") ? "❄️" : cat.name.includes("Plumb") ? "🪠" : cat.name.includes("Security") ? "🛡️" : "⚙️"}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">{cat.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.description || "Browse all service listings"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Top Rated Services</h2>
                <div className="h-1.5 w-16 bg-indigo-600 rounded-full mt-2"></div>
              </div>
              {selectedCategoryFilter !== 'All' && (
                <div className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 py-1.5 px-3 rounded-full flex items-center gap-1.5">
                  <span>Filtered: {selectedCategoryFilter}</span>
                  <button onClick={() => setSelectedCategoryFilter('All')} className="hover:text-indigo-800 cursor-pointer">×</button>
                </div>
              )}
            </div>

            {filteredLandingServices.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl">
                <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Services Found</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">We couldn't find any services matching "{landingSearchQuery}" in category "{selectedCategoryFilter}".</p>
                <button 
                  onClick={() => { setLandingSearchQuery(''); setSelectedCategoryFilter('All'); }}
                  className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {filteredLandingServices.map((svc: any) => (
                  <div key={svc.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative h-[180px] bg-zinc-800">
                      <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                      {/* Heart bookmark */}
                      <button 
                        onClick={() => toggleFavorite(svc.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
                          favorites.includes(svc.id) 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-black/40 hover:bg-black/60 text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(svc.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
                          {svc.category}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-850 dark:text-white mt-1 leading-snug line-clamp-1">{svc.name}</h3>
                        
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-black text-base">${svc.price.toFixed(2)}</span>
                          <span className="text-[11px] text-slate-400 dark:text-zinc-550 font-bold">•</span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> {svc.duration}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={svc.avatar} alt={svc.handyman_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/10" />
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{svc.handyman_name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white ml-0.5">{svc.rating}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">({svc.reviews})</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => showToast("Booking features are available in our Mobile App! Please download the app.", "success")}
                        className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-800 dark:text-white hover:text-white dark:hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Services Section */}
        <section className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Featured Services</h2>
                <div className="h-1.5 w-16 bg-indigo-600 rounded-full mt-2"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "House Cleaning", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80" },
                { name: "Beauty & Spa", img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80" },
                { name: "Wall Repairing", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80" },
                { name: "Carpet Steaming", img: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80" }
              ].map((feat, idx) => (
                <div key={idx} className="relative group h-[240px] rounded-3xl overflow-hidden shadow-md cursor-pointer">
                  <img src={feat.img} alt={feat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5">
                    <div className="space-y-1">
                      <h4 className="text-white font-extrabold text-base leading-snug">{feat.name}</h4>
                      <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        Professional Staff <Sparkles className="w-3 h-3 text-indigo-400" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shops Section */}
        <section id="shops" className="py-16 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Shops</h2>
                <div className="h-1.5 w-16 bg-indigo-600 rounded-full mt-2"></div>
              </div>
              <button 
                onClick={() => showToast('View all shops in the mobile app')}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {defaultShops.map((shop) => (
                <div key={shop.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative h-[160px] bg-zinc-800">
                    <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-slate-850 dark:text-white leading-snug">{shop.name}</h3>
                    <div className="flex items-center gap-2">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt={shop.provider} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-bold text-slate-500 dark:text-zinc-450">{shop.provider}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional App Section */}
        <section id="download" className="py-16 px-4 md:px-12 bg-white dark:bg-zinc-900 transition-colors duration-300">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[38px] p-8 md:p-14 text-white relative overflow-hidden shadow-xl shadow-indigo-600/10">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl space-y-6 text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full inline-block">
                Download Now
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Get the Handyman Pro Mobile App for Direct Bookings!
              </h2>
              <p className="text-sm md:text-base text-indigo-100 font-medium">
                Book instantly, track your handyman's live location, securely pay via Stripe or Wallet, and view comprehensive invoice logs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-2">
                <button onClick={() => showToast("Google Play app link coming soon")} className="bg-white text-indigo-700 hover:bg-slate-50 hover:scale-[1.03] transition-all font-extrabold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <Download className="w-4.5 h-4.5" />
                  <span>Get on Android</span>
                </button>
                <button onClick={() => showToast("Apple App Store link coming soon")} className="bg-indigo-700/50 hover:bg-indigo-700 border border-indigo-400 hover:scale-[1.03] transition-all font-extrabold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer">
                  <Download className="w-4.5 h-4.5" />
                  <span>Download for iOS</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-8 border-t border-zinc-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Column 1: Info */}
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">Handyman Pro</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 font-medium">
                Launch your own mobile-based online On-Demand Home Services with Handyman Service mobile app. The customizable templates of this amazing platform offer comprehensive features.
              </p>
              
              <div className="space-y-3">
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-zinc-550">Business Inquiries</h5>
                    <a href="mailto:hello@iqonic.design" className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">hello@iqonic.design</a>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-zinc-550">Helpline Number</h5>
                    <a href="tel:+15265897485" className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">+15265897485</a>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4 text-zinc-500">
                <Facebook className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Youtube className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Column 2: Categories */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-sm font-extrabold text-white tracking-wider uppercase">Handyman Category</h4>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-zinc-500">
                <span className="hover:text-white cursor-pointer transition-colors">AC CoolCare</span>
                <span className="text-zinc-800">/</span>
                <span className="hover:text-white cursor-pointer transition-colors">Pest Control</span>
              </div>
            </div>

            {/* Column 3: Popular Services */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="text-sm font-extrabold text-white tracking-wider uppercase">Popular Services</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Split AC Setup", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=150&q=80" },
                  { name: "Window AC Installation", img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80" },
                  { name: "Oil Change and Fluid Checks", img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80" },
                  { name: "Kitchen & Bath Fitting", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=80" },
                  { name: "Water Heater Installation", img: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=150&q=80" }
                ].map((pop, idx) => (
                  <div key={idx} onClick={() => showToast(`Learn more about ${pop.name} on the mobile app`)} className="flex items-center gap-3 cursor-pointer group">
                    <img src={pop.img} alt={pop.name} className="w-12 h-12 object-cover rounded-xl shrink-0 border border-zinc-800 group-hover:border-indigo-500 transition-all" />
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors line-clamp-2 leading-snug">{pop.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-12 mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-550">
            <span>© 2025 All Rights Reserved by <a href="#" className="hover:text-white transition-colors">IQONIC Design</a></span>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Help & Support</a>
              <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
              <a href="#" className="hover:text-white transition-colors">Data Deletion Request</a>
              <a href="#" className="hover:text-white transition-colors">About Us</a>
            </div>
          </div>
        </footer>

        {/* Login Modal Overlay */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111112]/95 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#18181A] border border-zinc-800 rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-2xl relative">
              
              {/* Close Button */}
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="sm:mx-auto sm:w-full z-10 text-center">
                {/* Custom Logo (Blue/Purple House with Wrench/Hammer shape inside) */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#5E5CE6]/10 rounded-2xl flex items-center justify-center border border-[#5E5CE6]/25">
                    <svg className="w-10 h-10 text-[#5E5CE6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" fillOpacity="0.2" />
                      <path d="M14.7 12.8a1.5 1.5 0 0 0-2-2l-3.5 3.5a1.5 1.5 0 0 0 2 2z" />
                      <path d="m9.2 14.3-3 3" />
                      <path d="m11.2 12.3 3-3" />
                      <path d="M16 8h2v2h-2z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Sign In
                </h2>
                <p className="mt-1.5 text-sm text-zinc-400 font-medium">
                  Login to your account to continue
                </p>
              </div>

              <div className="mt-8 sm:mx-auto sm:w-full z-10">
                {loginError && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5" />
                    <span><span className="font-bold">Error:</span> {loginError}</span>
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="block w-full px-4 py-3 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm font-medium"
                      placeholder="Enter Email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full px-4 py-3 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm font-medium"
                      placeholder="Enter Password"
                    />
                    <div className="flex justify-end mt-2">
                      <a href="#" className="text-xs font-semibold text-[#5E5CE6] hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                  </div>

                  {/* Prefill Credentials Role Selection */}
                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => prefillRole('admin')}
                      className="flex-1 py-2 px-1 text-xs font-semibold text-zinc-400 bg-[#121214] border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-lg transition-all cursor-pointer text-center"
                    >
                      Demo Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillRole('provider')}
                      className="flex-1 py-2 px-1 text-xs font-semibold text-zinc-400 bg-[#121214] border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-lg transition-all cursor-pointer text-center"
                    >
                      Provider
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillRole('handyman')}
                      className="flex-1 py-2 px-1 text-xs font-semibold text-zinc-400 bg-[#121214] border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-lg transition-all cursor-pointer text-center"
                    >
                      Handyman
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#5E5CE6] hover:bg-[#4E4CD6] transition-all disabled:opacity-55 cursor-pointer shadow-lg shadow-[#5E5CE6]/20"
                    >
                      {loginLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Login"
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
                  Don't Have An Account?{' '}
                  <a href="#" className="text-[#5E5CE6] hover:underline font-bold ml-1">
                    Sign Up
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
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

        <div className="space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-slate-650 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 font-medium text-sm text-left transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium text-sm text-left transition-all cursor-pointer"
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
            {/* Header Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-zinc-850 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
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
