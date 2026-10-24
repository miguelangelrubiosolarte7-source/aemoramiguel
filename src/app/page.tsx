'use client';

import React, { useState } from 'react';
import { useFeed } from '@/features/feed/hooks/useFeed';
import { CreatePostBox } from '@/features/feed/components/CreatePostBox';
import { PostCard } from '@/features/feed/components/PostCard';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function FeedPage() {
  const { data, isLoading, isError, error, refetch } = useFeed(1, 10);
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');

  return (
    <div className="flex flex-col w-full">
      {/* Header Fijo Superior (Pestañas estilo X: "Para ti" / "Siguiendo") */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#0B0F17]/80 border-b border-white/[0.08] flex">
        <button
          type="button"
          onClick={() => setActiveTab('for_you')}
          className="flex-1 py-3.5 hover:bg-white/[0.03] transition-colors relative flex items-center justify-center font-bold text-[15px]"
        >
          <span className={activeTab === 'for_you' ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}>
            Para ti
          </span>
          {activeTab === 'for_you' && (
            <div className="absolute bottom-0 h-1 w-14 rounded-full bg-[#1d9bf0]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('following')}
          className="flex-1 py-3.5 hover:bg-white/[0.03] transition-colors relative flex items-center justify-center font-bold text-[15px]"
        >
          <span className={activeTab === 'following' ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}>
            Siguiendo
          </span>
          {activeTab === 'following' && (
            <div className="absolute bottom-0 h-1 w-18 rounded-full bg-[#1d9bf0]" />
          )}
        </button>
      </div>

      {/* Compositor de Creación en la parte superior del Feed */}
      <CreatePostBox />

      {/* Estado de Carga del Timeline */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#94A3B8]">
          <div className="w-7 h-7 rounded-full border-2 border-[#1d9bf0] border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Cargando publicaciones...</p>
        </div>
      )}

      {/* Estado de Error */}
      {isError && (
        <div className="m-4 p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between text-red-300 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>
              {error instanceof Error ? error.message : 'Error al consultar las publicaciones.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-900/40 hover:bg-red-800/50 text-xs font-semibold text-red-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* Timeline con 0px de espacio entre tarjetas (separadas exclusivamente por border-b hairline) */}
      {data && data.items.length === 0 && (
        <div className="text-center py-20 text-[#94A3B8] text-[15px]">
          No hay publicaciones en el feed por el momento. ¡Sé el primero en postear!
        </div>
      )}

      {data && (
        <div className="flex flex-col divide-y-0">
          {data.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
