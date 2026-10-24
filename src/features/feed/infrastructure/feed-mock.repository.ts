import { IPostRepository } from '@/core/ports/post.repository';
import {
  Post,
  CreatePostInput,
  PaginatedPosts,
  PostSchema,
  PaginatedPostsSchema,
  CreatePostInputSchema,
} from '@/core/domain/post.entity';
import { Comment, CreateCommentInput, CommentSchema } from '@/core/domain/comment.entity';
import { PaginationParams } from '@/core/domain/pagination.entity';
import { HttpClient, httpClient } from '@/shared/http/http-client';
import { z } from 'zod';

const ToggleLikeResponseSchema = z.object({
  isLiked: z.boolean(),
  likesCount: z.number().int().nonnegative(),
});

const ToggleBookmarkResponseSchema = z.object({
  isSaved: z.boolean(),
});

export class FeedMockRepository implements IPostRepository {
  constructor(private readonly client: HttpClient = httpClient) {}

  private mapPost(raw: any): Post {
    const author = raw.author;
    return PostSchema.parse({
      id: raw.id,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.display_name ?? author.displayName,
        avatarUrl: author.avatar_url ?? author.avatarUrl ?? undefined,
        verified: author.is_verified ?? author.verified ?? false,
        role: author.role ?? 'user',
      },
      content: raw.content,
      media: (raw.media ?? []).map((item: any) => ({
        id: String(item.id ?? crypto.randomUUID()),
        type: item.type ?? 'image',
        url: item.url,
        altText: item.altText ?? 'Imagen compartida en Aemora',
      })),
      tags: raw.tags ?? [],
      aiGenerated: raw.ai_generated ?? false,
      metrics: {
        likesCount: raw.likes_count ?? 0,
        commentsCount: raw.comments_count ?? raw.comments?.length ?? 0,
        repostsCount: 0,
        viewsCount: 0,
      },
      comments: (raw.comments ?? []).map((comment: any) => ({
        id: String(comment.id),
        postId: String(comment.post_id ?? comment.postId ?? raw.id),
        author: {
          id: String(comment.author?.id ?? comment.user_id),
          username: comment.author?.username ?? comment.username,
          displayName: comment.author?.display_name ?? comment.author?.displayName ?? comment.display_name,
          avatarUrl: comment.author?.avatar_url ?? comment.author?.avatarUrl ?? undefined,
          verified: comment.author?.is_verified ?? comment.author?.verified ?? false,
          role: comment.author?.role ?? 'user',
        },
        content: comment.content,
        createdAt: comment.created_at ?? comment.createdAt,
        likesCount: 0,
        isLikedByMe: false,
      })),
      isLikedByMe: raw.is_liked_by_me ?? false,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  public async getFeed(params: PaginationParams = {}): Promise<PaginatedPosts> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('limit', String(params.pageSize));

    const endpoint = `/api/v1/posts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const rawResponse = await this.client.get<unknown>(endpoint);

    const response = rawResponse as any;
    const page = response.page ?? 1;
    const pageSize = response.limit ?? params.pageSize ?? 10;
    const totalItems = response.total ?? response.items?.length ?? 0;
    return PaginatedPostsSchema.parse({
      items: (response.items ?? []).map((item: any) => this.mapPost(item)),
      pagination: {
        page, pageSize, totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasNextPage: response.has_more ?? false,
        hasPreviousPage: page > 1,
      },
    });
  }

  public async getById(id: string): Promise<Post> {
    const rawResponse = await this.client.get<unknown>(`/api/v1/posts/${encodeURIComponent(id)}`);
    return PostSchema.parse(rawResponse);
  }

  public async create(input: CreatePostInput & { author?: Post['author'] }): Promise<Post> {
    const validatedInput = CreatePostInputSchema.parse(input);
    const rawResponse = await this.client.post<unknown>('/api/v1/posts', validatedInput);
    return this.mapPost(rawResponse);
  }

  public async toggleLike(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const rawResponse = await this.client.post<unknown>(`/api/v1/posts/${encodeURIComponent(id)}/like`);
    const response = rawResponse as any;
    return ToggleLikeResponseSchema.parse({
      isLiked: response.isLiked ?? response.liked ?? false,
      likesCount: response.likesCount ?? response.total_likes ?? 0,
    });
  }

  public async toggleBookmark(id: string): Promise<{ isSaved: boolean }> {
    const rawResponse = await this.client.post<unknown>(`/api/v1/posts/${encodeURIComponent(id)}/bookmark`);
    return ToggleBookmarkResponseSchema.parse(rawResponse);
  }

  public async addComment(input: CreateCommentInput & { author?: Comment['author'] }): Promise<Comment> {
    const rawResponse = await this.client.post<unknown>(
      `/api/v1/posts/${encodeURIComponent(input.postId)}/comments`,
      input
    );
    return CommentSchema.parse(rawResponse);
  }

  public async delete(id: string): Promise<void> {
    await this.client.delete<void>(`/api/v1/posts/${encodeURIComponent(id)}`);
  }

  public async getUserPosts(username: string, params: PaginationParams = {}): Promise<PaginatedPosts> {
    const searchParams = new URLSearchParams({ username });
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const rawResponse = await this.client.get<unknown>(`/api/v1/posts?${searchParams.toString()}`);
    return PaginatedPostsSchema.parse(rawResponse);
  }
}

export const feedRepository: IPostRepository = new FeedMockRepository();
