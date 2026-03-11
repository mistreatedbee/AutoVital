import React, { useEffect, useState } from 'react';
import {
  EditIcon,
  LayoutTemplateIcon,
  MessageSquareIcon,
  FileTextIcon } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import type { BlogPost } from '../../services/blog';
import { getInsforgeClient } from '../../lib/insforgeClient';
export function ContentManagement() {
  const [activeTab, setActiveTab] = useState('landing');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab !== 'blog') return;
    let cancelled = false;
    const load = async () => {
      setLoadingBlog(true);
      setBlogError(null);
      try {
        const client = getInsforgeClient();
        const { data, error } = await client.database
          .from('blog_posts')
          .select(
            'id, slug, title, excerpt, category, author_name, reading_time_minutes, status, published_at',
          )
          .order('published_at', { ascending: false });
        if (error) {
          setBlogError(error.message ?? 'Failed to load blog posts.');
        } else if (!cancelled && data) {
          setBlogPosts(data as BlogPost[]);
        }
      } catch (err) {
        if (!cancelled) {
          setBlogError(
            err instanceof Error ? err.message : 'Failed to load blog posts.',
          );
        }
      } finally {
        if (!cancelled) setLoadingBlog(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
  };

  const handleNewPost = () => {
    setEditingPost({
      id: '',
      slug: '',
      title: '',
      excerpt: '',
      content_markdown: '',
      cover_image_url: '',
      category: '',
      author_name: '',
      reading_time_minutes: null,
      status: 'draft',
      seo_title: '',
      seo_description: '',
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const handleSavePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;
    setSaving(true);
    try {
      const client = getInsforgeClient();
      const payload = {
        slug: editingPost.slug.trim(),
        title: editingPost.title.trim(),
        excerpt: editingPost.excerpt,
        content_markdown: editingPost.content_markdown,
        cover_image_url: editingPost.cover_image_url,
        category: editingPost.category,
        author_name: editingPost.author_name,
        reading_time_minutes: editingPost.reading_time_minutes,
        status: editingPost.status,
        seo_title: editingPost.seo_title,
        seo_description: editingPost.seo_description,
      };
      if (editingPost.id) {
        const { error } = await client.database
          .from('blog_posts')
          .update(payload)
          .eq('id', editingPost.id);
        if (error) {
          // eslint-disable-next-line no-alert
          alert(error.message ?? 'Failed to update post.');
        }
      } else {
        const { error } = await client.database.from('blog_posts').insert([payload]);
        if (error) {
          // eslint-disable-next-line no-alert
          alert(error.message ?? 'Failed to create post.');
        }
      }
      setEditingPost(null);
      setActiveTab('blog'); // trigger reload via effect
    } finally {
      setSaving(false);
    }
  };

  const blogColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value: any) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            value === 'published'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'published_at',
      header: 'Published',
      render: (value: any) => {
        if (!value) return <span className="text-slate-400 text-xs">Draft</span>;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Content Management
        </h1>
        <p className="text-slate-500 mt-1">
          Manage public-facing website content.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'landing' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <LayoutTemplateIcon className="w-4 h-4" /> Landing Page
          </div>
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'faqs' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <MessageSquareIcon className="w-4 h-4" /> FAQs
          </div>
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'blog' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" /> Blog Posts
          </div>
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'testimonials' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <MessageSquareIcon className="w-4 h-4" /> Testimonials
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'landing' &&
        <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {[
            'Hero Section',
            'Features Grid',
            'Health Score Explainer',
            'Testimonials',
            'Final CTA'].
            map((section) =>
            <div
              key={section}
              className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">

                  <div>
                    <h3 className="font-bold text-slate-900">{section}</h3>
                    <p className="text-sm text-slate-500">
                      Last updated: 2 weeks ago
                    </p>
                  </div>
                  <Button
                variant="secondary"
                size="sm"
                icon={<EditIcon className="w-4 h-4" />}>

                    Edit Content
                  </Button>
                </div>
            )}
            </div>
          </Card>
        }

        {activeTab === 'faqs' &&
        <Card className="p-6 text-center py-12">
            <MessageSquareIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Manage FAQs</h3>
            <p className="text-slate-500 mt-1 mb-6">
              Add, edit, or reorder frequently asked questions.
            </p>
            <Button
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700 border-none">

              Open FAQ Editor
            </Button>
          </Card>
        }

        {activeTab === 'blog' &&
        <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-rose-500" />
                  Blog Posts
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Publish articles that appear on the public blog.
                </p>
              </div>
              <Button
                variant="primary"
                className="bg-rose-600 hover:bg-rose-700 border-none"
                onClick={handleNewPost}>
                New Post
              </Button>
            </div>

            {blogError &&
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {blogError}
              </div>
            }

            {loadingBlog ?
            <div className="text-slate-500 text-sm">Loading blog posts…</div> :
            <DataTable
              columns={blogColumns}
              data={blogPosts}
              onRowClick={handleEditPost}
            />
            }

            {editingPost &&
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {editingPost.id ? 'Edit Post' : 'New Post'}
                  </h3>
                  <form onSubmit={handleSavePost} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">
                          Title
                        </label>
                        <input
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          value={editingPost.title}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              title: e.target.value,
                            })}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">
                          Slug
                        </label>
                        <input
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          value={editingPost.slug}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              slug: e.target.value,
                            })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">
                          Category
                        </label>
                        <input
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          value={editingPost.category ?? ''}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              category: e.target.value,
                            })}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">
                          Author
                        </label>
                        <input
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          value={editingPost.author_name ?? ''}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              author_name: e.target.value,
                            })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Excerpt
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
                        value={editingPost.excerpt ?? ''}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            excerpt: e.target.value,
                          })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Cover Image URL
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        value={editingPost.cover_image_url ?? ''}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            cover_image_url: e.target.value,
                          })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Content (Markdown)
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[200px]"
                        value={editingPost.content_markdown}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            content_markdown: e.target.value,
                          })}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-700">
                          Status
                        </label>
                        <select
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          value={editingPost.status}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              status: e.target.value as BlogPost['status'],
                            })}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setEditingPost(null)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={saving}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            }
          </Card>
        }

        {activeTab === 'testimonials' &&
        <Card className="p-6 text-center py-12">
            <MessageSquareIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">
              Manage Testimonials
            </h3>
            <p className="text-slate-500 mt-1 mb-6">
              Add or edit customer testimonials displayed on marketing pages.
            </p>
            <Button
              variant="primary"
              className="bg-rose-600 hover:bg-rose-700 border-none">
              Add Testimonial
            </Button>
          </Card>
        }
      </div>
    </div>);

}