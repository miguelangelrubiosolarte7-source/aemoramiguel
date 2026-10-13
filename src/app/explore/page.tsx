'use client';

import React, { useState } from 'react';
import { DEMO_USERS } from '@/shared/security/auth.store';
import { toast } from '@/shared/ui/Toast';
import {
  Compass,
  TrendingUp,
  Search,
  Hash,
  Users,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  const trendingTopics = [
    { tag: 'cybersecurity', posts: '12.4K posts', category: 'Seguridad' },
    { tag: 'owasp', posts: '8.1K posts', category: 'Estándares' },
    { tag: 'cleancode', posts: '6.7K posts', category: 'Arquitectura' },
    { tag: 'designsystems', posts: '5.2K posts', category: 'UI/UX' },
    { tag: 'nextjs', posts: '18.9K posts', category: 'Frontend' },
    { tag: 'zero_trust', posts: '3.8K posts', category: 'Infosec' },
  ];

  const handleToggleFollow = (userId: string, name: string) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter((id) => id !== userId));
      toast('Dejaste de seguir', `Has dejado de seguir a ${name}`, 'info');
    } else {
      setFollowedUsers([...followedUsers, userId]);
      toast('Nuevo seguimiento', `Ahora sigues a ${name} en Aemora 🎉`, 'success');
    }
  };

  const filteredTopics = trendingTopics.filter((t) =>
    t.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Banner de Exploración */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/50 to-slate-900 border border-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Descubre y Conecta</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mb-2">
          Tendencias en Aemora
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-xl">
          Explora los temas más comentados en ingeniería de software, ciberseguridad y diseño de producto.
        </p>

        {/* Barra de Búsqueda Interactiva */}
        <div className="relative mt-4 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por hashtag (#owasp, #design)..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Tendencias */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          Hashtags Populares
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTopics.map((item) => (
            <div
              key={item.tag}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group flex items-center justify-between"
              onClick={() => toast(`Hashtag #${item.tag}`, `Filtrando publicaciones asociadas...`, 'info')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-medium">{item.category}</span>
                  <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    #{item.tag}
                  </span>
                </div>
              </div>

              <span className="text-xs text-slate-500 font-mono">{item.posts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creadores Destacados */}
      <div className="flex flex-col gap-3 mt-2">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          Creadores Recomendados
        </h2>

        <div className="flex flex-col gap-2.5">
          {DEMO_USERS.map((creator) => {
            const isFollowed = followedUsers.includes(creator.id);

            return (
              <div
                key={creator.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate">
                      {creator.displayName}
                    </span>
                    <span className="text-xs text-indigo-400 truncate">@{creator.username}</span>
                    <span className="text-xs text-slate-400 truncate mt-0.5 max-w-md hidden sm:block">
                      {creator.bio}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFollow(creator.id, creator.displayName)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isFollowed
                      ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-red-950/40 hover:text-red-400'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isFollowed ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
