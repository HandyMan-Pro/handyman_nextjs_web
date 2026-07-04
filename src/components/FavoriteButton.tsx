'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface FavoriteButtonProps {
  providerId: string;
  initialIsFavorited: boolean;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}

export default function FavoriteButton({
  providerId,
  initialIsFavorited,
  onToggle,
  className = ''
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent card clicks
    
    if (loading) return;

    const targetState = !isFavorited;
    
    // Optimistic UI Update
    setIsFavorited(targetState);
    
    try {
      const response = await apiClient.post('/user/favorites/toggle', {
        provider_id: providerId
      });
      
      const serverState = response.data?.is_favorited;
      if (typeof serverState === 'boolean') {
        setIsFavorited(serverState);
        if (onToggle) onToggle(serverState);
      } else {
        if (onToggle) onToggle(targetState);
      }
    } catch (error) {
      console.error('Failed to toggle favorite status:', error);
      // Revert optimistic state on error
      setIsFavorited(!targetState);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full bg-zinc-950/40 backdrop-blur-sm border border-zinc-800/80 hover:bg-zinc-900/80 transition-all active:scale-90 group ${className}`}
      title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-300 ${
          isFavorited
            ? 'text-rose-500 fill-rose-500 scale-110 animate-bounce-in'
            : 'text-zinc-400 group-hover:text-rose-500 group-hover:scale-110'
        }`}
      />
    </button>
  );
}
