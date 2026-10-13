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

  public async getFeed(params: PaginationParams = {}): Promise<PaginatedPosts> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const endpoint = `/api/v1/posts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const rawResponse = await this.client.get<unknown>(endpoint);

    return PaginatedPostsSchema.parse(rawResponse);
  }

  public async getById(id: string): Promise<Post> {
    const rawResponse = await this.client.get<unknown>(`/api/v1/posts/${encodeURIComponent(id)}`);
    return PostSchema.parse(rawResponse);
  }

  public async create(input: CreatePostInput & { author?: Post['author'] }): Promise<Post> {
    const validatedInput = CreatePostInputSchema.parse(input);
    const rawResponse = await this.client.post<unknown>('/api/v1/posts', {
      ...validatedInput,
      author: input.author,
    });
    return PostSchema.parse(rawResponse);
  }

  public async toggleLike(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const rawResponse = await this.client.post<unknown>(`/api/v1/posts/${encodeURIComponent(id)}/like`);
    return ToggleLikeResponseSchema.parse(rawResponse);
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
