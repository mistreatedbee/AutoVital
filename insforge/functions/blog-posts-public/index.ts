/**
 * Public edge function: Fetch published blog posts (no auth required).
 * Uses INSFORGE_SERVICE_ROLE_KEY to bypass RLS. Fixes 401 on anon blog_posts access.
 *
 * GET ?page=1&pageSize=9&slug=welcome&query=...&category=...
 *
 * Deploy: insforge functions deploy blog-posts-public
 * Secret: insforge secrets add INSFORGE_SERVICE_ROLE_KEY <value>
 */
import { createClient } from '@insforge/sdk';

const COLS =
  'id, slug, title, excerpt, content_markdown, cover_image_url, category, author_name, reading_time_minutes, status, seo_title, seo_description, published_at, created_at, updated_at';

export default async function handler(req: Request): Promise<Response> {
  const CORS_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' as const };
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  const serviceKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY');
  const baseUrl = (Deno.env.get('INSFORGE_URL') ?? '').replace(/\/+$/, '');
  const anonKey = Deno.env.get('INSFORGE_ANON_KEY') ?? '';

  if (!serviceKey || !baseUrl || !anonKey) {
    const missing = [
      !serviceKey && 'INSFORGE_SERVICE_ROLE_KEY',
      !baseUrl && 'INSFORGE_URL',
      !anonKey && 'INSFORGE_ANON_KEY',
    ].filter(Boolean);
    console.error('blog-posts-public: missing env', { missing });
    return new Response(
      JSON.stringify({ error: 'Server configuration incomplete', code: 'MISSING_ENV' }),
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const pageSize = Math.max(1, Math.min(24, parseInt(url.searchParams.get('pageSize') ?? '9', 10)));
  const query = (url.searchParams.get('query') ?? '').trim();
  const category = (url.searchParams.get('category') ?? '').trim();

  try {
    const client = createClient({
      baseUrl,
      anonKey,
      accessToken: serviceKey,
    });

    if (slug) {
      const { data, error } = await client.database
        .from('blog_posts')
        .select(COLS)
        .eq('status', 'published')
        .eq('slug', slug)
        .limit(1);

      if (error) {
        return new Response(
          JSON.stringify({ error: (error as { message?: string })?.message ?? 'Failed to fetch' }),
          { status: 400, headers: CORS_HEADERS },
        );
      }
      const post = (data as unknown[])?.[0] ?? null;
      return new Response(JSON.stringify({ post }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = client.database
      .from('blog_posts')
      .select(COLS)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (query) {
      const escaped = query.replace(/,/g, '');
      q = q.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`) as typeof q;
    }
    if (category && category !== 'All') {
      q = q.eq('category', category) as typeof q;
    }

    const qWithRange = q as { range?: (a: number, b: number) => typeof q; limit?: (n: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(from, to)
      : qWithRange.limit
        ? qWithRange.limit(pageSize)
        : q);

    if (error) {
      console.error('blog-posts-public: query error', { message: (error as { message?: string })?.message });
      return new Response(
        JSON.stringify({ error: (error as { message?: string })?.message ?? 'Failed to fetch' }),
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const posts = (data as unknown[]) ?? [];
    const hasMore = posts.length === pageSize;
    return new Response(
      JSON.stringify({ posts, page, pageSize, hasMore }),
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error('blog-posts-public error:', { message: msg, stack: err instanceof Error ? err.stack : undefined });
    return new Response(
      JSON.stringify({ error: msg, code: 'INTERNAL_ERROR' }),
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
