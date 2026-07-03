"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Navigation
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
  const router = useRouter();
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

  // New multi-role signup and profile image states
  const [signupRole, setSignupRole] = useState<'user' | 'provider'>('user');
  const [signupProviderType, setSignupProviderType] = useState('');
  const [signupProfileImage, setSignupProfileImage] = useState('');
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceCategory, setCustomServiceCategory] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState(0);
  const [customServiceDuration, setCustomServiceDuration] = useState(1);
  // Provider location states
  const [signupAddress, setSignupAddress] = useState('');
  const [signupLat, setSignupLat] = useState<number | null>(null);
  const [signupLng, setSignupLng] = useState<number | null>(null);
  const [signupLocating, setSignupLocating] = useState(false);

  const handleUploadProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSignupError("Image file size should not exceed 5MB.");
      return;
    }

    setIsUploadingProfile(true);
    setSignupError('');
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/register/upload-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data && res.data.url) {
        setSignupProfileImage(res.data.url);
        showToast("Profile image uploaded successfully!");
      } else {
        throw new Error("Failed to upload profile image.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to upload image.";
      setSignupError(msg);
    } finally {
      setIsUploadingProfile(false);
    }
  };

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
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // How It Works interactive video states
  const [howItWorksActiveStep, setHowItWorksActiveStep] = useState(0);
  const [howItWorksIsPlaying, setHowItWorksIsPlaying] = useState(true);
  const [howItWorksProgress, setHowItWorksProgress] = useState(0);

  // Real Phone simulation states
  const [phoneMode, setPhoneMode] = useState<'autoplay' | 'interactive'>('autoplay');
  const [phoneScreen, setPhoneScreen] = useState<'search' | 'details' | 'booking' | 'checkout' | 'processing' | 'tracking' | 'success'>('search');
  const [selectedDateIndex, setSelectedDateIndex] = useState(2); // Wed
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(1); // 12:00 PM
  const [interactiveRating, setInteractiveRating] = useState(5);
  const [scooterPosition, setScooterPosition] = useState(15);

  // Tab switching state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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
    min_payout_amount: '',
    tax_percentage: '',
    advance_payment_enabled: false,
    advance_payment_percentage: '',
    cancellation_charge_enabled: false,
    cancellation_charge_percentage: '',
    cancellation_hours: ''
  });

  // Coupons tab state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('flat');
  const [couponDiscountValue, setCouponDiscountValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponUsageLimit, setCouponUsageLimit] = useState('');

  // Help Desk tab state
  const [helpTickets, setHelpTickets] = useState<any[]>([]);
  const [helpFilter, setHelpFilter] = useState('All');
  const [replyTicketId, setReplyTicketId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // Commissions tab state
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionName, setCommissionName] = useState('');
  const [commissionType, setCommissionType] = useState('percent');
  const [commissionValue, setCommissionValue] = useState('');
  const [commissionHandymanId, setCommissionHandymanId] = useState('');

  // Blogs tab state
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogDesc, setBlogDesc] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogCategory, setBlogCategory] = useState('General');
  const [blogReadTime, setBlogReadTime] = useState('5 min read');
  const [editBlogId, setEditBlogId] = useState('');
  const [editBlogTitle, setEditBlogTitle] = useState('');
  const [editBlogDesc, setEditBlogDesc] = useState('');
  const [editBlogContent, setEditBlogContent] = useState('');
  const [editBlogImage, setEditBlogImage] = useState('');
  const [editBlogCategory, setEditBlogCategory] = useState('');
  const [editBlogReadTime, setEditBlogReadTime] = useState('');

  // Withdrawals tab state
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('All');

  // Analytics tab state
  const [analytics, setAnalytics] = useState<any>(null);

  // Zones tab state
  const [zones, setZones] = useState<any[]>([]);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');

  // Taxes tab state
  const [taxes, setTaxes] = useState<any[]>([]);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('');

  // Service Addons tab state
  const [addons, setAddons] = useState<any[]>([]);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonDesc, setAddonDesc] = useState('');

  // Plans tab state
  const [plans, setPlans] = useState<any[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDuration, setPlanDuration] = useState('30');
  const [planMaxBookings, setPlanMaxBookings] = useState('-1');
  const [planFeatures, setPlanFeatures] = useState('');

  // Post Jobs tab state
  const [postJobs, setPostJobs] = useState<any[]>([]);
  const [postJobFilter, setPostJobFilter] = useState('All');

  // Push Notification tab state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifUserType, setNotifUserType] = useState('all');
  const [notifSending, setNotifSending] = useState(false);
  const [notifLogs, setNotifLogs] = useState<any[]>([]);

  // Payment Gateways tab state
  const [paymentGateways, setPaymentGateways] = useState<any>(null);
  const [gwSaving, setGwSaving] = useState(false);

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // How It Works Autoplay Progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (howItWorksIsPlaying) {
      interval = setInterval(() => {
        setHowItWorksProgress((prev) => {
          if (prev >= 100) {
            setHowItWorksActiveStep((curr) => (curr + 1) % 3);
            return 0;
          }
          return prev + 2; // Fills in 5 seconds (100 / 50 steps of 100ms)
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [howItWorksIsPlaying]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Check auth state on load and fetch catalog data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setCurrentUser(userObj);
          if (['admin', 'demo_admin', 'provider', 'handyman', 'user'].includes(userObj.user_type)) {
            router.push('/dashboard');
            setAuthLoading(false);
            return;
          }
        } catch (e) {}
      }
      fetchAdminStats();
      fetchBookings();
      fetchCustomers();
      fetchSettings();
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true') {
        setShowLoginModal(true);
      } else if (params.get('register') === 'true') {
        setShowSignUpModal(true);
        const role = params.get('role');
        if (role) {
          setSignupRole(role as any);
        }
      }
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

  const fetchIpLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const city = data.city || 'Kolkata';
        const region = data.region || 'West Bengal';
        const formatted = `${city}, ${region}`;
        setLandingLocationQuery(formatted);
        showToast(`Location set via IP: ${formatted}`, 'success');
      } else {
        const backupRes = await fetch('https://ip-api.com/json/');
        if (backupRes.ok) {
          const backupData = await backupRes.json();
          if (backupData.status === 'success') {
            const formatted = `${backupData.city}, ${backupData.regionName}`;
            setLandingLocationQuery(formatted);
            showToast(`Location set via IP: ${formatted}`, 'success');
            return;
          }
        }
        setLandingLocationQuery('Kolkata, WB');
      }
    } catch (e) {
      setLandingLocationQuery('Kolkata, WB');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser. Trying IP...', 'error');
      fetchIpLocation();
      return;
    }

    setIsDetectingLocation(true);
    showToast('Detecting your location...', 'success');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'HandymanPro-Web-Client/1.0'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            
            // Build highly accurate, detailed, and human-readable exact address
            let locationName = '';
            if (data.display_name) {
              const addressParts = data.display_name.split(',').map((p: any) => p.trim());
              // Remove redundant country/state info to keep the string clean but extremely specific
              const filteredParts = addressParts.filter((part: string) => {
                const lower = part.toLowerCase();
                return lower !== 'india' && lower !== 'west bengal';
              });
              
              if (filteredParts.length > 0) {
                // Take the first 3 most precise parts (e.g. road, neighborhood, city/suburb)
                locationName = filteredParts.slice(0, 3).join(', ');
              } else {
                locationName = addressParts.slice(0, 3).join(', ');
              }
            }

            // Fallback to individual fields if display_name couldn't be parsed
            if (!locationName && address) {
              const city = address.city || address.town || address.village || address.suburb || address.state || 'Kolkata';
              locationName = city;
            }

            setLandingLocationQuery(locationName || 'Kolkata');
            showToast(`Location set: ${locationName}`, 'success');
          } else {
            setLandingLocationQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            showToast('Resolved to coordinates.', 'success');
          }
        } catch (err) {
          setLandingLocationQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          showToast('Coordinates set.', 'success');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        let msg = 'Failed to get location. Trying IP...';
        showToast(msg, 'success');
        fetchIpLocation();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Auto-detect location on load
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const selectHowItWorksStep = (index: number) => {
    setHowItWorksActiveStep(index);
    setHowItWorksProgress(0);
    setPhoneMode('autoplay');
    setHowItWorksIsPlaying(true);
  };

  // Interactive mode scooter animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneMode === 'interactive' && phoneScreen === 'tracking') {
      timer = setInterval(() => {
        setScooterPosition((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 3;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [phoneMode, phoneScreen]);

  const getCursorStyle = () => {
    let left = '50%';
    let top = '50%';
    let opacity = 0;
    let scale = 1;
    let ripple = false;

    const lerp = (start: number, end: number, amt: number) => {
      return start + (end - start) * amt;
    };

    if (howItWorksActiveStep === 0) {
      if (howItWorksProgress < 10) {
        left = '80%'; top = '85%'; opacity = 0;
      } else if (howItWorksProgress < 30) {
        // Move to search bar
        const ratio = (howItWorksProgress - 10) / 20;
        left = `${lerp(80, 50, ratio)}%`;
        top = `${lerp(85, 27, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 50) {
        // Typing: hover on search bar
        left = '50%'; top = '27%'; opacity = 1;
      } else if (howItWorksProgress < 65) {
        // Move to dropdown card
        const ratio = (howItWorksProgress - 50) / 15;
        left = `${lerp(50, 60, ratio)}%`;
        top = `${lerp(27, 44, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 70) {
        // Tap dropdown card
        left = '60%'; top = '44%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 67) ripple = true;
      } else if (howItWorksProgress < 75) {
        left = '60%'; top = '44%'; opacity = 0;
      } else if (howItWorksProgress < 88) {
        // Move to Book Service Now button
        const ratio = (howItWorksProgress - 75) / 13;
        left = `${lerp(60, 50, ratio)}%`;
        top = `${lerp(44, 87, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 94) {
        // Tap Book Service Now
        left = '50%'; top = '87%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 90) ripple = true;
      } else {
        left = '50%'; top = '87%'; opacity = 0;
      }
    } else if (howItWorksActiveStep === 1) {
      if (howItWorksProgress < 8) {
        left = '50%'; top = '87%'; opacity = 0;
      } else if (howItWorksProgress < 22) {
        // Move to Wed 12 date card
        const ratio = (howItWorksProgress - 8) / 14;
        left = `${lerp(50, 52, ratio)}%`;
        top = `${lerp(87, 38, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 27) {
        // Tap Wed 12
        left = '52%'; top = '38%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 24) ripple = true;
      } else if (howItWorksProgress < 42) {
        // Move to 12:00 PM time slot
        const ratio = (howItWorksProgress - 27) / 15;
        left = `${lerp(52, 50, ratio)}%`;
        top = `${lerp(38, 50, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 47) {
        // Tap 12:00 PM slot
        left = '50%'; top = '50%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 44) ripple = true;
      } else if (howItWorksProgress < 62) {
        // Move to Proceed to Checkout button
        const ratio = (howItWorksProgress - 47) / 15;
        left = '50%';
        top = `${lerp(50, 87, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 67) {
        // Tap Proceed to Checkout
        left = '50%'; top = '87%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 64) ripple = true;
      } else if (howItWorksProgress < 72) {
        left = '50%'; top = '87%'; opacity = 0;
      } else if (howItWorksProgress < 85) {
        // Move to Pay & Book Now
        const ratio = (howItWorksProgress - 72) / 13;
        left = '50%';
        top = `${lerp(87, 87, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 90) {
        // Tap Pay & Book Now
        left = '50%'; top = '87%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 87) ripple = true;
      } else {
        left = '50%'; top = '87%'; opacity = 0;
      }
    } else if (howItWorksActiveStep === 2) {
      if (howItWorksProgress < 55) {
        // Scooter is moving, hide cursor
        left = '50%'; top = '50%'; opacity = 0;
      } else if (howItWorksProgress < 70) {
        // Move to rating stars
        const ratio = (howItWorksProgress - 55) / 15;
        left = `${lerp(50, 70, ratio)}%`;
        top = `${lerp(50, 56, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 76) {
        // Tap stars (rating)
        left = '70%'; top = '56%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 73) ripple = true;
      } else if (howItWorksProgress < 87) {
        // Move to Done/Return Home button
        const ratio = (howItWorksProgress - 76) / 11;
        left = `${lerp(70, 50, ratio)}%`;
        top = `${lerp(56, 87, ratio)}%`;
        opacity = 1;
      } else if (howItWorksProgress < 92) {
        // Tap Done button
        left = '50%'; top = '87%'; opacity = 1;
        scale = 0.8;
        if (howItWorksProgress >= 89) ripple = true;
      } else {
        left = '50%'; top = '87%'; opacity = 0;
      }
    }

    return { left, top, opacity, scale, ripple };
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
      } else if (activeTab === 'coupons') {
        fetchCoupons();
      } else if (activeTab === 'helpdesk') {
        fetchHelpDesk();
      } else if (activeTab === 'commissions') {
        fetchCommissions();
        fetchProviders();
      } else if (activeTab === 'blogs') {
        fetchBlogs();
      } else if (activeTab === 'withdrawals') {
        fetchWithdrawals();
      } else if (activeTab === 'analytics') {
        fetchAnalytics();
      } else if (activeTab === 'zones') {
        fetchZones();
      } else if (activeTab === 'taxes') {
        fetchTaxes();
      } else if (activeTab === 'addons') {
        fetchAddons();
      } else if (activeTab === 'plans') {
        fetchPlans();
      } else if (activeTab === 'postjobs') {
        fetchPostJobs();
      } else if (activeTab === 'notifications') {
        fetchNotifLogs();
      } else if (activeTab === 'payment-gateways') {
        fetchPaymentGateways();
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
        min_payout_amount: String(response.data.min_payout_amount || ''),
        tax_percentage: String(response.data.tax_percentage || ''),
        advance_payment_enabled: !!response.data.advance_payment_enabled,
        advance_payment_percentage: String(response.data.advance_payment_percentage || ''),
        cancellation_charge_enabled: !!response.data.cancellation_charge_enabled,
        cancellation_charge_percentage: String(response.data.cancellation_charge_percentage || ''),
        cancellation_hours: String(response.data.cancellation_hours || '')
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/coupons');
      setCoupons(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      showToast('Failed to load coupons', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchHelpDesk = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/helpdesk');
      setHelpTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      showToast('Failed to load help desk tickets', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/commissions');
      setCommissions(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      showToast('Failed to load commissions', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/blogs');
      setBlogs(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      showToast('Failed to load blogs', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/withdrawals');
      setWithdrawals(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      showToast('Failed to load withdrawals', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setTabLoading(true);
      const response = await apiClient.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error: any) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setTabLoading(false);
    }
  };

  // ── New fetch functions ────────────────────────────────────────────────────

  const fetchZones = async () => {
    try { setTabLoading(true); const r = await apiClient.get('/admin/zones'); setZones(Array.isArray(r.data) ? r.data : []); }
    catch { showToast('Failed to load zones', 'error'); } finally { setTabLoading(false); }
  };

  const fetchTaxes = async () => {
    try { setTabLoading(true); const r = await apiClient.get('/admin/taxes'); setTaxes(Array.isArray(r.data) ? r.data : []); }
    catch { showToast('Failed to load taxes', 'error'); } finally { setTabLoading(false); }
  };

  const fetchAddons = async () => {
    try { setTabLoading(true); const r = await apiClient.get('/admin/addons'); setAddons(Array.isArray(r.data) ? r.data : []); }
    catch { showToast('Failed to load addons', 'error'); } finally { setTabLoading(false); }
  };

  const fetchPlans = async () => {
    try { setTabLoading(true); const r = await apiClient.get('/admin/plans'); setPlans(Array.isArray(r.data) ? r.data : []); }
    catch { showToast('Failed to load plans', 'error'); } finally { setTabLoading(false); }
  };

  const fetchPostJobs = async () => {
    try {
      setTabLoading(true);
      const params = postJobFilter !== 'All' ? { status: postJobFilter } : {};
      const r = await apiClient.get('/admin/post-jobs', { params });
      setPostJobs(Array.isArray(r.data) ? r.data : []);
    } catch { showToast('Failed to load post jobs', 'error'); } finally { setTabLoading(false); }
  };

  const fetchNotifLogs = async () => {
    try { const r = await apiClient.get('/admin/notification-logs'); setNotifLogs(Array.isArray(r.data) ? r.data : []); }
    catch { /* silent */ }
  };

  const fetchPaymentGateways = async () => {
    try { setTabLoading(true); const r = await apiClient.get('/admin/payment-gateways'); setPaymentGateways(r.data); }
    catch { showToast('Failed to load payment gateways', 'error'); } finally { setTabLoading(false); }
  };

  // ── Zone handlers ──────────────────────────────────────────────────────────

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/zones', { name: zoneName, description: zoneDesc, status: 1 });
      setIsZoneModalOpen(false); setZoneName(''); setZoneDesc('');
      showToast('Zone created!'); fetchZones();
    } catch (err: any) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    try { await apiClient.delete(`/admin/zones/${id}`); showToast('Zone deleted'); fetchZones(); }
    catch { showToast('Failed to delete zone', 'error'); }
  };

  // ── Tax handlers ───────────────────────────────────────────────────────────

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/taxes', { name: taxName, percentage: parseFloat(taxPercentage), status: 1 });
      setIsTaxModalOpen(false); setTaxName(''); setTaxPercentage('');
      showToast('Tax created!'); fetchTaxes();
    } catch (err: any) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
  };

  const handleToggleTax = async (tax: any) => {
    try {
      await apiClient.put(`/admin/taxes/${tax.id}`, { status: tax.status === 1 ? 0 : 1 });
      showToast('Tax updated'); fetchTaxes();
    } catch { showToast('Failed', 'error'); }
  };

  const handleDeleteTax = async (id: string) => {
    if (!confirm('Delete this tax?')) return;
    try { await apiClient.delete(`/admin/taxes/${id}`); showToast('Tax deleted'); fetchTaxes(); }
    catch { showToast('Failed to delete tax', 'error'); }
  };

  // ── Addon handlers ─────────────────────────────────────────────────────────

  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/addons', { name: addonName, price: parseFloat(addonPrice), description: addonDesc, status: 1 });
      setIsAddonModalOpen(false); setAddonName(''); setAddonPrice(''); setAddonDesc('');
      showToast('Add-on created!'); fetchAddons();
    } catch (err: any) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!confirm('Delete this add-on?')) return;
    try { await apiClient.delete(`/admin/addons/${id}`); showToast('Add-on deleted'); fetchAddons(); }
    catch { showToast('Failed', 'error'); }
  };

  // ── Plan handlers ──────────────────────────────────────────────────────────

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/plans', {
        name: planName, price: parseFloat(planPrice),
        duration_days: parseInt(planDuration),
        max_bookings: parseInt(planMaxBookings),
        features: planFeatures.split('\n').map(f => f.trim()).filter(Boolean),
        status: 1
      });
      setIsPlanModalOpen(false); setPlanName(''); setPlanPrice(''); setPlanDuration('30'); setPlanMaxBookings('-1'); setPlanFeatures('');
      showToast('Plan created!'); fetchPlans();
    } catch (err: any) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try { await apiClient.delete(`/admin/plans/${id}`); showToast('Plan deleted'); fetchPlans(); }
    catch { showToast('Failed', 'error'); }
  };

  // ── Post Job handlers ──────────────────────────────────────────────────────

  const handleDeletePostJob = async (id: string) => {
    if (!confirm('Delete this post job?')) return;
    try { await apiClient.delete(`/admin/post-jobs/${id}`); showToast('Job deleted'); fetchPostJobs(); }
    catch { showToast('Failed', 'error'); }
  };

  // ── Notification handlers ──────────────────────────────────────────────────

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSending(true);
    try {
      const r = await apiClient.post('/admin/send-notification', { title: notifTitle, message: notifMessage, user_type: notifUserType });
      showToast(`Notification sent to ${r.data.recipients} users!`);
      setNotifTitle(''); setNotifMessage(''); setNotifUserType('all');
      fetchNotifLogs();
    } catch (err: any) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
    finally { setNotifSending(false); }
  };

  // ── Payment gateway handlers ───────────────────────────────────────────────

  const handleSaveGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    setGwSaving(true);
    try {
      await apiClient.put('/admin/payment-gateways', paymentGateways);
      showToast('Payment gateways saved!');
    } catch { showToast('Failed to save', 'error'); }
    finally { setGwSaving(false); }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/coupons', {
        code: couponCode,
        discount_type: couponDiscountType,
        discount_value: parseFloat(couponDiscountValue),
        min_order_amount: parseFloat(couponMinOrder) || 0,
        expiry_date: couponExpiry || null,
        usage_limit: couponUsageLimit ? parseInt(couponUsageLimit) : null,
        status: 1
      });
      setIsCouponModalOpen(false);
      setCouponCode(''); setCouponDiscountType('flat'); setCouponDiscountValue('');
      setCouponMinOrder(''); setCouponExpiry(''); setCouponUsageLimit('');
      showToast('Coupon created successfully!');
      fetchCoupons();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await apiClient.delete(`/admin/coupons/${id}`);
      showToast('Coupon deleted');
      fetchCoupons();
    } catch {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleToggleCouponStatus = async (coupon: any) => {
    try {
      await apiClient.put(`/admin/coupons/${coupon.id}`, { status: coupon.status === 1 ? 0 : 1 });
      showToast('Coupon status updated');
      fetchCoupons();
    } catch {
      showToast('Failed to update coupon', 'error');
    }
  };

  const handleOpenReply = (ticket: any) => {
    setReplyTicketId(ticket.id);
    setReplyText(ticket.admin_reply || '');
    setIsReplyModalOpen(true);
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/helpdesk/${replyTicketId}`, { admin_reply: replyText, status: 'Closed' });
      setIsReplyModalOpen(false);
      setReplyText(''); setReplyTicketId('');
      showToast('Reply sent and ticket closed');
      fetchHelpDesk();
    } catch {
      showToast('Failed to send reply', 'error');
    }
  };

  const handleReopenTicket = async (id: string) => {
    try {
      await apiClient.put(`/admin/helpdesk/${id}`, { status: 'Open' });
      showToast('Ticket reopened');
      fetchHelpDesk();
    } catch {
      showToast('Failed to reopen ticket', 'error');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await apiClient.delete(`/admin/helpdesk/${id}`);
      showToast('Ticket deleted');
      fetchHelpDesk();
    } catch {
      showToast('Failed to delete ticket', 'error');
    }
  };

  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/commissions', {
        name: commissionName,
        commission_type: commissionType,
        commission_value: parseFloat(commissionValue),
        handyman_id: commissionHandymanId || null,
        status: 1
      });
      setIsCommissionModalOpen(false);
      setCommissionName(''); setCommissionType('percent'); setCommissionValue(''); setCommissionHandymanId('');
      showToast('Commission created successfully!');
      fetchCommissions();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create commission', 'error');
    }
  };

  const handleDeleteCommission = async (id: string) => {
    if (!confirm('Delete this commission rule?')) return;
    try {
      await apiClient.delete(`/admin/commissions/${id}`);
      showToast('Commission deleted');
      fetchCommissions();
    } catch {
      showToast('Failed to delete commission', 'error');
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/blogs', {
        title: blogTitle, description: blogDesc, content: blogContent,
        image: blogImage || null, category: blogCategory, read_time: blogReadTime, status: 1
      });
      setIsBlogModalOpen(false);
      setBlogTitle(''); setBlogDesc(''); setBlogContent(''); setBlogImage(''); setBlogCategory('General'); setBlogReadTime('5 min read');
      showToast('Blog post created!');
      fetchBlogs();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create blog', 'error');
    }
  };

  const handleOpenEditBlog = (blog: any) => {
    setEditBlogId(blog.id);
    setEditBlogTitle(blog.title);
    setEditBlogDesc(blog.description);
    setEditBlogContent(blog.content);
    setEditBlogImage(blog.image || '');
    setEditBlogCategory(blog.category || 'General');
    setEditBlogReadTime(blog.read_time || '5 min read');
    setIsEditBlogModalOpen(true);
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/blogs/${editBlogId}`, {
        title: editBlogTitle, description: editBlogDesc, content: editBlogContent,
        image: editBlogImage || null, category: editBlogCategory, read_time: editBlogReadTime
      });
      setIsEditBlogModalOpen(false);
      showToast('Blog post updated!');
      fetchBlogs();
    } catch {
      showToast('Failed to update blog', 'error');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await apiClient.delete(`/admin/blogs/${id}`);
      showToast('Blog deleted');
      fetchBlogs();
    } catch {
      showToast('Failed to delete blog', 'error');
    }
  };

  const handleWithdrawalAction = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    if (!confirm(`${newStatus === 'Approved' ? 'Approve' : 'Reject'} this withdrawal request?`)) return;
    try {
      await apiClient.put(`/admin/withdrawals/${id}`, { status: newStatus });
      showToast(`Withdrawal ${newStatus.toLowerCase()}`);
      fetchWithdrawals();
    } catch (error: any) {
      showToast(error.response?.data?.detail || `Failed to ${newStatus.toLowerCase()} withdrawal`, 'error');
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

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user_data));
      localStorage.setItem('user_data', JSON.stringify(user_data));
      setCurrentUser(user_data);
      setIsAuthenticated(true);

      setShowLoginModal(false);
      router.push('/dashboard');
      showToast('Sign in successful!');
    } catch (error: any) {
      const msg = error.message || 'Login failed. Please check credentials.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleDetectProviderLocation = () => {
    if (!navigator.geolocation) return;
    setSignupLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSignupLat(lat);
        setSignupLng(lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setSignupAddress(addr);
        } catch {
          setSignupAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setSignupLocating(false);
      },
      () => setSignupLocating(false),
      { timeout: 12000, enableHighAccuracy: true }
    );
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
    if (signupRole === 'provider' && !signupProviderType) {
      setSignupError('Please select a service type.');
      return;
    }
    if (signupRole === 'provider' && signupProviderType === 'custom') {
      if (!customServiceName.trim()) {
        setSignupError('Please enter the custom service name.');
        return;
      }
    }
    setSignupLoading(true);
    try {
      const suggestedServicePayload = signupRole === 'provider' && signupProviderType === 'custom' ? {
        name: customServiceName,
        category: 'Unassigned',
        price: Number(customServicePrice),
        base_price: Number(customServicePrice),
        duration: Number(customServiceDuration),
        description: `Suggested by provider ${signupFirstName} ${signupLastName} during signup`
      } : undefined;

      await apiClient.post('/register', {
        username: signupUsername,
        email: signupEmail,
        first_name: signupFirstName,
        last_name: signupLastName,
        password: signupPassword,
        contact_number: signupPhone || undefined,
        user_type: signupRole,
        provider_type: signupRole === 'provider' ? (signupProviderType === 'custom' ? customServiceName : signupProviderType) : undefined,
        profile_image: signupProfileImage || undefined,
        suggested_service: suggestedServicePayload,
        address: signupRole === 'provider' ? (signupAddress || undefined) : undefined,
        latitude: signupRole === 'provider' ? (signupLat ?? undefined) : undefined,
        longitude: signupRole === 'provider' ? (signupLng ?? undefined) : undefined,
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
    setSignupRole('user');
    setSignupProviderType('');
    setSignupProfileImage('');
    setIsUploadingProfile(false);
    setCustomServiceName('');
    setCustomServiceCategory(categories[0]?.name || '');
    setCustomServicePrice(0);
    setCustomServiceDuration(1);
    setSignupAddress('');
    setSignupLat(null);
    setSignupLng(null);
    setSignupLocating(false);
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
    localStorage.removeItem('user_data');
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
    setEditServicePrice((service.price ?? service.base_price ?? 0).toString());
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
        min_payout_amount: settingsForm.min_payout_amount ? parseFloat(settingsForm.min_payout_amount) : undefined,
        tax_percentage: settingsForm.tax_percentage ? parseFloat(settingsForm.tax_percentage) : undefined,
        advance_payment_enabled: settingsForm.advance_payment_enabled,
        advance_payment_percentage: settingsForm.advance_payment_percentage ? parseFloat(settingsForm.advance_payment_percentage) : undefined,
        cancellation_charge_enabled: settingsForm.cancellation_charge_enabled,
        cancellation_charge_percentage: settingsForm.cancellation_charge_percentage ? parseFloat(settingsForm.cancellation_charge_percentage) : undefined,
        cancellation_hours: settingsForm.cancellation_hours ? parseInt(settingsForm.cancellation_hours) : undefined
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

  // Redirect authenticated users to the dashboard immediately
  if (currentUser && ['admin', 'demo_admin', 'provider', 'handyman', 'user'].includes(currentUser.user_type)) {
    router.push('/dashboard');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isRegularUser = currentUser && currentUser.user_type !== 'admin' && currentUser.user_type !== 'demo_admin';

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
        price: s.price ?? s.base_price ?? 0,
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
        {showTopBanner && (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 text-[11px] md:text-xs font-semibold py-2 px-4 flex items-center justify-between select-none shadow-sm relative z-40 transition-all duration-300">
            <div className="flex-1 text-center">
              Welcome to our service! For more information, visit our About Us page.
            </div>
            <button 
              onClick={() => setShowTopBanner(false)}
              className="p-1 hover:bg-zinc-950/10 rounded-lg transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-zinc-950" />
            </button>
          </div>
        )}

        {/* 2nd Bar: Purple info */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-zinc-350 text-xs py-2 px-4 md:px-12 flex justify-between items-center select-none font-medium relative z-30 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-indigo-400" />
            <span>+15265897485</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </div>
          </div>
        </div>

        {/* 3rd Header: Main Navbar */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800/60 py-3.5 px-4 md:px-12 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { setLandingSearchQuery(''); setSelectedCategoryFilter('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ease-out">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                Handyman <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Pro</span>
              </span>
            </div>

            {/* Menu Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-zinc-650 dark:text-zinc-300">
              <a href="#home" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Home</a>
              <a href="#categories" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Categories</a>
              <a href="#services" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Services</a>
              <a href="#shops" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">Shops</a>
              <a href="#download" className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200">App</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 relative">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60 text-zinc-500 hover:text-indigo-600 dark:text-zinc-450 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all duration-200 hover:scale-105"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* Login/Profile Button */}
              {isAuthenticated && isRegularUser ? (
                <div className="relative">
                  {/* Clickable Profile Button */}
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/50 rounded-2xl hover:border-indigo-500/35 transition-all duration-200 select-none cursor-pointer"
                  >
                    {currentUser.profile_image ? (
                      <img 
                        src={currentUser.profile_image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover border border-indigo-500/20" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {currentUser.first_name ? currentUser.first_name[0].toUpperCase() : currentUser.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-bold text-zinc-700 dark:text-zinc-200 max-w-[100px] truncate">
                      {currentUser.first_name || currentUser.username}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-450 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Card */}
                  {showProfileDropdown && (
                    <>
                      {/* Backdrop to close dropdown on click outside */}
                      <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowProfileDropdown(false)} />
                      
                      <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl shadow-slate-200/30 dark:shadow-black/40 py-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Profile Info */}
                        <div className="px-4 pb-3 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/60">
                          {currentUser.profile_image ? (
                            <img 
                              src={currentUser.profile_image} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover border border-indigo-500/30" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                              {currentUser.first_name ? currentUser.first_name[0].toUpperCase() : currentUser.username[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-zinc-800 dark:text-white truncate">
                              {currentUser.first_name} {currentUser.last_name || ''}
                            </h4>
                            <p className="text-[10px] text-zinc-450 dark:text-zinc-550 truncate mb-1">
                              {currentUser.email || currentUser.username}
                            </p>
                            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-indigo-100/40 dark:border-indigo-900/30">
                              {currentUser.user_type}
                            </span>
                          </div>
                        </div>

                        {/* Navigation Options */}
                        <div className="px-2 py-2 border-b border-slate-100 dark:border-zinc-800/60 flex flex-col gap-0.5">
                          {['admin', 'demo_admin', 'provider', 'handyman'].includes(currentUser.user_type) && (
                            <button 
                              onClick={() => { setShowProfileDropdown(false); router.push('/dashboard'); }}
                              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-zinc-650 hover:text-indigo-650 dark:text-zinc-200 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                            >
                              <LayoutDashboard className="w-4 h-4 text-zinc-405" />
                              <span>Go to Dashboard</span>
                            </button>
                          )}
                          <button 
                            onClick={() => { setShowProfileDropdown(false); showToast('My Bookings feature coming soon!'); }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-indigo-650 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                          >
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <span>My Bookings</span>
                          </button>
                          <button 
                            onClick={() => { setShowProfileDropdown(false); showToast('My Favorites feature coming soon!'); }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-indigo-650 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                          >
                            <Heart className="w-4 h-4 text-zinc-400" />
                            <span>My Favorites</span>
                          </button>
                          <button 
                            onClick={() => { setShowProfileDropdown(false); showToast('Account Settings coming soon!'); }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-indigo-650 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/45 rounded-xl transition-colors text-left"
                          >
                            <UserIcon className="w-4 h-4 text-zinc-400" />
                            <span>Account Settings</span>
                          </button>
                        </div>

                        {/* Logout Option */}
                        <div className="px-2 pt-2">
                          <button 
                            onClick={() => {
                              setShowProfileDropdown(false);
                              localStorage.removeItem('token');
                              localStorage.removeItem('user');
                              localStorage.removeItem('user_data');
                              setCurrentUser(null);
                              setIsAuthenticated(false);
                              showToast('Logged out successfully');
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-705 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => { setLoginError(''); setShowLoginModal(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-white/90" />
                  <span>Login</span>
                </button>
              )}
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
              <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-850 rounded-[28px] p-2 md:p-2.5 shadow-2xl shadow-indigo-500/5 dark:shadow-black/60 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto lg:mx-0 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40">
                <div className="flex flex-col justify-center gap-1.5 px-2.5 py-1.5 flex-1 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-zinc-800/60 group/loc relative min-w-0">
                  <div className="flex items-center gap-2 w-full">
                    <button 
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="hover:scale-110 active:scale-95 transition-all text-indigo-500 hover:text-indigo-600 disabled:opacity-50 cursor-pointer shrink-0 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl"
                      title="Detect Current Location"
                    >
                      {isDetectingLocation ? (
                        <RefreshCw className="w-4.5 h-4.5 animate-spin text-indigo-500" />
                      ) : (
                        <MapPin className="w-4.5 h-4.5 text-indigo-500" />
                      )}
                    </button>
                    <input 
                      type="text" 
                      value={landingLocationQuery}
                      onChange={(e) => setLandingLocationQuery(e.target.value)}
                      title={landingLocationQuery}
                      className="bg-transparent text-xs sm:text-sm text-slate-800 dark:text-zinc-100 outline-none w-full font-bold placeholder-slate-400 dark:placeholder-zinc-600 pr-2"
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="pl-9 flex">
                    <button 
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="flex text-[9px] md:text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-extrabold uppercase tracking-wider shrink-0 border border-emerald-500/25 px-2 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 hover:bg-emerald-500/20 transition-all cursor-pointer items-center gap-1 shadow-sm active:scale-95"
                    >
                      {isDetectingLocation ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3 h-3 rotate-45 text-emerald-500 fill-emerald-500/10" />
                          Current Location
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 flex-1 group/search">
                  <span className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-colors">
                    <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                  </span>
                  <input 
                    type="text" 
                    value={landingSearchQuery}
                    onChange={(e) => setLandingSearchQuery(e.target.value)}
                    className="bg-transparent text-sm text-slate-800 dark:text-zinc-100 outline-none w-full font-bold placeholder-slate-400 dark:placeholder-zinc-650"
                    placeholder="Search Service..."
                  />
                </div>
                <button 
                  onClick={() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    showToast(`Searching for "${landingSearchQuery || 'All'}" in ${landingLocationQuery}`);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-550 text-white font-extrabold text-sm px-7 py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-600/15 cursor-pointer shrink-0"
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

        {/* Trust Metrics Counter Bar */}
        <section className="py-10 px-4 md:px-12 bg-white dark:bg-zinc-900 border-y border-slate-200/50 dark:border-zinc-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Expert Handymen", icon: "👷" },
              { value: "15K+", label: "Happy Customers", icon: "😊" },
              { value: "50+", label: "Service Categories", icon: "⚡" },
              { value: "98%", label: "Satisfaction Rate", icon: "⭐" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
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
                          <span className="text-indigo-600 dark:text-indigo-400 font-black text-base">${(svc.price ?? 0).toFixed(2)}</span>
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

        {/* How It Works Section */}
        <section className="py-24 px-4 md:px-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-1.5 rounded-full inline-block mb-4">Simple Process</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight">How It Works</h2>
              <p className="text-base text-slate-500 dark:text-zinc-400 mt-3 max-w-lg mx-auto font-medium">Book a verified handyman in three simple steps. Try the interactive video preview below.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Interactive Steps List */}
              <div className="lg:col-span-5 space-y-6">
                {[
                  {
                    step: "01",
                    title: "Choose Your Service",
                    description: "Browse through our extensive list of home services. Pick the one that fits your needs.",
                    icon: "🔍",
                    color: "border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                  },
                  {
                    step: "02",
                    title: "Book An Appointment",
                    description: "Select your preferred date, time, and location. Confirm your booking instantly.",
                    icon: "📅",
                    color: "border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20"
                  },
                  {
                    step: "03",
                    title: "Get It Done!",
                    description: "Our verified professional arrives on time. Pay securely through the app when done.",
                    icon: "✅",
                    color: "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                  }
                ].map((item, idx) => {
                  const isActive = howItWorksActiveStep === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectHowItWorksStep(idx)}
                      className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex gap-4 ${
                        isActive
                          ? "bg-white dark:bg-zinc-900 border-indigo-500 shadow-xl shadow-indigo-500/5 translate-x-2"
                          : "bg-transparent border-slate-200 dark:border-zinc-800 hover:bg-white/50 dark:hover:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {/* Active indicator progress line */}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-zinc-800">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100" 
                            style={{ width: `${howItWorksProgress}%` }}
                          />
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-lg ${item.color} shrink-0`}>
                        {item.icon}
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug flex items-center gap-2">
                          <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-450 px-2 py-0.5 rounded-md font-black">{item.step}</span>
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Simulated Video Player Screen Mockup */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                {/* Mode Selector Toggle Switch */}
                <div className="mb-5 bg-slate-100 dark:bg-zinc-800/80 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 shadow-lg border border-slate-200/50 dark:border-zinc-700/50 relative z-20">
                  <button 
                    onClick={() => {
                      setPhoneMode('autoplay');
                      setHowItWorksIsPlaying(true);
                      setHowItWorksProgress(0);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      phoneMode === 'autoplay' 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20' 
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Autoplay Demo</span>
                  </button>
                  <button 
                    onClick={() => {
                      setPhoneMode('interactive');
                      setHowItWorksIsPlaying(false);
                      setPhoneScreen('search');
                      setSelectedDateIndex(2);
                      setSelectedTimeIndex(1);
                      setInteractiveRating(5);
                      setScooterPosition(15);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      phoneMode === 'interactive' 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20' 
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                    <span>Interactive Sandbox</span>
                  </button>
                </div>

                <div className="w-full max-w-[390px] aspect-[9/19.5] rounded-[60px] bg-gradient-to-b from-[#2d2d30] via-[#1a1a1c] to-[#0f0f10] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),_inset_0_2px_4px_rgba(255,255,255,0.15),_inset_0_-2px_4px_rgba(0,0,0,0.4)] ring-1 ring-white/10 relative group/player overflow-hidden">
                  
                  {/* Left physical buttons (Action button & Volume keys) */}
                  <div className="absolute top-28 -left-[2px] w-[4px] h-8 bg-zinc-800 rounded-l-sm border-r border-black/40 z-30" />
                  <div className="absolute top-40 -left-[2px] w-[4px] h-12 bg-zinc-800 rounded-l-sm border-r border-black/40 z-30" />
                  <div className="absolute top-56 -left-[2px] w-[4px] h-12 bg-zinc-800 rounded-l-sm border-r border-black/40 z-30" />
                  
                  {/* Right physical button (Power/Sleep button) */}
                  <div className="absolute top-44 -right-[2px] w-[4px] h-18 bg-zinc-800 rounded-r-sm border-l border-black/40 z-30" />

                  {/* Bezel */}
                  <div className="relative h-full w-full bg-black rounded-[50px] overflow-hidden p-2 flex flex-col justify-between shadow-inner">
                    
                    {/* Glass sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-40 rounded-[40px]" />
                    
                    {/* Dynamic Island Notch */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-full z-45 flex items-center justify-between px-4 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.1)]">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-900/60 relative flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60 blur-[0.5px]" />
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    </div>

                    {/* Speaker Grill */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-zinc-800 rounded-full z-45 border border-black/20" />

                    {/* Inner Screen */}
                    <div className="relative w-full h-full bg-slate-950 rounded-[42px] overflow-hidden border border-slate-900 flex flex-col justify-between pt-12 pb-4 select-none">
                      
                      {/* iOS Status Bar */}
                      <div className="px-7 py-3 flex justify-between items-center text-white/95 text-[9.5px] font-bold tracking-tight w-full absolute top-0 left-0 bg-black/20 backdrop-blur-xs z-40 select-none">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-end gap-[1px] h-2">
                            <div className="w-[1.5px] h-1 bg-white rounded-2xs" />
                            <div className="w-[1.5px] h-1.5 bg-white rounded-2xs" />
                            <div className="w-[1.5px] h-2 bg-white rounded-2xs" />
                            <div className="w-[1.5px] h-2.5 bg-white rounded-2xs" />
                          </div>
                          <span className="text-[7.5px] font-black tracking-tighter mr-0.5">5G</span>
                          <span className="text-[7.5px] font-black opacity-80">100%</span>
                          <div className="w-5 h-2.5 border border-white/80 rounded-[4px] p-[1.5px] flex items-center relative">
                            <div className="h-full bg-emerald-500 rounded-[2px] w-full" />
                            <div className="w-[1px] h-[3px] bg-white/80 absolute -right-[2px] top-1/2 -translate-y-1/2 rounded-r-xs" />
                          </div>
                        </div>
                      </div>

                      {/* Safari Web Address Bar */}
                      <div className="absolute top-8 left-0 right-0 bg-[#161618]/95 border-b border-white/10 px-4 py-2 flex items-center justify-between z-30 backdrop-blur-md">
                        <div className="flex items-center gap-3 text-zinc-400">
                          <button 
                            onClick={() => {
                              if (phoneMode === 'interactive') {
                                if (phoneScreen === 'details') setPhoneScreen('search');
                                else if (phoneScreen === 'booking') setPhoneScreen('details');
                                else if (phoneScreen === 'checkout') setPhoneScreen('booking');
                                else if (phoneScreen === 'processing') setPhoneScreen('checkout');
                                else if (phoneScreen === 'tracking') setPhoneScreen('checkout');
                                else if (phoneScreen === 'success') setPhoneScreen('search');
                              }
                            }}
                            className={`hover:text-white transition-colors cursor-pointer ${phoneMode === 'autoplay' ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button 
                            onClick={() => {
                              if (phoneMode === 'interactive') {
                                if (phoneScreen === 'search') setPhoneScreen('details');
                                else if (phoneScreen === 'details') setPhoneScreen('booking');
                              }
                            }}
                            className={`hover:text-white transition-colors cursor-pointer ${phoneMode === 'autoplay' || phoneScreen === 'success' || phoneScreen === 'tracking' ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                        
                        <div className="flex-1 mx-3 bg-[#242426] border border-white/5 rounded-xl py-1.5 px-3 flex items-center justify-between gap-1.5 text-[8.5px] font-medium text-zinc-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <svg className="w-2.5 h-2.5 text-emerald-500 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                            <span className="text-zinc-200 tracking-tight truncate">handyman.ulmind.com</span>
                          </div>
                          <svg className="w-2.5 h-2.5 text-zinc-550 shrink-0 hover:text-white transition-colors cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        </div>

                        <div className="text-zinc-400 text-[8px] font-black border border-zinc-700/60 rounded px-1.5 py-0.5 bg-[#242426]">
                          aA
                        </div>
                      </div>

                      {/* Background glow effects */}
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                      {/* Step Content Switcher */}
                      <div className="flex-1 flex flex-col justify-start relative z-10 w-full overflow-hidden mt-12 pt-3">
                      
                      {/* SCREEN 1: SEARCH & HOME */}
                      {((phoneMode === 'autoplay' && (howItWorksActiveStep === 0 && howItWorksProgress < 45)) || 
                        (phoneMode === 'interactive' && phoneScreen === 'search')) && (
                        <div className="w-full h-full flex flex-col justify-between p-4 animate-fade-in">
                          <div className="space-y-4 flex-1 flex flex-col justify-start">
                            {/* Header & Greetings */}
                            <div className="text-left space-y-1 mt-1">
                              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                                Hi Samir! <span className="animate-bounce">👋</span>
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#6366f1] shrink-0" />
                                <span>{landingLocationQuery || "Kolkata, West Bengal, India"}</span>
                              </p>
                            </div>

                            {/* Grid Categories */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-left flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                                <span className="text-sm">🧹</span>
                                <span className="text-[9px] text-white font-bold">Cleaning</span>
                              </div>
                              <div className="bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl p-2.5 text-left flex items-center gap-1.5 shadow-sm hover:bg-[#6366f1]/15 transition-colors">
                                <span className="text-sm">❄️</span>
                                <span className="text-[9px] text-white font-bold">AC Repair</span>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-left flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                                <span className="text-sm">🔌</span>
                                <span className="text-[9px] text-white font-bold">Electrical</span>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-left flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                                <span className="text-sm">🎨</span>
                                <span className="text-[9px] text-white font-bold">Painting</span>
                              </div>
                            </div>

                            {/* Search Bar Input */}
                            <div 
                              onClick={() => {
                                if (phoneMode === 'interactive') {
                                  setPhoneScreen('details');
                                }
                              }}
                              className="bg-white/10 border border-white/15 rounded-xl p-2.5 flex items-center gap-2 relative cursor-pointer hover:bg-white/15 transition-colors"
                            >
                              <Search className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
                              <div className="text-[10px] font-bold text-white flex-1 min-w-0 flex items-center gap-0.5">
                                {phoneMode === 'autoplay' ? (
                                  <>
                                    <span>
                                      {howItWorksProgress < 8 
                                        ? "" 
                                        : "AC Servicing & Repair".substring(0, Math.floor(((howItWorksProgress - 8) / 20) * "AC Servicing & Repair".length))}
                                    </span>
                                    <span className="w-0.5 h-3.5 bg-[#6366f1] animate-pulse shrink-0" />
                                  </>
                                ) : (
                                  <span className="text-zinc-400">Search for AC, cleaning, etc...</span>
                                )}
                              </div>
                            </div>

                            {/* Suggestions / Recommended */}
                            <div className="bg-slate-900/95 border border-white/10 rounded-xl p-1.5 shadow-xl space-y-1 animate-slide-up">
                              <div 
                                onClick={() => {
                                  if (phoneMode === 'interactive') {
                                    setPhoneScreen('details');
                                  }
                                }}
                                className={`p-1.5 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
                                  phoneMode === 'autoplay' 
                                    ? (howItWorksProgress >= 36 ? 'bg-[#6366f1]/15 border border-[#6366f1]/30' : 'bg-transparent border border-transparent')
                                    : 'hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                <span className="text-xs shrink-0">❄️</span>
                                <div className="text-left flex-1 min-w-0">
                                  <h5 className="text-[9px] font-black text-white leading-tight">AC Servicing & Repair</h5>
                                  <p className="text-[7px] text-zinc-400">54 verified experts</p>
                                </div>
                                <ChevronRight className="w-3 h-3 text-zinc-500" />
                              </div>
                              <div className="p-1.5 rounded-lg flex items-center gap-2 opacity-60">
                                <span className="text-xs shrink-0">🔌</span>
                                <div className="text-left flex-1 min-w-0">
                                  <h5 className="text-[9px] font-black text-white leading-tight">Electrician & Wiring</h5>
                                  <p className="text-[7px] text-zinc-400">12 experts available</p>
                                </div>
                                <ChevronRight className="w-3 h-3 text-zinc-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 2: DETAILS */}
                      {((phoneMode === 'autoplay' && (howItWorksActiveStep === 0 && howItWorksProgress >= 45)) || 
                        (phoneMode === 'interactive' && phoneScreen === 'details')) && (
                        <div className="w-full h-full flex flex-col justify-between p-4 animate-fade-in">
                          <div className="flex-1 flex flex-col justify-between animate-slide-in-right p-1 mt-1">
                            <div className="space-y-3.5">
                              {/* Service Poster Image */}
                              <div className="w-full h-28 bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-purple-500/20 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent animate-pulse" />
                                <div className="text-center relative z-10">
                                  <span className="text-3xl filter drop-shadow animate-bounce">❄️</span>
                                  <p className="text-[9px] text-cyan-300 font-extrabold tracking-widest uppercase mt-2">AC DEEP CLEANING</p>
                                </div>
                              </div>

                              {/* Details Block */}
                              <div className="text-left space-y-1.5">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-[12px] font-black text-white leading-tight">AC Servicing & Repair</h4>
                                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full">$49.00</span>
                                </div>
                                
                                {/* Ratings */}
                                <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400">
                                  <div className="flex gap-0.5 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} className="w-2.5 h-2.5 fill-current" />
                                    ))}
                                  </div>
                                  <span>4.9 (120 reviews)</span>
                                </div>

                                <p className="text-[8px] text-zinc-400 font-semibold leading-relaxed">
                                  Full indoor unit service, cooling check, filter wash, pressure test, and carbon dust cleanup. Done by certified professionals.
                                </p>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-2">
                              <button 
                                onClick={() => {
                                  if (phoneMode === 'interactive') {
                                    setPhoneScreen('booking');
                                  }
                                }}
                                className={`w-full py-2.5 rounded-xl font-extrabold text-[10px] text-white bg-gradient-to-r from-[#6366f1] to-[#4f46e5] border border-[#6366f1]/40 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                                  phoneMode === 'autoplay' && howItWorksProgress >= 80 ? 'scale-95 shadow-inner opacity-90' : 'hover:brightness-110 active:scale-98'
                                }`}
                              >
                                <span>Book Service Now</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 3: BOOKING CALENDAR */}
                      {((phoneMode === 'autoplay' && (howItWorksActiveStep === 1 && howItWorksProgress < 60)) || 
                        (phoneMode === 'interactive' && phoneScreen === 'booking')) && (
                        <div className="w-full h-full flex flex-col justify-between p-4 animate-fade-in">
                          <div className="space-y-3.5 flex-1 flex flex-col justify-between p-1 mt-1">
                            <div className="space-y-3">
                              {/* Handyman Header */}
                              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2.5">
                                <img 
                                  src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80" 
                                  alt="Provider" 
                                  className="w-8 h-8 rounded-lg object-cover border border-white/10" 
                                />
                                <div className="text-left flex-1 min-w-0">
                                  <h5 className="text-[10px] font-black text-white flex items-center gap-1.5 leading-tight">
                                    Debasis Das
                                    <span className="text-[7px] bg-[#6366f1]/20 text-[#818cf8] font-black px-1.5 py-0.25 rounded-full uppercase tracking-wider">Top Pro</span>
                                  </h5>
                                  <p className="text-[8px] text-zinc-400 font-bold">AC Service Expert</p>
                                </div>
                              </div>

                              {/* Mini Calendar Section */}
                              <div className="text-left space-y-1">
                                <h6 className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider">Select Date</h6>
                                <div className="grid grid-cols-5 gap-1">
                                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => {
                                    const isSelected = phoneMode === 'autoplay' 
                                      ? (idx === 2 && howItWorksProgress >= 25)
                                      : (idx === selectedDateIndex);
                                    return (
                                      <div 
                                        key={idx} 
                                        onClick={() => {
                                          if (phoneMode === 'interactive') {
                                            setSelectedDateIndex(idx);
                                          }
                                        }}
                                        className={`p-1 rounded-lg border transition-all duration-200 text-center cursor-pointer ${
                                          isSelected 
                                            ? 'bg-indigo-600 border-indigo-500 text-white scale-105 shadow-md shadow-indigo-600/30' 
                                            : 'border-white/5 text-zinc-400 bg-white/5 hover:bg-white/10'
                                        }`}
                                      >
                                        <p className="text-[6px] uppercase font-black">{day}</p>
                                        <p className="text-[8px] font-black">{10 + idx}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Mini Time Slot Section */}
                              <div className="text-left space-y-1">
                                <h6 className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider">Select Time Slot</h6>
                                <div className="grid grid-cols-3 gap-1 text-center">
                                  {['09:00 AM', '12:00 PM', '03:00 PM'].map((slot, idx) => {
                                    const isSelected = phoneMode === 'autoplay'
                                      ? (idx === 1 && howItWorksProgress >= 48)
                                      : (idx === selectedTimeIndex);
                                    return (
                                      <div 
                                        key={idx} 
                                        onClick={() => {
                                          if (phoneMode === 'interactive') {
                                            setSelectedTimeIndex(idx);
                                          }
                                        }}
                                        className={`py-1.5 text-[7px] font-black rounded-lg border transition-all duration-200 cursor-pointer ${
                                          isSelected 
                                            ? 'bg-indigo-600 border-indigo-500 text-white scale-105' 
                                            : 'border-white/5 text-zinc-400 bg-white/5 hover:bg-white/10'
                                        }`}
                                      >
                                        {slot}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Progress Booking Button */}
                            <div className="pt-2">
                              {phoneMode === 'autoplay' ? (
                                <button className="w-full py-2 rounded-xl font-extrabold text-[10px] text-white bg-white/5 border border-white/10 cursor-not-allowed text-center">
                                  Choose Date & Time
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setPhoneScreen('checkout')}
                                  className="w-full py-2.5 rounded-xl font-extrabold text-[10px] text-white bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500/40 shadow-lg shadow-indigo-600/20 text-center active:scale-98 transition-all hover:brightness-110 cursor-pointer"
                                >
                                  Proceed to Checkout
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 4: BILLING & CHECKOUT */}
                      {((phoneMode === 'autoplay' && (howItWorksActiveStep === 1 && howItWorksProgress >= 60)) || 
                        (phoneMode === 'interactive' && phoneScreen === 'checkout')) && (
                        <div className="w-full h-full flex flex-col justify-between p-4 animate-fade-in">
                          <div className="flex-1 flex flex-col justify-between animate-slide-up p-1 mt-1">
                            <div className="space-y-3">
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2.5 shadow-inner">
                                <h5 className="text-[9px] font-black text-white border-b border-white/10 pb-1.5 text-left uppercase tracking-wider flex items-center gap-1.5">
                                  <span>🧾</span> Price Details
                                </h5>
                                <div className="space-y-1.5 text-[8px] font-bold text-zinc-350">
                                  <div className="flex justify-between">
                                    <span>Service Charge</span>
                                    <span className="text-white">$49.00</span>
                                  </div>
                                  <div className="flex justify-between text-emerald-400">
                                    <span>Coupon Applied (WELCOME10)</span>
                                    <span>-$10.00</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Platform Fee</span>
                                    <span className="text-white">$2.00</span>
                                  </div>
                                  <div className="flex justify-between border-t border-white/10 pt-2 text-[10px] font-black text-white">
                                    <span>Total Amount</span>
                                    <span className="text-indigo-450">$41.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Checkout Button & Modal */}
                            <div className="pt-2 relative">
                              {phoneMode === 'autoplay' ? (
                                <button className={`w-full py-2.5 rounded-xl font-extrabold text-[10px] text-white bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-500/40 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all duration-150 ${howItWorksProgress >= 70 ? 'scale-95 shadow-inner opacity-90' : ''}`}>
                                  <span>Proceed to Pay $41.00</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setPhoneScreen('processing');
                                    setTimeout(() => {
                                      setPhoneScreen('tracking');
                                      setScooterPosition(15);
                                    }, 1500);
                                  }}
                                  className="w-full py-2.5 rounded-xl font-extrabold text-[10px] text-white bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-500/40 shadow-lg shadow-emerald-600/20 text-center active:scale-98 transition-all hover:brightness-110 cursor-pointer"
                                >
                                  Pay & Book Now ($41.00)
                                </button>
                              )}
                              
                              {/* Processing Overlay (Autoplay) */}
                              {phoneMode === 'autoplay' && howItWorksProgress >= 78 && (
                                <div className="absolute inset-x-0 -top-44 bg-slate-950/95 rounded-xl flex flex-col items-center justify-center p-4 border border-white/10 space-y-3 z-30 animate-fade-in">
                                  {howItWorksProgress < 94 ? (
                                    <>
                                      <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
                                      <p className="text-[9px] font-black text-white uppercase tracking-widest animate-pulse text-center">Processing Payment...</p>
                                    </>
                                  ) : (
                                    <div className="text-center space-y-1.5 animate-scale-in">
                                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center mx-auto shadow-md">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                      </div>
                                      <h5 className="text-[10px] font-black text-white">Payment Successful!</h5>
                                      <p className="text-[7px] text-zinc-400 font-bold">Your booking is confirmed.</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 5: PROCESSING LOADER (Interactive Only) */}
                      {phoneMode === 'interactive' && phoneScreen === 'processing' && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in space-y-3">
                          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Processing Payment</p>
                            <p className="text-[8px] text-zinc-500">Securing payment gateway...</p>
                          </div>
                        </div>
                      )}

                      {/* SCREEN 6: LIVE TRACKER MAP */}
                      {((phoneMode === 'autoplay' && (howItWorksActiveStep === 2 && howItWorksProgress < 55)) || 
                        (phoneMode === 'interactive' && phoneScreen === 'tracking')) && (
                        <div className="w-full h-full flex flex-col justify-between p-4 animate-fade-in">
                          <div className="flex-1 flex flex-col justify-between p-1 mt-1">
                            {/* Vector Map Mock */}
                            <div className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl relative overflow-hidden shadow-inner">
                              <svg className="absolute inset-0 w-full h-full stroke-white/5" strokeWidth={1.5}>
                                <path d="M0 40h200M0 90h200M50 0v150M150 0v150" />
                                <path d="M-10 100 C 40 90, 80 110, 210 100" fill="none" stroke="#2563eb" strokeWidth={3} className="opacity-20" />
                                <path 
                                  d="M 30 90 L 30 35 L 120 35 L 120 70" 
                                  fill="none" 
                                  stroke="#6366f1" 
                                  strokeWidth={2.5} 
                                  strokeDasharray="3,3" 
                                  className="opacity-60"
                                />
                              </svg>

                              {/* Customer Marker (House) */}
                              <div className="absolute left-[120px] top-[70px] -translate-x-1/2 -translate-y-1/2 bg-[#6366f1]/30 border border-[#6366f1] rounded-full p-0.5 shadow-md">
                                <MapPin className="w-3.5 h-3.5 text-white" />
                              </div>

                              {/* Handyman Scooter Marker moving */}
                              <div 
                                className="absolute bg-emerald-500 border border-white rounded-full p-1 shadow-lg transition-all duration-300 z-10"
                                style={{
                                  left: phoneMode === 'autoplay'
                                    ? (howItWorksProgress < 15
                                        ? '30px'
                                        : howItWorksProgress < 40
                                          ? `${30 + ((howItWorksProgress - 15) / 25) * 90}px`
                                          : '120px')
                                    : (scooterPosition < 30
                                        ? '30px'
                                        : scooterPosition < 70
                                          ? `${30 + ((scooterPosition - 30) / 40) * 90}px`
                                          : '120px'),
                                  top: phoneMode === 'autoplay'
                                    ? (howItWorksProgress < 15
                                        ? `${90 - (howItWorksProgress / 15) * 55}px`
                                        : howItWorksProgress < 40
                                          ? '35px'
                                          : `${35 + ((howItWorksProgress - 40) / 15) * 35}px`)
                                    : (scooterPosition < 30
                                        ? `${90 - (scooterPosition / 30) * 55}px`
                                        : scooterPosition < 70
                                          ? '35px'
                                          : `${35 + ((scooterPosition - 70) / 20) * 35}px`),
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <span className="text-[10px] leading-none block">🛵</span>
                              </div>
                            </div>

                            {/* Status Cards */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-left space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h5 className="text-[9px] font-black text-white uppercase tracking-wider">
                                  {phoneMode === 'autoplay' ? (
                                    howItWorksProgress < 50 ? "Technician Dispatched" : "Technician Arrived"
                                  ) : (
                                    scooterPosition < 85 ? "Technician En Route" : "Technician Arrived"
                                  )}
                                </h5>
                                <span className="text-[6px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.25 rounded-full uppercase tracking-wider animate-pulse">Live</span>
                              </div>
                              <p className="text-[8px] text-zinc-400 font-semibold leading-normal">
                                {phoneMode === 'autoplay' ? (
                                  howItWorksProgress < 50 
                                    ? "Debasis Das is heading to your place. ETA: 8 mins."
                                    : "Debasis Das has arrived. Work is under progress."
                                ) : (
                                  scooterPosition < 85
                                    ? `Debasis is riding to your place. ETA: ${Math.max(1, Math.ceil((90 - scooterPosition) / 10))} mins.`
                                    : "Debasis has arrived. Work is under progress."
                                )}
                              </p>

                              {/* Work Progress bar (Autoplay) */}
                              {phoneMode === 'autoplay' && howItWorksProgress >= 50 && (
                                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-2.5">
                                  <div className="flex-1 bg-white/10 h-1 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full" style={{ width: '60%' }} />
                                  </div>
                                  <span className="text-[7px] font-black text-[#818cf8] uppercase tracking-widest animate-pulse shrink-0">Working...</span>
                                </div>
                              )}
                            </div>

                            {/* Action Button to Complete (Interactive Only) */}
                            {phoneMode === 'interactive' && (
                              <div className="pt-2">
                                <button 
                                  onClick={() => setPhoneScreen('success')}
                                  className="w-full py-2 rounded-xl font-extrabold text-[9px] text-white bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500/40 text-center active:scale-98 transition-all hover:brightness-110 cursor-pointer"
                                >
                                  {scooterPosition < 85 ? "Simulate Arrival" : "Complete Booking"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SCREEN 7: JOB COMPLETED & RATING */}
                      {((phoneMode === 'autoplay' && (howItWorksActiveStep === 2 && howItWorksProgress >= 55)) || 
                        (phoneMode === 'interactive' && phoneScreen === 'success')) && (
                        <div className="w-full h-full flex flex-col justify-between p-4 animate-fade-in">
                          <div className="flex-1 flex flex-col justify-between animate-slide-up p-1 mt-1">
                            <div className="space-y-3 text-center">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center mx-auto shadow-md">
                                <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-[11px] font-black text-white leading-tight">Job Completed successfully!</h4>
                                <p className="text-[7px] text-zinc-400 font-bold">AC Deep Clean has been completed</p>
                              </div>

                              {/* Handyman Rating Card */}
                              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80" alt="Provider" className="w-7 h-7 rounded-full object-cover border border-white/10" />
                                  <div className="text-left">
                                    <h5 className="text-[9px] font-black text-white leading-tight">Debasis Das</h5>
                                    <p className="text-[7px] text-zinc-400 font-bold">AC Specialist</p>
                                  </div>
                                </div>

                                {/* Stars rating */}
                                <div className="flex gap-0.5 text-zinc-700">
                                  {[1, 2, 3, 4, 5].map((s) => {
                                    const isStarred = phoneMode === 'autoplay'
                                      ? (howItWorksProgress >= 62 + s * 3.5)
                                      : (s <= interactiveRating);
                                    return (
                                      <Star 
                                        key={s} 
                                        onClick={() => {
                                          if (phoneMode === 'interactive') {
                                            setInteractiveRating(s);
                                          }
                                        }}
                                        className={`w-3.5 h-3.5 transition-all duration-200 cursor-pointer ${
                                          isStarred 
                                            ? 'text-amber-400 fill-amber-400 scale-110' 
                                            : 'text-zinc-600'
                                        }`} 
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Return CTA */}
                            <div className="pt-2">
                              <button 
                                onClick={() => {
                                  if (phoneMode === 'interactive') {
                                    setPhoneScreen('search');
                                  } else {
                                    selectHowItWorksStep(0);
                                  }
                                }}
                                className="w-full py-2.5 rounded-xl font-extrabold text-[10px] text-white bg-gradient-to-r from-[#6366f1] to-[#4f46e5] border border-[#6366f1]/40 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all duration-150 hover:brightness-110 cursor-pointer"
                              >
                                <span>Return to Home</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Virtual cursor/pointer hand indicator (Only in Autoplay) */}
                    {phoneMode === 'autoplay' && howItWorksIsPlaying && (
                      <div 
                        className="absolute pointer-events-none z-50 transition-all duration-300 ease-out"
                        style={{
                          left: getCursorStyle().left,
                          top: getCursorStyle().top,
                          opacity: getCursorStyle().opacity,
                          transform: `translate(-50%, -50%) scale(${getCursorStyle().scale})`,
                        }}
                      >
                        {/* Circle cursor pointer ring */}
                        <div className="w-8 h-8 rounded-full bg-[#6366f1]/25 border-2 border-[#6366f1] shadow-xl flex items-center justify-center relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shadow-sm" />
                          {/* Ripple click effect */}
                          {getCursorStyle().ripple && (
                            <span className="absolute -inset-2 rounded-full border-2 border-[#6366f1]/80 animate-ping" />
                          )}
                        </div>
                        
                        {/* Custom Pointer Hand SVG */}
                        <div className="absolute top-4 left-4 text-white drop-shadow-md">
                          <svg className="w-6 h-6 fill-[#6366f1] stroke-white" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.303.197-1.591 1.591M21.75 12h-2.25m-.197 5.303-1.591-1.591M12 21.75V19.5m-5.303-.197 1.591-1.591M2.25 12h2.25m.197-5.303 1.591 1.591" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* iOS Home Indicator Bar */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-45" />

                    {/* Interactive Video Control Overlay (Only in Autoplay) */}
                    {phoneMode === 'autoplay' && (
                      <div className="px-4 pt-3 border-t border-white/10 bg-black/60 backdrop-blur-md relative z-20">
                        {/* Video Progress scrubbing bar */}
                        <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative overflow-hidden mb-2">
                          <div className="absolute left-[33%] top-0 bottom-0 w-0.5 bg-black/30 z-10" />
                          <div className="absolute left-[66%] top-0 bottom-0 w-0.5 bg-black/30 z-10" />
                          
                          <div 
                            className="h-full bg-gradient-to-r from-[#6366f1] to-purple-500 transition-all duration-100" 
                            style={{ width: `${((howItWorksActiveStep * 100) + (howItWorksProgress || 0)) / 3}%` }}
                          />
                        </div>

                        {/* Video play/pause, volume, time indicators */}
                        <div className="flex items-center justify-between text-zinc-300">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setHowItWorksIsPlaying(!howItWorksIsPlaying)}
                              className="hover:text-white transition-colors cursor-pointer"
                            >
                              {howItWorksIsPlaying ? (
                                <Pause className="w-4 h-4 text-white fill-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-white" />
                              )}
                            </button>
                            
                            <span className="text-[10px] font-bold tracking-wider">
                              0:0{howItWorksActiveStep + 1} / 0:03
                            </span>
                            
                            <span className="text-[8px] bg-indigo-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                              Demo Play
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button className="hover:text-white transition-colors cursor-pointer">
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-extrabold border border-white/20 rounded px-1 text-white">
                              HD
                            </span>
                            <button 
                              onClick={() => showToast("Full video demo available on our Mobile App!", "success")}
                              className="hover:text-white transition-colors cursor-pointer"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
            <div className="bg-[#18181A] border border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative my-8">

              {/* Close */}
              <button
                onClick={() => setShowSignUpModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
                <p className="mt-1 text-xs text-zinc-400 font-medium">Join Handyman Pro today</p>
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
                  {/* Account Type Tabs */}
                  <div className="flex gap-2 p-1 bg-[#121214] border border-zinc-800 rounded-2xl mb-5">
                    <button
                      type="button"
                      onClick={() => { setSignupRole('user'); setSignupError(''); }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        signupRole === 'user'
                          ? 'bg-[#5E5CE6] text-white shadow-lg shadow-[#5E5CE6]/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                      }`}
                    >
                      Handyman User
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSignupRole('provider'); setSignupError(''); }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        signupRole === 'provider'
                          ? 'bg-[#5E5CE6] text-white shadow-lg shadow-[#5E5CE6]/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                      }`}
                    >
                      Handyman Provider
                    </button>
                  </div>

                  {signupError && (
                    <div className="mb-4 p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span><span className="font-bold">Error:</span> {signupError}</span>
                    </div>
                  )}

                  {/* Profile Picture Uploader */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#5E5CE6]/30 hover:border-[#5E5CE6]/60 bg-zinc-900 overflow-hidden flex items-center justify-center relative transition-all">
                        {isUploadingProfile ? (
                          <Loader2 className="w-6 h-6 text-[#5E5CE6] animate-spin" />
                        ) : signupProfileImage ? (
                          <img src={signupProfileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-8 h-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                        
                        {!isUploadingProfile && (
                          <label htmlFor="signup-profile-upload" className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold text-white uppercase tracking-wider">
                            Upload
                          </label>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        id="signup-profile-upload"
                        onChange={handleUploadProfileImage}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1.5 font-medium">
                      {signupRole === 'provider' ? 'Provider Photo (Recommended)' : 'Avatar Image (Optional)'}
                    </span>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          required
                          placeholder="John"
                          className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                          required
                          placeholder="Doe"
                          className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          required
                          placeholder="johndoe"
                          className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          Phone <span className="text-zinc-500 font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="+880 1700-000000"
                          className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                        className="block w-full px-3 py-2 bg-[#121214] border border-zinc-850 rounded-xl text-white placeholder-zinc-655 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                      />
                    </div>

                    {signupRole === 'provider' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Service Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={signupProviderType}
                            onChange={(e) => setSignupProviderType(e.target.value)}
                            required
                            className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm cursor-pointer"
                          >
                            <option value="">Select the service you provide</option>
                            {services.filter((s: any) => s.status === 1).map((svc: any) => (
                              <option key={svc.id || svc.name} value={svc.name}>
                                {svc.name} ({svc.category})
                              </option>
                            ))}
                            <option value="custom">Other (Suggest a new service)</option>
                          </select>
                        </div>

                        {signupProviderType === 'custom' && (
                          <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3 animate-fade-in">
                            <p className="text-xs text-[#5E5CE6] font-semibold">Suggest a new service for review:</p>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                                Service Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={customServiceName}
                                onChange={(e) => setCustomServiceName(e.target.value)}
                                required
                                placeholder="e.g. Smart Lock Installation"
                                className="block w-full px-3 py-1.5 bg-[#121214] border border-zinc-850 rounded-lg text-white outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* Provider Location */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                            Service Location <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={signupAddress}
                              onChange={(e) => setSignupAddress(e.target.value)}
                              required
                              placeholder="Your city / area (e.g. Kolaghat, West Bengal)"
                              className="flex-1 px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                            />
                            <button
                              type="button"
                              onClick={handleDetectProviderLocation}
                              disabled={signupLocating}
                              title="Auto-detect my location"
                              className="h-10 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                            >
                              {signupLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                              {signupLocating ? 'Detecting...' : 'Detect'}
                            </button>
                          </div>
                          {signupLat && signupLng && (
                            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              GPS: {signupLat.toFixed(5)}°N, {signupLng.toFixed(5)}°E — location saved
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          placeholder="Min. 6 chars"
                          className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          placeholder="Re-enter password"
                          className="block w-full px-3 py-2 bg-[#121214] border border-zinc-800 rounded-xl text-white placeholder-zinc-650 outline-none focus:border-[#5E5CE6] focus:ring-1 focus:ring-[#5E5CE6] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#5E5CE6] hover:bg-[#4E4CD6] transition-all disabled:opacity-55 cursor-pointer shadow-lg shadow-[#5E5CE6]/20"
                      >
                        {signupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-5 text-center text-xs text-zinc-400 font-medium">
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

      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden drawer-overlay">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="admin-sidebar absolute left-0 top-0 bottom-0 w-72 bg-[#111112] border-r border-[#1C1C1E] p-5 flex flex-col justify-between text-zinc-300 animate-slide-drawer overflow-y-auto z-50">
            <div>
              {/* Close button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-x-3">
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
                    {currentUser?.user_type === 'demo_admin' ? 'Demo Admin' : 'System Admin'}
                  </span>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl hover:bg-[#1C1C1E] text-zinc-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="panel-dark-2 flex items-center gap-x-3 p-3 bg-[#1C1C1E] border border-zinc-800 rounded-2xl mb-8">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" alt="Profile" className="w-10 h-10 rounded-full border border-[#5E5CE6]/30" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{currentUser?.display_name || 'Demo Admin'}</p>
                  <p className="text-xs text-zinc-500 font-medium truncate">{currentUser?.email || 'demo@admin.com'}</p>
                </div>
              </div>

              {/* Navigation Menu (same as desktop) */}
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Main</p>
                  <div className="space-y-1">
                    {[{tab: 'dashboard', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, label: 'Dashboard'},
                      {tab: 'bookings', icon: <Calendar className="w-5 h-5 flex-shrink-0" />, label: 'Bookings'}].map(item => (
                      <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                          activeTab === item.tab ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                        }`}>
                        {item.icon}<span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Service</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveTab('services'); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                        activeTab === 'services' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                      }`}>
                      <Wrench className="w-5 h-5 flex-shrink-0" /><span>Services & Categories</span>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">User</p>
                  <div className="space-y-1">
                    {[{tab: 'providers', icon: <Users className="w-5 h-5 flex-shrink-0" />, label: 'Providers'},
                      {tab: 'customers', icon: <UserCheck className="w-5 h-5 flex-shrink-0" />, label: 'Customers'}].map(item => (
                      <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                          activeTab === item.tab ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                        }`}>
                        {item.icon}<span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Content</p>
                  <div className="space-y-1">
                    {[{tab: 'sliders', icon: <ImageIcon className="w-5 h-5 flex-shrink-0" />, label: 'Banners / Sliders'},
                      {tab: 'blogs', icon: <Briefcase className="w-5 h-5 flex-shrink-0" />, label: 'Blog Posts'}].map(item => (
                      <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                          activeTab === item.tab ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                        }`}>
                        {item.icon}<span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Marketing</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveTab('coupons'); setIsMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                        activeTab === 'coupons' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                      }`}>
                      <Tag className="w-5 h-5 flex-shrink-0" /><span>Coupons</span>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Financial</p>
                  <div className="space-y-1">
                    {[{tab: 'commissions', icon: <Percent className="w-5 h-5 flex-shrink-0" />, label: 'Commissions'},
                      {tab: 'withdrawals', icon: <Download className="w-5 h-5 flex-shrink-0" />, label: 'Withdrawals'}].map(item => (
                      <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                          activeTab === item.tab ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                        }`}>
                        {item.icon}<span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">System</p>
                  <div className="space-y-1">
                    {[{tab: 'analytics', icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />, label: 'Analytics'},
                      {tab: 'helpdesk', icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />, label: 'Help Desk'},
                      {tab: 'transactions', icon: <ArrowUpRight className="w-5 h-5 flex-shrink-0" />, label: 'Transactions'},
                      {tab: 'settings', icon: <Settings className="w-5 h-5 flex-shrink-0" />, label: 'System Settings'}].map(item => (
                      <button key={item.tab} onClick={() => { setActiveTab(item.tab); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-left transition-all ${
                          activeTab === item.tab ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                        }`}>
                        {item.icon}<span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <button onClick={() => { toggleTheme(); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-[#1C1C1E] hover:text-white font-semibold text-sm text-left transition-all">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#5E5CE6]" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button onClick={() => { handleLogout(); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center gap-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-950/20 font-semibold text-sm text-left transition-all">
                <LogOut className="w-4 h-4" /><span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

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
                  onClick={() => setActiveTab('zones')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'zones' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'}`}
                >
                  <div className="flex items-center gap-x-3">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>Service Zones</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('addons')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'addons' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'}`}
                >
                  <div className="flex items-center gap-x-3">
                    <PlusCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Service Add-ons</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
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
                <button
                  onClick={() => setActiveTab('blogs')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'blogs'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <Briefcase className="w-5 h-5 flex-shrink-0" />
                    <span>Blog Posts</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Marketing</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'coupons'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <Tag className="w-5 h-5 flex-shrink-0" />
                    <span>Coupons</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Financial</p>
              <div className="space-y-1">
                {[
                  { tab: 'commissions', icon: <Percent className="w-5 h-5 flex-shrink-0" />, label: 'Commissions' },
                  { tab: 'taxes', icon: <DollarSign className="w-5 h-5 flex-shrink-0" />, label: 'Taxes' },
                  { tab: 'plans', icon: <Award className="w-5 h-5 flex-shrink-0" />, label: 'Subscription Plans' },
                  { tab: 'withdrawals', icon: <Download className="w-5 h-5 flex-shrink-0" />, label: 'Withdrawals' },
                  { tab: 'payment-gateways', icon: <ShoppingBag className="w-5 h-5 flex-shrink-0" />, label: 'Payment Gateways' },
                ].map(item => (
                  <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === item.tab ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'}`}
                  >
                    <div className="flex items-center gap-x-3">{item.icon}<span>{item.label}</span></div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Operations</p>
              <div className="space-y-1">
                <button onClick={() => setActiveTab('postjobs')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'postjobs' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'}`}
                >
                  <div className="flex items-center gap-x-3"><Briefcase className="w-5 h-5 flex-shrink-0" /><span>Post Jobs</span></div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Support</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('helpdesk')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'helpdesk'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-x-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Help Desk</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">System</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20'
                      : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 flex-shrink-0" />
                  <span>Analytics</span>
                </button>
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
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-x-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'notifications' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20' : 'text-zinc-400 hover:bg-[#1C1C1E] hover:text-white'}`}
                >
                  <Zap className="w-5 h-5 flex-shrink-0" />
                  <span>Push Notifications</span>
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
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
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
                {activeTab === 'coupons' && "Coupon Management"}
                {activeTab === 'helpdesk' && "Help Desk Tickets"}
                {activeTab === 'commissions' && "Commission Rules"}
                {activeTab === 'blogs' && "Blog Management"}
                {activeTab === 'withdrawals' && "Withdrawal Requests"}
                {activeTab === 'analytics' && "Analytics & Reports"}
                {activeTab === 'zones' && "Service Zones"}
                {activeTab === 'taxes' && "Tax Management"}
                {activeTab === 'addons' && "Service Add-ons"}
                {activeTab === 'plans' && "Subscription Plans"}
                {activeTab === 'postjobs' && "Post Job Requests"}
                {activeTab === 'notifications' && "Push Notifications"}
                {activeTab === 'payment-gateways' && "Payment Gateways"}
              </span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-semibold animate-fade-in">
              {activeTab === 'dashboard' && `Welcome back, ${currentUser?.display_name || 'Demo Admin'}!`}
              {activeTab === 'bookings' && "Manage system bookings"}
              {activeTab === 'providers' && "Manage and monitor registered Handymen & Service Providers"}
              {activeTab === 'services' && "Manage service items and system-wide service categories"}
              {activeTab === 'zones' && "Define geographic service zones for providers"}
              {activeTab === 'taxes' && "Configure tax rates applied to bookings"}
              {activeTab === 'addons' && "Manage optional add-on services for bookings"}
              {activeTab === 'plans' && "Create and manage provider subscription plans"}
              {activeTab === 'postjobs' && "Review customer-posted job requests and bids"}
              {activeTab === 'notifications' && "Send push notifications to app users"}
              {activeTab === 'payment-gateways' && "Configure which payment methods are enabled"}
              {activeTab === 'transactions' && "Wallet transactions history and system payout logs"}
              {activeTab === 'customers' && "View and manage registered app customers"}
              {activeTab === 'sliders' && "Manage homepage banners and promotional sliders"}
              {activeTab === 'settings' && "Configure system-wide app settings and commission rates"}
              {activeTab === 'coupons' && "Create and manage discount coupons for customers"}
              {activeTab === 'helpdesk' && "View and respond to support tickets from users"}
              {activeTab === 'commissions' && "Configure custom commission rates per handyman"}
              {activeTab === 'blogs' && "Create and manage blog content for the app"}
              {activeTab === 'withdrawals' && "Review and approve provider withdrawal requests"}
              {activeTab === 'analytics' && "Real-time revenue and booking analytics"}
            </p>
          </div>
          </div>
          
          {/* Header Action Bar */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Night mode toggle button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-[#5E5CE6] transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>

            {/* Orange Add Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#FF9500] hover:bg-[#E08500] flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg shadow-[#FF9500]/15 hover:scale-105 active:scale-95"
              title="Add New"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Notification Bell with red badge */}
            <div className="relative">
              <button className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <span className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center border-2 border-[#18181A]">
                0
              </span>
            </div>

            {/* US Flag Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm">
              <span className="text-xl leading-none">🇺🇸</span>
            </div>

            {/* User Profile Avatar with Name */}
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800 h-9">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
                alt="Profile" 
                className="w-9 h-9 rounded-full border-2 border-[#5E5CE6]/45 hover:border-[#5E5CE6] transition-colors duration-200 cursor-pointer shadow-md"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[11px] font-black text-white leading-tight">
                  {currentUser?.display_name || 'SYSTEM ADMIN'}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-tight mt-0.5">
                  {currentUser?.user_type === 'demo_admin' ? 'Demo Mode' : 'Admin'}
                </span>
              </div>
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
                    : 'Live from DB',
                  gradient: 'from-[#5E5CE6] to-[#4338ca]',
                  borderColor: 'border-[#5E5CE6]/35',
                  glowColor: 'shadow-[#5E5CE6]/15',
                },
                {
                  label: 'Total Revenue',
                  value: Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                  icon: <DollarSign className="w-5 h-5 text-white" />,
                  prefix: '$',
                  suffix: '',
                  delay: '75ms',
                  trend: 'Completed orders',
                  gradient: 'from-emerald-500 to-emerald-700',
                  borderColor: 'border-emerald-500/35',
                  glowColor: 'shadow-emerald-500/15',
                },
                {
                  label: 'Active Handymen',
                  value: activeHandymen,
                  icon: <Wrench className="w-5 h-5 text-white" />,
                  suffix: '',
                  delay: '150ms',
                  trend: `${totalPartnersCount} total partners`,
                  gradient: 'from-amber-500 to-orange-600',
                  borderColor: 'border-amber-500/35',
                  glowColor: 'shadow-amber-500/15',
                },
                {
                  label: 'Total Customers',
                  value: totalCustomersCount,
                  icon: <Users className="w-5 h-5 text-white" />,
                  suffix: '',
                  delay: '225ms',
                  trend: `${totalServicesCount} services active`,
                  gradient: 'from-rose-500 to-pink-600',
                  borderColor: 'border-rose-500/35',
                  glowColor: 'shadow-rose-500/15',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${card.gradient} ${card.borderColor} border p-6 rounded-2xl shadow-xl ${card.glowColor} relative overflow-hidden text-white group hover:scale-[1.02] transition-all duration-200 card-hover animate-fade-in-up`}
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

            {/* Chart & Status Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {/* Monthly Revenue Column (2/3 width) */}
              <div className="lg:col-span-2 panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700/80 transition-all duration-300 shadow-xl shadow-black/15 noise-texture flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white">Monthly Revenue</h3>
                    {/* Control Icons */}
                    <div className="flex items-center gap-2.5 text-zinc-500 text-sm">
                      <button className="hover:text-white transition-colors cursor-pointer" title="Zoom In">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                      </button>
                      <button className="hover:text-white transition-colors cursor-pointer" title="Zoom Out">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                      </button>
                      <button className="hover:text-white transition-colors cursor-pointer" title="Search">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      </button>
                      <button className="hover:text-white transition-colors cursor-pointer" title="More Options">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart SVG */}
              <div className="relative h-64 w-full">
                {(() => {
                  const getMonthIndex = (dateStr: string): number => {
                    if (!dateStr) return 5;
                    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    const lower = dateStr.toLowerCase();
                    for (let i = 0; i < 12; i++) {
                      if (lower.includes(months[i])) return i;
                    }
                    const parts = dateStr.split('-');
                    if (parts.length >= 2) {
                      const m = parseInt(parts[1], 10);
                      if (m >= 1 && m <= 12) return m - 1;
                    }
                    const parsed = new Date(dateStr);
                    if (!isNaN(parsed.getTime())) {
                      return parsed.getMonth();
                    }
                    return 5;
                  };

                  const monthlyRevenue = Array(12).fill(0);
                  bookings.forEach(b => {
                    if (b.status === 'Completed' || b.status === 'Ongoing' || b.status === 'Accepted' || b.status === 'In Progress') {
                      const month = getMonthIndex(b.date);
                      monthlyRevenue[month] += b.amount || 0;
                    }
                  });

                  const maxVal = Math.max(...monthlyRevenue, 100);
                  const yMax = Math.ceil(maxVal / 100) * 100;

                  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const chartData = chartMonths.map((name, i) => {
                    const x = 50 + i * (930 / 11);
                    const val = monthlyRevenue[i];
                    const y = 210 - (val / yMax) * 190;
                    return { name, x, y, value: val };
                  });

                  const pathD = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.y}`).join(' ');
                  const areaD = `${pathD} L ${chartData[11].x} 210 L ${chartData[0].x} 210 Z`;

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
                        <text x="15" y="25" fill="#71717A" fontSize="10" className="font-semibold">${Math.round(yMax)}</text>
                        <text x="15" y="75" fill="#71717A" fontSize="10" className="font-semibold">${Math.round(yMax * 0.75)}</text>
                        <text x="15" y="125" fill="#71717A" fontSize="10" className="font-semibold">${Math.round(yMax * 0.5)}</text>
                        <text x="15" y="175" fill="#71717A" fontSize="10" className="font-semibold">${Math.round(yMax * 0.25)}</text>
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

            {/* Booking Status Distribution Column (1/3 width) */}
            {adminStats?.status_distribution && (
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700/80 transition-all duration-300 shadow-xl shadow-black/15 noise-texture flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white">Booking Status Distribution</h3>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{totalBookingsCount} Total</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Pending', color: 'bg-amber-500', glow: 'rgba(245, 158, 11, 0.35)', count: adminStats.status_distribution['Pending'] || 0 },
                      { label: 'Accepted', color: 'bg-blue-500', glow: 'rgba(59, 130, 246, 0.35)', count: adminStats.status_distribution['Accepted'] || 0 },
                      { label: 'In Progress', color: 'bg-indigo-500', glow: 'rgba(99, 102, 241, 0.35)', count: adminStats.status_distribution['In Progress'] || 0 },
                      { label: 'Completed', color: 'bg-emerald-500', glow: 'rgba(16, 185, 129, 0.35)', count: adminStats.status_distribution['Completed'] || 0 },
                      { label: 'Cancelled', color: 'bg-red-500', glow: 'rgba(239, 68, 68, 0.35)', count: adminStats.status_distribution['Cancelled'] || 0 },
                    ].filter(s => s.count > 0).map((status, idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${status.color}`} style={{ boxShadow: `0 0 8px ${status.glow}` }} />
                            {status.label}
                          </span>
                          <span className="text-xs font-bold text-white">{status.count} <span className="text-zinc-500 font-normal">({totalBookingsCount > 0 ? Math.round((status.count / totalBookingsCount) * 100) : 0}%)</span></span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${status.color} animate-progress transition-all duration-500 group-hover:brightness-110`}
                            style={{ 
                              width: `${totalBookingsCount > 0 ? (status.count / totalBookingsCount) * 100 : 0}%`,
                              boxShadow: `0 0 10px ${status.glow}`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Bottom status tracker */}
                <div className="mt-6 pt-4 border-t border-zinc-800/60 text-[10px] text-zinc-500 flex items-center justify-between font-semibold">
                  <span>System Health</span>
                  <span className="text-emerald-400">Excellent</span>
                </div>
              </div>
            )}
          </div>

            {/* Bottom 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-8">
              {/* Column 1: Recent Providers */}
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700/80 hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-black/10 noise-texture">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-white">Recent Providers</h4>
                  <a href="#" onClick={() => setActiveTab('providers')} className="text-xs font-semibold text-[#5E5CE6] hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {providers.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No providers yet</p>
                  ) : (
                    providers.slice(0, 3).map((prov: any, i: number) => {
                      const name = prov.display_name || `${prov.first_name || ''} ${prov.last_name || ''}`.trim() || prov.username || 'Provider';
                      return (
                        <div key={i} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                          <SafeAvatar src={prov.profile_image} name={name} className="w-10 h-10 rounded-full border border-zinc-800" />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-white truncate">{name}</h5>
                            <p className="text-[10px] text-zinc-450 truncate">{prov.email || prov.username}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <span className="text-[10px] text-zinc-500">★ {prov.rating || 0}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prov.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                            {prov.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 2: Recent Customers */}
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700/80 hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-black/10 noise-texture">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-white">Recent Customers</h4>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('customers'); }} className="text-xs font-semibold text-[#5E5CE6] hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {customers.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No customers yet</p>
                  ) : (
                    customers.slice(0, 3).map((c: any, i: number) => {
                      const name = c.display_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Customer';
                      return (
                        <div key={i} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                          <SafeAvatar src={c.profile_image} name={name} className="w-10 h-10 rounded-full border border-zinc-800 flex-shrink-0" />
                          <div className="min-w-0 flex-1 text-left">
                            <h5 className="text-xs font-bold text-white truncate">{name}</h5>
                            <p className="text-[10px] text-zinc-450 truncate">{c.email || c.username}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                            {c.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 3: Recent Bookings */}
              <div className="panel-dark bg-[#18181A] border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700/80 hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-black/10 noise-texture">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-sm font-bold text-white">Recent Bookings</h4>
                  <a href="#" onClick={() => setActiveTab('bookings')} className="text-xs font-semibold text-[#5E5CE6] hover:underline">View All</a>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No bookings yet</p>
                  ) : (
                    bookings.slice(0, 3).map((bk: any, i: number) => {
                      const statusColors: Record<string, string> = {
                        'Pending': 'bg-amber-950/45 text-amber-500 border-amber-900/40',
                        'Accepted': 'bg-blue-950/45 text-blue-400 border-blue-900/40',
                        'On The Way': 'bg-cyan-950/45 text-cyan-400 border-cyan-900/40',
                        'In Progress': 'bg-indigo-950/45 text-indigo-400 border-indigo-900/40',
                        'Completed': 'bg-emerald-950/45 text-emerald-400 border-emerald-900/40',
                        'Cancelled': 'bg-red-950/45 text-red-400 border-red-900/40',
                      };
                      const statusClass = statusColors[bk.status] || statusColors['Pending'];
                      const shortId = (bk.id || bk._id || '').slice(-6).toUpperCase();
                      return (
                        <div key={i} className="flex items-center justify-between gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-[#5E5CE6]/10 border border-[#5E5CE6]/20 flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#5E5CE6]/5">
                              <Calendar className="w-4 h-4 text-[#5E5CE6]" />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <h5 className="text-xs font-bold text-white truncate">Booking #{shortId}</h5>
                              <p className="text-[10px] text-zinc-450 truncate">
                                {bk.date || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${statusClass}`}>{bk.status}</span>
                        </div>
                      );
                    })
                  )}
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

                {/* Tax & Advance Payment Settings */}
                <div className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl p-6 animate-fade-in-up delay-150">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Tax & Advance Payment</h3>
                      <p className="text-xs text-zinc-500">Tax rate and advance booking deposit settings</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tax Percentage (%)</label>
                      <input type="number" step="0.1" value={settingsForm.tax_percentage} onChange={(e) => setSettingsForm(p => ({ ...p, tax_percentage: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="5.0" />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Advance Payment %</label>
                        <input type="number" step="0.1" value={settingsForm.advance_payment_percentage} onChange={(e) => setSettingsForm(p => ({ ...p, advance_payment_percentage: e.target.value }))} disabled={!settingsForm.advance_payment_enabled} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors disabled:opacity-40" placeholder="10" />
                      </div>
                      <button type="button" onClick={() => setSettingsForm(p => ({ ...p, advance_payment_enabled: !p.advance_payment_enabled }))} className={`mb-0.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex-shrink-0 ${settingsForm.advance_payment_enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                        {settingsForm.advance_payment_enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl p-6 animate-fade-in-up delay-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Cancellation Charge Policy</h3>
                      <p className="text-xs text-zinc-500">Fee charged if cancelled within specified hours</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Charge (%)</label>
                      <input type="number" step="0.1" value={settingsForm.cancellation_charge_percentage} onChange={(e) => setSettingsForm(p => ({ ...p, cancellation_charge_percentage: e.target.value }))} disabled={!settingsForm.cancellation_charge_enabled} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors disabled:opacity-40" placeholder="5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Within Hours</label>
                      <input type="number" value={settingsForm.cancellation_hours} onChange={(e) => setSettingsForm(p => ({ ...p, cancellation_hours: e.target.value }))} disabled={!settingsForm.cancellation_charge_enabled} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors disabled:opacity-40" placeholder="2" />
                    </div>
                    <button type="button" onClick={() => setSettingsForm(p => ({ ...p, cancellation_charge_enabled: !p.cancellation_charge_enabled }))} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${settingsForm.cancellation_charge_enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                      {settingsForm.cancellation_charge_enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Support Settings */}
                <div className="panel-dark bg-[#111112] border border-zinc-800 rounded-2xl p-6 animate-fade-in-up delay-300">
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

        {/* ────────────────── COUPONS TAB ────────────────── */}
        {activeTab === 'coupons' && (
          <div className="animate-tab-content">
            <div className="flex items-center justify-between mb-6">
              <div />
              <button onClick={() => setIsCouponModalOpen(true)} className="flex items-center gap-2 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" /> New Coupon
              </button>
            </div>
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" /></div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No coupons yet. Create your first coupon!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon: any) => (
                  <div key={coupon.id} className="bg-[#111112] border border-zinc-800 rounded-2xl p-5 animate-fade-in-up card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-[#5E5CE6]/10 border border-[#5E5CE6]/20 rounded-xl px-3 py-1.5">
                        <span className="text-[#5E5CE6] font-bold text-sm tracking-widest">{coupon.code}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${coupon.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {coupon.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <p className="text-white font-bold text-lg">
                        {coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                      </p>
                      {coupon.min_order_amount > 0 && (
                        <p className="text-xs text-zinc-500">Min order: ${coupon.min_order_amount}</p>
                      )}
                      {coupon.expiry_date && (
                        <p className="text-xs text-zinc-500">Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</p>
                      )}
                      {coupon.usage_limit && (
                        <p className="text-xs text-zinc-500">Used: {coupon.used_count || 0} / {coupon.usage_limit}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleCouponStatus(coupon)} className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${coupon.status === 1 ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}>
                        {coupon.status === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────────── HELP DESK TAB ────────────────── */}
        {activeTab === 'helpdesk' && (
          <div className="animate-tab-content">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {['All', 'Open', 'Closed'].map(f => (
                <button key={f} onClick={() => setHelpFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${helpFilter === f ? 'bg-[#5E5CE6] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>{f}</button>
              ))}
              <button onClick={fetchHelpDesk} className="ml-auto p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"><RefreshCw className="w-4 h-4" /></button>
            </div>
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {helpTickets.filter((t: any) => helpFilter === 'All' || t.status === helpFilter).length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">No tickets found.</div>
                ) : helpTickets.filter((t: any) => helpFilter === 'All' || t.status === helpFilter).map((ticket: any) => (
                  <div key={ticket.id} className="bg-[#111112] border border-zinc-800 rounded-2xl p-5 animate-fade-in-up card-hover">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${ticket.status === 'Open' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{ticket.status}</span>
                          <span className="text-xs text-zinc-500">{ticket.category}</span>
                        </div>
                        <p className="font-bold text-white text-sm mb-1 truncate">{ticket.title}</p>
                        <p className="text-sm text-zinc-400 line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-zinc-600 mt-2">By {ticket.user_name} ({ticket.user_type}) · {ticket.created_at?.slice(0, 10)}</p>
                        {ticket.admin_reply && (
                          <div className="mt-3 bg-[#5E5CE6]/10 border border-[#5E5CE6]/20 rounded-xl p-3">
                            <p className="text-xs font-bold text-[#5E5CE6] mb-1">Admin Reply:</p>
                            <p className="text-xs text-zinc-300">{ticket.admin_reply}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {ticket.status === 'Open' ? (
                          <button onClick={() => handleOpenReply(ticket)} className="px-3 py-1.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold text-xs rounded-xl transition-all">Reply</button>
                        ) : (
                          <button onClick={() => handleReopenTicket(ticket.id)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all">Reopen</button>
                        )}
                        <button onClick={() => handleDeleteTicket(ticket.id)} className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all self-end"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────────── COMMISSIONS TAB ────────────────── */}
        {activeTab === 'commissions' && (
          <div className="animate-tab-content">
            <div className="flex items-center justify-between mb-6">
              <div />
              <button onClick={() => setIsCommissionModalOpen(true)} className="flex items-center gap-2 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" /> New Commission
              </button>
            </div>
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" /></div>
            ) : commissions.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No commission rules. Create your first one!</div>
            ) : (
              <div className="bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Handyman</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Value</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c: any, i: number) => (
                      <tr key={c.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                        <td className="px-5 py-3.5 font-semibold text-white">{c.name}</td>
                        <td className="px-5 py-3.5 text-zinc-400">{c.handyman_name || 'All'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${c.commission_type === 'percent' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {c.commission_type === 'percent' ? 'Percent' : 'Flat'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-white">{c.commission_type === 'percent' ? `${c.commission_value}%` : `$${c.commission_value}`}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => handleDeleteCommission(c.id)} className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ────────────────── BLOGS TAB ────────────────── */}
        {activeTab === 'blogs' && (
          <div className="animate-tab-content">
            <div className="flex items-center justify-between mb-6">
              <div />
              <button onClick={() => setIsBlogModalOpen(true)} className="flex items-center gap-2 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" /> New Blog Post
              </button>
            </div>
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" /></div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No blog posts yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {blogs.map((blog: any) => (
                  <div key={blog.id} className="bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in-up card-hover">
                    {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-[#5E5CE6]/10 text-[#5E5CE6] px-2 py-0.5 rounded-lg">{blog.category}</span>
                        <span className="text-xs text-zinc-500">{blog.read_time}</span>
                        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-lg ${blog.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>{blog.status === 1 ? 'Published' : 'Draft'}</span>
                      </div>
                      <h3 className="font-bold text-white mb-1 line-clamp-1">{blog.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">{blog.description}</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleOpenEditBlog(blog)} className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2 rounded-xl transition-all">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
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

        {/* ────────────────── WITHDRAWALS TAB ────────────────── */}
        {activeTab === 'withdrawals' && (
          <div className="animate-tab-content">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                <button key={f} onClick={() => setWithdrawalFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${withdrawalFilter === f ? 'bg-[#5E5CE6] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>{f}</button>
              ))}
              <button onClick={fetchWithdrawals} className="ml-auto p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"><RefreshCw className="w-4 h-4" /></button>
            </div>
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {withdrawals.filter((w: any) => withdrawalFilter === 'All' || w.status === withdrawalFilter).length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">No withdrawal requests found.</div>
                ) : withdrawals.filter((w: any) => withdrawalFilter === 'All' || w.status === withdrawalFilter).map((w: any) => (
                  <div key={w.id} className="bg-[#111112] border border-zinc-800 rounded-2xl p-5 animate-fade-in-up card-hover">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white">{w.user_name}</p>
                          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-lg">{w.user_type}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${w.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : w.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{w.status}</span>
                        </div>
                        <p className="text-2xl font-extrabold text-white">${w.amount?.toFixed(2)}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-500">
                          {w.payment_method && <span>Via: {w.payment_method}</span>}
                          {w.bank_name && <span>Bank: {w.bank_name}</span>}
                          {w.account_number && <span>Acc: ****{w.account_number?.slice(-4)}</span>}
                          <span>{w.created_at?.slice(0, 10)}</span>
                        </div>
                      </div>
                      {w.status === 'Pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleWithdrawalAction(w.id, 'Approved')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-sm rounded-xl transition-all">Approve</button>
                          <button onClick={() => handleWithdrawalAction(w.id, 'Rejected')} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm rounded-xl transition-all">Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────────── ANALYTICS TAB ────────────────── */}
        {activeTab === 'analytics' && (
          <div className="animate-tab-content">
            <div className="flex items-center justify-end mb-6">
              <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold transition-all"><RefreshCw className="w-4 h-4" /> Refresh</button>
            </div>
            {tabLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-[#5E5CE6] animate-spin" /></div>
            ) : !analytics ? (
              <div className="text-center py-20 text-zinc-500">No analytics data available yet.</div>
            ) : (
              <div className="space-y-6">
                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `$${analytics.monthly_revenue?.reduce((a: number, m: any) => a + m.revenue, 0).toFixed(2) || '0.00'}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Completed', value: analytics.status_breakdown?.['Completed'] || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Pending', value: analytics.status_breakdown?.['Pending'] || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Cancelled', value: analytics.status_breakdown?.['Cancelled'] || 0, color: 'text-red-400', bg: 'bg-red-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} border border-zinc-800 rounded-2xl p-5 animate-fade-in-up`} style={{animationDelay: `${i * 80}ms`}}>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly Revenue Chart */}
                {analytics.monthly_revenue && analytics.monthly_revenue.length > 0 && (
                  <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Monthly Revenue</h3>
                    <div className="flex items-end gap-2 h-40">
                      {(() => {
                        const maxRev = Math.max(...analytics.monthly_revenue.map((m: any) => m.revenue), 1);
                        return analytics.monthly_revenue.map((m: any, i: number) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-zinc-500 font-bold">${m.revenue > 0 ? m.revenue.toFixed(0) : ''}</span>
                            <div
                              className="w-full bg-[#5E5CE6] rounded-t-lg transition-all hover:bg-[#7B79F2] cursor-pointer"
                              style={{ height: `${Math.max((m.revenue / maxRev) * 100, 4)}%` }}
                              title={`${m.month}: $${m.revenue.toFixed(2)}`}
                            />
                            <span className="text-[10px] text-zinc-500">{m.month}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Top Services */}
                {analytics.top_services && analytics.top_services.length > 0 && (
                  <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Top Services by Bookings</h3>
                    <div className="space-y-3">
                      {analytics.top_services.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-bold text-zinc-600 w-5 flex-shrink-0">#{i + 1}</span>
                            <span className="text-sm font-semibold text-white truncate">{s.service}</span>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0 text-right">
                            <span className="text-xs text-zinc-500">{s.bookings} bookings</span>
                            <span className="text-sm font-bold text-emerald-400">${s.revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Breakdown */}
                {analytics.status_breakdown && Object.keys(analytics.status_breakdown).length > 0 && (
                  <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Booking Status Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(analytics.status_breakdown).map(([status, count]: [string, any]) => {
                        const colors: Record<string, string> = {
                          Completed: 'bg-emerald-500/10 text-emerald-400',
                          Pending: 'bg-amber-500/10 text-amber-400',
                          Cancelled: 'bg-red-500/10 text-red-400',
                          Accepted: 'bg-blue-500/10 text-blue-400',
                          Ongoing: 'bg-purple-500/10 text-purple-400',
                        };
                        return (
                          <div key={status} className={`${colors[status] || 'bg-zinc-800/50 text-zinc-400'} rounded-xl p-4 text-center`}>
                            <p className="text-2xl font-extrabold">{count}</p>
                            <p className="text-xs font-bold mt-1">{status}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ──────────── ZONES TAB ──────────── */}
        {activeTab === 'zones' && (
          <div className="animate-tab-content">
            <div className="flex justify-end mb-6">
              <button onClick={() => setIsZoneModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" />Create Zone
              </button>
            </div>
            {tabLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" /></div> : zones.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No service zones yet. Create your first zone.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map(z => (
                  <div key={z.id} className="bg-[#111112] border border-zinc-800 rounded-2xl p-5 card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white">{z.name}</h3>
                        {z.description && <p className="text-xs text-zinc-500 mt-1">{z.description}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${z.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-400'}`}>{z.status === 1 ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleDeleteZone(z.id)} className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────── TAXES TAB ──────────── */}
        {activeTab === 'taxes' && (
          <div className="animate-tab-content">
            <div className="flex justify-end mb-6">
              <button onClick={() => setIsTaxModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" />Add Tax
              </button>
            </div>
            {tabLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" /></div> : taxes.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No taxes configured yet.</div>
            ) : (
              <div className="bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-zinc-800 text-left"><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Name</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Rate</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Status</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Actions</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {taxes.map(t => (
                      <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{t.name}</td>
                        <td className="px-6 py-4 text-zinc-300">{t.percentage}%</td>
                        <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-400'}`}>{t.status === 1 ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleToggleTax(t)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">{t.status === 1 ? 'Disable' : 'Enable'}</button>
                            <button onClick={() => handleDeleteTax(t.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ──────────── SERVICE ADD-ONS TAB ──────────── */}
        {activeTab === 'addons' && (
          <div className="animate-tab-content">
            <div className="flex justify-end mb-6">
              <button onClick={() => setIsAddonModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" />Add Service Add-on
              </button>
            </div>
            {tabLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" /></div> : addons.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No service add-ons yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addons.map(a => (
                  <div key={a.id} className="bg-[#111112] border border-zinc-800 rounded-2xl p-5 card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white">{a.name}</h3>
                        {a.description && <p className="text-xs text-zinc-500 mt-1">{a.description}</p>}
                        <p className="text-lg font-extrabold text-[#5E5CE6] mt-2">${parseFloat(a.price || 0).toFixed(2)}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-400'}`}>{a.status === 1 ? 'Active' : 'Inactive'}</span>
                    </div>
                    <button onClick={() => handleDeleteAddon(a.id)} className="w-full mt-4 py-2 text-xs font-bold rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────── SUBSCRIPTION PLANS TAB ──────────── */}
        {activeTab === 'plans' && (
          <div className="animate-tab-content">
            <div className="flex justify-end mb-6">
              <button onClick={() => setIsPlanModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">
                <Plus className="w-4 h-4" />Create Plan
              </button>
            </div>
            {tabLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" /></div> : plans.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No subscription plans yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(p => (
                  <div key={p.id} className="bg-[#111112] border border-zinc-800 rounded-2xl p-6 card-hover flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-extrabold text-white text-lg">{p.name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/40 text-zinc-400'}`}>{p.status === 1 ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="text-3xl font-extrabold text-[#5E5CE6]">${parseFloat(p.price || 0).toFixed(2)}<span className="text-sm text-zinc-500 font-normal">/{p.duration_days}d</span></p>
                    {p.max_bookings !== -1 && <p className="text-xs text-zinc-500 mt-1">Up to {p.max_bookings} bookings</p>}
                    {p.features && p.features.length > 0 && (
                      <ul className="mt-4 space-y-1.5 flex-1">
                        {p.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-zinc-300"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{f}</li>
                        ))}
                      </ul>
                    )}
                    <button onClick={() => handleDeletePlan(p.id)} className="mt-5 w-full py-2 text-xs font-bold rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete Plan</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────── POST JOBS TAB ──────────── */}
        {activeTab === 'postjobs' && (
          <div className="animate-tab-content">
            <div className="flex gap-2 mb-6">
              {['All', 'Open', 'Assigned', 'Completed', 'Cancelled'].map(f => (
                <button key={f} onClick={() => { setPostJobFilter(f); setTimeout(fetchPostJobs, 0); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${postJobFilter === f ? 'bg-[#5E5CE6] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{f}</button>
              ))}
            </div>
            {tabLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" /></div> : postJobs.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">No post job requests found.</div>
            ) : (
              <div className="bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-zinc-800 text-left"><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Job</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Customer</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Budget</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Bids</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Status</th><th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Actions</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {postJobs.map(j => (
                      <tr key={j.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{j.title}</p>
                          {j.description && <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">{j.description}</p>}
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{j.user_name}</td>
                        <td className="px-6 py-4 text-zinc-300">{j.budget_min > 0 ? `$${j.budget_min}–$${j.budget_max}` : 'Negotiable'}</td>
                        <td className="px-6 py-4 text-zinc-300">{j.bid_count || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${j.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400' : j.status === 'Assigned' ? 'bg-blue-500/10 text-blue-400' : j.status === 'Completed' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'}`}>{j.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeletePostJob(j.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ──────────── PUSH NOTIFICATIONS TAB ──────────── */}
        {activeTab === 'notifications' && (
          <div className="animate-tab-content max-w-2xl mx-auto">
            <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-white mb-4">Send Push Notification</h3>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                  <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors" placeholder="Notification title" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors h-24 resize-none" placeholder="Notification message" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Target Audience</label>
                  <select value={notifUserType} onChange={e => setNotifUserType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]">
                    <option value="all">All Users</option>
                    <option value="user">Customers Only</option>
                    <option value="provider">Providers Only</option>
                    <option value="handyman">Handymen Only</option>
                  </select>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-xs text-amber-400">⚠️ OneSignal credentials must be configured in the backend .env for notifications to actually send. Without them, the request is logged but not delivered.</p>
                </div>
                <button type="submit" disabled={notifSending} className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {notifSending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Zap className="w-4 h-4" />Send Notification</>}
                </button>
              </form>
            </div>
            {notifLogs.length > 0 && (
              <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                  {notifLogs.slice(0, 10).map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-xl">
                      <Zap className="w-4 h-4 text-[#5E5CE6] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{n.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{n.message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-zinc-500">{n.recipient_count} recipients</span>
                        <p className="text-xs text-zinc-600">{n.user_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────── PAYMENT GATEWAYS TAB ──────────── */}
        {activeTab === 'payment-gateways' && (
          <div className="animate-tab-content max-w-2xl mx-auto">
            {tabLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#5E5CE6] animate-spin" /></div> : !paymentGateways ? (
              <div className="text-center py-20 text-zinc-500">Loading...</div>
            ) : (
              <form onSubmit={handleSaveGateways} className="space-y-4">
                {/* COD */}
                <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Basic Payment Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">Cash on Delivery</p>
                        <p className="text-xs text-zinc-500">Allow customers to pay in cash</p>
                      </div>
                      <button type="button" onClick={() => setPaymentGateways({...paymentGateways, cash_on_delivery_enabled: !paymentGateways.cash_on_delivery_enabled})} className={`w-12 h-6 rounded-full transition-colors relative ${paymentGateways.cash_on_delivery_enabled ? 'bg-[#5E5CE6]' : 'bg-zinc-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentGateways.cash_on_delivery_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">Wallet Payment</p>
                        <p className="text-xs text-zinc-500">Allow customers to pay from wallet</p>
                      </div>
                      <button type="button" onClick={() => setPaymentGateways({...paymentGateways, wallet_payment_enabled: !paymentGateways.wallet_payment_enabled})} className={`w-12 h-6 rounded-full transition-colors relative ${paymentGateways.wallet_payment_enabled ? 'bg-[#5E5CE6]' : 'bg-zinc-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentGateways.wallet_payment_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Stripe */}
                <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white">Stripe</h3>
                      <p className="text-xs text-zinc-500">Credit/debit card payments</p>
                    </div>
                    <button type="button" onClick={() => setPaymentGateways({...paymentGateways, stripe_enabled: !paymentGateways.stripe_enabled})} className={`w-12 h-6 rounded-full transition-colors relative ${paymentGateways.stripe_enabled ? 'bg-[#5E5CE6]' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentGateways.stripe_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {paymentGateways.stripe_enabled && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Stripe Publishable Key</label>
                      <input value={paymentGateways.stripe_publishable_key || ''} onChange={e => setPaymentGateways({...paymentGateways, stripe_publishable_key: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="pk_live_..." />
                    </div>
                  )}
                </div>
                {/* Razorpay */}
                <div className="bg-[#111112] border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white">Razorpay</h3>
                      <p className="text-xs text-zinc-500">India-focused payment gateway</p>
                    </div>
                    <button type="button" onClick={() => setPaymentGateways({...paymentGateways, razorpay_enabled: !paymentGateways.razorpay_enabled})} className={`w-12 h-6 rounded-full transition-colors relative ${paymentGateways.razorpay_enabled ? 'bg-[#5E5CE6]' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentGateways.razorpay_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {paymentGateways.razorpay_enabled && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Razorpay Key ID</label>
                      <input value={paymentGateways.razorpay_key_id || ''} onChange={e => setPaymentGateways({...paymentGateways, razorpay_key_id: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="rzp_live_..." />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={gwSaving} className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {gwSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Payment Gateways</>}
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* ──── ZONE MODAL ──── */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button onClick={() => setIsZoneModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Create Service Zone</h3>
            <form onSubmit={handleCreateZone} className="space-y-4">
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Zone Name *</label><input value={zoneName} onChange={e => setZoneName(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="e.g. Downtown, North Zone" /></div>
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label><textarea value={zoneDesc} onChange={e => setZoneDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] h-20 resize-none" placeholder="Zone coverage area description" /></div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all">Create Zone</button>
            </form>
          </div>
        </div>
      )}

      {/* ──── TAX MODAL ──── */}
      {isTaxModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button onClick={() => setIsTaxModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Add Tax Rate</h3>
            <form onSubmit={handleCreateTax} className="space-y-4">
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tax Name *</label><input value={taxName} onChange={e => setTaxName(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="e.g. GST, VAT, Service Tax" /></div>
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Rate (%) *</label><input type="number" value={taxPercentage} onChange={e => setTaxPercentage(e.target.value)} required min="0" max="100" step="0.01" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="5.0" /></div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all">Add Tax</button>
            </form>
          </div>
        </div>
      )}

      {/* ──── ADDON MODAL ──── */}
      {isAddonModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button onClick={() => setIsAddonModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Add Service Add-on</h3>
            <form onSubmit={handleCreateAddon} className="space-y-4">
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Add-on Name *</label><input value={addonName} onChange={e => setAddonName(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="e.g. Deep Cleaning, Extra Polish" /></div>
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Price *</label><input type="number" value={addonPrice} onChange={e => setAddonPrice(e.target.value)} required min="0" step="0.01" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="9.99" /></div>
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label><textarea value={addonDesc} onChange={e => setAddonDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] h-20 resize-none" /></div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all">Create Add-on</button>
            </form>
          </div>
        </div>
      )}

      {/* ──── PLAN MODAL ──── */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal my-4">
            <button onClick={() => setIsPlanModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Create Subscription Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Plan Name *</label><input value={planName} onChange={e => setPlanName(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="e.g. Basic, Pro, Enterprise" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Price ($) *</label><input type="number" value={planPrice} onChange={e => setPlanPrice(e.target.value)} required min="0" step="0.01" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" placeholder="29.99" /></div>
                <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Duration (days) *</label><input type="number" value={planDuration} onChange={e => setPlanDuration(e.target.value)} required min="1" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" /></div>
              </div>
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Max Bookings (-1 = unlimited)</label><input type="number" value={planMaxBookings} onChange={e => setPlanMaxBookings(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6]" /></div>
              <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Features (one per line)</label><textarea value={planFeatures} onChange={e => setPlanFeatures(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] h-24 resize-none" placeholder={"Priority listing\nUnlimited bookings\n24/7 support"} /></div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all">Create Plan</button>
            </form>
          </div>
        </div>
      )}

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
                    <option key={idx} value={svc.name}>{svc.name} (${svc.price ?? svc.base_price ?? 0})</option>
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

      {/* -------------------- CREATE COUPON MODAL -------------------- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button onClick={() => setIsCouponModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Create Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Coupon Code</label>
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors uppercase tracking-widest font-mono" placeholder="e.g. SAVE20" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Discount Type</label>
                  <select value={couponDiscountType} onChange={(e) => setCouponDiscountType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors">
                    <option value="flat">Flat Amount</option>
                    <option value="percent">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Value {couponDiscountType === 'percent' ? '(%)' : '($)'}</label>
                  <input type="number" step="0.01" value={couponDiscountValue} onChange={(e) => setCouponDiscountValue(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="10" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Min Order ($)</label>
                  <input type="number" step="0.01" value={couponMinOrder} onChange={(e) => setCouponMinOrder(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Usage Limit</label>
                  <input type="number" value={couponUsageLimit} onChange={(e) => setCouponUsageLimit(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="Unlimited" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                <input type="date" value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">Create Coupon</button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- HELP DESK REPLY MODAL -------------------- */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button onClick={() => setIsReplyModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Reply & Close Ticket</h3>
            <form onSubmit={handleReplyTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Admin Reply</label>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors h-28 resize-none" placeholder="Type your reply here..." required />
              </div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">Send Reply & Close Ticket</button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- CREATE COMMISSION MODAL -------------------- */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in-modal">
            <button onClick={() => setIsCommissionModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Add Commission Rule</h3>
            <form onSubmit={handleCreateCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Rule Name</label>
                <input type="text" value={commissionName} onChange={(e) => setCommissionName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="e.g. Standard Commission" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Type</label>
                  <select value={commissionType} onChange={(e) => setCommissionType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Value</label>
                  <input type="number" step="0.01" value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder={commissionType === 'percent' ? '15' : '10.00'} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Assign to Handyman (optional)</label>
                <select value={commissionHandymanId} onChange={(e) => setCommissionHandymanId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors">
                  <option value="">All Handymen (global)</option>
                  {providers.filter((p: any) => p.user_type === 'handyman').map((p: any) => (
                    <option key={p.id} value={p.id}>{p.display_name || `${p.first_name} ${p.last_name}`}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">Create Commission Rule</button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- CREATE BLOG MODAL -------------------- */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-scale-in-modal my-4">
            <button onClick={() => setIsBlogModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Create Blog Post</h3>
            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="Blog post title" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Short Description</label>
                <textarea value={blogDesc} onChange={(e) => setBlogDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors h-20 resize-none" placeholder="Brief summary..." required />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Full Content</label>
                <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors h-32 resize-none" placeholder="Full article content..." required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input type="text" value={blogCategory} onChange={(e) => setBlogCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="General" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Read Time</label>
                  <input type="text" value={blogReadTime} onChange={(e) => setBlogReadTime(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="5 min read" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cover Image URL</label>
                <input type="url" value={blogImage} onChange={(e) => setBlogImage(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#5E5CE6] transition-colors" placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">Publish Blog Post</button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- EDIT BLOG MODAL -------------------- */}
      {isEditBlogModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-scale-in-modal my-4">
            <button onClick={() => setIsEditBlogModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-6">Edit Blog Post</h3>
            <form onSubmit={handleUpdateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={editBlogTitle} onChange={(e) => setEditBlogTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Short Description</label>
                <textarea value={editBlogDesc} onChange={(e) => setEditBlogDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors h-20 resize-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Full Content</label>
                <textarea value={editBlogContent} onChange={(e) => setEditBlogContent(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors h-32 resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input type="text" value={editBlogCategory} onChange={(e) => setEditBlogCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Read Time</label>
                  <input type="text" value={editBlogReadTime} onChange={(e) => setEditBlogReadTime(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cover Image URL</label>
                <input type="url" value={editBlogImage} onChange={(e) => setEditBlogImage(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#5E5CE6] transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#5E5CE6] hover:bg-[#4E4CD6] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#5E5CE6]/20">Save Changes</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
