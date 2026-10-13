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
    e.preventDefault();
    setIsLiking(true);
    toggleLikeMutation.mutate(post.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBookmarkMutation.mutate(post.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/#post-${post.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      toast('Enlace copiado al portapapeles', '¡Compártelo con tus contactos en cualquier lugar!', 'success');
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

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      deletePostMutation.mutate(post.id);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(post.createdAt));

  return (
    <article
      id={`post-${post.id}`}
      className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 shadow-md shadow-black/10 backdrop-blur-md mb-4"
    >
      {/* Cabecera del Post: Autor e Identidad */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0"
            loading="lazy"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition-colors cursor-pointer">
                {post.author.displayName}
              </span>
              {post.author.verified && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20 shrink-0" />
              )}
              {post.author.role === 'admin' && (
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-semibold border border-purple-500/30">
                  Fundador
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>@{post.author.username}</span>
              <span>•</span>
              <time dateTime={post.createdAt}>{formattedDate}</time>
            </div>
          </div>
        </div>

        {/* Menú de opciones */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Más opciones"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl z-30 p-1.5 animate-in fade-in-50">
              <button
                type="button"
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg text-left"
              >
                <Share2 className="w-3.5 h-3.5" />
                Copiar enlace
              </button>
              {isAuthor && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-lg text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido Sanitizado contra XSS (OWASP SafeHTML) */}
      <div className="text-sm text-slate-200 leading-relaxed mb-3.5 whitespace-pre-line">
        <SafeHTML html={post.content} />
      </div>

      {/* Etiquetas / Hashtags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Adjuntos Multimedia Seguros */}
      {post.media.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-slate-800 mb-4 bg-slate-950">
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

      {/* Barra de Interacciones y Métricas Reactivas */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-slate-400 text-xs">
        {/* Like Interactivo Optimista */}
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 group ${
            post.isLikedByMe
              ? 'text-pink-500 bg-pink-500/10 font-bold'
              : 'hover:text-pink-400 hover:bg-slate-800/60'
          }`}
          aria-label="Me gusta"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isLiking ? 'scale-125' : 'group-hover:scale-110'
            } ${post.isLikedByMe ? 'fill-pink-500 text-pink-500' : ''}`}
          />
          <span>{post.metrics.likesCount}</span>
        </button>

        {/* Desplegable de Comentarios */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors group ${
            showComments
              ? 'text-indigo-400 bg-indigo-500/10 font-bold'
              : 'hover:text-indigo-400 hover:bg-slate-800/60'
          }`}
          aria-label="Ver comentarios"
        >
          <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{post.comments.length || post.metrics.commentsCount}</span>
        </button>

        {/* Repost */}
        <button
          type="button"
          onClick={() => toast('Función Repost', 'Publicación amplificada en tu perfil.', 'info')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors group ${
            post.isRepostedByMe
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'hover:text-emerald-400 hover:bg-slate-800/60'
          }`}
          aria-label="Republicar"
        >
          <Repeat2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{post.metrics.repostsCount}</span>
        </button>

        {/* Guardar en Marcadores */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`p-1.5 rounded-lg transition-colors ${
            post.isSavedByMe
              ? 'text-amber-400 bg-amber-500/10'
              : 'hover:text-amber-400 hover:bg-slate-800/60'
          }`}
          aria-label="Guardar post"
          title="Guardar en marcadores"
        >
          <Bookmark className={`w-4 h-4 ${post.isSavedByMe ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Compartir */}
        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          aria-label="Compartir"
          title="Copiar enlace"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          SECCIÓN INTERACTIVA DE COMENTARIOS (ACORDEÓN DESPLEGABLE)
      ========================================================================= */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-3 animate-in fade-in-50">
          {/* Caja para Escribir Comentario */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Escribe una respuesta como @${user.username}...`}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shrink-0"
              aria-label="Enviar comentario"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Lista de Comentarios Existentes */}
          <div className="flex flex-col gap-2.5 mt-2">
            {post.comments.length === 0 ? (
              <p className="text-center py-3 text-xs text-slate-500">
                Aún no hay comentarios. ¡Sé el primero en participar!
              </p>
            ) : (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-start gap-2.5 text-xs"
                >
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.displayName}
                    className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">
                          {comment.author.displayName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          @{comment.author.username}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(
                          new Date(comment.createdAt)
                        )}
                      </span>
                    </div>
                    {/* Contenido Sanitizado con SafeHTML */}
                    <div className="text-slate-300 leading-relaxed">
                      <SafeHTML html={comment.content} inline />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};
