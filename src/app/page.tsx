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
  LayoutDashboard,
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
  Menu,
  Layers,
  Zap,
  Wind,
  Image as ImageIcon,
  Settings,
  UserCheck,
  BarChart3,
  Activity,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  ToggleLeft,
  ToggleRight,
  Percent,
  Mail
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface SafeAvatarProps {
  src?: string;
  name: string;
  className?: string;
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({ src, name, className = "w-8 h-8 rounded-full" }) => {
  const [error, setError] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  // Deterministic bg color based on name
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-sky-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];
  const charSum = name ? name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
  const colorClass = colors[charSum % colors.length];

  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br ${colorClass} text-white font-bold text-xs select-none shadow-inner flex-shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${className} object-cover flex-shrink-0`}
      onError={() => setError(true)}
    />
  );
};

interface SafeServiceImageProps {
  src?: string;
  name: string;
  className?: string;
}

const SafeServiceImage: React.FC<SafeServiceImageProps> = ({ src, name, className = "w-10 h-10 rounded-xl" }) => {
  const [error, setError] = useState(false);

  const isAC = name.toLowerCase().includes('ac') || name.toLowerCase().includes('coolant');
  const isCleaning = name.toLowerCase().includes('clean');
  const isElectrical = name.toLowerCase().includes('wire') || name.toLowerCase().includes('electrical') || name.toLowerCase().includes('light');
  
  let Icon = Wrench;
  let bgGradient = 'from-blue-500/20 to-indigo-500/20 text-[#5E5CE6] border-[#5E5CE6]/30';

  if (isAC) {
    Icon = Wind;
    bgGradient = 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30';
  } else if (isCleaning) {
    Icon = Sparkles;
    bgGradient = 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
  } else if (isElectrical) {
    Icon = Zap;
    bgGradient = 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
  }

  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br ${bgGradient} border font-bold text-xs select-none flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${className} object-cover flex-shrink-0`}
      onError={() => setError(true)}
    />
  );
};

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up modal states
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const prefillRole = (role: 'admin' | 'demo_admin') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'demo_admin') {
      setUsername('demo@admin.com');
      setPassword('admin123');
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  
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
  const [bookingSortField, setBookingSortField] = useState<string>('date');
  const [bookingSortOrder, setBookingSortOrder] = useState<'asc' | 'desc'>('desc');
  const [mockStatusOverrides, setMockStatusOverrides] = useState<Record<string, string>>({});
  const [mockHandymanOverrides, setMockHandymanOverrides] = useState<Record<string, string>>({});
  const [mockDeletedIds, setMockDeletedIds] = useState<Set<string>>(new Set());
  const [providerSearch, setProviderSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('All');

  // Success/Error toast messages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Booking creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  
  // Export modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFileType, setExportFileType] = useState<'XLSX' | 'XLS' | 'ODS' | 'CSV' | 'PDF' | 'HTML'>('XLSX');
  const [exportColumns, setExportColumns] = useState({
    id: true,
    service_name: true,
    date: true,
    customer_name: true,
    provider_name: true,
    status: true,
    amount: true,
    payment_status: true
  });
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

  // Admin stats from /api/admin/stats
  const [adminStats, setAdminStats] = useState<any>(null);

  // Customers tab state
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Sliders tab state
  const [sliders, setSliders] = useState<any[]>([]);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [isEditSliderModalOpen, setIsEditSliderModalOpen] = useState(false);
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [newSliderDesc, setNewSliderDesc] = useState('');
  const [newSliderImage, setNewSliderImage] = useState('');
  const [editSliderId, setEditSliderId] = useState('');
  const [editSliderTitle, setEditSliderTitle] = useState('');
  const [editSliderDesc, setEditSliderDesc] = useState('');
  const [editSliderImage, setEditSliderImage] = useState('');

  // Settings tab state
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    app_name: '',
    commission_rate: '',
    currency_symbol: '',
    support_email: '',
    support_phone: '',
    min_payout_amount: ''
  });

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
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
      fetchAdminStats();
      fetchBookings();
      fetchCustomers();
      fetchSettings();
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
      if (activeTab === 'dashboard') {
        fetchAdminStats();
        fetchBookings();
        fetchProviders();
        fetchServicesAndCategories();
        fetchCustomers();
      } else if (activeTab === 'bookings') {
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
      } else if (activeTab === 'customers') {
        fetchCustomers();
      } else if (activeTab === 'sliders') {
        fetchSliders();
      } else if (activeTab === 'settings') {
        fetchSettings();
      }
    }
  }, [activeTab, isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bookings');
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      const msg = error?.message?.includes('waking up')
        ? 'Backend is waking up — please click Refresh in a moment.'
        : 'Failed to load bookings';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/providers');
      setProviders(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      showToast(error?.message?.includes('waking up') ? 'Backend waking up — please retry.' : 'Failed to load providers', 'error');
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
      const srvData = Array.isArray(srvResponse.data) ? srvResponse.data : [];
      const catData = Array.isArray(catResponse.data) ? catResponse.data : [];
      setServices(srvData);
      setCategories(catData);
      if (catData.length > 0 && !newServiceCategory) {
        setNewServiceCategory(catData[0].name);
      }
    } catch (error: any) {
      console.error('Error fetching services/categories:', error);
      showToast(error?.message?.includes('waking up') ? 'Backend waking up — please retry.' : 'Failed to load catalog data', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/transactions');
      setTransactions(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      showToast(error?.message?.includes('waking up') ? 'Backend waking up — please retry.' : 'Failed to load transactions', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      setAdminStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/customers');
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      showToast(error?.message?.includes('waking up') ? 'Backend waking up — please retry.' : 'Failed to load customers', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchSliders = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/sliders');
      setSliders(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching sliders:', error);
      showToast(error?.message?.includes('waking up') ? 'Backend waking up — please retry.' : 'Failed to load sliders', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/settings');
      setSystemSettings(response.data);
      setSettingsForm({
        app_name: response.data.app_name || '',
        commission_rate: String(response.data.commission_rate || ''),
        currency_symbol: response.data.currency_symbol || '',
        support_email: response.data.support_email || '',
        support_phone: response.data.support_phone || '',
        min_payout_amount: String(response.data.min_payout_amount || '')
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      let access_token = 'local-mock-token';
      let user_data = null;

      // Local mock login credentials for testing/evaluation purposes
      if (username === 'admin' && password === 'admin123') {
        user_data = {
          id: 'admin-id',
          username: 'admin',
          display_name: 'System Admin',
          email: 'admin@handyman.com',
          user_type: 'admin'
        };
      } else if ((username === 'demo@admin.com' || username === 'demo_admin') && password === 'admin123') {
        user_data = {
          id: 'demo-admin-id',
          username: 'demo_admin',
          display_name: 'Demo Admin',
          email: 'demo@admin.com',
          user_type: 'demo_admin'
        };
      }

      if (!user_data) {
        // If not matched by mock, attempt to hit the backend API
        try {
          const response = await apiClient.post('/login', {
            username,
            password
          });
          access_token = response.data.access_token;
          user_data = response.data.user_data;
        } catch (apiErr: any) {
          throw new Error(apiErr.response?.data?.detail || apiErr.message || 'Invalid username or password');
        }
      }

      if (user_data.user_type !== 'admin' && user_data.user_type !== 'demo_admin') {
        throw new Error('Access denied. Admin role required.');
      }
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user_data));
      setCurrentUser(user_data);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      showToast('Sign in successful!');
      fetchAdminStats();
      fetchBookings();
      fetchProviders();
      fetchServicesAndCategories();
    } catch (error: any) {
      const msg = error.message || 'Login failed. Please check credentials.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    setSignupLoading(true);
    try {
      await apiClient.post('/register', {
        username: signupUsername,
        email: signupEmail,
        first_name: signupFirstName,
        last_name: signupLastName,
        password: signupPassword,
        contact_number: signupPhone || undefined,
        user_type: 'user',
      });
      setSignupSuccess(true);
      showToast('Account created! You can now sign in.');
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || 'Registration failed. Please try again.';
      setSignupError(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  const openSignUp = () => {
    setShowLoginModal(false);
    setSignupFirstName('');
    setSignupLastName('');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPhone('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupError('');
    setSignupSuccess(false);
    setShowSignUpModal(true);
  };

  const openSignIn = () => {
    setShowSignUpModal(false);
    setLoginError('');
    setShowLoginModal(true);
  };

  const openForgotPassword = () => {
    setShowLoginModal(false);
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess(false);
    setShowForgotModal(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await apiClient.post('/forgot-password', { email: forgotEmail });
      setForgotSuccess(true);
    } catch (error: any) {
      setForgotError(error.response?.data?.detail || error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
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

  // ------------------ BOOKINGS EXTENSIONS & MOCK MERGING ------------------
  const handleSort = (field: string) => {
    if (bookingSortField === field) {
      setBookingSortOrder(bookingSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setBookingSortField(field);
      setBookingSortOrder('desc');
    }
  };

  const getMergedBookings = () => {
    return bookings.map((b, idx) => {
      let providerAvatar = "https://randomuser.me/api/portraits/men/64.jpg";
      if (b.handyman_name && b.handyman_name.toLowerCase().includes("beverly")) {
        providerAvatar = "https://randomuser.me/api/portraits/women/68.jpg";
      } else if (b.handyman_name && b.handyman_name.toLowerCase().includes("katie")) {
        providerAvatar = "https://randomuser.me/api/portraits/women/12.jpg";
      }

      let serviceImg = "https://images.unsplash.com/photo-1558904541-efa8c1a68f6a?auto=format&fit=crop&w=150&q=80";
      if (b.service_name && b.service_name.toLowerCase().includes("coolant")) {
        serviceImg = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80";
      } else if (b.service_name && b.service_name.toLowerCase().includes("filter")) {
        serviceImg = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=150&q=80";
      }

      const shortId = b.id ? `#${b.id.slice(-4).toUpperCase()}` : `#DB${idx}`;

      return {
        id: shortId,
        service_name: b.service_name || "Custom Service",
        service_image: serviceImg,
        date: b.date || "June 20, 2026 9:56 AM",
        customer_name: b.customer_name || "Customer",
        customer_email: `${(b.customer_name || "customer").toLowerCase().replace(/\s/g, "")}@user.com`,
        customer_avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        shop: "-",
        provider_name: b.handyman_name || "Unassigned",
        provider_email: b.handyman_name && b.handyman_name !== "Unassigned" ? `${b.handyman_name.toLowerCase().replace(/\s/g, "")}@gmail.com` : "-",
        provider_avatar: providerAvatar,
        status: b.status || "Pending",
        amount: b.amount || 0.0,
        payment_status: b.status === "Completed" ? "Paid" : b.status === "Ongoing" ? "Pending By Provider" : "Pending",
        dbId: b.id
      };
    });
  };

  const getFilteredAndSortedBookings = () => {
    const merged = getMergedBookings();
    
    const filtered = merged.filter(b => {
      const matchesSearch = b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.customer_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.service_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.provider_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.status.toLowerCase().includes(bookingSearch.toLowerCase());
      
      const matchesFilter = bookingFilter === 'All' || b.status.toLowerCase() === bookingFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let valA = a[bookingSortField as keyof typeof a] || '';
      let valB = b[bookingSortField as keyof typeof b] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return bookingSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return bookingSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleDeleteBookingWrapper = async (booking: any) => {
    if (booking.dbId) {
      await handleDeleteBooking(booking.dbId);
    } else {
      if (window.confirm(`Are you sure you want to delete mock booking ${booking.id}?`)) {
        setMockDeletedIds(prev => new Set([...Array.from(prev), booking.id]));
        showToast('Mock booking deleted successfully');
      }
    }
  };

  const handleUpdateBookingStatusWrapper = async (booking: any, newStatus: string) => {
    if (booking.dbId) {
      await handleUpdateBookingStatus(booking.dbId, newStatus);
    } else {
      setMockStatusOverrides(prev => ({ ...prev, [booking.id]: newStatus }));
      showToast(`Booking status updated to ${newStatus}`);
    }
  };

  const handleUpdateBookingHandymanWrapper = async (booking: any, handyman: string) => {
    if (booking.dbId) {
      await handleUpdateBookingHandyman(booking.dbId, handyman);
    } else {
      setMockHandymanOverrides(prev => ({ ...prev, [booking.id]: handyman }));
      showToast(`Handyman assigned: ${handyman}`);
    }
  };

  const handleExportData = () => {
    const list = getFilteredAndSortedBookings();
    if (list.length === 0) {
      showToast('No bookings to export', 'error');
      return;
    }

    const colConfigs = [
      { key: 'id', label: 'ID', getValue: (b: any) => b.id },
      { key: 'service_name', label: 'Service', getValue: (b: any) => b.service_name },
      { key: 'date', label: 'Booking Date', getValue: (b: any) => b.date },
      { key: 'customer_name', label: 'User', getValue: (b: any) => `${b.customer_name} (${b.customer_email || ''})` },
      { key: 'provider_name', label: 'Provider', getValue: (b: any) => b.provider_name === 'Unassigned' ? 'Unassigned' : `${b.provider_name} (${b.provider_email || ''})` },
      { key: 'status', label: 'Status', getValue: (b: any) => b.status },
      { key: 'amount', label: 'Total Amount', getValue: (b: any) => b.amount || 0 },
      { key: 'payment_status', label: 'Payment Status', getValue: (b: any) => b.payment_status }
    ];

    const activeCols = colConfigs.filter(cfg => (exportColumns as any)[cfg.key]);
    if (activeCols.length === 0) {
      showToast('Please select at least one column to export', 'error');
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];

    if (exportFileType === 'CSV') {
      const headers = activeCols.map(c => c.label).join(',');
      const csvRows = [headers];
      
      for (const b of list) {
        const values = activeCols.map(c => {
          const val = c.getValue(b);
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `bookings_export_${dateStr}.csv`);
      a.click();
      showToast('Bookings exported to CSV successfully');
    } else if (exportFileType === 'HTML') {
      const htmlContent = `
        <html>
          <head>
            <title>Bookings Export</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #111112; color: #f4f4f5; padding: 40px; }
              h1 { color: #5E5CE6; margin-bottom: 5px; font-weight: 800; font-size: 28px; }
              .meta { color: #a1a1aa; font-size: 14px; margin-bottom: 30px; font-weight: 500; }
              table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-top: 20px; border-radius: 12px; overflow: hidden; border: 1px solid #27272a; }
              th { background-color: #1c1c1e; color: #a1a1aa; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; padding: 16px 20px; text-align: left; border-bottom: 2px solid #27272a; }
              td { padding: 16px 20px; border-bottom: 1px solid #27272a; font-size: 14px; color: #e4e4e7; }
              tr:nth-child(even) { background-color: #18181a; }
              .status-completed { color: #34c759; font-weight: 700; }
              .status-pending { color: #ff9f0a; font-weight: 700; }
              .status-cancelled { color: #ff453a; font-weight: 700; }
              .status-ongoing { color: #bf5af2; font-weight: 700; }
              .status-accepted { color: #0a84ff; font-weight: 700; }
            </style>
          </head>
          <body>
            <h1>Bookings Report</h1>
            <div class="meta">Generated on ${new Date().toLocaleString()} | Total Bookings: ${list.length}</div>
            <table>
              <thead>
                <tr>
                  ${activeCols.map(c => `<th>${c.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${list.map(b => `
                  <tr>
                    ${activeCols.map(c => {
                      const val = c.getValue(b);
                      let displayVal = val;
                      if (c.key === 'amount') displayVal = `$${(val as number).toFixed(2)}`;
                      let tdClass = '';
                      if (c.key === 'status') {
                        tdClass = `class="status-${String(val).toLowerCase()}"`;
                      }
                      return `<td ${tdClass}>${displayVal}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `bookings_export_${dateStr}.html`);
      a.click();
      showToast('Bookings exported to HTML successfully');
    } else if (exportFileType === 'PDF') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Bookings Export</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #111112; padding: 30px; }
                h1 { color: #5E5CE6; margin-bottom: 5px; font-weight: 800; font-size: 24px; }
                .meta { color: #71717a; font-size: 12px; margin-bottom: 20px; font-weight: 500; }
                table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-top: 20px; }
                th { background-color: #f4f4f5; color: #71717a; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; padding: 12px 14px; text-align: left; border-bottom: 2px solid #e4e4e7; }
                td { padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; color: #18181b; }
                tr:nth-child(even) { background-color: #fafafa; }
                .status-completed { color: #16a34a; font-weight: 750; }
                .status-pending { color: #d97706; font-weight: 750; }
                .status-cancelled { color: #dc2626; font-weight: 750; }
                .status-ongoing { color: #9333ea; font-weight: 750; }
                .status-accepted { color: #2563eb; font-weight: 750; }
              </style>
            </head>
            <body>
              <h1>Bookings Report</h1>
              <div class="meta">Generated on ${new Date().toLocaleString()} | Total Bookings: ${list.length}</div>
              <table>
                <thead>
                  <tr>
                    ${activeCols.map(c => `<th>${c.label}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${list.map(b => `
                    <tr>
                      ${activeCols.map(c => {
                        const val = c.getValue(b);
                        let displayVal = val;
                        if (c.key === 'amount') displayVal = `$${(val as number).toFixed(2)}`;
                        let tdClass = '';
                        if (c.key === 'status') {
                          tdClass = `class="status-${String(val).toLowerCase()}"`;
                        }
                        return `<td ${tdClass}>${displayVal}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        showToast('Print dialog opened for PDF export');
      }
    } else {
      // XLSX, XLS, ODS
      const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Handyman Pro</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#5E5CE6" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Bookings">
  <Table>`;
      
      let xmlBody = '<Row>';
      activeCols.forEach(c => {
        xmlBody += `<Cell ss:StyleID="Header"><Data ss:Type="String">${c.label}</Data></Cell>`;
      });
      xmlBody += '</Row>';

      list.forEach(b => {
        xmlBody += '<Row>';
        activeCols.forEach(c => {
          const val = c.getValue(b);
          const isNum = c.key === 'amount';
          if (isNum) {
            xmlBody += `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
          } else {
            const cleanVal = typeof val === 'string' ? val.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;') : String(val);
            xmlBody += `<Cell><Data ss:Type="String">${cleanVal}</Data></Cell>`;
          }
        });
        xmlBody += '</Row>';
      });

      const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

      const fullXml = xmlHeader + xmlBody + xmlFooter;
      const blob = new Blob([fullXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      
      const ext = exportFileType.toLowerCase(); // xlsx, xls, ods
      a.setAttribute('download', `bookings_export_${dateStr}.${ext}`);
      a.click();
      showToast(`Bookings exported to ${exportFileType} successfully`);
    }

    setIsExportModalOpen(false);
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

  // ------------------ CRUD CUSTOMERS ------------------
  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await apiClient.delete(`/admin/customers/${customerId}`);
      fetchCustomers();
      showToast('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Failed to delete customer', 'error');
    }
  };

  const handleToggleCustomerStatus = async (customerId: string, currentStatus: number) => {
    try {
      await apiClient.put(`/admin/customers/${customerId}`, { status: currentStatus === 1 ? 0 : 1 });
      fetchCustomers();
      showToast('Customer status updated');
    } catch (error) {
      console.error('Error updating customer status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  // ------------------ CRUD SLIDERS ------------------
  const handleCreateSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/sliders', {
        title: newSliderTitle,
        description: newSliderDesc,
        slider_image: newSliderImage,
        status: 1
      });
      setIsSliderModalOpen(false);
      setNewSliderTitle('');
      setNewSliderDesc('');
      setNewSliderImage('');
      fetchSliders();
      showToast('Slider created successfully');
    } catch (error) {
      console.error('Error creating slider:', error);
      showToast('Failed to create slider', 'error');
    }
  };

  const handleEditSliderClick = (slider: any) => {
    setEditSliderId(slider.id);
    setEditSliderTitle(slider.title);
    setEditSliderDesc(slider.description || '');
    setEditSliderImage(slider.slider_image || '');
    setIsEditSliderModalOpen(true);
  };

  const handleUpdateSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/sliders/${editSliderId}`, {
        title: editSliderTitle,
        description: editSliderDesc,
        slider_image: editSliderImage
      });
      setIsEditSliderModalOpen(false);
      fetchSliders();
      showToast('Slider updated successfully');
    } catch (error) {
      console.error('Error updating slider:', error);
      showToast('Failed to update slider', 'error');
    }
  };

  const handleToggleSliderStatus = async (sliderId: string, currentStatus: number) => {
    try {
      await apiClient.put(`/admin/sliders/${sliderId}`, { status: currentStatus === 1 ? 0 : 1 });
      fetchSliders();
      showToast('Slider status updated');
    } catch (error) {
      console.error('Error updating slider:', error);
      showToast('Failed to update slider status', 'error');
    }
  };

  const handleDeleteSlider = async (sliderId: string) => {
    if (!window.confirm("Are you sure you want to delete this slider?")) return;
    try {
      await apiClient.delete(`/admin/sliders/${sliderId}`);
      fetchSliders();
      showToast('Slider deleted successfully');
    } catch (error) {
      console.error('Error deleting slider:', error);
      showToast('Failed to delete slider', 'error');
    }
  };

  // ------------------ SETTINGS ------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await apiClient.put('/admin/settings', {
        app_name: settingsForm.app_name || undefined,
        commission_rate: settingsForm.commission_rate ? parseFloat(settingsForm.commission_rate) : undefined,
        currency_symbol: settingsForm.currency_symbol || undefined,
        support_email: settingsForm.support_email || undefined,
        support_phone: settingsForm.support_phone || undefined,
        min_payout_amount: settingsForm.min_payout_amount ? parseFloat(settingsForm.min_payout_amount) : undefined
      });
      fetchSettings();
      showToast('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSettingsLoading(false);
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
    const matchesSearch = (b.customer_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          (b.service_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          (b.handyman_name || '').toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesFilter = bookingFilter === 'All' || (b.status || '').toLowerCase() === bookingFilter.toLowerCase();
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
    const matchesSearch = (t.customer_name || '').toLowerCase().includes(txSearch.toLowerCase()) ||
                          (t.payment_method || '').toLowerCase().includes(txSearch.toLowerCase());
    const matchesFilter = txFilter === 'All' || (t.type || '').toLowerCase() === txFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredCustomers = customers.filter(c => {
    const fullName = c.display_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
    return fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
           (c.username || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
           (c.email || '').toLowerCase().includes(customerSearch.toLowerCase());
  });

  // Calculate statistics - prefer adminStats from API, fallback to local calculations
  const totalRevenue = adminStats?.summary?.total_revenue ?? bookings.filter(b => b.status === 'Completed').reduce((sum, b) => sum + b.amount, 0);
  const activeHandymen = adminStats?.summary?.active_handymen ?? providers.filter(p => p.user_type === 'handyman' && p.status === 1).length;
  const totalBookingsCount = adminStats?.summary?.total_bookings ?? bookings.length;
  const totalPartnersCount = adminStats?.summary?.total_partners ?? providers.length;
  const totalCustomersCount = adminStats?.summary?.total_customers ?? 0;
  const totalServicesCount = adminStats?.summary?.total_services ?? services.length;

  const stats = [
    { label: "Total Bookings", value: totalBookingsCount.toString(), icon: Calendar, change: "Live from MongoDB", color: "bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400" },
    { label: "Accrued Revenue", value: `$${Number(totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, icon: DollarSign, change: "Completed orders only", color: "bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400" },
    { label: "Active Handymen", value: activeHandymen.toString(), icon: Wrench, change: "Status active in system", color: "bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400" },
    { label: "Total Partners", value: totalPartnersCount.toString(), icon: Users, change: "Atlas database connection", color: "bg-sky-50 dark:bg-sky-950/35 text-sky-600 dark:text-sky-400" },
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
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border shadow-2xl animate-toast-slide ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/95 border-rose-800 text-rose-300'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
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
                      <button type="button" onClick={openForgotPassword} className="text-xs font-semibold text-[#5E5CE6] hover:underline cursor-pointer bg-transparent border-0 p-0">
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  {/* Quick Login Presets (admin-only panel) */}
                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => prefillRole('admin')}
                      className="flex-1 py-2 px-1 text-xs font-semibold text-zinc-400 bg-[#121214] border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-lg transition-all cursor-pointer text-center"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => prefillRole('demo_admin')}
                      className="flex-1 py-2 px-1 text-xs font-semibold text-zinc-400 bg-[#121214] border border-zinc-850 hover:border-zinc-700 hover:text-white rounded-lg transition-all cursor-pointer text-center"
                    >
                      Demo Admin
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
                  <button type="button" onClick={openSignUp} className="text-[#5E5CE6] hover:underline font-bold ml-1 cursor-pointer">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Sign Up Modal ─────────────────────────────────────────────── */}
        {showSignUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111112]/95 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-[#18181A] border border-zinc-800 rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-2xl relative my-8">

              {/* Close */}
              <button
                onClick={() => setShowSignUpModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-8">
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
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
                <p className="mt-1.5 text-sm text-zinc-400 font-medium">Join Handyman Pro today</p>
              </div>

              {signupSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800/50">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Account Created!</h3>
                  <p className="text-sm text-zinc-400 mb-6">Your account has been created successfully. You can now sign in.</p>
                  <button
                    onClick={openSignIn}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#5E5CE6] hover:bg-[#4E4CD6] transition-all cursor-pointer"
                  >
                    Sign In Now
                  </button>
                </div>
              ) : (
                <>
                  {signupError && (
                    <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span><span className="font-bold">Error:</span> {signupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          required
                          placeholder="John"
                          className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                          required
                          placeholder="Doe"
                          className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        required
                        placeholder="johndoe"
                        className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                        className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                        Phone <span className="text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+880 1700 000000"
                        className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        placeholder="Min. 6 characters"
                        className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter password"
                        className="block w-full px-3 py-2.5 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                      />
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#5E5CE6] hover:bg-[#4E4CD6] transition-all disabled:opacity-55 cursor-pointer shadow-lg shadow-[#5E5CE6]/20"
                      >
                        {signupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
                    Already have an account?{' '}
                    <button type="button" onClick={openSignIn} className="text-[#5E5CE6] hover:underline font-bold ml-1 cursor-pointer">
                      Sign In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Forgot Password Modal ───────────────────────────────────────── */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111112]/95 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#18181A] border border-zinc-800 rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#5E5CE6]/10 rounded-2xl flex items-center justify-center border border-[#5E5CE6]/25">
                    <Lock className="w-8 h-8 text-[#5E5CE6]" />
                  </div>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h2>
                <p className="mt-1.5 text-sm text-zinc-400 font-medium">Enter your email to receive a reset link</p>
              </div>

              {forgotSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800/50">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Email Sent!</h3>
                  <p className="text-sm text-zinc-400 mb-6">If an account exists for that email, you will receive a password reset link shortly.</p>
                  <button
                    onClick={() => { setShowForgotModal(false); setShowLoginModal(true); }}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#5E5CE6] hover:bg-[#4E4CD6] transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  {forgotError && (
                    <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span><span className="font-bold">Error:</span> {forgotError}</span>
                    </div>
                  )}
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="block w-full px-4 py-3 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#5E5CE6] hover:bg-[#4E4CD6] transition-all disabled:opacity-55 cursor-pointer shadow-lg shadow-[#5E5CE6]/20"
                      >
                        {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                  <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
                    Remember your password?{' '}
                    <button type="button" onClick={() => { setShowForgotModal(false); setShowLoginModal(true); }} className="text-[#5E5CE6] hover:underline font-bold ml-1 cursor-pointer">
                      Sign In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-theme flex min-h-screen bg-[#111112] text-zinc-100 animate-fade-in font-sans">

      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border shadow-2xl animate-toast-slide ${
          toast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/95 border-rose-800 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="admin-sidebar w-66 border-r border-[#1C1C1E] bg-[#111112] p-5 hidden md:flex flex-col justify-between text-zinc-300">
        <div>
          {/* Logo & Workspace Title */}
          <div className="flex items-center gap-x-3 mb-6">
            <div className="w-10 h-10 bg-[#5E5CE6]/10 rounded-xl flex items-center justify-center border border-[#5E5CE6]/25">
              <svg className="w-6 h-6 text-[#5E5CE6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" fillOpacity="0.2" />
                <path d="M14.7 12.8a1.5 1.5 0 0 0-2-2l-3.5 3.5a1.5 1.5 0 0 0 2 2z" />
                <path d="m9.2 14.3-3 3" />
                <path d="m11.2 12.3 3-3" />
                <path d="M16 8h2v2h-2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              {currentUser?.user_type === 'demo_admin' ? 'Demo admin' : 'System Admin'}
            </span>
          </div>

          {/* Profile Card */}
          <div className="panel-dark-2 flex items-center gap-x-3 p-3 bg-[#1C1C1E] border border-zinc-800 rounded-2xl mb-8">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-[#5E5CE6]/30"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">
                {currentUser?.display_name || 'Demo Admin'}
              </p>
              <p className="text-xs text-zinc-500 font-medium truncate">
                {currentUser?.email || 'demo@admin.com'}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Main</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                    activeTab === 'bookings'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <Calendar className="w-5 h-5 flex-shrink-0" />
                  <span>Bookings</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Service</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab('services')}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm text-zinc-400 hover:bg-[#1C1C1E] hover:text-white transition-all"
                >
                  <div className="flex items-center gap-x-3">
                    <Tag className="w-5 h-5 flex-shrink-0" />
                    <span>Category</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('services')}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm text-zinc-400 hover:bg-[#1C1C1E] hover:text-white transition-all"
                >
                  <div className="flex items-center gap-x-3">
                    <Layers className="w-5 h-5 flex-shrink-0" />
                    <span>Sub Category</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'services'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <Wrench className="w-5 h-5 flex-shrink-0" />
                    <span>Services</span>
                  </div>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveTab('services')}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm text-zinc-400 hover:bg-[#1C1C1E] hover:text-white transition-all"
                >
                  <div className="flex items-center gap-x-3">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>Zones</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">User</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'providers'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <span>Providers</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'customers'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <UserCheck className="w-5 h-5 flex-shrink-0" />
                    <span>Customers</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Content</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('sliders')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'sliders'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <ImageIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Banners / Sliders</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">System</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'transactions'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 flex-shrink-0" />
                  <span>Transactions</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>System Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-[#1C1C1E] hover:text-white font-semibold text-sm text-left transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-[#5E5CE6]" />}
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-950/20 font-semibold text-sm text-left transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <header className="admin-main-header flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 mb-6 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 animate-fade-in-down">
              <span>
                {activeTab === 'dashboard' && "Dashboard"}
                {activeTab === 'bookings' && "Bookings"}
                {activeTab === 'providers' && "Service Providers Catalog"}
                {activeTab === 'services' && "Services & Categories Catalog"}
                {activeTab === 'transactions' && "Transactions Ledger"}
                {activeTab === 'customers' && "Customer Management"}
                {activeTab === 'sliders' && "Banners & Sliders"}
                {activeTab === 'settings' && "System Settings"}
              </span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-semibold animate-fade-in">
              {activeTab === 'dashboard' && `Welcome back, ${currentUser?.display_name || 'Demo Admin'}!`}
              {activeTab === 'bookings' && "Manage system bookings"}
              {activeTab === 'providers' && "Manage and monitor registered Handymen & Service Providers"}
              {activeTab === 'services' && "Manage service items and system-wide service categories"}
              {activeTab === 'transactions' && "Wallet transactions history and system payout logs"}
              {activeTab === 'customers' && "View and manage registered app customers"}
              {activeTab === 'sliders' && "Manage homepage banners and promotional sliders"}
              {activeTab === 'settings' && "Configure system-wide app settings and commission rates"}
            </p>
          </div>
          
          {/* Header Action Bar */}
          <div className="flex items-center gap-4">
            {/* Night mode toggle button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-[#5E5CE6] transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>

            {/* Orange Add Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#FF9500] hover:bg-[#E08500] flex items-center justify-center text-white transition-colors cursor-pointer shadow-lg shadow-[#FF9500]/10"
              title="Add New"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Notification Bell with red badge */}
            <div className="relative">
              <button className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-450 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-650 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-[#18181A]">
                0
              </span>
            </div>

            {/* US Flag Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer">
              <span className="text-xl">🇺🇸</span>
            </div>

            {/* User Profile Avatar with Name */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-zinc-800"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider hidden md:inline">
                {currentUser?.user_type === 'demo_admin' ? 'DEMO ADMIN' : 'SYSTEM ADMIN'}
              </span>
            </div>
          </div>
        </header>

        {/* -------------------- 1. BOOKINGS / DASHBOARD TAB -------------------- */}
        {activeTab === 'dashboard' && (
          <>
            {/* Orange Warning/Important Notice Banner */}
            {currentUser?.user_type === 'demo_admin' && (
              <div className="mb-6 p-4 rounded-2xl bg-[#FFF9E6] dark:bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] dark:text-[#FFB340] text-sm flex items-center justify-between gap-3 font-semibold shadow-sm animate-pulse-slow">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF9500] text-white flex items-center justify-center text-xs font-bold font-sans">!</span>
                  <span>
                    Important Notice: Please configure payment settings from the{' '}
                    <button type="button" onClick={() => setActiveTab('settings')} className="underline font-bold text-[#FF9500] dark:text-[#FFB340] hover:opacity-80 cursor-pointer bg-transparent border-0 p-0">Settings tab</button>{' '}
                    to allow providers to withdraw their funds.
                  </span>
                </div>
                <svg className="w-4.5 h-4.5 text-[#FF9500] dark:text-[#FFB340] cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            )}

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                {
                  label: 'Total Bookings',
                  value: totalBookingsCount,
                  icon: <Calendar className="w-5 h-5 text-white" />,
                  suffix: '',
                  delay: '0ms',
                  trend: adminStats?.status_distribution
                    ? `${(adminStats.status_distribution['Completed'] || 0)} completed`
                    : 'Live from DB'
                },
                {
                  label: 'Total Revenue',
                  value: Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                  icon: <DollarSign className="w-5 h-5 text-white" />,
                  prefix: '$',
                  suffix: '',
                  delay: '75ms',
                  trend: 'Completed orders'
                },
                {
                  label: 'Active Handymen',
                  value: activeHandymen,
                  icon: <Wrench className="w-5 h-5 text-white" />,
                  suffix: '',
                  delay: '150ms',
                  trend: `${totalPartnersCount} total partners`
                },
                {
                  label: 'Total Customers',
                  value: totalCustomersCount,
                  icon: <Users className="w-5 h-5 text-white" />,
                  suffix: '',
                  delay: '225ms',
                  trend: `${totalServicesCount} services active`
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#5E5CE6]/90 to-[#4E4CD6] border border-[#5E5CE6]/35 p-6 rounded-2xl shadow-xl relative overflow-hidden text-white group hover:scale-[1.02] transition-all duration-200 card-hover animate-fade-in-up"
                  style={{ animationDelay: card.delay }}
                >
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
                  <div className="absolute -left-6 -top-6 w-20 h-20 bg-white/5 rounded-full" />
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div>
                      <h3 className="text-3xl font-black mb-1 stat-value">
                        {card.prefix || ''}{card.value}{card.suffix || ''}
                      </h3>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{card.label}</span>
                    </div>
                    <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-xs text-white/60 font-semibold relative z-10 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {card.trend}
                  </p>
                </div>
              ))}
            </section>

            {/* Monthly Revenue Chart */}
            <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white">Monthly Revenue</h3>
                {/* Control Icons */}
                <div className="flex items-center gap-2.5 text-zinc-500 text-sm">
                  <button className="hover:text-white transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  </button>
                  <button className="hover:text-white transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                  </button>
                  <button className="hover:text-white transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </button>
                  <button className="hover:text-white transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                  </button>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="relative h-64 w-full">
                {(() => {
                  const chartData = [
                    { name: "Jan", x: 50, y: 210, value: 0 },
                    { name: "Feb", x: 134, y: 210, value: 0 },
                    { name: "Mar", x: 218, y: 210, value: 0 },
                    { name: "Apr", x: 302, y: 210, value: 0 },
                    { name: "May", x: 386, y: 210, value: 0 },
                    { name: "June", x: 470, y: 50, value: 680 },
                    { name: "Jul", x: 554, y: 210, value: 0 },
                    { name: "Aug", x: 638, y: 210, value: 0 },
                    { name: "Sep", x: 722, y: 210, value: 0 },
                    { name: "Oct", x: 806, y: 210, value: 0 },
                    { name: "Nov", x: 890, y: 210, value: 0 },
                    { name: "Dec", x: 980, y: 210, value: 0 }
                  ];

                  const pathD = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y}`).join(' ');
                  const areaD = `${pathD} L 980 210 L 50 210 Z`;

                  return (
                    <>
                      <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1="50" y1="20" x2="980" y2="20" stroke="#27272A" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="50" y1="70" x2="980" y2="70" stroke="#27272A" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="50" y1="120" x2="980" y2="120" stroke="#27272A" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="50" y1="170" x2="980" y2="170" stroke="#27272A" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="50" y1="210" x2="980" y2="210" stroke="#27272A" strokeWidth="1" />

                        {/* Y Axis Labels */}
                        <text x="15" y="25" fill="#71717A" fontSize="10" className="font-semibold">$800</text>
                        <text x="15" y="75" fill="#71717A" fontSize="10" className="font-semibold">$600</text>
                        <text x="15" y="125" fill="#71717A" fontSize="10" className="font-semibold">$400</text>
                        <text x="15" y="175" fill="#71717A" fontSize="10" className="font-semibold">$200</text>
                        <text x="25" y="215" fill="#71717A" fontSize="10" className="font-semibold">$0</text>

                        {/* Gradient Under the Line */}
                        <path
                          d={areaD}
                          fill="url(#chart-grad)"
                          opacity="0.12"
                        />

                        {/* SVG Chart Line */}
                        <path 
                          d={pathD} 
                          fill="none" 
                          stroke="#5E5CE6" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Hover vertical dashed line */}
                        {hoveredChartIndex !== null && (
                          <line 
                            x1={chartData[hoveredChartIndex].x} 
                            y1={20} 
                            x2={chartData[hoveredChartIndex].x} 
                            y2={210} 
                            stroke="#71717A" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4" 
                            className="pointer-events-none"
                          />
                        )}

                        {/* Hover pointer circle */}
                        {hoveredChartIndex !== null && (
                          <circle 
                            cx={chartData[hoveredChartIndex].x} 
                            cy={chartData[hoveredChartIndex].y} 
                            r="6.5" 
                            fill="white" 
                            stroke="#5E5CE6" 
                            strokeWidth="2.5" 
                            className="pointer-events-none"
                          />
                        )}

                        {/* Definitions for Gradients */}
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5E5CE6" />
                            <stop offset="100%" stopColor="#5E5CE6" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Interactive Columns */}
                        {chartData.map((d, i) => {
                          const startingX = i === 0 ? 0 : (chartData[i - 1].x + d.x) / 2;
                          const endingX = i === chartData.length - 1 ? 1000 : (d.x + chartData[i + 1].x) / 2;
                          return (
                            <rect
                              key={i}
                              x={startingX}
                              y={0}
                              width={endingX - startingX}
                              height={240}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredChartIndex(i)}
                              onMouseLeave={() => setHoveredChartIndex(null)}
                            />
                          );
                        })}
                      </svg>

                      {/* Tooltip Box */}
                      {hoveredChartIndex !== null && (
                        <div 
                          className="absolute bg-[#111112] border border-zinc-800 rounded-xl p-3 shadow-2xl z-30 flex flex-col gap-1 pointer-events-none transition-all duration-150"
                          style={{
                            left: `${(chartData[hoveredChartIndex].x / 1000) * 100}%`,
                            top: `${(chartData[hoveredChartIndex].y / 240) * 100 - 6}%`,
                            transform: 'translate(-50%, -100%)',
                          }}
                        >
                          <span className="text-[11px] font-bold text-white tracking-wide">
                            {chartData[hoveredChartIndex].name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-[#5E5CE6]" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              revenue:
                            </span>
                            <span className="text-xs font-bold text-white">
                              ${chartData[hoveredChartIndex].value}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mt-2.5 pl-[48px] pr-[15px]">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>June</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>

            {/* Bottom 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-8">
              {/* Column 1: Recent Providers */}
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-white">Recent Providers</h4>
                  <a href="#" onClick={() => setActiveTab('providers')} className="text-xs font-semibold text-[#5E5CE6] hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80" alt="Provider" className="w-10 h-10 rounded-full border border-zinc-800" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Clio Trujillo</h5>
                      <p className="text-[10px] text-zinc-450">rywy@yopmail.com</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span className="text-[10px] text-zinc-500">★ 0</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80" alt="Provider" className="w-10 h-10 rounded-full border border-zinc-800" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Neville Roberson</h5>
                      <p className="text-[10px] text-zinc-450">camizyji@yopmail.com</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <span className="text-[10px] text-zinc-500">★ 0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Recent Customers */}
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-white">Recent Customers</h4>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('customers'); }} className="text-xs font-semibold text-[#5E5CE6] hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {customers.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No customers yet</p>
                  ) : (
                    customers.slice(0, 3).map((c, i) => {
                      const name = c.display_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Customer';
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <SafeAvatar src={c.profile_image} name={name} className="w-10 h-10 rounded-full border border-zinc-800" />
                          <div>
                            <h5 className="text-xs font-bold text-white">{name}</h5>
                            <p className="text-[10px] text-zinc-500">{c.email || c.username}</p>
                          </div>
                          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                            {c.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 3: Recent Bookings */}
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-white">Recent Bookings</h4>
                  <a href="#" onClick={() => setActiveTab('bookings')} className="text-xs font-semibold text-[#5E5CE6] hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80" alt="Booking" className="w-10 h-10 rounded-full border border-zinc-800" />
                      <div>
                        <h5 className="text-xs font-bold text-white">#45</h5>
                        <p className="text-[10px] text-zinc-455">June 20, 2026 9:56 AM</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-950/45 text-amber-500 border border-amber-900/40">Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80" alt="Booking" className="w-10 h-10 rounded-full border border-zinc-800" />
                      <div>
                        <h5 className="text-xs font-bold text-white">#44</h5>
                        <p className="text-[10px] text-zinc-455">June 25, 2026 2:22 AM</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-950/45 text-amber-500 border border-amber-900/40">Pending</span>
                  </div>
                </div>
              </div>
            </div>

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
                            #{(booking.id || '').slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800 dark:text-zinc-200">{booking.customer_name}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">{booking.service_name}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                            <select
                              value={booking.handyman_name || 'Unassigned'}
                              onChange={(e) => booking.id && handleUpdateBookingHandyman(booking.id, e.target.value)}
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
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800 dark:text-zinc-200">${(booking.amount || 0).toFixed(2)}</span>
                            {systemSettings?.commission_rate > 0 && (
                              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                Client: ${((booking.amount || 0) * (1 + systemSettings.commission_rate / 100)).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={booking.status}
                              onChange={(e) => booking.id && handleUpdateBookingStatus(booking.id, e.target.value)}
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
                              onClick={() => booking.id && handleDeleteBooking(booking.id)}
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

        {/* -------------------- 1.5. BOOKINGS TAB (LIST VIEW) -------------------- */}
        {activeTab === 'bookings' && (
          <>
            {/* Top Bar with Total Amount, Breakdown & Export */}
            <div className="panel-dark flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-[#18181A] border border-zinc-800 rounded-3xl p-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-400 text-sm font-semibold">Total Amount:</span>
                  <span className="text-2xl font-extrabold text-[#5E5CE6] tracking-tight">
                    ${getFilteredAndSortedBookings().reduce((sum, b) => sum + (b.amount || 0), 0).toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={() => setIsBreakdownOpen(true)}
                  className="text-xs font-bold text-[#34C759] hover:underline flex items-center gap-1 transition-all"
                >
                  View Breakdown
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]"
                  />
                  {bookingSearch && (
                    <button 
                      onClick={() => setBookingSearch('')} 
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <select 
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="w-full appearance-none bg-[#1C1C1E] border border-zinc-800 text-white rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5E5CE6] cursor-pointer font-medium"
                  >
                    <option value="All">All Bookings</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* Export Button */}
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white rounded-xl px-5 py-2 font-bold text-sm transition-all shadow-lg shadow-[#5E5CE6]/15 hover:shadow-[#5E5CE6]/25"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </button>

                {/* Create Booking Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-[#1C1C1E] border border-zinc-800 hover:bg-[#252528] text-white rounded-xl px-4 py-2 font-bold text-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-[#5E5CE6]" />
                  <span>Book Service</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <table className="w-full min-w-[1100px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider bg-[#1C1C1E]">
                      {[
                        { key: 'id', label: 'ID' },
                        { key: 'service_name', label: 'Service' },
                        { key: 'date', label: 'Booking Date' },
                        { key: 'customer_name', label: 'User' },
                        { key: 'shop', label: 'Shop' },
                        { key: 'provider_name', label: 'Provider' },
                        { key: 'status', label: 'Status' },
                        { key: 'amount', label: 'Total Amount' },
                        { key: 'payment_status', label: 'Payment Status' }
                      ].map((header) => (
                        <th 
                          key={header.key}
                          onClick={() => handleSort(header.key)}
                          className="px-6 py-4 cursor-pointer hover:bg-zinc-800/40 hover:text-white transition-all select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{header.label}</span>
                            <span className="text-zinc-500 text-[10px]">
                              {bookingSortField === header.key ? (
                                bookingSortOrder === 'asc' ? '▲' : '▼'
                              ) : (
                                '↕'
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 font-bold text-zinc-450 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850/40 text-sm">
                    {getFilteredAndSortedBookings().length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-zinc-500 font-semibold">
                          No bookings found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      getFilteredAndSortedBookings().map((booking, idx) => (
                        <tr 
                          key={booking.id + idx}
                          className="hover:bg-zinc-900/30 transition-all group"
                        >
                          <td className="px-6 py-4.5 font-bold text-white group-hover:text-[#5E5CE6] transition-colors whitespace-nowrap">
                            {booking.id}
                          </td>
                          
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <SafeServiceImage 
                                src={booking.service_image} 
                                name={booking.service_name} 
                                className="w-10 h-10 rounded-xl object-cover border border-zinc-800/80 group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="font-bold text-white">{booking.service_name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4.5 text-zinc-300 font-medium whitespace-nowrap">
                            {booking.date}
                          </td>

                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <SafeAvatar 
                                src={booking.customer_avatar} 
                                name={booking.customer_name} 
                                className="w-8 h-8 rounded-full border border-zinc-800"
                              />
                              <div>
                                <p className="font-semibold text-white leading-tight">{booking.customer_name}</p>
                                <p className="text-[10px] text-zinc-500 font-medium">{booking.customer_email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4.5 text-zinc-400 font-semibold whitespace-nowrap">
                            {booking.shop}
                          </td>

                          <td className="px-6 py-4.5 whitespace-nowrap">
                            {booking.provider_name === 'Unassigned' ? (
                              <select
                                onChange={(e) => handleUpdateBookingHandymanWrapper(booking, e.target.value)}
                                className="bg-[#1C1C1E] border border-zinc-800 rounded-lg px-2 py-1 text-xs text-amber-500 font-bold focus:outline-none focus:ring-1 focus:ring-[#5E5CE6] cursor-pointer"
                              >
                                <option value="Unassigned">Assign Provider...</option>
                                {providers.map((p, pIdx) => {
                                  const name = p.display_name || `${p.first_name} ${p.last_name}`;
                                  return <option key={pIdx} value={name}>{name}</option>;
                                })}
                              </select>
                            ) : (
                              <div className="flex items-center gap-2.5">
                                <SafeAvatar 
                                  src={booking.provider_avatar} 
                                  name={booking.provider_name} 
                                  className="w-8 h-8 rounded-full border border-zinc-850"
                                />
                                <div>
                                  <p className="font-semibold text-white leading-tight">{booking.provider_name}</p>
                                  <p className="text-[10px] text-zinc-500 font-medium">{booking.provider_email}</p>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border transition-colors ${
                              booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              booking.status === 'Accepted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              booking.status === 'Ongoing' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                              booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              booking.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                              'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                            }`}>
                              <select 
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatusWrapper(booking, e.target.value)}
                                className="bg-transparent border-0 text-inherit font-bold text-xs focus:ring-0 focus:outline-none cursor-pointer pr-1"
                              >
                                <option value="Pending" className="bg-[#18181A] text-amber-500">Pending</option>
                                <option value="Accepted" className="bg-[#18181A] text-blue-500">Accepted</option>
                                <option value="Ongoing" className="bg-[#18181A] text-purple-500">Ongoing</option>
                                <option value="Completed" className="bg-[#18181A] text-emerald-500">Completed</option>
                                <option value="Cancelled" className="bg-[#18181A] text-rose-500">Cancelled</option>
                              </select>
                            </div>
                          </td>

                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <span className="font-extrabold text-white text-base">${(booking.amount || 0).toFixed(2)}</span>
                            {systemSettings?.commission_rate > 0 && (
                              <span className="block text-[10px] text-emerald-400 font-semibold mt-0.5">
                                Client: ${((booking.amount || 0) * (1 + systemSettings.commission_rate / 100)).toFixed(2)}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              booking.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              booking.payment_status === 'Pending By Provider' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {booking.payment_status}
                            </span>
                          </td>

                          <td className="px-6 py-4.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleDeleteBookingWrapper(booking)}
                                className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 duration-200"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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

        {/* ────────────────── CUSTOMERS TAB ────────────────── */}
        {activeTab === 'customers' && (
          <div className="animate-tab-content">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-[#5E5CE6] transition-colors"
                />
              </div>
              <button
                onClick={fetchCustomers}
                className="flex items-center gap-2 bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Customers', value: customers.length, color: 'text-[#5E5CE6]' },
                { label: 'Active', value: customers.filter(c => c.status === 1 || c.status === undefined).length, color: 'text-emerald-400' },
                { label: 'Inactive', value: customers.filter(c => c.status === 0).length, color: 'text-zinc-500' },
                { label: 'Showing', value: filteredCustomers.length, color: 'text-amber-400' },
              ].map((s, i) => (
                <div key={i} className="panel-dark-2 bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <p className="text-xs text-zinc-500 font-semibold mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <section className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Registered Customers</h3>
                <span className="text-xs bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20 px-2.5 py-1 rounded-full font-bold">
                  {filteredCustomers.length} records
                </span>
              </div>
              <div className="overflow-x-auto">
                {tabLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No customers found</p>
                    <p className="text-xs mt-1 opacity-60">Customers register through the mobile app</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                        <th className="px-6 py-3.5">Customer</th>
                        <th className="px-6 py-3.5">Username</th>
                        <th className="px-6 py-3.5">Contact</th>
                        <th className="px-6 py-3.5">Wallet</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-sm">
                      {filteredCustomers.map((c, idx) => {
                        const name = c.display_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Unknown';
                        const isActive = c.status === 1 || c.status === undefined;
                        return (
                          <tr key={c.id || idx} className="hover:bg-zinc-900/40 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <SafeAvatar src={c.avatar} name={name} className="w-9 h-9 rounded-full" />
                                <div>
                                  <p className="font-bold text-white text-sm">{name}</p>
                                  <p className="text-xs text-zinc-500">{c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-zinc-400 font-mono text-xs">@{c.username}</td>
                            <td className="px-6 py-4 text-zinc-400">{c.contact_number || '—'}</td>
                            <td className="px-6 py-4 font-bold text-emerald-400">${(c.wallet_balance || 0).toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isActive
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                                  : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleCustomerStatus(c.id, c.status ?? 1)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                                  title={isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(c.id)}
                                  className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 transition-all"
                                  title="Delete customer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ────────────────── SLIDERS TAB ────────────────── */}
        {activeTab === 'sliders' && (
          <div className="animate-tab-content">
            <div className="flex items-center justify-between mb-6">
              <p className="text-zinc-400 text-sm">Manage homepage banners shown in the mobile app</p>
              <button
                onClick={() => setIsSliderModalOpen(true)}
                className="flex items-center gap-2 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20 btn-ripple"
              >
                <Plus className="w-4 h-4" />
                Add Slider
              </button>
            </div>

            {tabLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" />
              </div>
            ) : sliders.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No sliders created yet</p>
                <p className="text-xs mt-1 opacity-60">Add your first banner or promotional slider</p>
                <button
                  onClick={() => setIsSliderModalOpen(true)}
                  className="mt-4 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  Create First Slider
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sliders.map((s, idx) => (
                  <div key={s.id || idx} className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="relative aspect-[16/7] bg-zinc-900 overflow-hidden">
                      {s.slider_image ? (
                        <img src={s.slider_image} alt={s.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${s.status === 1 ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                        {s.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm mb-1 truncate">{s.title}</h3>
                      <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{s.description}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditSliderClick(s)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold py-2 rounded-xl transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleSliderStatus(s.id, s.status)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold py-2 rounded-xl transition-all text-zinc-400"
                        >
                          {s.status === 1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {s.status === 1 ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDeleteSlider(s.id)}
                          className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────────── SETTINGS TAB ────────────────── */}
        {activeTab === 'settings' && (
          <div className="animate-tab-content max-w-2xl">
            {tabLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* General Settings */}
                <div className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl p-6 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[#5E5CE6]/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-[#5E5CE6]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">General Settings</h3>
                      <p className="text-xs text-zinc-500">App name and currency configuration</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">App Name</label>
                      <input
                        type="text"
                        value={settingsForm.app_name}
                        onChange={(e) => setSettingsForm(p => ({ ...p, app_name: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                        placeholder="Handyman Pro"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Currency Symbol</label>
                      <input
                        type="text"
                        value={settingsForm.currency_symbol}
                        onChange={(e) => setSettingsForm(p => ({ ...p, currency_symbol: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                        placeholder="$"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Settings */}
                <div className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl p-6 animate-fade-in-up delay-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Financial Settings</h3>
                      <p className="text-xs text-zinc-500">Commission rates and payout minimums</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Commission Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settingsForm.commission_rate}
                        onChange={(e) => setSettingsForm(p => ({ ...p, commission_rate: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                        placeholder="15.0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Min Payout Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settingsForm.min_payout_amount}
                        onChange={(e) => setSettingsForm(p => ({ ...p, min_payout_amount: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                        placeholder="50.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Support Settings */}
                <div className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl p-6 animate-fade-in-up delay-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Support Contact</h3>
                      <p className="text-xs text-zinc-500">Customer support email and phone</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.support_email}
                        onChange={(e) => setSettingsForm(p => ({ ...p, support_email: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                        placeholder="support@handymanpro.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Support Phone</label>
                      <input
                        type="text"
                        value={settingsForm.support_phone}
                        onChange={(e) => setSettingsForm(p => ({ ...p, support_phone: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                        placeholder="+15550199"
                      />
                    </div>
                  </div>
                </div>

                {/* Current values display */}
                {systemSettings && (
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 animate-fade-in">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Current Saved Values</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'App Name', value: systemSettings.app_name },
                        { label: 'Commission', value: `${systemSettings.commission_rate}%` },
                        { label: 'Currency', value: systemSettings.currency_symbol },
                        { label: 'Min Payout', value: `$${systemSettings.min_payout_amount}` },
                        { label: 'Support Email', value: systemSettings.support_email },
                        { label: 'Support Phone', value: systemSettings.support_phone },
                      ].map((item, i) => (
                        <div key={i} className="bg-zinc-800/50 rounded-xl p-3">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">{item.label}</p>
                          <p className="text-xs text-zinc-200 font-semibold truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="flex items-center gap-2 bg-[#5E5CE6] hover:bg-[#4E4CD6] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20 btn-ripple"
                >
                  {settingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* -------------------- EXPORT DATA MODAL -------------------- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-6 w-full max-w-[420px] shadow-2xl relative">
            {/* Close Button */}
            <button 
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Title */}
            <h3 className="text-base font-bold text-white mb-6">Export Data</h3>
            
            {/* Select File Type */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-zinc-400 mb-2.5">Select File Type</p>
              <div className="flex border border-zinc-800 rounded-lg overflow-hidden bg-[#121214]">
                {(['XLSX', 'XLS', 'ODS', 'CSV', 'PDF', 'HTML'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExportFileType(type)}
                    className={`flex-1 text-center py-2 text-xs font-bold transition-all cursor-pointer border-r border-zinc-800 last:border-r-0 ${
                      exportFileType === type 
                        ? 'bg-[#5E5CE6] text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Columns */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-zinc-400 mb-2.5">Select Columns</p>
              <div className="space-y-2">
                {[
                  { key: 'id', label: 'ID' },
                  { key: 'service_name', label: 'Service' },
                  { key: 'date', label: 'Booking Date' },
                  { key: 'customer_name', label: 'User' },
                  { key: 'provider_name', label: 'Provider' },
                  { key: 'status', label: 'Status' },
                  { key: 'amount', label: 'Total Amount' },
                  { key: 'payment_status', label: 'Payment Status' }
                ].map((col) => (
                  <label 
                    key={col.key}
                    className="flex items-center gap-3 cursor-pointer select-none group py-1"
                  >
                    <div className="relative">
                      <input 
                        type="checkbox"
                        checked={(exportColumns as any)[col.key]}
                        onChange={() => setExportColumns(prev => ({
                          ...prev,
                          [col.key]: !(prev as any)[col.key]
                        }))}
                        className="sr-only"
                      />
                      <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all ${
                        (exportColumns as any)[col.key]
                          ? 'bg-[#5E5CE6] border-[#5E5CE6]' 
                          : 'border-zinc-700 bg-[#121214] group-hover:border-zinc-500'
                      }`}>
                        {(exportColumns as any)[col.key] && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                      {col.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-zinc-300 hover:text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportData}
                className="bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-[#5E5CE6]/15 hover:shadow-[#5E5CE6]/25"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Service Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-600 transition-colors text-slate-800 dark:text-zinc-150 font-bold"
                    placeholder="99.99"
                    required
                  />
                  {amount && parseFloat(amount) > 0 && systemSettings?.commission_rate > 0 && (
                    <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[10px] space-y-0.5">
                      <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                        <span>Provider gets:</span>
                        <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                        <span>Platform fee ({systemSettings.commission_rate}%):</span>
                        <span className="font-bold">+${(parseFloat(amount) * systemSettings.commission_rate / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold border-t border-emerald-200 dark:border-emerald-900/40 pt-0.5 mt-0.5">
                        <span>Client pays:</span>
                        <span>${(parseFloat(amount) * (1 + systemSettings.commission_rate / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
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

      {/* -------------------- VIEW BREAKDOWN MODAL -------------------- */}
      {isBreakdownOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-scale-in-modal">
            <button 
              onClick={() => setIsBreakdownOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-2">
              <span className="p-2 bg-[#5E5CE6]/10 text-[#5E5CE6] rounded-xl">
                <DollarSign className="w-5 h-5" />
              </span>
              <span>Revenue Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1C1C1E] border border-zinc-850 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-2xl font-black text-[#5E5CE6]">
                  ${getFilteredAndSortedBookings().reduce((sum, b) => sum + (b.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-[#1C1C1E] border border-zinc-850 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Bookings</p>
                <p className="text-2xl font-black text-white">
                  {getFilteredAndSortedBookings().length}
                </p>
              </div>
            </div>

            {/* Service breakdown list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Revenue by Service</h4>
              <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
                {Object.entries(
                  getFilteredAndSortedBookings().reduce((acc, b) => {
                    acc[b.service_name] = (acc[b.service_name] || 0) + (b.amount || 0);
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([name, val], idx) => {
                  const total = getFilteredAndSortedBookings().reduce((sum, b) => sum + (b.amount || 0), 0) || 1;
                  const pct = Math.round((val / total) * 100);
                  return (
                    <div key={idx} className="bg-[#1C1C1E]/50 border border-zinc-900 rounded-xl p-3.5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-white">{name}</span>
                        <span className="text-zinc-300">${val.toFixed(2)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#5E5CE6] h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={() => setIsBreakdownOpen(false)}
              className="w-full mt-6 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all"
            >
              Close Breakdown
            </button>
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

      {/* -------------------- CREATE SLIDER MODAL -------------------- */}
      {isSliderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button
              onClick={() => setIsSliderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Add New Slider</h3>
            <form onSubmit={handleCreateSlider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  value={newSliderTitle}
                  onChange={(e) => setNewSliderTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                  placeholder="e.g. Summer AC Service Deal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={newSliderDesc}
                  onChange={(e) => setNewSliderDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors h-20 resize-none"
                  placeholder="Short promotional text..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={newSliderImage}
                  onChange={(e) => setNewSliderImage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {newSliderImage && (
                <div className="rounded-xl overflow-hidden aspect-[16/7] bg-zinc-900">
                  <img src={newSliderImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20"
              >
                Create Slider
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- EDIT SLIDER MODAL -------------------- */}
      {isEditSliderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button
              onClick={() => setIsEditSliderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Edit Slider</h3>
            <form onSubmit={handleUpdateSlider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  value={editSliderTitle}
                  onChange={(e) => setEditSliderTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={editSliderDesc}
                  onChange={(e) => setEditSliderDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors h-20 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={editSliderImage}
                  onChange={(e) => setEditSliderImage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors"
                />
              </div>
              {editSliderImage && (
                <div className="rounded-xl overflow-hidden aspect-[16/7] bg-zinc-900">
                  <img src={editSliderImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
