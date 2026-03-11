import { getInsforgeClient } from '../lib/insforgeClient';

// #region agent log
const _dbg = (msg: string, data: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7293/ingest/e3e34ecb-6f03-4ff2-80b8-7e6b2f049d58', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2511e9' },
    body: JSON.stringify({
      sessionId: '2511e9',
      location: 'blog.ts',
      message: msg,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

export type BlogPostStatus = 'draft' | 'published';

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

// Removed fallback - return empty arrays on error
const _UNUSED_FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'fallback-1',
    slug: 'welcome-to-autovital',
    title: 'Welcome to AutoVital',
    excerpt:
      'A quick intro to what AutoVital is, who it’s for, and how to get started in minutes.',
    content_markdown:
      '# Welcome to AutoVital\n\nAutoVital helps you track maintenance, expenses, documents, and reminders so you can stay ahead of repairs.\n\n## Getting started\n\n- Create your account\n- Add your vehicle\n- Log your latest service\n- Turn on reminders\n\nReady to begin? [Start your free trial](/signup).',
    cover_image_url:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
    category: 'Product Updates',
    author_name: 'AutoVital Team',
    reading_time_minutes: 3,
    status: 'published',
    seo_title: 'Welcome to AutoVital',
    seo_description: 'An introduction to AutoVital and how to get started.',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function fetchPublishedBlogPosts(
  params: BlogListParams = {},
): Promise<BlogListResult> {
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 9, 24));
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  _dbg('fetchPublishedBlogPosts entry', { hypothesisId: 'E', page, pageSize, from, to });

  try {
    const client = getInsforgeClient();
    let q = client.database
      .from('blog_posts')
      .select(
        'id, slug, title, excerpt, content_markdown, cover_image_url, category, author_name, reading_time_minutes, status, seo_title, seo_description, published_at, created_at, updated_at',
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const query = (params.query ?? '').trim();
    if (query) {
      // InsForge/PostgREST supports `or` filters.
      const escaped = query.replace(/,/g, '');
      q = q.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`);
    }

    const category = (params.category ?? '').trim();
    if (category && category !== 'All') {
      q = q.eq('category', category);
    }

    // Some SDKs support range; if not, it will be ignored by the client.
    // We’ll detect by checking result size for hasMore.
    const { data, error } = await (q as any).range?.(from, to) ?? q;

    if (error || !data) {
      _dbg('blog_posts list error', {
        hypothesisId: 'A',
        table: 'blog_posts',
        fn: 'fetchPublishedBlogPosts',
        errorMsg: (error as any)?.message,
        errorCode: (error as any)?.code,
        errorStatus: (error as any)?.status,
        hasData: !!data,
      });
      // eslint-disable-next-line no-console
      console.warn('Failed to load blog posts from backend, using fallback.', error);
      return { posts: [], page: 1, pageSize, hasMore: false };
    }

    const posts = data as BlogPost[];
    const hasMore = posts.length === pageSize;
    return { posts, page, pageSize, hasMore };
  } catch (err) {
    _dbg('blog_posts list exception', {
      hypothesisId: 'A',
      table: 'blog_posts',
      fn: 'fetchPublishedBlogPosts',
      errMsg: err instanceof Error ? err.message : String(err),
    });
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
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('blog_posts')
      .select(
        'id, slug, title, excerpt, content_markdown, cover_image_url, category, author_name, reading_time_minutes, status, seo_title, seo_description, published_at, created_at, updated_at',
      )
      .eq('status', 'published')
      .eq('slug', clean)
      .limit(1);

    if (error) {
      _dbg('blog_posts slug error', {
        hypothesisId: 'D',
        table: 'blog_posts',
        fn: 'fetchPublishedBlogPostBySlug',
        slug: clean,
        errorMsg: (error as any)?.message,
        errorCode: (error as any)?.code,
        errorStatus: (error as any)?.status,
      });
      // eslint-disable-next-line no-console
      console.warn('Failed to load blog post by slug.', error);
      return null;
    }

    const post = (data as BlogPost[] | null | undefined)?.[0] ?? null;
    return post;
  } catch (err) {
    _dbg('blog_posts slug exception', {
      hypothesisId: 'D',
      table: 'blog_posts',
      fn: 'fetchPublishedBlogPostBySlug',
      errMsg: err instanceof Error ? err.message : String(err),
    });
    // eslint-disable-next-line no-console
    console.warn('Blog service unavailable for slug.', err);
    return null;
  }
}

