import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Share2Icon } from
'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { fetchPublishedBlogPostBySlug, type BlogPost } from '../../services/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePageSeo } from '../../hooks/usePageSeo';
export function BlogArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPost(null);

    (async () => {
      const data = await fetchPublishedBlogPostBySlug(slug ?? '');
      if (cancelled) return;
      setPost(data);
      setLoading(false);
    })().catch((e) => {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : 'Failed to load article.');
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const publishedDate = useMemo(() => {
    if (!post?.published_at) return '';
    const d = new Date(post.published_at);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }, [post?.published_at]);

  const share = async () => {
    if (!post) return;
    const url = window.location.href;
    const payload = { title: post.title, text: post.excerpt ?? '', url };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav: any = navigator;
      if (nav?.share) {
        await nav.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      // eslint-disable-next-line no-alert
      alert('Link copied to clipboard.');
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-32 pb-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-500">
          Loading article…
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full pt-32 pb-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to all articles
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-700">
            <p className="font-bold text-slate-900 mb-2">Article not found</p>
            <p className="text-sm text-slate-600">
              {error ?? 'This article may have been moved or is not published yet.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  usePageSeo({
    title: post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
  });

  return (
    <div className="w-full pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 mb-8 transition-colors">

          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to all articles
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          {post.category && (
            <Badge variant="primary" className="mb-6">
              {post.category}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-heading mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                {(post.author_name ?? 'A')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('') || 'A'}
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {post.author_name ?? 'AutoVital'}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  {publishedDate && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" /> {publishedDate}
                    </span>
                  )}
                  {post.reading_time_minutes != null && (
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" /> {post.reading_time_minutes} min read
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Share2Icon className="w-4 h-4" />}>
              <span onClick={share}>Share</span>
            </Button>
          </div>
        </header>

        {/* Hero Image */}
        <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-16 bg-slate-100">
          <img
            src={
              post.cover_image_url ??
              'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80'
            }
            alt={post.title}
            className="w-full h-full object-cover" />

        </div>

        {/* Article Content Layout */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Main Content */}
          <article className="flex-1 prose prose-lg prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary-600">
            {post.excerpt && (
              <p className="lead text-xl text-slate-600 mb-8">{post.excerpt}</p>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content_markdown}
            </ReactMarkdown>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 my-10">
              <h3 className="text-primary-900 mt-0">Ready to track your maintenance?</h3>
              <p className="text-primary-800 mb-6">
                AutoVital helps you stay ahead of service, log expenses, and keep every vehicle
                healthy—without spreadsheets.
              </p>
              <Link to="/signup">
                <Button variant="primary">Start Tracking Free</Button>
              </Link>
            </div>
          </article>

          {/* Sidebar / Table of Contents */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-32 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2 font-heading">
                Quick links
              </h4>
              <p className="text-sm text-slate-600 mb-4">
                Learn more about AutoVital.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/features" className="text-slate-700 hover:text-primary-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-slate-700 hover:text-primary-600 transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-slate-700 hover:text-primary-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-slate-700 hover:text-primary-600 transition-colors">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>);

}