import { postHandlers } from './handlers/posts.handler';

export async function initMocks(): Promise<void> {
  // En SSR (Server-Side Rendering) de Node.js, evitamos inicializar el worker del navegador
  if (typeof window === 'undefined') {
    return;
  }

  // Import dinámico exclusivamente en el cliente para prevenir fallos en SSR
  const { setupWorker } = await import('msw/browser');
  const worker = setupWorker(...postHandlers);

  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_MSW === 'true') {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }
}
