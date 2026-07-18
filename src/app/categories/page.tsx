'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { apiClient } from '../../lib/apiClient';
import {
  Wrench, Sparkles, Zap, Wind, Shield, ChevronLeft, Loader2, ArrowRight, Sun, Moon
} from 'lucide-react';
import Link from 'next/link';
import FrontendNavbar from '../../components/FrontendNavbar';

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('ac') || lower.includes('cool')) return Wind;
  if (lower.includes('clean') || lower.includes('sanitiz')) return Sparkles;
  if (lower.includes('wire') || lower.includes('electric')) return Zap;
  if (lower.includes('guard') || lower.includes('secur')) return Shield;
  return Wrench;
};

const getGradient = (str: string) => {
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-indigo-500/30 to-purple-500/30 text-indigo-400',
    'from-emerald-500/30 to-teal-500/30 text-emerald-400',
    'from-cyan-500/30 to-blue-500/30 text-cyan-400',
    'from-amber-500/30 to-orange-500/30 text-amber-400',
    'from-rose-500/30 to-pink-500/30 text-rose-400'
  ];
  return gradients[hash % gradients.length];
};

function CategoryCard({ cat, idx, router }: { cat: any, idx: number, router: any }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  const Icon = getCategoryIcon(cat.name);
  const gradient = getGradient(cat.name);

  return (
    <motion.div
      key={cat.id || cat.name}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 + (idx * 0.05), type: "spring", bounce: 0.4 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onClick={() => router.push(`/categories/${encodeURIComponent(cat.name)}`)}
      className="group cursor-pointer relative bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-6 shadow-xl dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-indigo-500/30 dark:hover:shadow-[0_20px_40px_-15px_rgba(94,92,230,0.4)] transition-colors duration-500"
    >
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 dark:via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 z-10 pointer-events-none rounded-[32px]"></div>

      <div style={{ transform: "translateZ(30px)" }}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${gradient} border border-current/20 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}>
          <Icon className="w-6 h-6 relative z-10" />
          <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {cat.name}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-medium">
          {cat.description || `Professional ${cat.name.toLowerCase()} services.`}
        </p>
      </div>

      <div style={{ transform: "translateZ(40px)" }} className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
        <div className="w-10 h-10 rounded-full border border-indigo-500/50 dark:border-white/20 flex items-center justify-center bg-indigo-50 dark:bg-white/10 backdrop-blur-md shadow-lg shadow-indigo-500/20">
          <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-white" strokeWidth={3} />
        </div>
      </div>
    </motion.div>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Theme setup
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        setCategories([
          { id: "c1", name: "AC CoolCare", description: "Experience Enhanced Comfort With Our AC CoolCare Service. From swift repairs to seamless installations, we've got your cooling needs covered." },
          { id: "c2", name: "Appliance Repair", description: "Expert repair services for all your household appliances." },
          { id: "c3", name: "Carpentry", description: "Custom furniture, repairs, and woodwork." },
          { id: "c4", name: "Electrical", description: "Safe and reliable electrical repairs and installations." },
          { id: "c5", name: "Landscaping", description: "Garden maintenance, lawn care, and landscaping services." },
          { id: "c6", name: "Painting", description: "Interior and exterior painting services for your home." },
          { id: "c7", name: "Plumber", description: "Professional plumbing repairs, pipe fixing, and leak detection." },
          { id: "c8", name: "Sanitization", description: "Complete home and office sanitization, disinfection, and cleaning." },
          { id: "c9", name: "Security Guard", description: "Personal protection, event security, and asset guarding." },
          { id: "c10", name: "Smart Home", description: "Configure, automate, and upgrade your home entertainment system." }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

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

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-800 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-hidden">
      
      {/* Ambient Glows (Moved to page level for seamless background) */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen hidden dark:block"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden dark:block"></div>

      {/* Navbar */}
      <FrontendNavbar />

      {/* Ultra Premium Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-16 pb-12 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-2xl mb-6"
          >
            Explore <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-[#5E5CE6] to-purple-500 relative inline-block">
              <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20 -z-10 hidden dark:block"></span>
              All Categories
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl font-medium leading-relaxed"
          >
            Browse our comprehensive directory of professional handyman services. Click any category to view available services.
          </motion.p>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-16" style={{ perspective: "1000px" }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedCategories.map((cat, idx) => (
              <CategoryCard key={cat.id || cat.name} cat={cat} idx={idx} router={router} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
