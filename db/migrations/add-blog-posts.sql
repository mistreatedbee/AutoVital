-- Add blog_posts table for public blog and admin content management.
-- Run: insforge db query "$(cat db/migrations/add-blog-posts.sql)"

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_markdown TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  category TEXT,
  author_name TEXT,
  reading_time_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'public_read_published_blog_posts') THEN
    CREATE POLICY "public_read_published_blog_posts" ON blog_posts FOR SELECT TO anon USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'authenticated_read_all_blog_posts') THEN
    CREATE POLICY "authenticated_read_all_blog_posts" ON blog_posts FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'authenticated_insert_blog_posts') THEN
    CREATE POLICY "authenticated_insert_blog_posts" ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'authenticated_update_blog_posts') THEN
    CREATE POLICY "authenticated_update_blog_posts" ON blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'authenticated_delete_blog_posts') THEN
    CREATE POLICY "authenticated_delete_blog_posts" ON blog_posts FOR DELETE TO authenticated USING (true);
  END IF;
END $$;
