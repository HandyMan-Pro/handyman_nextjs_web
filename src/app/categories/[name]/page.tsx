'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient } from '../../../lib/apiClient';
import { ChevronLeft, Loader2, Star, Clock, User, ArrowRight, MapPin, Wrench, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import FrontendNavbar from '../../../components/FrontendNavbar';

export default function CategoryDetailsPage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const categoryName = decodeURIComponent(params.name);
  
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Theme setup
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const fetchServices = async () => {
      try {
        const res = await apiClient.get('/services');
        if (res.data && res.data.length > 0) {
          // Filter services by category
          const filtered = res.data.filter((s: any) => 
            s.category?.toLowerCase() === categoryName.toLowerCase()
          );
          setServices(filtered.length > 0 ? filtered : []);
        }
      } catch (err) {
        // Mock fallback data if API fails
        const mockServices = [
          {
            id: "s1", name: "Premium " + categoryName + " Service", price: 45.00, duration: "30 Min", 
            category: categoryName, handyman_name: "James Wilson", rating: 5, reviews: 12,
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
          },
          {
            id: "s2", name: "Quick " + categoryName + " Fix", price: 25.00, duration: "15 Min", 
            category: categoryName, handyman_name: "Sarah Chen", rating: 4.8, reviews: 8,
            image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
          }
        ];
        setServices(mockServices);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [categoryName]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-800 dark:text-zinc-100 transition-colors duration-300 font-sans relative overflow-hidden">
      
      {/* Ambient Glows (Moved to page level for seamless background) */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen hidden dark:block"></div>
      
      {/* Navbar */}
      <FrontendNavbar />

      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-16 pb-12 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-6"
          >
            <Wrench className="w-8 h-8" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-lg mb-4"
          >
            {categoryName} Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-zinc-400 font-medium"
          >
            Discover the best professionals for all your {categoryName.toLowerCase()} needs.
          </motion.p>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium">Loading {categoryName} services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Wrench className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Services Found</h3>
            <p className="text-slate-500">We couldn't find any active services under {categoryName} right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={service.id || idx}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1, type: "spring" }}
                onClick={() => router.push(`/?search=${encodeURIComponent(service.name)}`)}
                className="group cursor-pointer bg-white dark:bg-[#121217]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-[0_20px_40px_-15px_rgba(94,92,230,0.3)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/30 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {service.image ? (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Wrench className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-sm flex items-center gap-1 border border-white/20">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {service.rating || "5.0"}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      {service.category}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors">
                    {service.name}
                  </h3>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-zinc-400 mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4" />
                        {service.duration || "1 Hr"}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4" />
                        Local
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden border border-white/10">
                          {service.avatar ? (
                            <img src={service.avatar} alt="Provider" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-1 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 truncate max-w-[80px]">
                          {service.handyman_name || "Pro Fixer"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 dark:text-zinc-500 font-semibold block">Starts at</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">${service.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
