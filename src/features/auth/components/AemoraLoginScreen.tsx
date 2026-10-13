'use client';

import React, { useState } from 'react';
import {
  InteractiveAemoraLogo,
  CyberParticleBackground,
  LogoInteractionState,
} from '@/shared/ui/InteractiveAemoraLogo';
import { useAuthStore, DEMO_USERS } from '@/shared/security/auth.store';
import { User, generateDiceBearAvatar } from '@/core/domain/user.entity';
import { toast } from '@/shared/ui/Toast';
import {
  ShieldCheck,
  Dices,
  Sparkles,
  ArrowRight,
  Lock,
  User as UserIcon,
  Crown,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

const RANDOM_SEEDS = [
  'NovaCyber',
  'AegisViper',
  'EchoPilot',
  'QuantumFox',
  'ZeroTrustHero',
  'KryptonCore',
  'NexusGlitch',
  'CyberValkyrie',
  'ZenithNode',
];

export const AemoraLoginScreen: React.FC = () => {
  const { login } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'quick' | 'dicebear'>('quick');
  const [logoState, setLogoState] = useState<LogoInteractionState>('idle');

  // Estado para la pestaña de Avatar Personalizado
  const [avatarSeed, setAvatarSeed] = useState('CyberVanguard');
  const [username, setUsername] = useState('aemora_explorer');
  const [displayName, setDisplayName] = useState('Nuevo Usuario');
  const [password, setPassword] = useState('••••••••••••');

  // Estado de transición de acceso concedido
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizingUser, setAuthorizingUser] = useState<User | null>(null);

  // Manejador de selección rápida de perfil
  const handleQuickLogin = (selectedUser: User) => {
    setAuthorizingUser(selectedUser);
    setIsAuthorizing(true);
    setLogoState('success');

    setTimeout(() => {
      login(selectedUser);
      toast(
        'Acceso Concedido',
        `Bienvenido(a) de nuevo, ${selectedUser.displayName}. Sesión en memoria iniciada.`,
        'success'
      );
    }, 1400);
  };

  // Randomizar semilla de DiceBear
  const handleRandomizeAvatar = () => {
    const nextSeed = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)] + '_' + Math.floor(Math.random() * 900 + 100);
    setAvatarSeed(nextSeed);
  };

  // Login con Avatar Personalizado
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) return;

    const newUser: User = {
      id: `user_${Date.now()}_custom`,
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: displayName.trim(),
      email: `${username.trim().toLowerCase()}@aemora.io`,
      avatarUrl: generateDiceBearAvatar(avatarSeed),
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
      bio: 'Explorador y miembro soberano de Aemora. Defendiendo la privacidad y el código abierto.',
      verified: false,
      role: 'user',
      stats: {
        followersCount: 1,
        followingCount: 3,
        postsCount: 0,
        likesReceivedCount: 0,
      },
      isPrivate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAuthorizingUser(newUser);
    setIsAuthorizing(true);
    setLogoState('success');

    setTimeout(() => {
      login(newUser);
      toast('Identidad Creada', `Bienvenido a Aemora, ${newUser.displayName}`, 'success');
    }, 1400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 antialiased select-none">
      {/* Fondo de Partículas Interactivo */}
      <CyberParticleBackground />

      {/* Luces Ambientales de Fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Superposición Holográfica de Acceso Concedido */}
      {isAuthorizing && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative">
            <InteractiveAemoraLogo state="success" size={130} />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Credencial Criptográfica Validada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Acceso Concedido // {authorizingUser?.displayName}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Iniciando túnel seguro Zero-Trust e hidratando estado en memoria...
            </p>
          </div>

          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Tarjeta Principal de Inicio de Sesión (Glassmorphism de Alto Grado) */}
      <div className="relative z-10 max-w-lg w-full rounded-3xl bg-slate-900/80 border border-slate-700/60 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl overflow-hidden p-6 sm:p-8 transition-all duration-300">
        {/* Cabecera con Logotipo Inteligente Reactivo */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <InteractiveAemoraLogo state={logoState} size={110} />

          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                AEMORA
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Zero-Trust
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Red social ultra-segura, descentralizada y libre de rastreo.
            </p>
          </div>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              setLogoState('idle');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'quick'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso Rápido</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('dicebear');
              setLogoState('idle');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'dicebear'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Avatar</span>
          </button>
        </div>

        {/* =========================================================================
            PESTAÑA A: ACCESO RÁPIDO (3 PERFILES PRECONFIGURADOS)
        ========================================================================= */}
        {activeTab === 'quick' && (
          <div className="flex flex-col gap-3 animate-in fade-in-50 duration-200">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Selecciona una identidad para ingresar al instante:
            </span>

            {DEMO_USERS.map((demo) => {
              const isCEO = demo.role === 'admin';
              const isSecurity = demo.username.includes('sec');

              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-850/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 group text-left hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-indigo-950/30"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={demo.avatarUrl}
                        alt={demo.displayName}
                        className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-950 border border-slate-800">
                        {isCEO ? (
                          <Crown className="w-3.5 h-3.5 text-purple-400" />
                        ) : isSecurity ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {demo.displayName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 shrink-0">
                          {isCEO ? 'Fundadora' : isSecurity ? 'Seguridad' : 'Diseño UX'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 truncate">@{demo.username}</span>
                      <span className="text-[11px] text-slate-500 truncate mt-0.5">
                        {demo.bio.slice(0, 48)}...
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            PESTAÑA B: GENERADOR DE AVATAR EN VIVO (DICEBEAR LIVE)
        ========================================================================= */}
        {activeTab === 'dicebear' && (
          <form onSubmit={handleCustomLogin} className="flex flex-col gap-4 animate-in fade-in-50 duration-200">
            {/* Vista Previa de Avatar DiceBear en Tiempo Real */}
            <div className="flex items-center justify-center gap-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="relative group">
                <img
                  src={generateDiceBearAvatar(avatarSeed)}
                  alt="Avatar DiceBear en Vivo"
                  className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-indigo-500/50 shadow-xl object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-pulse pointer-events-none" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Semilla: <code className="text-indigo-400 font-mono text-[11px]">{avatarSeed}</code>
                </span>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <Dices className="w-4 h-4 text-cyan-400 animate-spin-hover" />
                  <span>🎲 Randomizar Avatar</span>
                </button>
              </div>
            </div>

            {/* Input Nombre Visible */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                Nombre Visible
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onFocus={() => setLogoState('focus-user')}
                onBlur={() => setLogoState('idle')}
                placeholder="Ej: Alex Rivera"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            {/* Input Nombre de Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>@</span>
                Nombre de Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setLogoState('focus-user')}
                onBlur={() => setLogoState('idle')}
                placeholder="ej: alex_cyber"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Input Contraseña Cifrada (Dispara el Plegado del Logo) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Contraseña Simulada
                </label>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  (Activa el escudo del logo)
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setLogoState('focus-password')}
                onBlur={() => setLogoState('idle')}
                placeholder="Tu contraseña secreta..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            {/* Botón Entrar */}
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar a Aemora con este Avatar</span>
            </button>
          </form>
        )}

        {/* Pie de Página de Seguridad */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            OWASP Top 10 Compliant
          </span>
          <span className="font-mono text-[10px]">v0.2.0 • In-Memory Auth</span>
        </div>
      </div>
    </div>
  );
};
