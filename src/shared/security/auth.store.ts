import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User) => void;
  loginWithCredentials: (usernameOrEmail: string, password: string) => Promise<User>;
  loginWithFirebaseToken: (idToken: string) => Promise<User>;
  registerWithCredentials: (input: { username: string; email: string; displayName: string; password: string }) => Promise<User>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUser: (partialUser: Partial<User>) => void;
}

const storedUser: User | null = typeof window !== 'undefined'
  ? JSON.parse(localStorage.getItem('aemora_user') || 'null')
  : null;
const storedAccessToken = typeof window !== 'undefined' ? localStorage.getItem('aemora_access_token') : null;
const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('aemora_refresh_token') : null;

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: storedUser || DEMO_USERS[0],
  allDemoUsers: DEMO_USERS,
  // Iniciamos en false para dar la bienvenida con la pantalla interactiva de Login
  isAuthenticated: Boolean(storedUser && storedAccessToken),
  isLoading: false,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,

  login: (user: User) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('aemora_access_token')
      : null;

    // Los perfiles rápidos son solo demostrativos: no pueden abrir una sesión
    // real ni publicar sin un JWT emitido por FastAPI.
    if (!token) {
      set({ user, isAuthenticated: false });
      return;
    }

    if (typeof window !== 'undefined') localStorage.setItem('aemora_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, accessToken: token });
  },

  loginWithCredentials: async (usernameOrEmail, password) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail?.[0]?.msg || data.detail || 'No se pudo iniciar sesión');
    const apiUser = data.user;
    const user: User = {
      id: apiUser.id,
      username: apiUser.username,
      displayName: apiUser.display_name,
      email: apiUser.email,
      avatarUrl: apiUser.avatar_url || generateDiceBearAvatar(apiUser.username),
      bannerUrl: '', bio: apiUser.bio || '', verified: apiUser.is_verified,
      role: apiUser.role, stats: { followersCount: 0, followingCount: 0, postsCount: 0, likesReceivedCount: 0 },
      isPrivate: false, createdAt: apiUser.created_at, updatedAt: apiUser.created_at,
    };
    localStorage.setItem('aemora_access_token', data.access_token);
    localStorage.setItem('aemora_refresh_token', data.refresh_token);
    localStorage.setItem('aemora_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, accessToken: data.access_token, refreshToken: data.refresh_token });
    return user;
  },

  loginWithFirebaseToken: async (idToken) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail?.[0]?.msg || data.detail || 'No se pudo iniciar sesión con Firebase');
    const apiUser = data.user;
    const user: User = {
      id: apiUser.id,
      username: apiUser.username,
      displayName: apiUser.display_name,
      email: apiUser.email,
      avatarUrl: apiUser.avatar_url || generateDiceBearAvatar(apiUser.username),
      bannerUrl: '', bio: apiUser.bio || '', verified: apiUser.is_verified,
      role: apiUser.role, stats: { followersCount: 0, followingCount: 0, postsCount: 0, likesReceivedCount: 0 },
      isPrivate: false, createdAt: apiUser.created_at, updatedAt: apiUser.created_at,
    };
    localStorage.setItem('aemora_access_token', data.access_token);
    localStorage.setItem('aemora_refresh_token', data.refresh_token);
    localStorage.setItem('aemora_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, accessToken: data.access_token, refreshToken: data.refresh_token });
    return user;
  },

  registerWithCredentials: async ({ username, email, displayName, password }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, email, display_name: displayName, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail?.[0]?.msg || data.detail || 'No se pudo registrar');
    return get().loginWithCredentials(email, password);
  },

  logout: () => {
    localStorage.removeItem('aemora_access_token');
    localStorage.removeItem('aemora_refresh_token');
    localStorage.removeItem('aemora_user');
    set({ isAuthenticated: false, accessToken: null, refreshToken: null });
  },

  switchUser: (userId: string) => {
    const selected = DEMO_USERS.find((u) => u.id === userId);
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('aemora_access_token')
      : null;
    if (selected && token) {
      set({ user: selected, isAuthenticated: true, accessToken: token });
    }
  },

  updateUser: (partialUser) => {
    set((state) => ({
      user: { ...state.user, ...partialUser, updatedAt: new Date().toISOString() },
    }));
  },
}), { name: 'aemora-auth' }));
