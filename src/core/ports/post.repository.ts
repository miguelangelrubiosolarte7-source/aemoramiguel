import { Post, CreatePostInput, PaginatedPosts } from '../domain/post.entity';
import { Comment, CreateCommentInput } from '../domain/comment.entity';
import { PaginationParams } from '../domain/pagination.entity';

/**
 * Puerto Secundario (Driven Port) para el Repositorio de Posts de Aemora.
 */
export interface IPostRepository {
  getFeed(params?: PaginationParams): Promise<PaginatedPosts>;
  getById(id: string): Promise<Post>;
  create(input: CreatePostInput): Promise<Post>;
  toggleLike(id: string): Promise<{ isLiked: boolean; likesCount: number }>;
  toggleBookmark(id: string): Promise<{ isSaved: boolean }>;
  addComment(input: CreateCommentInput): Promise<Comment>;
  delete(id: string): Promise<void>;
  getUserPosts(username: string, params?: PaginationParams): Promise<PaginatedPosts>;
}
