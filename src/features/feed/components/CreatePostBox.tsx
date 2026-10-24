'use client';

import React, { useRef, useState } from 'react';
import { useAuthStore } from '@/shared/security/auth.store';
import { useCreatePost } from '../hooks/useFeed';
import {
  Image as ImageIcon,
  Sparkles,
  X,
  Hash,
  Globe,
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
  const [imageQuery, setImageQuery] = useState('');
  const [tags, setTags] = useState<string[]>(['aemora']);
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxChars = 1000;
  const remainingChars = maxChars - content.length;
  const filteredPresetImages = PRESET_IMAGES.filter((image) =>
    image.label.toLowerCase().includes(imageQuery.trim().toLowerCase())
  );

  const handleEnhanceWithAI = async () => {
    if (isEnhancingWithAI) return;
    setIsEnhancingWithAI(true);
    try {
      const promptToSend =
        content.trim() ||
        'Escribe un post breve e impactante sobre Clean Architecture, Zero-Trust y seguridad frontend moderna.';

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
        toast('Post optimizado con Aemora AI ✨', 'Texto refinado por Groq Llama 3.3.', 'success');
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
    if ((!content.trim() && !selectedImageUrl) || createPostMutation.isPending) return;

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

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = window.localStorage.getItem('aemora_access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/posts/media`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'No se pudo subir la imagen.');
      setSelectedImageUrl(data.url);
      setShowImagePicker(false);
    } catch (error) {
      const { toast } = await import('@/shared/ui/Toast');
      toast('Error al subir imagen', error instanceof Error ? error.message : 'Intenta de nuevo.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="p-4 border-b border-white/[0.08] bg-[#0B0F17] transition-colors">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Cabecera: Avatar 40px + Textarea sin borde (Estilo X) */}
        <div className="flex items-start gap-3">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-10 h-10 rounded-full bg-[#161F30] border border-white/10 object-cover shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          />

          <div className="flex-1 min-w-0 pt-1">
            {/* Indicador de audiencia */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-white/[0.12] text-[#1d9bf0] text-xs font-semibold mb-2 hover:bg-[#1d9bf0]/10 cursor-pointer transition-colors">
              <Globe className="w-3 h-3" />
              <span>Cualquier persona puede responder</span>
            </div>

            {/* Textarea sin bordes */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¡¿Qué está pasando?!"
              rows={3}
              maxLength={maxChars}
              className="w-full bg-transparent text-[15px] leading-[1.33] text-[#F8FAFC] placeholder-[#94A3B8] resize-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Vista previa de imagen seleccionada con bordes 16px (rounded-2xl) */}
        {selectedImageUrl && (
          <div className="relative ml-13 rounded-2xl overflow-hidden border border-white/[0.08] max-h-72 group">
            <img
              src={selectedImageUrl}
              alt="Adjunto seleccionado"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/75 hover:bg-black text-white transition-all backdrop-blur-sm"
              aria-label="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selector de fotos Unsplash */}
        {showImagePicker && (
          <div className="ml-13 p-3.5 rounded-2xl bg-[#161F30] border border-white/[0.08] flex flex-col gap-3 animate-in fade-in-50">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-semibold text-[#F8FAFC]">Selecciona una foto segura:</span>
              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="search"
              value={imageQuery}
              onChange={(event) => setImageQuery(event.target.value)}
              placeholder="Buscar en la galería de imágenes..."
              className="w-full bg-[#0B0F17] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0]"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredPresetImages.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => {
                    setSelectedImageUrl(img.url);
                    setShowImagePicker(false);
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.08] overflow-hidden hover:border-[#1d9bf0] transition-all group"
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] text-[#94A3B8] py-1 font-medium">{img.label}</span>
                </button>
              ))}
            </div>
            {filteredPresetImages.length === 0 && (
              <p className="text-xs text-[#94A3B8]">No hay imágenes de la galería con ese término. Puedes subir una foto o pegar una URL HTTPS.</p>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="O pega una URL HTTPS directa..."
                className="flex-1 bg-[#0B0F17] border border-white/[0.08] rounded-md px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0]"
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
                className="px-3.5 py-1.5 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-xs text-white font-bold transition-all"
              >
                Adjuntar
              </button>
            </div>
          </div>
        )}

        {/* Píldoras de Tags activas */}
        <div className="flex items-center flex-wrap gap-1.5 ml-13">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#1d9bf0]/10 text-[#1d9bf0] border border-[#1d9bf0]/20 text-xs font-semibold"
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

          {['owasp', 'cleancode', 'uiux'].map((quickTag) => (
            !tags.includes(quickTag) && (
              <button
                key={quickTag}
                type="button"
                onClick={() => handleAddTag(quickTag)}
                className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] px-2.5 py-0.5 rounded-full border border-dashed border-white/[0.12] hover:border-white/30 transition-colors"
              >
                +{quickTag}
              </button>
            )
          ))}
        </div>

        {/* Barra de herramientas inferior con botón píldora y Aemora AI */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] ml-13">
          {/* Iconos de acciones */}
          <div className="flex items-center gap-1 text-[#1d9bf0]">
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors"
              title="Multimedia"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImageUpload(file);
                event.currentTarget.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="px-2 text-xs text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-50"
              title="Subir imagen desde tu dispositivo"
            >
              {isUploadingImage ? 'Subiendo...' : 'Subir foto'}
            </button>
            <button
              type="button"
              onClick={() => handleAddTag('trend')}
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors"
              title="Hashtag"
            >
              <Hash className="w-5 h-5" />
            </button>

            {/* Botón de la varita mágica ✨ de Aemora AI (Píldora con degradado AI) */}
            <button
              type="button"
              onClick={handleEnhanceWithAI}
              disabled={isEnhancingWithAI}
              className="ml-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
              }}
              title="Mejorar y optimizar con Aemora AI (Llama 3.3 en Groq)"
            >
              {isEnhancingWithAI ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Optimizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aemora AI ✨</span>
                </>
              )}
            </button>
          </div>

          {/* Contador y Botón de Publicar (Píldora redondeada X) */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono ${
                remainingChars < 100 ? 'text-amber-400' : 'text-[#94A3B8]'
              }`}
            >
              {remainingChars}
            </span>

            <button
              type="submit"
              disabled={(!content.trim() && !selectedImageUrl) || createPostMutation.isPending}
              className="px-5 py-2 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:hover:bg-[#1d9bf0] text-white text-[15px] font-bold shadow-sm transition-all"
            >
              {createPostMutation.isPending ? 'Posteando...' : 'Postear'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
