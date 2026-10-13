import { create } from 'zustand';
import { User, generateDiceBearAvatar } from '@/core/domain/user.entity';

/**
 * Perfiles demostrativos preconfigurados para Aemora.
 */
export const DEMO_USERS: User[] = [
  {
    id: 'user_emily_001',
    username: 'emily_founder',
    displayName: 'Emily Chen',
    email: 'emily@aemora.io',
    avatarUrl: generateDiceBearAvatar('EmilyChen_Aemora_CEO'),
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    bio: 'Fundadora y CEO de Aemora 🚀 Creando una red social transparente, descentralizada y de alto impacto.',
    verified: true,
    role: 'admin',
    stats: {
      followersCount: 15420,
      followingCount: 382,
      postsCount: 114,
      likesReceivedCount: 48900,
    },
    isPrivate: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-10-12T12:00:00Z',
  },
  {
    id: 'user_carlos_002',
    username: 'carlos_sec',
    displayName: 'Carlos Méndez',
    email: 'carlos@aemora.io',
    avatarUrl: generateDiceBearAvatar('CarlosMendez_SecurityLead'),
    bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80',
    bio: 'Staff Security Engineer @ Aemora. Apasionado de OWASP Top 10, Zero-Trust Web y mitigación de XSS/CSRF.',
    verified: true,
    role: 'verified_creator',
    stats: {
      followersCount: 6840,
      followingCount: 240,
      postsCount: 56,
      likesReceivedCount: 19400,
    },
    isPrivate: false,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-10-12T12:00:00Z',
  },
  {
    id: 'user_sofia_003',
    username: 'sofia_ux',
    displayName: 'Sofia Valdés',
    email: 'sofia@aemora.io',
    avatarUrl: generateDiceBearAvatar('SofiaValdes_DesignLead'),
    bannerUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=80',
    bio: 'Lead UI/UX Designer en Aemora ✨ Obsesionada con micro-interacciones, tipografía y sistemas de diseño accesibles.',
    verified: true,
    role: 'verified_creator',
    stats: {
      followersCount: 9350,
      followingCount: 410,
      postsCount: 78,
      likesReceivedCount: 31200,
    },
    isPrivate: false,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-10-12T12:00:00Z',
  },
];

interface AuthState {
  user: User;
  allDemoUsers: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUser: (partialUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USERS[0],
  allDemoUsers: DEMO_USERS,
  // Iniciamos en false para dar la bienvenida con la pantalla interactiva de Login
  isAuthenticated: false,
  isLoading: false,

  login: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  switchUser: (userId: string) => {
    const selected = DEMO_USERS.find((u) => u.id === userId);
    if (selected) {
      set({ user: selected, isAuthenticated: true });
    }
  },

  updateUser: (partialUser) => {
    set((state) => ({
      user: { ...state.user, ...partialUser, updatedAt: new Date().toISOString() },
    }));
  },
}));
