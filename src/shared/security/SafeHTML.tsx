'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

export interface SafeHTMLProps {
  /**
   * Cadena HTML potencialmente peligrosa o con formato de usuario a sanitizar.
   */
  html: string;
  /**
   * Elemento envoltorio HTML (por defecto 'div').
   */
  as?: 'div' | 'span' | 'p' | 'article' | 'section';
  /**
   * Clases Tailwind o CSS personalizadas.
   */
  className?: string;
  /**
   * Si es true, restringe a formato inline básico (negrita, cursiva, enlaces).
   */
  inline?: boolean;
}

/**
 * Configuración estricta de sanitización alineada con OWASP Anti-XSS Guidelines.
 */
type SanitizeConfig = NonNullable<Parameters<typeof DOMPurify.sanitize>[1]>;

const BASE_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'span',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'style'],
};

/**
 * Componente Guardián de Seguridad (SafeHTML).
 * 
 * Defensa Activa contra Cross-Site Scripting (XSS - OWASP Top 10):
 * - Neutraliza vectores de ataque en atributos, etiquetas ejecutables y pseudoprotocolos (javascript:).
 * - Fuerza rel="noopener noreferrer nofollow" en todos los hipervínculos externos para evitar tabnabbing.
 * - Soporta ejecución segura tanto en cliente como en hidratación de React.
 */
export const SafeHTML: React.FC<SafeHTMLProps> = ({
  html,
  as: Component = 'div',
  className = '',
  inline = false,
}) => {
  const sanitizedContent = useMemo(() => {
    if (!html) return '';

    // En entorno de servidor (SSR), si window no está definido, evitamos fallos
    if (typeof window === 'undefined') {
      return '';
    }

    // Configurar transformador para forzar seguridad en enlaces
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer nofollow');
      }
    });

    const config: SanitizeConfig = inline
      ? {
          ...BASE_CONFIG,
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'code'],
        }
      : BASE_CONFIG;

    return DOMPurify.sanitize(html, config);
  }, [html, inline]);

  // Si no hay ventana aún (primer render SSR), renderizamos un fallback no interactivo
  if (typeof window === 'undefined') {
    return <Component className={className}>{html.replace(/<[^>]*>?/gm, '')}</Component>;
  }

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
