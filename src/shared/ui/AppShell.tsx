'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { QuickUserSwitcher } from '@/features/auth/components/QuickUserSwitcher';
import { useAuthStore } from '@/shared/security/auth.store';
import { ToastContainer } from './Toast';
import { httpClient } from '@/shared/http/http-client';
import {
  Home,
  Compass,
  Bell,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Search,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { AemoraLoginScreen } from '@/features/auth/components/AemoraLoginScreen';
import { LoginAdventure3DNative as LoginAdventure3D } from '@/features/auth/components/LoginAdventure3DNative';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [showLegacyLogin, setShowLegacyLogin] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (userSearch.trim().length < 2) {
      setUserSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const response = await httpClient.get<{ items: any[] }>(
          `/api/v1/users/search?q=${encodeURIComponent(userSearch.trim())}`
        );
        setUserSearchResults(response.items ?? []);
      } catch {
        setUserSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [userSearch]);

  // Si el usuario no ha iniciado sesión, desplegamos la pantalla de login inmersiva
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC]">
        <ToastContainer />
        {showLegacyLogin ? (
          <AemoraLoginScreen />
        ) : (
          <LoginAdventure3D onCreateAccount={() => setShowLegacyLogin(true)} />
        )}
      </div>
    );
  }

  const navItems = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Explorar', href: '/explore', icon: Compass },
    { label: 'Notificaciones', href: '/notifications', icon: Bell, badge: '4' },
    { label: 'Mensajes', href: '/messages', icon: Mail, badge: '1' },
    { label: 'Perfil', href: '/profile', icon: UserIcon },
  ];

  const trendingTopics = [
    { tag: 'cybersecurity', posts: '14.2K posts', category: 'Ciberseguridad · Tendencia' },
    { tag: 'owasp_top10', posts: '9.8K posts', category: 'Seguridad Web · Tendencia' },
    { tag: 'clean_architecture', posts: '7.1K posts', category: 'Software · Tendencia' },
    { tag: 'uiux_design', posts: '5.4K posts', category: 'Diseño · Tendencia' },
  ];

  const isMessagesPage = pathname === '/messages';

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex justify-center antialiased selection:bg-[#1d9bf0]/30 selection:text-[#1d9bf0]">
      {/* Toast Global Notifications */}
      <ToastContainer />

      {/* Contenedor Grid Principal de 3 Columnas (X / Cyber-Dark Layout) */}
      <div className="w-full max-w-[1240px] flex justify-between min-h-screen">
        {/* =========================================================================
            COLUMNA 1: NAVEGACIÓN LATERAL IZQUIERDA (~68px - 240px)
        ========================================================================= */}
        <aside className="w-[68px] xl:w-[250px] flex flex-col justify-between p-2 sm:px-3 sm:py-3 sticky top-0 h-screen shrink-0 border-r border-white/[0.08] z-30">
          <div className="flex flex-col gap-2">
            {/* Logotipo de Aemora */}
            <div className="p-2 xl:px-3 mb-1">
              <Link
                href="/"
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/[0.08] transition-colors -ml-1"
                aria-label="Aemora Home"
              >
                <Logo size="sm" showWordmark={false} />
              </Link>
            </div>

            {/* Menú de Navegación con Botones Píldora (rounded-full) */}
            <nav className="flex flex-col gap-1" aria-label="Navegación principal">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-4 p-3 xl:px-4 xl:py-3 rounded-full transition-colors group ${
                      isActive
                        ? 'font-bold text-[#F8FAFC]'
                        : 'text-[#F8FAFC] hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon
                        className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-[#1d9bf0]' : 'text-[#F8FAFC]'
                        }`}
                      />
                      {item.badge && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#1d9bf0] absolute -top-0.5 -right-0.5" />
                      )}
                    </div>
                    <span className="hidden xl:inline text-lg leading-tight tracking-normal">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Botón Acción Postear (Píldora rounded-full estilo X) */}
            <div className="mt-4">
              <Link
                href="/"
                className="hidden xl:flex items-center justify-center w-full py-3.5 px-4 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[17px] shadow-sm transition-all hover:shadow-lg active:scale-95"
              >
                <span>Postear</span>
              </Link>

              {/* Botón flotante para vista compacta (pantallas intermedias) */}
              <Link
                href="/"
                className="xl:hidden w-12 h-12 flex items-center justify-center rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white shadow-sm transition-all"
                title="Postear"
              >
                <PlusCircle className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {/* Tarjeta Inferior de Usuario Activo en Formato Píldora */}
          <div className="pt-2 pb-2">
            <div className="hidden xl:flex items-center justify-between p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer group">
              <Link href="/profile" className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full bg-[#161F30] border border-white/10 object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-sm font-bold text-[#F8FAFC] truncate">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-[#94A3B8] truncate">@{user.username}</span>
                </div>
              </Link>
              <div className="shrink-0 ml-1">
                <QuickUserSwitcher />
              </div>
            </div>

            {/* Vista compacta del usuario */}
            <div className="xl:hidden flex justify-center">
              <QuickUserSwitcher />
            </div>
          </div>
        </aside>

        {/* =========================================================================
            COLUMNA 2: FEED DE PUBLICACIONES AL CENTRO (~600px o ~950px en mensajes)
        ========================================================================= */}
        <main
          className={`w-full min-h-screen border-r border-white/[0.08] flex flex-col pb-20 md:pb-6 ${
            isMessagesPage ? 'max-w-[950px]' : 'max-w-[600px]'
          }`}
        >
          {children}
        </main>

        {/* =========================================================================
            COLUMNA 3: PANEL LATERAL DERECHO (AEMORA AI Y TENDENCIAS ~290px-350px)
        ========================================================================= */}
        {!isMessagesPage && (
          <aside className="hidden lg:flex flex-col w-[300px] xl:w-[350px] p-4 gap-4 sticky top-0 h-screen overflow-y-auto shrink-0">
            {/* Buscador Estilo X en Formato Píldora (rounded-full) */}
            <div className="relative sticky top-0 z-10 bg-[#0B0F17] pb-1">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#161F30] border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-[#0B0F17] transition-all">
                <Search className="w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Buscar en Aemora"
                  className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none"
                />
              </div>
              {userSearch.trim().length >= 2 && (
                <div className="absolute top-14 left-0 right-0 z-40 rounded-2xl bg-[#161F30] border border-white/[0.08] shadow-2xl overflow-hidden">
                  {isSearchingUsers ? (
                    <p className="p-3 text-xs text-[#94A3B8]">Buscando usuarios...</p>
                  ) : userSearchResults.length === 0 ? (
                    <p className="p-3 text-xs text-[#94A3B8]">No encontramos esa cuenta.</p>
                  ) : (
                    userSearchResults.map((person) => (
                      <Link
                        key={person.id}
                        href={`/profile?username=${encodeURIComponent(person.username)}`}
                        onClick={() => setUserSearch('')}
                        className="flex items-center gap-3 p-3 hover:bg-white/[0.06]"
                      >
                        <img
                          src={person.avatar_url ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=aemora'}
                          alt={person.display_name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-bold truncate">{person.display_name}</span>
                          <span className="block text-xs text-[#94A3B8] truncate">@{person.username}</span>
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Tarjeta Aemora AI (Degradado Accent AI + Llama 3.3 en Groq) */}
            <div className="p-4 rounded-2xl bg-[#161F30] border border-white/[0.08] flex flex-col gap-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span
                    className="font-bold text-base bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                    }}
                  >
                    Aemora AI
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1d9bf0]/10 text-[#1d9bf0] font-semibold border border-[#1d9bf0]/20">
                  Llama 3.3 70B
                </span>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Asistente de inteligencia artificial para auditar ciberseguridad, Clean Architecture y optimizar tus publicaciones en tiempo real.
              </p>

              <Link
                href="/messages"
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                }}
              >
                <span>Conversar con Aemora AI</span>
              </Link>
            </div>

            {/* Tarjeta de Tendencias (Estilo "Qué está pasando" en X) */}
            <div className="rounded-2xl bg-[#161F30] border border-white/[0.08] overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                <h3 className="font-black text-base text-[#F8FAFC] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1d9bf0]" />
                  Qué está pasando
                </h3>
              </div>

              <div className="flex flex-col">
                {trendingTopics.map((topic) => (
                  <Link
                    key={topic.tag}
                    href="/explore"
                    className="p-3 hover:bg-white/[0.04] transition-colors flex flex-col gap-0.5"
                  >
                    <span className="text-xs text-[#94A3B8] font-normal">{topic.category}</span>
                    <span className="text-sm font-bold text-[#F8FAFC]">#{topic.tag}</span>
                    <span className="text-xs text-[#94A3B8] font-mono">{topic.posts}</span>
                  </Link>
                ))}
              </div>

              <Link
                href="/explore"
                className="p-3 text-xs text-[#1d9bf0] hover:bg-white/[0.04] font-medium transition-colors"
              >
                Mostrar más
              </Link>
            </div>

            {/* Tarjeta de Seguridad OWASP Zero-Trust */}
            <div className="p-4 rounded-2xl bg-[#161F30] border border-white/[0.08] flex flex-col gap-2 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <Lock className="w-3.5 h-3.5 text-[#1d9bf0]" />
                <span>Seguridad Web Activa</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                OWASP Top 10 compliance: Sanitización estricta DOMPurify en tiempo de ejecución y JWT manejados exclusivamente en memoria volátil.
              </p>
            </div>

            {/* Enlaces Legales / Footer estilo X */}
            <footer className="px-2 text-[11px] text-[#94A3B8]/60 flex flex-wrap gap-x-2.5 gap-y-1">
              <span className="hover:underline cursor-pointer">Condiciones de Servicio</span>
              <span className="hover:underline cursor-pointer">Política de Privacidad</span>
              <span className="hover:underline cursor-pointer">Accesibilidad</span>
              <span>© 2026 Aemora Social</span>
            </footer>
          </aside>
        )}
      </div>

      {/* =========================================================================
          BARRA DE NAVEGACIÓN MÓVIL INFERIOR
      ========================================================================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/[0.08] flex justify-around py-2 px-2"
        aria-label="Navegación móvil"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-full text-xs font-medium transition-colors relative ${
                isActive ? 'text-[#1d9bf0] font-bold' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Icon className="w-6 h-6" />
              {item.badge && !isActive && (
                <span className="w-2 h-2 rounded-full bg-[#1d9bf0] absolute top-1.5 right-2" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
