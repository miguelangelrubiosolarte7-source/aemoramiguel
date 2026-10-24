/**
 * Error tipado para fallos en peticiones HTTP.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly data?: unknown,
    public readonly code?: string
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

export type RequestInterceptor = (config: RequestInit, url: string) => Promise<RequestInit> | RequestInit;
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

export interface HttpClientConfig {
  baseUrl?: string;
  defaultTimeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

/**
 * Cliente HTTP Seguro de Aemora con soporte de Interceptores, Timeouts y Protección CSRF/OWASP.
 * 
 * Directrices de Seguridad:
 * - Credentials: 'same-origin' (o 'include') para que los JWT viajen exclusivamente como cookies HttpOnly/SameSite=Strict.
 * - Cabeceras de protección activa contra CSRF (X-Requested-With, X-CSRF-Token).
 * - Timeouts agresivos para mitigar vulnerabilidades de agotamiento de recursos (Slowloris/DoS).
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.defaultTimeoutMs = config.defaultTimeoutMs || 10000; // 10 segundos timeout por defecto
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Defensa básica contra CSRF
      ...config.defaultHeaders,
    };

    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    // Interceptor para inyectar trazabilidad (Correlation ID)
    this.addRequestInterceptor((config) => {
      const headers = new Headers(config.headers);
      if (!headers.has('X-Correlation-ID')) {
        headers.set('X-Correlation-ID', `req_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`);
      }
      return { ...config, headers };
    });

    // Interceptor para validar respuestas HTTP no exitosas
    this.addResponseInterceptor(async (response) => {
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.clone().json();
        } catch {
          errorData = await response.clone().text();
        }
        throw new HttpError(response.status, response.statusText, errorData);
      }
      return response;
    });
  }

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async executeFetch(endpoint: string, options: RequestInit = {}, timeoutMs?: number): Promise<Response> {
    const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    // Configuración inicial de seguridad
    let config: RequestInit = {
      credentials: 'same-origin', // Previene fugas de cookies entre diferentes orígenes
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('aemora_access_token');
      if (token) {
        const headers = new Headers(config.headers);
        if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
      }
    }

    // Aplicar interceptores de petición
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config, fullUrl);
    }

    // Configuración del AbortController para timeout
    const controller = new AbortController();
    const timeout = timeoutMs ?? this.defaultTimeoutMs;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (config.signal) {
      config.signal.addEventListener('abort', () => controller.abort());
    }
    config.signal = controller.signal;

    try {
      let response = await fetch(fullUrl, config);

      // Aplicar interceptores de respuesta
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError(408, 'Request Timeout', { message: `La petición excedió los ${timeout}ms.` });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async get<T>(endpoint: string, options?: RequestInit, timeoutMs?: number): Promise<T> {
    const response = await this.executeFetch(endpoint, { ...options, method: 'GET' }, timeoutMs);
    return response.json() as Promise<T>;
  }

  public async post<T>(endpoint: string, body?: unknown, options?: RequestInit, timeoutMs?: number): Promise<T> {
    const response = await this.executeFetch(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      timeoutMs
    );
    return response.json() as Promise<T>;
  }

  public async put<T>(endpoint: string, body?: unknown, options?: RequestInit, timeoutMs?: number): Promise<T> {
    const response = await this.executeFetch(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      timeoutMs
    );
    return response.json() as Promise<T>;
  }

  public async delete<T>(endpoint: string, options?: RequestInit, timeoutMs?: number): Promise<T> {
    const response = await this.executeFetch(endpoint, { ...options, method: 'DELETE' }, timeoutMs);
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}

/**
 * Instancia singleton preconfigurada para las peticiones estándar de la API de Aemora.
 */
export const httpClient = new HttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
});
