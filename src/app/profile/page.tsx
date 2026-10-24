'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/shared/security/auth.store';
import { useUserPosts } from '@/features/feed/hooks/useFeed';
import { PostCard } from '@/features/feed/components/PostCard';
import { toast } from '@/shared/ui/Toast';
import {
  Calendar,
  Link as LinkIcon,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { data, isLoading } = useUserPosts(user.username);

  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'highlights' | 'likes'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user.bio);

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ bio: newBio });
    setIsEditingBio(false);
    toast('Perfil actualizado', 'Tu biografía ha sido guardada.', 'success');
  };

  const postsCount = data?.items.length ?? user.stats.postsCount;

  return (
    <div className="flex flex-col w-full">
      {/* Cabecera Fija Superior con Flecha y Contador de Posts (Estilo X) */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#0B0F17]/80 border-b border-white/[0.08] px-4 py-2 flex items-center gap-6">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-white/[0.08] text-[#F8FAFC] transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-[#F8FAFC] truncate">{user.displayName}</h1>
            {user.verified && (
              <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]/10" />
            )}
          </div>
          <span className="text-xs text-[#94A3B8]">{postsCount} posts</span>
        </div>
      </div>

      {/* Banner de Portada */}
      <div className="h-44 sm:h-52 w-full relative bg-[#161F30]">
        {user.bannerUrl && (
          <img
            src={user.bannerUrl}
            alt="Portada de perfil"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bloque de Información del Perfil */}
      <div className="px-4 pb-4 relative">
        <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-3">
          {/* Avatar Circular 130px (rounded-full) */}
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#161F30] border-4 border-[#0B0F17] shadow-lg object-cover"
            />
          </div>

          {/* Botón Editar Perfil en Formato Píldora (rounded-full) */}
          <button
            type="button"
            onClick={() => setIsEditingBio(!isEditingBio)}
            className="px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/[0.08] text-sm font-bold text-[#F8FAFC] transition-colors"
          >
            Editar perfil
          </button>
        </div>

        {/* Nombres e Identidad */}
        <div className="flex flex-col mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-bold text-[#F8FAFC]">{user.displayName}</h2>
            {user.verified && (
              <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]/10" />
            )}
          </div>
          <span className="text-sm text-[#94A3B8]">@{user.username}</span>
        </div>

        {/* Biografía */}
        {isEditingBio ? (
          <form onSubmit={handleSaveBio} className="my-2 flex flex-col gap-2">
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full bg-[#161F30] border border-white/[0.08] rounded-md p-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0]"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingBio(false)}
                className="px-3.5 py-1 rounded-full text-xs text-[#94A3B8] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-xs font-bold text-white"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <p className="text-[15px] leading-snug text-[#F8FAFC] mb-3">{user.bio}</p>
        )}

        {/* Metadatos (Fecha de unión y enlace) */}
        <div className="flex items-center gap-4 text-xs text-[#94A3B8] flex-wrap mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Se unió en enero de 2026
          </span>
          <span className="flex items-center gap-1 text-[#1d9bf0] hover:underline cursor-pointer">
            <LinkIcon className="w-3.5 h-3.5" />
            aemora.io/@{user.username}
          </span>
        </div>

        {/* Métricas de Siguiendo y Seguidores (Estilo X) */}
        <div className="flex items-center gap-5 text-sm">
          <span className="cursor-pointer hover:underline">
            <strong className="text-[#F8FAFC] font-bold">
              {user.stats.followingCount.toLocaleString()}
            </strong>{' '}
            <span className="text-[#94A3B8]">Siguiendo</span>
          </span>
          <span className="cursor-pointer hover:underline">
            <strong className="text-[#F8FAFC] font-bold">
              {user.stats.followersCount.toLocaleString()}
            </strong>{' '}
            <span className="text-[#94A3B8]">Seguidores</span>
          </span>
        </div>
      </div>

      {/* Pestañas de Navegación del Perfil (Estilo X) */}
      <div className="flex border-b border-white/[0.08] text-[15px]">
        {(['posts', 'replies', 'highlights', 'likes'] as const).map((tab) => {
          const labels = {
            posts: 'Posts',
            replies: 'Respuestas',
            highlights: 'Destacados',
            likes: 'Me gusta',
          };
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3.5 hover:bg-white/[0.03] transition-colors relative flex items-center justify-center font-bold text-sm sm:text-[15px]"
            >
              <span className={isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}>
                {labels[tab]}
              </span>
              {isActive && (
                <div className="absolute bottom-0 h-1 w-14 rounded-full bg-[#1d9bf0]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Historial de Publicaciones con 0px de espacio entre tarjetas */}
      <div className="flex flex-col">
        {isLoading && (
          <div className="py-20 flex justify-center text-[#94A3B8] text-sm">
            Cargando posts de @{user.username}...
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="p-12 text-center text-[#94A3B8] text-[15px]">
            @{user.username} aún no ha publicado ningún post.
          </div>
        )}

        {data && data.items.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
