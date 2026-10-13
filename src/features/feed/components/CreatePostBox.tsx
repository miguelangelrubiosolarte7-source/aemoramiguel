'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/shared/security/auth.store';
import { useCreatePost } from '../hooks/useFeed';
import {
  Image as ImageIcon,
  Sparkles,
  Send,
  X,
  Hash,
  Globe,
  Lock,
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    label: 'Ciberseguridad',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Diseño UX',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Arquitectura',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Gradiente Aemora',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CreatePostBox: React.FC = () => {
  const { user } = useAuthStore();
  const createPostMutation = useCreatePost();

  const [content, setContent] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>(['aemora']);
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState(false);

  const handleEnhanceWithAI = async () => {
    if (isEnhancingWithAI) return;
    setIsEnhancingWithAI(true);
    try {
      const promptToSend =
        content.trim() ||
        'Escribe un anuncio breve y emocionante sobre las ventajas de una arquitectura Zero-Trust y Clean Architecture en una red social.';

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: 'post_assistant',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al conectar con Aemora AI');

      if (data.result) {
        setContent(data.result);
        const { toast } = await import('@/shared/ui/Toast');
        toast('Post optimizado con Aemora AI ✨', 'Tu borrador fue mejorado utilizando Llama 3.3 en Groq.', 'success');
      }
    } catch (err: unknown) {
      const { toast } = await import('@/shared/ui/Toast');
      toast(
        'Error con Aemora AI',
        err instanceof Error ? err.message : 'No se pudo conectar con el servicio de IA.',
        'error'
      );
    } finally {
      setIsEnhancingWithAI(false);
    }
  };

  const maxChars = 1000;
  const remainingChars = maxChars - content.length;

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || createPostMutation.isPending) return;

    createPostMutation.mutate(
      {
        content: content.trim(),
        media: selectedImageUrl
          ? [{ url: selectedImageUrl, altText: 'Adjunto en publicación' }]
          : [],
        tags,
        visibility: 'public',
      },
      {
        onSuccess: () => {
          setContent('');
          setSelectedImageUrl(null);
          setShowImagePicker(false);
          setCustomImageUrl('');
        },
      }
    );
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-lg shadow-black/20 backdrop-blur-xl mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Cabecera con Avatar Dinámico y Selector de Visibilidad */}
        <div className="flex items-start gap-3.5">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-11 h-11 rounded-full bg-slate-800 border-2 border-indigo-500/40 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-bold text-slate-100">{user.displayName}</span>
              <span className="text-xs text-indigo-400 font-medium">@{user.username}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                Público
              </span>
            </div>

            {/* Textarea del Post */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué idea, código o avance deseas compartir hoy, ${user.displayName.split(' ')[0]}?`}
              rows={3}
              maxLength={maxChars}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-0 leading-relaxed"
            />
          </div>
        </div>

        {/* Vista Previa de Imagen Seleccionada */}
        {selectedImageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-slate-700/80 max-h-60 group">
            <img
              src={selectedImageUrl}
              alt="Adjunto seleccionado"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition-colors"
              aria-label="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selector Desplegable de Fotos de Unsplash */}
        {showImagePicker && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Selecciona una foto segura (Unsplash):
              </span>
              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => {
                    setSelectedImageUrl(img.url);
                    setShowImagePicker(false);
                  }}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-800 overflow-hidden hover:border-indigo-500 transition-all group"
                >
                  <img src={img.url} alt={img.label} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] text-slate-400 py-1 font-medium">{img.label}</span>
                </button>
              ))}
            </div>

            {/* O pegar enlace personalizado */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="O pega una URL directa de imagen (https://...)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customImageUrl.trim().startsWith('https://')) {
                    setSelectedImageUrl(customImageUrl.trim());
                    setShowImagePicker(false);
                    setCustomImageUrl('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors"
              >
                Adjuntar
              </button>
            </div>
          </div>
        )}

        {/* Etiquetas / Hashtags seleccionadas */}
        <div className="flex items-center flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-pink-400"
                aria-label={`Quitar etiqueta ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Sugerencias de Tags rápidas */}
          {['owasp', 'nextjs', 'uiux', 'security'].map((quickTag) => (
            !tags.includes(quickTag) && (
              <button
                key={quickTag}
                type="button"
                onClick={() => handleAddTag(quickTag)}
                className="text-[11px] text-slate-500 hover:text-slate-300 font-medium px-2 py-0.5 rounded-full border border-dashed border-slate-800 hover:border-slate-700 transition-colors"
              >
                +{quickTag}
              </button>
            )
          ))}
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/80 hover:text-indigo-400 text-xs font-medium transition-colors"
              title="Adjuntar Imagen"
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Multimedia</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddTag('trend')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/80 hover:text-pink-400 text-xs font-medium transition-colors"
              title="Etiqueta"
            >
              <Hash className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">Etiqueta</span>
            </button>
            <button
              type="button"
              onClick={handleEnhanceWithAI}
              disabled={isEnhancingWithAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all shadow-sm"
              title="Mejorar y optimizar con Aemora AI (Groq Llama 3.3)"
            >
              {isEnhancingWithAI ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-cyan-300">Optimizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Aemora AI ✨</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono font-medium ${
                remainingChars < 100 ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              {remainingChars}
            </span>

            <button
              type="submit"
              disabled={!content.trim() || createPostMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {createPostMutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
