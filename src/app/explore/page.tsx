'use client';

import React, { useEffect, useState } from 'react';
import { DEMO_USERS } from '@/shared/security/auth.store';
import { toast } from '@/shared/ui/Toast';
import {
  Search,
  Users,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { httpClient } from '@/shared/http/http-client';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setRegisteredUsers([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const response = await httpClient.get<{ items: any[] }>(
          `/api/v1/users/search?q=${encodeURIComponent(searchTerm.trim())}`
        );
        setRegisteredUsers(response.items ?? []);
      } catch {
        setRegisteredUsers([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const trendingTopics = [
    { tag: 'cybersecurity', posts: '14.2K posts', category: 'Ciberseguridad · Tendencia' },
    { tag: 'owasp_top10', posts: '9.8K posts', category: 'Seguridad Web · Tendencia' },
    { tag: 'clean_architecture', posts: '7.1K posts', category: 'Software · Tendencia' },
    { tag: 'designsystems', posts: '5.2K posts', category: 'UI/UX · Tendencia' },
    { tag: 'nextjs', posts: '18.9K posts', category: 'Frontend · Tendencia' },
    { tag: 'zero_trust', posts: '3.8K posts', category: 'Infosec · Tendencia' },
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
    <div className="flex flex-col w-full">
      {/* Buscador Fijo Superior Estilo X */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#0B0F17]/80 border-b border-white/[0.08] p-3 flex items-center">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#161F30] border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-[#0B0F17] transition-all w-full">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en Explorar (#owasp, #design)..."
            className="w-full bg-transparent text-[15px] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none"
          />
        </div>
      </div>

      {searchTerm.trim().length >= 2 && (
        <section className="border-b border-white/[0.08]">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Personas registradas</h2>
            {isSearchingUsers && <span className="text-xs text-[#94A3B8]">Buscando...</span>}
          </div>
          {registeredUsers.length === 0 && !isSearchingUsers ? (
            <p className="px-4 pb-4 text-sm text-[#94A3B8]">No encontramos usuarios con esa búsqueda.</p>
          ) : (
            registeredUsers.map((person) => (
              <div key={person.id} className="p-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={person.avatar_url ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=aemora'} alt={person.display_name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{person.display_name}</p>
                    <p className="text-xs text-[#94A3B8] truncate">@{person.username}</p>
                  </div>
                </div>
                <button type="button" onClick={() => handleToggleFollow(String(person.id), person.display_name)} className="px-4 py-1.5 rounded-full bg-[#F8FAFC] text-black text-xs font-bold shrink-0">
                  {followedUsers.includes(String(person.id)) ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {/* Sección: Tendencias para ti (Estilo X Timeline: 0px gap, border-b hairline) */}
      <div className="flex flex-col">
        <div className="px-4 py-3 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Tendencias para ti
          </h2>
        </div>

        {filteredTopics.map((item, index) => (
          <div
            key={item.tag}
            onClick={() => toast(`Hashtag #${item.tag}`, `Explorando publicaciones...`, 'info')}
            className="p-4 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#94A3B8]">{index + 1} · {item.category}</span>
              <span className="text-[15px] font-bold text-[#F8FAFC]">#{item.tag}</span>
              <span className="text-xs text-[#94A3B8] font-mono">{item.posts}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sección: Creadores a quienes seguir */}
      <div className="flex flex-col mt-2">
        <div className="px-4 py-3 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1d9bf0]" />
            A quién seguir
          </h2>
        </div>

        {DEMO_USERS.map((creator) => {
          const isFollowed = followedUsers.includes(creator.id);

          return (
            <div
              key={creator.id}
              className="p-4 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  className="w-10 h-10 rounded-full bg-[#161F30] border border-white/10 object-cover shrink-0 cursor-pointer"
                />
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[15px] font-bold text-[#F8FAFC] hover:underline cursor-pointer">
                      {creator.displayName}
                    </span>
                    {creator.verified && (
                      <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]/10 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-[#94A3B8] truncate">@{creator.username}</span>
                  <p className="text-xs text-[#94A3B8] truncate mt-1 max-w-sm hidden sm:block">
                    {creator.bio}
                  </p>
                </div>
              </div>

              {/* Botón Seguir en Formato Píldora (rounded-full) */}
              <button
                type="button"
                onClick={() => handleToggleFollow(creator.id, creator.displayName)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isFollowed
                    ? 'border border-white/20 bg-transparent text-[#F8FAFC] hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-400'
                    : 'bg-[#F8FAFC] hover:bg-white/90 text-black'
                }`}
              >
                {isFollowed ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
