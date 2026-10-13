'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { QuickUserSwitcher } from '@/features/auth/components/QuickUserSwitcher';
import { useAuthStore } from '@/shared/security/auth.store';
import { ToastContainer } from './Toast';
import {
  Home,
  Compass,
  Bell,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Search,
  PlusCircle,
  Menu,
} from 'lucide-react';

import { AemoraLoginScreen } from '@/features/auth/components/AemoraLoginScreen';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  // Si el usuario no ha iniciado sesión, desplegamos la pantalla de login inmersiva
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <ToastContainer />
        <AemoraLoginScreen />
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Global Notifications */}
      <ToastContainer />

      {/* =========================================================================
          SIDEBAR DE ESCRITORIO
      ========================================================================= */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 border-r border-slate-800/80 p-5 sticky top-0 h-screen shrink-0 bg-slate-950/70 backdrop-blur-2xl z-40">
        <div className="flex flex-col gap-7">
          {/* Cabecera con Logotipo de Alta Gama */}
          <Link href="/" className="px-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl">
            <Logo size="md" />
          </Link>

          {/* Menú de Navegación con Detección de Ruta Activa */}
          <nav className="flex flex-col gap-1.5" aria-label="Navegación principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-950/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Botón Acción Crear Publicación */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Publicar</span>
          </Link>
        </div>

        {/* Tarjeta Inferior de Usuario Activo con Switcher */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <Link href="/profile" className="flex items-center gap-2.5 overflow-hidden flex-1 group">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                  {user.displayName}
                </span>
                <span className="text-[11px] text-slate-400 truncate">@{user.username}</span>
              </div>
            </Link>

            <div title="Zero-Trust Autenticación Segura" className="text-cyan-400 shrink-0 ml-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          CONTENIDO PRINCIPAL Y HEADER SUPERIOR
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior con QuickUserSwitcher */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/">
              <Logo size="sm" showWordmark={false} />
            </Link>
          </div>

          {/* Buscador Global Rápido */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en Aemora (#owasp, @carlos)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Controles del Header: Estado MSW y Quick User Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MSW Active</span>
            </div>

            {/* Selector Rápido de Usuarios (Emily / Carlos / Sofia) */}
            <QuickUserSwitcher />
          </div>
        </header>

        {/* Área Central de Vistas */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* =========================================================================
          BARRA DE NAVEGACIÓN MÓVIL INFERIOR
      ========================================================================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 flex justify-around py-2.5 px-2"
        aria-label="Navegación móvil"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-medium transition-colors relative ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
              {item.badge && !isActive && (
                <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-1 right-2" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
