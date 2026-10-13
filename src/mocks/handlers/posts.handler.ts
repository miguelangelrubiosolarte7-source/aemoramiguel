import { http, HttpResponse } from 'msw';
import { Post, CreatePostInput } from '@/core/domain/post.entity';
import { Comment, CreateCommentInput } from '@/core/domain/comment.entity';
import { generateDiceBearAvatar } from '@/core/domain/user.entity';

// Base de datos simulada en memoria con comentarios e interacción rica
let mockPosts: Post[] = [
  {
    id: 'post_001_intro_aemora',
    author: {
      id: 'user_emily_001',
      username: 'emily_founder',
      displayName: 'Emily Chen',
      avatarUrl: generateDiceBearAvatar('EmilyChen_Aemora_CEO'),
      verified: true,
      role: 'admin',
    },
    content:
      '¡Bienvenidos oficialmente a la fase interactiva de **Aemora**! 🚀 Hemos blindado la arquitectura con Clean Architecture, TanStack Query v5 y defensas activas de **OWASP**. Cada interacción es instantánea, sin recargas y con seguridad Zero-Trust en cada capa.',
    media: [
      {
        id: 'media_001_launch',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        altText: 'Arquitectura y lanzamiento de Aemora',
        width: 1200,
        height: 675,
      },
    ],
    tags: ['aemora', 'launch', 'cleancode', 'owasp'],
    visibility: 'public',
    metrics: {
      likesCount: 234,
      commentsCount: 2,
      repostsCount: 45,
      viewsCount: 3400,
    },
    comments: [
      {
        id: 'comment_001',
        postId: 'post_001_intro_aemora',
        author: {
          id: 'user_carlos_002',
          username: 'carlos_sec',
          displayName: 'Carlos Méndez',
          avatarUrl: generateDiceBearAvatar('CarlosMendez_SecurityLead'),
          verified: true,
          role: 'verified_creator',
        },
        content: 'Excelente despliegue. Todos los inputs sanitizados mediante DOMPurify y tipos validados en tiempo de ejecución con Zod.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likesCount: 18,
        isLikedByMe: false,
      },
      {
        id: 'comment_002',
        postId: 'post_001_intro_aemora',
        author: {
          id: 'user_sofia_003',
          username: 'sofia_ux',
          displayName: 'Sofia Valdés',
          avatarUrl: generateDiceBearAvatar('SofiaValdes_DesignLead'),
          verified: true,
          role: 'verified_creator',
        },
        content: 'La estética dark-mode y la respuesta reactiva con Optimistic Updates en los likes se sienten increíblemente fluidas ✨',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        likesCount: 12,
        isLikedByMe: true,
      },
    ],
    isLikedByMe: false,
    isRepostedByMe: false,
    isSavedByMe: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'post_002_cyber_audit',
    author: {
      id: 'user_carlos_002',
      username: 'carlos_sec',
      displayName: 'Carlos Méndez',
      avatarUrl: generateDiceBearAvatar('CarlosMendez_SecurityLead'),
      verified: true,
      role: 'verified_creator',
    },
    content:
      'Recordatorio para todo el equipo: nunca almacenar tokens JWT en `localStorage`. Cualquier inyección XSS de terceros podría exfiltrar credenciales. En Aemora, la sesión de producción viajará estrictamente como cookies `HttpOnly; SameSite=Strict`. 🛡️🔒',
    media: [
      {
        id: 'media_002_security',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        altText: 'Monitoreo de seguridad y terminal',
        width: 1200,
        height: 800,
      },
    ],
    tags: ['cybersecurity', 'infosec', 'websecurity', 'privacy'],
    visibility: 'public',
    metrics: {
      likesCount: 156,
      commentsCount: 1,
      repostsCount: 28,
      viewsCount: 1890,
    },
    comments: [
      {
        id: 'comment_003',
        postId: 'post_002_cyber_audit',
        author: {
          id: 'user_emily_001',
          username: 'emily_founder',
          displayName: 'Emily Chen',
          avatarUrl: generateDiceBearAvatar('EmilyChen_Aemora_CEO'),
          verified: true,
          role: 'admin',
        },
        content: 'Totalmente de acuerdo Carlos. La privacidad de nuestra comunidad es nuestra prioridad número uno.',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        likesCount: 9,
        isLikedByMe: true,
      },
    ],
    isLikedByMe: true,
    isRepostedByMe: false,
    isSavedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'post_003_design_tokens',
    author: {
      id: 'user_sofia_003',
      username: 'sofia_ux',
      displayName: 'Sofia Valdés',
      avatarUrl: generateDiceBearAvatar('SofiaValdes_DesignLead'),
      verified: true,
      role: 'verified_creator',
    },
    content:
      'Acabamos de terminar el nuevo sistema de componentes y el isotipo de Möbius para el logo de Aemora. Paleta de gradientes: Cian Eléctrico -> Índigo Profundo -> Violeta Neón. ¿Qué les parece el resultado?',
    media: [
      {
        id: 'media_003_design',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        altText: 'Proceso de diseño y prototipado',
        width: 1200,
        height: 800,
      },
    ],
    tags: ['uiux', 'designsystems', 'brandidentity', 'tailwindcss'],
    visibility: 'public',
    metrics: {
      likesCount: 312,
      commentsCount: 0,
      repostsCount: 67,
      viewsCount: 4200,
    },
    comments: [],
    isLikedByMe: false,
    isRepostedByMe: true,
    isSavedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const postHandlers = [
  // Listar Feed Paginado
  http.get('/api/v1/posts', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const username = url.searchParams.get('username');

    let filtered = [...mockPosts];
    if (username) {
      filtered = filtered.filter((p) => p.author.username === username);
    }

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return HttpResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextCursor: page < totalPages ? String(page + 1) : null,
      },
    });
  }),

  // Obtener Post por ID
  http.get('/api/v1/posts/:id', ({ params }) => {
    const { id } = params;
    const post = mockPosts.find((p) => p.id === id);

    if (!post) {
      return new HttpResponse(JSON.stringify({ message: 'Post no encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return HttpResponse.json(post);
  }),

  // Crear Post
  http.post('/api/v1/posts', async ({ request }) => {
    const body = (await request.json()) as CreatePostInput & { author?: Post['author'] };

    // Si viene autor personalizado del body o tomamos el de Emily
    const author = body.author || {
      id: 'user_emily_001',
      username: 'emily_founder',
      displayName: 'Emily Chen',
      avatarUrl: generateDiceBearAvatar('EmilyChen_Aemora_CEO'),
      verified: true,
      role: 'admin',
    };

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author,
      content: body.content,
      media: (body.media || []).map((m) => ({
        id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'image',
        url: m.url,
        altText: m.altText || 'Imagen compartida',
      })),
      tags: body.tags || [],
      visibility: body.visibility || 'public',
      metrics: {
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        viewsCount: 1,
      },
      comments: [],
      isLikedByMe: false,
      isRepostedByMe: false,
      isSavedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPosts = [newPost, ...mockPosts];
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // Alternar Like
  http.post('/api/v1/posts/:id/like', ({ params }) => {
    const { id } = params;
    const postIndex = mockPosts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Post no encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentPost = mockPosts[postIndex];
    const isLiked = !currentPost.isLikedByMe;
    const newLikesCount = isLiked
      ? currentPost.metrics.likesCount + 1
      : Math.max(0, currentPost.metrics.likesCount - 1);

    mockPosts[postIndex] = {
      ...currentPost,
      isLikedByMe: isLiked,
      metrics: {
        ...currentPost.metrics,
        likesCount: newLikesCount,
      },
    };

    return HttpResponse.json({
      isLiked,
      likesCount: newLikesCount,
    });
  }),

  // Alternar Bookmark / Guardado
  http.post('/api/v1/posts/:id/bookmark', ({ params }) => {
    const { id } = params;
    const postIndex = mockPosts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Post no encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentPost = mockPosts[postIndex];
    const isSaved = !currentPost.isSavedByMe;

    mockPosts[postIndex] = {
      ...currentPost,
      isSavedByMe: isSaved,
    };

    return HttpResponse.json({ isSaved });
  }),

  // Agregar Comentario
  http.post('/api/v1/posts/:id/comments', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as CreateCommentInput & { author?: Comment['author'] };

    const postIndex = mockPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Post no encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const author = body.author || {
      id: 'user_emily_001',
      username: 'emily_founder',
      displayName: 'Emily Chen',
      avatarUrl: generateDiceBearAvatar('EmilyChen_Aemora_CEO'),
      verified: true,
      role: 'admin',
    };

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: String(id),
      author,
      content: body.content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLikedByMe: false,
    };

    const currentPost = mockPosts[postIndex];
    mockPosts[postIndex] = {
      ...currentPost,
      comments: [...currentPost.comments, newComment],
      metrics: {
        ...currentPost.metrics,
        commentsCount: currentPost.metrics.commentsCount + 1,
      },
    };

    return HttpResponse.json(newComment, { status: 201 });
  }),

  // Eliminar Post
  http.delete('/api/v1/posts/:id', ({ params }) => {
    const { id } = params;
    mockPosts = mockPosts.filter((p) => p.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
