'use client';

import React, { useEffect, useRef, useState } from 'react';

export type LogoInteractionState = 'idle' | 'focus-user' | 'focus-password' | 'success';

interface InteractiveAemoraLogoProps {
  state?: LogoInteractionState;
  className?: string;
  size?: number;
}

export const InteractiveAemoraLogo: React.FC<InteractiveAemoraLogoProps> = ({
  state = 'idle',
  className = '',
  size = 120,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Normalizar desplazamiento del mouse entre -1 y 1
      const offsetX = (e.clientX - centerX) / centerX;
      const offsetY = (e.clientY - centerY) / centerY;
      setMouseOffset({ x: offsetX * 12, y: offsetY * 12 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Configuraciones dinámicas según el estado de interacción
  const isPassword = state === 'focus-password';
  const isUser = state === 'focus-user';
  const isSuccess = state === 'success';

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Halo de Resplandor Neón de Fondo (Glow Aura) */}
      <div
        className={`absolute rounded-full transition-all duration-700 blur-2xl pointer-events-none ${
          isSuccess
            ? 'w-48 h-48 bg-emerald-500/40 animate-pulse'
            : isPassword
            ? 'w-44 h-44 bg-amber-500/30'
            : isUser
            ? 'w-44 h-44 bg-cyan-500/35 scale-110'
            : 'w-36 h-36 bg-indigo-500/25 animate-pulse'
        }`}
      />

      {/* SVG del Isotipo Inteligente de Aemora */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative z-10 transition-all duration-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]"
      >
        <defs>
          {/* Gradiente Neón Primario: Cian a Índigo a Fucsia */}
          <linearGradient id="neonGradient1" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isPassword ? '#F59E0B' : '#06B6D4'} />
            <stop offset="50%" stopColor={isPassword ? '#D97706' : '#6366F1'} />
            <stop offset="100%" stopColor={isPassword ? '#EF4444' : '#EC4899'} />
          </linearGradient>

          {/* Gradiente Secundario para Nodos Internos */}
          <linearGradient id="neonGradient2" x1="90" y1="20" x2="20" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isSuccess ? '#10B981' : isPassword ? '#FBBF24' : '#A855F7'} />
            <stop offset="100%" stopColor={isSuccess ? '#06B6D4' : isPassword ? '#DC2626' : '#3B82F6'} />
          </linearGradient>

          <filter id="cyberGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Anillo de Calibración HUD Exterior */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className={`transition-all duration-700 ${
            isPassword
              ? 'stroke-amber-400/40 stroke-dasharray-[4,4] scale-95 origin-center'
              : isUser
              ? 'stroke-cyan-400/50 stroke-dasharray-[8,6]'
              : 'stroke-indigo-500/20 stroke-dasharray-[2,4]'
          }`}
          strokeWidth="1.5"
        />

        {/* Círculo Rotativo Secundario con Ticks de Radar */}
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke="url(#neonGradient1)"
          strokeWidth="0.8"
          strokeOpacity={isUser ? '0.7' : '0.3'}
          className={isUser ? 'animate-spin origin-center duration-1000' : ''}
        />

        {/* Lóbulo Izquierdo de la 'A' de Aemora (Reactivo a Estado) */}
        <path
          d={
            isPassword
              ? 'M34 68C26 62 24 50 24 40C24 25 36 18 50 18C64 18 76 25 76 40C76 50 74 62 66 68' // Modo Escudo Plegado
              : 'M28 72C18 64 15 52 15 42C15 24 30 14 50 14C70 14 85 24 85 42C85 52 82 64 72 72' // Modo Abierto Dinámico
          }
          stroke="url(#neonGradient1)"
          strokeWidth={isPassword ? '5' : '4.5'}
          strokeLinecap="round"
          filter="url(#cyberGlowFilter)"
          className="transition-all duration-500"
        />

        {/* Barra Transversal Orbital (Puente de Enlace) */}
        <path
          d={
            isPassword
              ? 'M30 52H70' // Barra cerrada de cerrojo
              : 'M25 54C35 48 65 48 75 54' // Curva fluida abierta
          }
          stroke="url(#neonGradient2)"
          strokeWidth={isPassword ? '5' : '4'}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Núcleo Central Inteligente ("Iris/Nodo de Identidad") */}
        <circle
          cx={50 + (isUser ? mouseOffset.x * 0.35 : 0)}
          cy={isPassword ? 44 : 38 + (isUser ? mouseOffset.y * 0.35 : 0)}
          r={isPassword ? 7 : isSuccess ? 8 : 6}
          fill={isSuccess ? '#10B981' : isPassword ? '#F59E0B' : 'url(#neonGradient1)'}
          filter="url(#cyberGlowFilter)"
          className="transition-all duration-300"
        />

        {/* Pupila Central / Brillo Blanco */}
        <circle
          cx={50 + (isUser ? mouseOffset.x * 0.45 : 0)}
          cy={isPassword ? 44 : 38 + (isUser ? mouseOffset.y * 0.45 : 0)}
          r="2.5"
          fill="#FFFFFF"
          className="transition-all duration-200"
        />

        {/* Nodos de Anclaje de la Base */}
        <circle
          cx={isPassword ? 34 : 28}
          cy={isPassword ? 68 : 72}
          r={isPassword ? 4 : 3.5}
          fill={isPassword ? '#F59E0B' : '#06B6D4'}
          className="transition-all duration-500"
        />
        <circle
          cx={isPassword ? 66 : 72}
          cy={isPassword ? 68 : 72}
          r={isPassword ? 4 : 3.5}
          fill={isPassword ? '#EF4444' : '#EC4899'}
          className="transition-all duration-500"
        />

        {/* Icono de Candado Holográfico cuando está en modo Password */}
        {isPassword && (
          <path
            d="M45 44V40C45 37.2386 47.2386 35 50 35C52.7614 35 55 37.2386 55 40V44"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-in fade-in zoom-in-75 duration-300"
          />
        )}
      </svg>
    </div>
  );
};

/**
 * Fondo Animado con Red de Partículas y Malla Dinámica Receptiva al Mouse
 */
export const CyberParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generar partículas interconectadas
    const particleCount = Math.min(Math.floor((width * height) / 18000), 55);
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#6366F1' : '#06B6D4',
    }));

    let mouse = { x: width / 2, y: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dibujar y actualizar partículas
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Rebote en bordes
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Atracción sutil hacia el mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += (dx / dist) * 0.4;
          p.y += (dy / dist) * 0.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Conectar partículas cercanas con líneas luminosas
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.25 * (1 - distance / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
