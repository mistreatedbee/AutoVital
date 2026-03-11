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
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const serviceKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY');
  if (!serviceKey) {
    return new Response(
      JSON.stringify({ error: 'INSFORGE_SERVICE_ROLE_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
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
      baseUrl: Deno.env.get('INSFORGE_URL') ?? '',
      anonKey: Deno.env.get('INSFORGE_ANON_KEY') ?? '',
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
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }
      const post = (data as unknown[])?.[0] ?? null;
      return new Response(JSON.stringify({ post }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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

    const { data, error } = await (q as any).range?.(from, to) ?? q;

    if (error) {
      return new Response(
        JSON.stringify({ error: (error as { message?: string })?.message ?? 'Failed to fetch' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
      );
    }

    const posts = (data as unknown[]) ?? [];
    const hasMore = posts.length === pageSize;
    return new Response(
      JSON.stringify({ posts, page, pageSize, hasMore }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  } catch (err) {
    console.error('blog-posts-public error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
}
