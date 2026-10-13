import { z } from 'zod';

export const UserRoleSchema = z.enum(['user', 'moderator', 'admin', 'verified_creator']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatsSchema = z.object({
  followersCount: z.number().int().nonnegative().default(0),
  followingCount: z.number().int().nonnegative().default(0),
  postsCount: z.number().int().nonnegative().default(0),
  likesReceivedCount: z.number().int().nonnegative().default(0),
});
export type UserStats = z.infer<typeof UserStatsSchema>;

/**
 * Representación simplificada del autor embebido en publicaciones y comentarios.
 * Validación flexible de ID para evitar falsos rechazos en tiempo de ejecución.
 */
export const UserAuthorSchema = z.object({
  id: z.string().min(1, 'El ID de usuario es obligatorio.'),
  username: z
    .string()
    .min(2, 'El username debe tener al menos 2 caracteres.')
    .max(30, 'El username no puede exceder 30 caracteres.')
    .regex(/^[a-zA-Z0-9_]+$/, 'El username solo permite caracteres alfanuméricos y guiones bajos.'),
  displayName: z
    .string()
    .min(1, 'El nombre visible es obligatorio.')
    .max(50, 'El nombre visible no puede exceder 50 caracteres.')
    .trim(),
  avatarUrl: z
    .string()
    .url({ message: 'El avatar debe ser una URL válida.' })
    .default('https://api.dicebear.com/7.x/avataaars/svg?seed=AemoraUser'),
  verified: z.boolean().default(false),
  role: UserRoleSchema.default('user'),
});
export type UserAuthor = z.infer<typeof UserAuthorSchema>;

/**
 * Entidad de Dominio: Usuario Completo de Aemora.
 */
export const UserSchema = UserAuthorSchema.extend({
  email: z.string().email('Dirección de correo electrónico inválida.').toLowerCase(),
  bio: z
    .string()
    .max(280, 'La biografía no puede exceder 280 caracteres.')
    .default('')
    .transform((val) => val.trim()),
  bannerUrl: z.string().url().optional().nullable(),
  stats: UserStatsSchema.default({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    likesReceivedCount: 0,
  }),
  isPrivate: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type User = z.infer<typeof UserSchema>;

export function generateDiceBearAvatar(seed: string): string {
  const safeSeed = encodeURIComponent(seed.trim().toLowerCase());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
