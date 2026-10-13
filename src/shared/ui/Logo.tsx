import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  variant?: 'default' | 'monochrome';
}

const SIZE_MAP = {
  sm: { icon: 28, text: 'text-lg', badge: 'text-[9px]' },
  md: { icon: 36, text: 'text-xl', badge: 'text-[10px]' },
  lg: { icon: 44, text: 'text-2xl', badge: 'text-[11px]' },
  xl: { icon: 56, text: 'text-3xl', badge: 'text-[12px]' },
};

/**
 * Logotipo Corporativo de Grado Staff de Aemora.
 * 
 * Simbolismo:
 * Representa una cinta de Möbius continua y un nodo de red entrelazado formando la "A" de Aemora.
 * Simboliza la privacidad descentralizada, fluidez social y conexiones humanas inmutables.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
  variant = 'default',
}) => {
  const { icon, text, badge } = SIZE_MAP[size];

  return (
    <div
      className={`inline-flex items-center select-none group cursor-pointer gap-3 ${className}`}
      role="img"
      aria-label="Aemora Social"
    >
      {/* Isotipo SVG de Alta Definición */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
        >
          <defs>
            <linearGradient id="aemoraCyanIndigo" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22D3EE" /> {/* Cyan 400 */}
              <stop offset="45%" stopColor="#6366F1" /> {/* Indigo 500 */}
              <stop offset="100%" stopColor="#A855F7" /> {/* Purple 500 */}
            </linearGradient>

            <linearGradient id="aemoraVioletPink" x1="56" y1="12" x2="12" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EC4899" /> {/* Pink 500 */}
              <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet 500 */}
              <stop offset="100%" stopColor="#3B82F6" /> {/* Blue 500 */}
            </linearGradient>

            <filter id="softNexusGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Anillo de Seguridad Perimetral Sutil */}
          <circle
            cx="32"
            cy="32"
            r="29"
            className={variant === 'default' ? 'stroke-indigo-500/15' : 'stroke-current opacity-20'}
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Lóbulo Exterior Izquierdo (Trazo Curvo Continuo) */}
          <path
            d="M20 48C13.5 42 10 35.5 10 28C10 16.954 18.954 8 30 8C38.5 8 45.8 13.5 48.5 21"
            stroke={variant === 'default' ? 'url(#aemoraCyanIndigo)' : 'currentColor'}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Lóbulo Exterior Derecho con Intersección Central */}
          <path
            d="M44 48C50.5 42 54 35.5 54 28C54 16.954 45.046 8 34 8C25.5 8 18.2 13.5 15.5 21"
            stroke={variant === 'default' ? 'url(#aemoraVioletPink)' : 'currentColor'}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Vértice Transversal Estilizado (La Barra Central de la 'A') */}
          <path
            d="M19 36C24 33.5 32 31.5 45 36"
            stroke={variant === 'default' ? 'url(#aemoraCyanIndigo)' : 'currentColor'}
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Núcleo Central de Convergencia (Punto de Enlace) */}
          <circle
            cx="32"
            cy="27"
            r="5"
            fill={variant === 'default' ? 'url(#aemoraVioletPink)' : 'currentColor'}
            filter={variant === 'default' ? 'url(#softNexusGlow)' : undefined}
          />
          <circle cx="32" cy="27" r="2.2" fill="#FFFFFF" />

          {/* Nodos de Conexión Inferiores */}
          <circle cx="20" cy="48" r="3" fill="#22D3EE" />
          <circle cx="44" cy="48" r="3" fill="#EC4899" />
        </svg>
      </div>

      {/* Tipografía Corporativa y Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${text} font-black tracking-[0.18em] uppercase bg-clip-text ${
                variant === 'default'
                  ? 'text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400'
                  : 'text-current'
              }`}
            >
              Aemora
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span
            className={`${badge} font-medium tracking-[0.25em] uppercase text-slate-500 mt-0.5 group-hover:text-indigo-400 transition-colors`}
          >
            Social Network
          </span>
        </div>
      )}
    </div>
  );
};
