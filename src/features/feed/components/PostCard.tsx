'use client';

import React, { useState } from 'react';
import { Post } from '@/core/domain/post.entity';
import { SafeHTML } from '@/shared/security/SafeHTML';
import { useAuthStore } from '@/shared/security/auth.store';
import {
  useToggleLike,
  useToggleBookmark,
  useAddComment,
  useDeletePost,
} from '../hooks/useFeed';
import { toast } from '@/shared/ui/Toast';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  CheckCircle2,
  MoreHorizontal,
  Send,
  Trash2,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuthStore();
  const toggleLikeMutation = useToggleLike();
  const toggleBookmarkMutation = useToggleBookmark();
  const addCommentMutation = useAddComment();
  const deletePostMutation = useDeletePost();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isAuthor = user.username === post.author.username;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    toggleLikeMutation.mutate(post.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmarkMutation.mutate(post.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#post-${post.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      toast('Enlace copiado al portapapeles', '¡Compártelo en X, Aemora o donde prefieras!', 'success');
    } catch {
      toast('Enlace generado', shareUrl, 'info');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      { postId: post.id, content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
        },
      }
    );
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta publicación?')) {
      deletePostMutation.mutate(post.id);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(post.createdAt));

  return (
    <article
      id={`post-${post.id}`}
      className="p-4 border-b border-white/[0.08] hover:bg-white/[0.015] transition-colors duration-150 flex gap-3 text-left relative group/post"
    >
      {/* Columna Izquierda: Avatar circular de 40px (X style) */}
      <div className="shrink-0">
        <img
          src={post.author.avatarUrl}
          alt={post.author.displayName}
          className="w-10 h-10 rounded-full bg-[#161F30] border border-white/10 object-cover hover:opacity-90 transition-opacity cursor-pointer"
          loading="lazy"
        />
      </div>

      {/* Columna Derecha: Contenido completo del Post */}
      <div className="flex-1 min-w-0">
        {/* Encabezado en línea: Nombre + Verified + @handle + · + Fecha + Menú */}
        <div className="flex items-center justify-between gap-1 mb-1 leading-snug">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 text-[15px]">
            <span className="font-bold text-[#F8FAFC] hover:underline cursor-pointer truncate">
              {post.author.displayName}
            </span>
            {post.author.verified && (
              <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]/10 shrink-0" />
            )}
            {post.author.role === 'admin' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30 shrink-0">
                Fundador
              </span>
            )}
            <span className="text-[#94A3B8] truncate cursor-pointer hover:underline">
              @{post.author.username}
            </span>
            <span className="text-[#94A3B8]">·</span>
            <time dateTime={post.createdAt} className="text-[#94A3B8] text-sm hover:underline cursor-pointer">
              {formattedDate}
            </time>
          </div>

          {/* Menú de opciones de post */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-[#94A3B8] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition-colors"
              aria-label="Más opciones"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 rounded-2xl bg-[#161F30] border border-white/[0.08] shadow-2xl z-30 p-1.5 animate-in fade-in-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#F8FAFC] hover:bg-white/[0.06] rounded-xl text-left"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#1d9bf0]" />
                  Copiar enlace
                </button>
                {isAuthor && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-xl text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cuerpo del post (SafeHTML - 15px body, line-height: 1.33) */}
        <div className="text-[15px] leading-[1.33] text-[#F8FAFC] mb-2.5 whitespace-pre-line break-words">
          <SafeHTML html={post.content} />
        </div>

        {/* Etiquetas / Hashtags en píldoras sutiles */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[#1d9bf0] hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Adjuntos Multimedia (Contenedor 16px rounded-2xl según DESIGN.md) */}
        {post.media.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] mb-3 bg-[#0B0F17]">
            {post.media.map((mediaItem) => (
              <img
                key={mediaItem.id}
                src={mediaItem.url}
                alt={mediaItem.altText}
                className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Barra de Interacciones (Estilo X: Reply, Retweet, Like, Bookmark, Share) */}
        <div className="flex items-center justify-between text-[#94A3B8] max-w-md pt-1 -ml-2 text-xs">
          {/* Comentar / Responder */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className={`flex items-center gap-1.5 p-2 rounded-full transition-colors group ${
              showComments ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10'
            }`}
            aria-label="Responder"
          >
            <div className="p-1 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-normal">
              {post.comments.length || post.metrics.commentsCount || ''}
            </span>
          </button>

          {/* Repost / Retweet */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toast('Repost en Aemora', 'Publicación amplificada en tu timeline.', 'info');
            }}
            className={`flex items-center gap-1.5 p-2 rounded-full transition-colors group ${
              post.isRepostedByMe ? 'text-emerald-400' : 'hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            aria-label="Repost"
          >
            <div className="p-1 rounded-full group-hover:bg-emerald-500/10 transition-colors">
              <Repeat2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-normal">{post.metrics.repostsCount || ''}</span>
          </button>

          {/* Like Optimista */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 p-2 rounded-full transition-colors group ${
              post.isLikedByMe ? 'text-pink-500 font-semibold' : 'hover:text-pink-500 hover:bg-pink-500/10'
            }`}
            aria-label="Me gusta"
          >
            <div className="p-1 rounded-full group-hover:bg-pink-500/10 transition-colors">
              <Heart
                className={`w-4 h-4 transition-transform ${isLiking ? 'scale-125' : ''} ${
                  post.isLikedByMe ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
            </div>
            <span className="text-xs font-normal">{post.metrics.likesCount || ''}</span>
          </button>

          {/* Bookmark / Guardar */}
          <button
            type="button"
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-colors group ${
              post.isSavedByMe ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10'
            }`}
            aria-label="Guardar en marcadores"
            title="Guardar"
          >
            <div className="p-1 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
              <Bookmark className={`w-4 h-4 ${post.isSavedByMe ? 'fill-[#1d9bf0]' : ''}`} />
            </div>
          </button>

          {/* Compartir */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors group"
            aria-label="Compartir"
            title="Copiar enlace"
          >
            <div className="p-1 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
              <Share2 className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Sección de Comentarios Desplegable (Con hilo de conversación X) */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-3 animate-in fade-in-50">
            {/* Input de respuesta directa con botón píldora */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-8 h-8 rounded-full bg-[#161F30] border border-white/10 object-cover shrink-0"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Postea tu respuesta..."
                className="flex-1 bg-transparent border-b border-white/[0.12] px-2 py-1.5 text-[15px] text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0] transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="px-4 py-1.5 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-40 text-white font-bold text-xs transition-all shrink-0"
              >
                Responder
              </button>
            </form>

            {/* Lista de comentarios */}
            <div className="flex flex-col gap-2 mt-1">
              {post.comments.length === 0 ? (
                <p className="py-2 text-xs text-[#94A3B8]">
                  Sé el primero en responder a esta publicación.
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2.5 rounded-xl bg-[#161F30]/40 border border-white/[0.05] flex items-start gap-2.5 text-xs"
                  >
                    <img
                      src={comment.author.avatarUrl}
                      alt={comment.author.displayName}
                      className="w-7 h-7 rounded-full bg-[#161F30] border border-white/10 object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#F8FAFC]">
                            {comment.author.displayName}
                          </span>
                          <span className="text-[11px] text-[#94A3B8]">
                            @{comment.author.username}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(
                            new Date(comment.createdAt)
                          )}
                        </span>
                      </div>
                      <div className="text-[#F8FAFC] text-[13px] leading-snug">
                        <SafeHTML html={comment.content} inline />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
