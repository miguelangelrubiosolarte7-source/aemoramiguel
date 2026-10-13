'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedRepository } from '../infrastructure/feed-mock.repository';
import { CreatePostInput, PaginatedPosts, Post } from '@/core/domain/post.entity';
import { CreateCommentInput, Comment } from '@/core/domain/comment.entity';
import { useAuthStore } from '@/shared/security/auth.store';
import { toast } from '@/shared/ui/Toast';

export const FEED_QUERY_KEY = ['feed', 'posts'];

export function useFeed(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...FEED_QUERY_KEY, { page, pageSize }],
    queryFn: () => feedRepository.getFeed({ page, pageSize }),
  });
}

export function useUserPosts(username: string) {
  return useQuery({
    queryKey: ['user-posts', username],
    queryFn: () => feedRepository.getUserPosts(username),
    enabled: Boolean(username),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreatePostInput) =>
      feedRepository.create({
        ...data,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          role: user.role,
        },
      }),
    onSuccess: (newPost) => {
      // Prepend optimista en el feed
      queryClient.setQueriesData<PaginatedPosts>({ queryKey: FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [newPost, ...old.items],
          pagination: {
            ...old.pagination,
            totalItems: old.pagination.totalItems + 1,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['user-posts', user.username] });
      toast('¡Publicación creada!', 'Tu contenido ya es visible en el feed principal.', 'success');
    },
    onError: (err) => {
      toast('Error al publicar', err instanceof Error ? err.message : 'Ocurrió un error inesperado.', 'error');
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => feedRepository.toggleLike(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previousFeed = queryClient.getQueryData<PaginatedPosts>(FEED_QUERY_KEY);

      queryClient.setQueriesData<PaginatedPosts>({ queryKey: FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((post) => {
            if (post.id === postId) {
              const isLiked = !post.isLikedByMe;
              return {
                ...post,
                isLikedByMe: isLiked,
                metrics: {
                  ...post.metrics,
                  likesCount: isLiked ? post.metrics.likesCount + 1 : Math.max(0, post.metrics.likesCount - 1),
                },
              };
            }
            return post;
          }),
        };
      });

      return { previousFeed };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => feedRepository.toggleBookmark(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previousFeed = queryClient.getQueryData<PaginatedPosts>(FEED_QUERY_KEY);

      let savedState = false;
      queryClient.setQueriesData<PaginatedPosts>({ queryKey: FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((post) => {
            if (post.id === postId) {
              savedState = !post.isSavedByMe;
              return { ...post, isSavedByMe: savedState };
            }
            return post;
          }),
        };
      });

      return { previousFeed, savedState };
    },
    onSuccess: (data) => {
      toast(
        data.isSaved ? 'Guardado en marcadores' : 'Eliminado de marcadores',
        data.isSaved ? 'Puedes revisarlo en cualquier momento desde tu colección.' : undefined,
        'info'
      );
    },
    onError: (_err, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (input: { postId: string; content: string }) =>
      feedRepository.addComment({
        postId: input.postId,
        content: input.content,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          role: user.role,
        },
      }),
    onSuccess: (newComment, variables) => {
      queryClient.setQueriesData<PaginatedPosts>({ queryKey: FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((post) => {
            if (post.id === variables.postId) {
              return {
                ...post,
                comments: [...post.comments, newComment],
                metrics: {
                  ...post.metrics,
                  commentsCount: post.metrics.commentsCount + 1,
                },
              };
            }
            return post;
          }),
        };
      });
      toast('Comentario añadido', 'Tu respuesta ya es visible para la comunidad.', 'success');
    },
    onError: (err) => {
      toast('Error al comentar', err instanceof Error ? err.message : 'No se pudo enviar el comentario.', 'error');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => feedRepository.delete(postId),
    onSuccess: (_data, postId) => {
      queryClient.setQueriesData<PaginatedPosts>({ queryKey: FEED_QUERY_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((p) => p.id !== postId),
        };
      });
      toast('Publicación eliminada', 'El post ha sido removido del feed.', 'info');
    },
  });
}
