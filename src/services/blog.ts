import { getInsforgeClient } from '../lib/insforgeClient';

export type BlogPostStatus = 'draft' | 'published';

/** Fetch published posts via public edge function (avoids 401 on anon DB access). */
async function fetchViaPublicFunction(
  params: { page?: number; pageSize?: number; slug?: string; query?: string; category?: string },
): Promise<{ posts: BlogPost[]; page: number; pageSize: number; hasMore: boolean } | { post: BlogPost | null }> {
  const baseUrl = (import.meta.env.VITE_INSFORGE_URL as string)?.replace(/\/+$/, '') ?? '';
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY as string | undefined;
  if (!baseUrl || !anonKey) throw new Error('InsForge not configured');

  const search = new URLSearchParams();
  if (params.slug) search.set('slug', params.slug);
  else {
    search.set('page', String(params.page ?? 1));
    search.set('pageSize', String(params.pageSize ?? 9));
    if (params.query) search.set('query', params.query);
    if (params.category) search.set('category', params.category);
  }
  const res = await fetch(`${baseUrl}/functions/blog-posts-public?${search}`, {
    headers: { Authorization: `Bearer ${anonKey}` },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

async function fetchViaDatabase(
  params: { page?: number; pageSize?: number; slug?: string; query?: string; category?: string },
): Promise<{ posts: BlogPost[]; page: number; pageSize: number; hasMore: boolean } | { post: BlogPost | null }> {
  const client = getInsforgeClient();

  if (params.slug) {
    const { data, error } = await client.database
      .from('blog_posts')
      .select(
        'id, slug, title, excerpt, content_markdown, cover_image_url, category, author_name, reading_time_minutes, status, seo_title, seo_description, published_at, created_at, updated_at',
      )
      .eq('status', 'published')
      .eq('slug', params.slug)
      .limit(1);
    if (error) throw error;
    return { post: ((data as BlogPost[] | null) ?? [])[0] ?? null };
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 9, 24));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client.database
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, content_markdown, cover_image_url, category, author_name, reading_time_minutes, status, seo_title, seo_description, published_at, created_at, updated_at',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (params.query?.trim()) {
    const escaped = params.query.trim().replace(/,/g, '');
    query = query.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`) as typeof query;
  }
  if (params.category?.trim() && params.category !== 'All') {
    query = query.eq('category', params.category.trim()) as typeof query;
  }

  const queryWithRange = query as {
    range?: (a: number, b: number) => typeof query;
    limit?: (n: number) => typeof query;
  };
  const { data, error } = await (queryWithRange.range
    ? queryWithRange.range(from, to)
    : queryWithRange.limit
      ? queryWithRange.limit(pageSize)
      : query);

  if (error) throw error;

  const posts = (data as BlogPost[] | null) ?? [];
  return { posts, page, pageSize, hasMore: posts.length === pageSize };
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_markdown: string;
  cover_image_url: string | null;
  category: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  status: BlogPostStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogListParams {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface BlogListResult {
  posts: BlogPost[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function fetchPublishedBlogPosts(
  params: BlogListParams = {},
): Promise<BlogListResult> {
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 9, 24));
  const page = Math.max(1, params.page ?? 1);

  try {
    const useFunction = import.meta.env.VITE_ENABLE_PUBLIC_BLOG_FUNCTION === 'true';
    const result = useFunction
      ? await fetchViaPublicFunction({
        page,
        pageSize,
        query: params.query,
        category: params.category,
      })
      : await fetchViaDatabase({
        page,
        pageSize,
        query: params.query,
        category: params.category,
      });
    const r = result as { posts: BlogPost[]; page: number; pageSize: number; hasMore: boolean };
    return { posts: r.posts ?? [], page: r.page ?? 1, pageSize: r.pageSize ?? pageSize, hasMore: r.hasMore ?? false };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Blog service unavailable, using fallback.', err);
    return { posts: [], page: 1, pageSize, hasMore: false };
  }
}

export async function fetchPublishedBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const clean = slug.trim();
  if (!clean) return null;

  try {
    const useFunction = import.meta.env.VITE_ENABLE_PUBLIC_BLOG_FUNCTION === 'true';
    const result = useFunction
      ? await fetchViaPublicFunction({ slug: clean })
      : await fetchViaDatabase({ slug: clean });
    const r = result as { post: BlogPost | null };
    return r.post ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Blog service unavailable for slug.', err);
    return null;
  }
}
