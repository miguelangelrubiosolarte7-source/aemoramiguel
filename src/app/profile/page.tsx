'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/shared/security/auth.store';
import { useUserPosts } from '@/features/feed/hooks/useFeed';
import { PostCard } from '@/features/feed/components/PostCard';
import { toast } from '@/shared/ui/Toast';
import {
  Calendar,
  ShieldCheck,
  Edit3,
  Link as LinkIcon,
  CheckCircle2,
  Users,
  Heart,
  FileText,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { data, isLoading } = useUserPosts(user.username);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user.bio);

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ bio: newBio });
    setIsEditingBio(false);
    toast('Perfil actualizado', 'Tu biografía ha sido guardada correctamente.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Tarjeta Principal de Perfil con Banner */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 overflow-hidden shadow-xl backdrop-blur-xl">
        {/* Banner de Portada */}
        <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950">
          {user.bannerUrl && (
            <img
              src={user.bannerUrl}
              alt="Portada de perfil"
              className="w-full h-full object-cover opacity-75"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        {/* Información de Identidad */}
        <div className="px-6 pb-6 relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar Superpuesto */}
            <div className="relative inline-block">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 shadow-2xl object-cover"
              />
              <span className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            {/* Botón Editar Perfil */}
            <button
              type="button"
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Editar Biografía</span>
            </button>
          </div>

          {/* Nombres y Badges */}
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user.displayName}</h1>
              {user.verified && (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30">
                {user.role === 'admin' ? 'Fundadora' : 'Creador Verificado'}
              </span>
            </div>
            <span className="text-sm text-slate-400 font-medium">@{user.username}</span>
          </div>

          {/* Biografía (Lectura o Edición) */}
          {isEditingBio ? (
            <form onSubmit={handleSaveBio} className="my-3 flex flex-col gap-2">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed mb-4 max-w-2xl">{user.bio}</p>
          )}

          {/* Metadatos y Enlaces */}
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mb-5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Miembro desde 2026
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 hover:underline cursor-pointer">
              <LinkIcon className="w-3.5 h-3.5" />
              aemora.io/@{user.username}
            </span>
          </div>

          {/* Contadores Estadísticos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="flex flex-col p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-lg font-black text-white">
                {user.stats.followersCount.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-indigo-400" />
                Seguidores
              </span>
            </div>
            <div className="flex flex-col p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-lg font-black text-white">
                {user.stats.followingCount.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-cyan-400" />
                Siguiendo
              </span>
            </div>
            <div className="flex flex-col p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-lg font-black text-white">
                {data?.items.length ?? user.stats.postsCount}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <FileText className="w-3 h-3 text-purple-400" />
                Publicaciones
              </span>
            </div>
            <div className="flex flex-col p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-lg font-black text-white">
                {user.stats.likesReceivedCount.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Heart className="w-3 h-3 text-pink-400" />
                Me gusta recibidos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Publicaciones del Usuario */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Publicaciones de @{user.username}
        </h2>

        {isLoading && (
          <div className="py-12 flex justify-center text-slate-500 text-sm">
            Cargando historial de publicaciones...
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
            Este usuario aún no ha realizado publicaciones. ¡Escribe la primera desde el Feed!
          </div>
        )}

        {data && data.items.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
