'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient } from '../../lib/apiClient';
import FrontendNavbar from '../../components/FrontendNavbar';
import Image from 'next/image';
import { Search, Loader2, ArrowRight, Star } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiClient.get('/services');
        if (res.data && res.data.length > 0) {
          setServices(res.data);
        }
      } catch (err) {
        setServices([
          { id: "s1", name: "Bodyguard Services", category: "Security Guard", price: 40.00, duration: "20 Min", rating: 5, reviews: 0, image_url: "https://images.unsplash.com/photo-1542327897-4141b355e20e?auto=format&fit=crop&q=80&w=600", provider: { name: "Danny Mark" } },
          { id: "s2", name: "Home Theater Setup", category: "Smart Home", price: 12.00, duration: "26 Min", rating: 5, reviews: 0, image_url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600", provider: { name: "Jennifer Davis" } },
          { id: "s3", name: "Garment Restoration", category: "Sanitization", price: 42.00, duration: "25 Min", rating: 5, reviews: 0, image_url: "https://images.unsplash.com/photo-1563214532-628d0cb09581?auto=format&fit=crop&q=80&w=600", provider: { name: "Jennifer Davis" } },
          { id: "s4", name: "Family Style Dinner Chef", category: "Sanitization", price: 32.00, duration: "20 Min", rating: 5, reviews: 0, image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600", provider: { name: "Jennifer Davis" } }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-800 dark:text-zinc-100 transition-colors duration-300 font-sans relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen hidden dark:block"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden dark:block"></div>
      
      <FrontendNavbar />

      {/* Hero Header */}
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
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 drop-shadow-sm"
          >
            Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400">All Services</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl max-w-2xl text-slate-500 dark:text-zinc-400 mb-10 leading-relaxed font-medium"
          >
            Discover our comprehensive range of professional handyman services tailored to your needs.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative w-full max-w-2xl"
          >
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search services by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-medium transition-all"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-zinc-400 font-medium">Loading premium services...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredServices.map((svc: any, idx: number) => (
                <motion.div
                  key={svc.id || idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative h-full bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-4 flex flex-col hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden group">
                    
                    {/* Glare effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 dark:via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 z-10 pointer-events-none"></div>

                    {/* Image */}
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-5">
                      <Image 
                        src={svc.image_url || 'https://images.unsplash.com/photo-1542327897-4141b355e20e?auto=format&fit=crop&q=80&w=600'} 
                        alt={svc.name} 
                        fill 
                        className="object-cover transform group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {svc.category || 'Service'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {svc.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-black text-emerald-500">${Number(svc.price).toFixed(2)}</span>
                      <span className="text-sm font-medium text-slate-400 dark:text-zinc-500">• {svc.duration || '60 Min'}</span>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                          <Image src="https://i.pravatar.cc/100?img=11" alt="Provider" width={32} height={32} />
                        </div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400 truncate max-w-[100px]">
                          {svc.provider?.name || 'Pro'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{svc.rating || '5.0'}</span>
                      </div>
                    </div>

                    <div style={{ transform: "translateZ(40px)" }} className="absolute bottom-6 right-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
                      <div className="w-10 h-10 rounded-full border border-indigo-500/50 dark:border-white/20 flex items-center justify-center bg-indigo-50 dark:bg-white/10 backdrop-blur-md shadow-lg shadow-indigo-500/20">
                        <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-white" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200/50 dark:border-white/10">
              <p className="text-xl text-slate-500 dark:text-zinc-400 font-medium">No services found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
