'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, DEMO_USERS } from '@/shared/security/auth.store';
import { toast } from '@/shared/ui/Toast';
import { ChevronDown, Check, UserCheck, Shield, Sparkles, Crown, LogOut } from 'lucide-react';

export const QuickUserSwitcher: React.FC = () => {
  const { user, switchUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (userId: string) => {
    const selected = DEMO_USERS.find((u) => u.id === userId);
    if (selected) {
      switchUser(userId);
      toast('Sesión cambiada', `Interactuando como ${selected.displayName} (@${selected.username})`, 'info');
      setIsOpen(false);
    }
  };

  const getRoleIcon = (username: string) => {
    if (username.includes('founder') || username.includes('emily')) return Crown;
    if (username.includes('sec') || username.includes('carlos')) return Shield;
    return Sparkles;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Disparador del Switcher en Formato Píldora (X style) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#161F30] hover:bg-white/[0.08] border border-white/[0.08] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        aria-label="Cambiar perfil activo"
        aria-expanded={isOpen}
      >
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="w-7 h-7 rounded-full bg-[#0B0F17] border border-white/10 object-cover shrink-0"
        />
        <div className="flex flex-col text-left hidden sm:flex leading-tight">
          <span className="text-xs font-bold text-[#F8FAFC]">
            {user.displayName}
          </span>
          <span className="text-[10px] text-[#1d9bf0] font-medium">@{user.username}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable (Container 16px rounded-2xl según DESIGN.md) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#161F30] border border-white/[0.08] shadow-2xl z-50 p-2 animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#1d9bf0]" />
              Cambio Rápido de Perfil
            </span>
            <span className="text-[10px] bg-[#1d9bf0]/10 text-[#1d9bf0] px-2 py-0.5 rounded-full font-semibold border border-[#1d9bf0]/20">
              In-Memory
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1.5">
            {DEMO_USERS.map((demoUser) => {
              const isSelected = demoUser.id === user.id;
              const RoleIcon = getRoleIcon(demoUser.username);

              return (
                <button
                  key={demoUser.id}
                  type="button"
                  onClick={() => handleSelectUser(demoUser.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                    isSelected
                      ? 'bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 text-white'
                      : 'hover:bg-white/[0.05] text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={demoUser.avatarUrl}
                      alt={demoUser.displayName}
                      className="w-9 h-9 rounded-full bg-[#0B0F17] border border-white/10 object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate text-[#F8FAFC]">{demoUser.displayName}</span>
                        <RoleIcon className="w-3 h-3 text-[#1d9bf0] shrink-0" />
                      </div>
                      <span className="text-[11px] text-[#94A3B8] truncate">@{demoUser.username}</span>
                      <span className="text-[10px] text-[#94A3B8]/70 truncate mt-0.5 max-w-[170px]">
                        {demoUser.bio.slice(0, 42)}...
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#1d9bf0] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-white/[0.08] flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                useAuthStore.getState().logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión / Portal de Login</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
