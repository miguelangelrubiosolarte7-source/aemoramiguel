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
  const { login, loginWithCredentials, registerWithCredentials } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'quick' | 'login' | 'dicebear'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
    toast(
      'Perfil demostrativo',
      `${selectedUser.displayName} no es una sesión real. Inicia sesión con tu cuenta o crea una nueva para publicar.`,
      'info'
    );
  };

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) return;
    setIsAuthorizing(true);
    setLogoState('success');
    try {
      const savedUser = await loginWithCredentials(loginIdentifier.trim(), loginPassword);
      setAuthorizingUser(savedUser);
      toast('Sesión iniciada', `Bienvenido(a), ${savedUser.displayName}.`, 'success');
    } catch (error: unknown) {
      setIsAuthorizing(false);
      setLogoState('idle');
      toast('No se pudo iniciar sesión', error instanceof Error ? error.message : 'Revisa tus credenciales.', 'error');
    }
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
      registerWithCredentials({
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        password,
      }).then((savedUser: User) => {
        login(savedUser);
        toast('Identidad Creada', `Bienvenido a Aemora, ${savedUser.displayName}`, 'success');
      }).catch((error: unknown) => {
        setIsAuthorizing(false);
        setLogoState('idle');
        toast('No se pudo crear la cuenta', error instanceof Error ? error.message : 'Error de conexión', 'error');
      });
    }, 1400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 antialiased select-none">
      {/* Fondo de Partículas Cyber-Dark */}
      <CyberParticleBackground />

      {/* Luces Ambientales de Fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1d9bf0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Superposición Holográfica de Acceso Concedido (Cards: 16px rounded-2xl) */}
      {isAuthorizing && (
        <div className="absolute inset-0 z-50 bg-[#0B0F17]/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative">
            <InteractiveAemoraLogo state="success" size={130} />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center px-4">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Credencial Criptográfica Validada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              Acceso Concedido // {authorizingUser?.displayName}
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-sm">
              Iniciando túnel seguro Zero-Trust e hidratando estado en memoria...
            </p>
          </div>

          <div className="w-48 h-1.5 bg-[#161F30] rounded-full overflow-hidden mt-2 border border-white/[0.08]">
            <div className="h-full bg-gradient-to-r from-[#1d9bf0] via-purple-500 to-emerald-400 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Tarjeta Principal de Inicio de Sesión (Container 16px rounded-2xl según DESIGN.md) */}
      <div className="relative z-10 max-w-lg w-full rounded-2xl bg-[#161F30]/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl overflow-hidden p-6 sm:p-8 transition-all duration-300">
        {/* Cabecera con Logotipo Inteligente Reactivo */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <InteractiveAemoraLogo state={logoState} size={110} />

          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-[#F8FAFC]">
                AEMORA
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1d9bf0]/10 text-[#1d9bf0] border border-[#1d9bf0]/20">
                Zero-Trust
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] max-w-xs">
              Red social moderna, ultra-segura y descentralizada.
            </p>
          </div>
        </div>

        {/* Selector de Pestañas con Formato Píldora (rounded-full) */}
        <div className="grid grid-cols-3 p-1 rounded-full bg-[#0B0F17] border border-white/[0.08] mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLogoState('idle');
            }}
            className={`py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-[#1d9bf0] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Iniciar sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              setLogoState('idle');
            }}
            className={`py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'quick'
                ? 'bg-[#1d9bf0] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
            className={`py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'dicebear'
                ? 'bg-[#1d9bf0] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Avatar</span>
          </button>
        </div>

        {/* =========================================================================
            PESTAÑA A: ACCESO RÁPIDO (Tarjetas 16px rounded-2xl y avatares rounded-full)
        ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleRealLogin} className="flex flex-col gap-4 animate-in fade-in-50 duration-200">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
              Accede con tu cuenta de Aemora
            </span>
            <input type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="Usuario o correo electrónico" autoComplete="username" required className="w-full bg-[#0B0F17] border border-white/[0.08] rounded-md px-3.5 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0]" />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Contraseña" autoComplete="current-password" required className="w-full bg-[#0B0F17] border border-white/[0.08] rounded-md px-3.5 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0]" />
            <button type="submit" className="mt-2 w-full py-3 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[15px] transition-all">
              Entrar a Aemora
            </button>
          </form>
        )}

        {activeTab === 'quick' && (
          <div className="flex flex-col gap-3 animate-in fade-in-50 duration-200">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1">
              Selecciona una identidad para ingresar:
            </span>

            {DEMO_USERS.map((demo) => {
              const isCEO = demo.role === 'admin';
              const isSecurity = demo.username.includes('sec');

              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0F17]/60 hover:bg-[#0B0F17] border border-white/[0.08] hover:border-[#1d9bf0]/50 transition-all duration-200 group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={demo.avatarUrl}
                        alt={demo.displayName}
                        className="w-12 h-12 rounded-full bg-[#161F30] border border-white/10 object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#0B0F17] border border-white/[0.08]">
                        {isCEO ? (
                          <Crown className="w-3.5 h-3.5 text-purple-400" />
                        ) : isSecurity ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#1d9bf0]" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-[#F8FAFC] group-hover:text-[#1d9bf0] transition-colors truncate">
                          {demo.displayName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1d9bf0]/10 text-[#1d9bf0] font-semibold border border-[#1d9bf0]/20 shrink-0">
                          {isCEO ? 'Fundadora' : isSecurity ? 'Seguridad' : 'Diseño UX'}
                        </span>
                      </div>
                      <span className="text-xs text-[#94A3B8] truncate">@{demo.username}</span>
                      <span className="text-[11px] text-[#94A3B8]/70 truncate mt-0.5">
                        {demo.bio.slice(0, 48)}...
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-full bg-[#161F30] text-[#94A3B8] group-hover:text-white group-hover:bg-[#1d9bf0] transition-all shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            PESTAÑA B: GENERADOR DE AVATAR EN VIVO (Inputs rounded-md: 4px)
        ========================================================================= */}
        {activeTab === 'dicebear' && (
          <form onSubmit={handleCustomLogin} className="flex flex-col gap-4 animate-in fade-in-50 duration-200">
            {/* Vista Previa de Avatar DiceBear */}
            <div className="flex items-center justify-center gap-5 p-4 rounded-2xl bg-[#0B0F17]/60 border border-white/[0.08]">
              <div className="relative group">
                <img
                  src={generateDiceBearAvatar(avatarSeed)}
                  alt="Avatar DiceBear en Vivo"
                  className="w-20 h-20 rounded-full bg-[#161F30] border-2 border-[#1d9bf0]/50 shadow-xl object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#F8FAFC]">
                  Semilla: <code className="text-[#1d9bf0] font-mono text-[11px]">{avatarSeed}</code>
                </span>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 text-[#1d9bf0] border border-[#1d9bf0]/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                >
                  <Dices className="w-4 h-4" />
                  <span>🎲 Randomizar Avatar</span>
                </button>
              </div>
            </div>

            {/* Input Nombre Visible (Inputs: 4px rounded-md) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#1d9bf0]" />
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
                className="w-full bg-[#0B0F17] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0] transition-colors"
              />
            </div>

            {/* Input Nombre de Usuario (Inputs: 4px rounded-md) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
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
                className="w-full bg-[#0B0F17] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#1d9bf0] transition-colors"
              />
            </div>

            {/* Input Contraseña Cifrada (Inputs: 4px rounded-md) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Contraseña Simulada
                </label>
                <span className="text-[10px] text-amber-400 font-mono">
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
                className="w-full bg-[#0B0F17] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Botón Entrar en Formato Píldora (Buttons: rounded-full) */}
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[15px] shadow-sm transition-all hover:shadow-lg active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar a Aemora con este Avatar</span>
            </button>
          </form>
        )}

        {/* Pie de Página de Seguridad */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#1d9bf0]" />
            OWASP Top 10 Compliant
          </span>
          <span className="font-mono text-[10px]">v0.3.0 • Cyber-Dark</span>
        </div>
      </div>
    </div>
  );
};
