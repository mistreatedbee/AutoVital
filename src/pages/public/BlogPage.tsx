import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon } from 'lucide-react';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { fetchPublishedBlogPosts } from '../../services/blog';
import { usePageSeo } from '../../hooks/usePageSeo';
export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const categories = useMemo(() => {
    const fromPosts = Array.from(
      new Set(
        posts
          .map((p) => (p.category ?? '').trim())
          .filter(Boolean),
      ),
    );
    return ['All', ...fromPosts].slice(0, 12);
  }, [posts]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);
    (async () => {
      const res = await fetchPublishedBlogPosts({
        query: search,
        category: selectedCategory,
        page: 1,
        pageSize: 9,
      });
      if (cancelled) return;
      setPosts(res.posts);
      setHasMore(res.hasMore);
      setLoading(false);
    })().catch((e) => {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : 'Failed to load blog posts.');
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [search, selectedCategory]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const res = await fetchPublishedBlogPosts({
        query: search,
        category: selectedCategory,
        page: next,
        pageSize: 9,
      });
      setPosts((prev) => [...prev, ...res.posts]);
      setHasMore(res.hasMore);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  usePageSeo({
    title: 'Blog',
    description:
      'AutoVital blog with maintenance tips, product updates, and guides to keep your vehicle healthy and costs under control.',
  });

  return (
    <div className="w-full pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionHeading
            title="AutoVital Resources"
            description="Expert advice, maintenance guides, and product updates to help you get the most out of your vehicle."
            centered />

        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat, i) => {
              const isActive = selectedCategory === cat;
              return (
            <button
              key={`${cat}-${i}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}>

                {cat}
              </button>
              );
            })}
          </div>
          <div className="w-full md:w-72">
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<SearchIcon className="w-4 h-4" />} />

          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center text-slate-500 py-16">
              Loading articles…
            </div>
          )}
          {!loading && error && (
            <div className="col-span-full text-center text-slate-500 py-16">
              {error}
            </div>
          )}
          {!loading && !error && posts.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-16">
              No articles found. Try a different search or category.
            </div>
          )}
          {!loading && !error && posts.map((post) =>
          <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card
              hover
              className="h-full flex flex-col bg-white border-slate-100 overflow-hidden group">

                <div className="h-48 overflow-hidden relative">
                  <img
                  src={post.cover_image_url ?? 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                  <div className="absolute top-4 left-4">
                    <Badge
                    variant="primary"
                    className="bg-white/90 backdrop-blur-sm shadow-sm">

                      {post.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 flex-1">
                    {post.excerpt ?? ''}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {(post.author_name ?? 'A').charAt(0)}
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-slate-900">
                          {post.author_name ?? 'AutoVital'}
                        </p>
                        <p className="text-slate-500">{formatDate(post.published_at)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {post.reading_time_minutes ? `${post.reading_time_minutes} min read` : ''}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {!loading && !error && hasMore && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading…' : 'Load more articles'} <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>);

}