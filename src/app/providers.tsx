'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mswReady, setMswReady] = useState(true);

  // Instancia única y aislada de QueryClient por ciclo de vida
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutos de frescura
            gcTime: 1000 * 60 * 10, // 10 minutos de recolección de basura
            retry: 1, // Limitar reintentos para no agotar el servidor ante errores 4xx
            refetchOnWindowFocus: false, // Prevenir llamadas innecesarias al cambiar de pestaña
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  useEffect(() => {
    // Inicializar Mock Service Worker en el cliente
    async function startServiceWorker() {
      try {
        // MSW desactivado: las peticiones deben llegar a FastAPI/PostgreSQL.
      } catch (error) {
        console.error('Error al inicializar Mock Service Worker:', error);
      } finally {
        setMswReady(true);
      }
    }

    startServiceWorker();
  }, []);

  // Bloqueo sutil de hidratación en dev para asegurar que el Service Worker capture las peticiones iniciales
  if (!mswReady && process.env.NODE_ENV === 'development') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-slate-400">
            Inicializando capa de red desacoplada (MSW)...
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
