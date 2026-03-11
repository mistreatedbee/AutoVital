-- Fix 401 on blog_posts: ensure anon can read published posts.
-- Run: insforge db query "$(Get-Content db/migrations/fix-blog-posts-anon-policy.sql -Raw)"

-- Ensure grants exist
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO authenticated;

-- Recreate policy with explicit TO anon (required for unauthenticated requests)
DROP POLICY IF EXISTS "public_read_published_blog_posts" ON blog_posts;
CREATE POLICY "public_read_published_blog_posts" ON blog_posts
  FOR SELECT TO anon USING (status = 'published');
