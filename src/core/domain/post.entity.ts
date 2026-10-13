import { z } from 'zod';
import { UserAuthorSchema } from './user.entity';
import { CommentSchema } from './comment.entity';
import { createPaginatedResultSchema } from './pagination.entity';

export const PostVisibilitySchema = z.enum(['public', 'followers_only', 'private']);
export type PostVisibility = z.infer<typeof PostVisibilitySchema>;

export const MediaTypeSchema = z.enum(['image', 'video']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const PostMediaSchema = z.object({
  id: z.string().min(1),
  type: MediaTypeSchema.default('image'),
  url: z.string().url({ message: 'La URL del archivo multimedia debe ser válida.' }),
  altText: z
    .string()
    .max(200, 'El texto alternativo no puede superar 200 caracteres.')
    .default('Imagen compartida en Aemora'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type PostMedia = z.infer<typeof PostMediaSchema>;

export const PostMetricsSchema = z.object({
  likesCount: z.number().int().nonnegative().default(0),
  commentsCount: z.number().int().nonnegative().default(0),
  repostsCount: z.number().int().nonnegative().default(0),
  viewsCount: z.number().int().nonnegative().default(0),
});
export type PostMetrics = z.infer<typeof PostMetricsSchema>;

export const PostSchema = z.object({
  id: z.string().min(1, 'El ID del post es obligatorio.'),
  author: UserAuthorSchema,
  content: z
    .string()
    .min(1, 'El post no puede estar vacío.')
    .max(1000, 'El post supera el límite de 1,000 caracteres.')
    .trim(),
  media: z.array(PostMediaSchema).max(4, 'Máximo 4 adjuntos por post.').default([]),
  tags: z.array(z.string()).max(10, 'Máximo 10 hashtags por publicación.').default([]),
  visibility: PostVisibilitySchema.default('public'),
  metrics: PostMetricsSchema.default({
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    viewsCount: 0,
  }),
  comments: z.array(CommentSchema).default([]),
  isLikedByMe: z.boolean().default(false),
  isRepostedByMe: z.boolean().default(false),
  isSavedByMe: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type Post = z.infer<typeof PostSchema>;

export const CreatePostInputSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido es requerido.')
    .max(1000, 'Máximo 1000 caracteres permitidos.')
    .trim(),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().max(200).optional(),
      })
    )
    .max(4)
    .optional()
    .default([]),
  visibility: PostVisibilitySchema.optional().default('public'),
  tags: z.array(z.string()).max(10).optional().default([]),
  author: UserAuthorSchema.optional(),
});
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;

export const PaginatedPostsSchema = createPaginatedResultSchema(PostSchema);
export type PaginatedPosts = z.infer<typeof PaginatedPostsSchema>;
