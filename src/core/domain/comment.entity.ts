import { z } from 'zod';
import { UserAuthorSchema } from './user.entity';

export const CommentSchema = z.object({
  id: z.string().min(1, 'El ID de comentario es obligatorio.'),
  postId: z.string().min(1, 'El ID de post asociado es obligatorio.'),
  author: UserAuthorSchema,
  content: z.string().min(1, 'El comentario no puede estar vacío.').max(500, 'Máximo 500 caracteres.'),
  createdAt: z.string().default(() => new Date().toISOString()),
  likesCount: z.number().int().nonnegative().default(0),
  isLikedByMe: z.boolean().default(false),
});

export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentInputSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, 'El comentario no puede estar vacío.').max(500).trim(),
  author: UserAuthorSchema.optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;
