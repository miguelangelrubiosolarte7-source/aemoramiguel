'use client';

import React from 'react';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { CreatePostBox } from '@/features/feed/components/CreatePostBox';
import { PostCard } from '@/features/feed/components/PostCard';
import { useAuthStore } from '@/shared/security/auth.store';
import {
  Shield,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useFeed(1, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Columna Principal: Compositor y Feed */}
      <div className="lg:col-span-8 flex flex-col">
        {/* Compositor Rico para Crear Posts */}
        <CreatePostBox />

        {/* Estado de Carga del Feed */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Sincronizando feed con MSW...</p>
          </div>
        )}

        {/* Estado de Error */}
        {isError && (
          <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between text-red-300 text-sm mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>
                {error instanceof Error ? error.message : 'Error al consultar las publicaciones.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/50 text-xs font-semibold text-red-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de Publicaciones */}
        {data && data.items.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No hay publicaciones en el feed por el momento. ¡Sé el primero en publicar!
          </div>
        )}

        {data && data.items.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      {/* Columna Lateral Derecha (Widgets de Información y Seguridad) */}
      <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5 sticky top-20">
        {/* Tarjeta de Sesión Activa */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-12 h-12 rounded-full bg-slate-800 border-2 border-indigo-500/40 object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{user.displayName}</span>
              <span className="text-xs text-indigo-400 font-medium truncate">@{user.username}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{user.bio}</p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              <strong className="text-white">{user.stats.followersCount}</strong> seguidores
            </span>
            <span className="text-slate-400">
              <strong className="text-white">{user.stats.postsCount}</strong> posts
            </span>
          </div>
        </div>

        {/* Widget de Tendencias Rápidas */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Tendencias de Hoy</span>
          </div>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white hover:text-indigo-400 cursor-pointer">
                #cybersecurity
              </span>
              <span className="text-slate-500 font-mono">12.4K</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white hover:text-indigo-400 cursor-pointer">
                #owasp_top10
              </span>
              <span className="text-slate-500 font-mono">8.1K</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white hover:text-indigo-400 cursor-pointer">
                #clean_architecture
              </span>
              <span className="text-slate-500 font-mono">6.7K</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white hover:text-indigo-400 cursor-pointer">
                #uiux_design
              </span>
              <span className="text-slate-500 font-mono">5.2K</span>
            </div>
          </div>
        </div>

        {/* Badge de Seguridad OWASP */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-xs text-slate-400 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Blindaje OWASP Activo</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Todos los textos se renderizan a través de <code>SafeHTML</code> (DOMPurify). Tokens mantenidos en memoria exclusivamente.
          </p>
        </div>
      </aside>
    </div>
  );
}
