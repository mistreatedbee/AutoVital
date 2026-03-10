import React from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon } from 'lucide-react';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
export function BlogPage() {
  const categories = [
  'All',
  'Maintenance Tips',
  'Industry News',
  'Product Updates',
  'Guides'];

  const posts = [
  {
    id: 1,
    title: 'The Ultimate Guide to Preventative Car Maintenance',
    excerpt:
    'Learn the essential maintenance tasks that can extend the life of your vehicle by years and save you thousands in repairs.',
    category: 'Guides',
    author: 'Alex Morgan',
    date: 'Oct 12, 2023',
    readTime: '8 min read',
    image:
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Why Your Check Engine Light is On (And What to Do)',
    excerpt:
    "Don't panic. Here are the 5 most common reasons your check engine light illuminates and how to diagnose them.",
    category: 'Maintenance Tips',
    author: 'Sarah Jenkins',
    date: 'Oct 05, 2023',
    readTime: '5 min read',
    image:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Introducing AutoVital Fleet Dashboard',
    excerpt:
    'Manage multiple vehicles with ease using our new Fleet Dashboard, designed specifically for small businesses.',
    category: 'Product Updates',
    author: 'David Chen',
    date: 'Sep 28, 2023',
    readTime: '3 min read',
    image:
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'EV vs ICE: Maintenance Cost Comparison',
    excerpt:
    'Are electric vehicles really cheaper to maintain? We break down the data from over 10,000 vehicles on our platform.',
    category: 'Industry News',
    author: 'Alex Morgan',
    date: 'Sep 15, 2023',
    readTime: '6 min read',
    image:
    'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    title: 'How to Prepare Your Car for Winter',
    excerpt:
    'Cold weather is brutal on vehicles. Follow this checklist to ensure your car is ready for freezing temperatures.',
    category: 'Guides',
    author: 'Sarah Jenkins',
    date: 'Sep 02, 2023',
    readTime: '7 min read',
    image:
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    title: 'Understanding Synthetic vs Conventional Oil',
    excerpt:
    'Is synthetic oil worth the extra cost? We explain the differences and when you should make the switch.',
    category: 'Maintenance Tips',
    author: 'Mike Thompson',
    date: 'Aug 20, 2023',
    readTime: '4 min read',
    image:
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }];

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
            {categories.map((cat, i) =>
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>

                {cat}
              </button>
            )}
          </div>
          <div className="w-full md:w-72">
            <Input
              placeholder="Search articles..."
              icon={<SearchIcon className="w-4 h-4" />} />

          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) =>
          <Link key={post.id} to={`/blog/article-slug-${post.id}`}>
              <Card
              hover
              className="h-full flex flex-col bg-white border-slate-100 overflow-hidden group">

                <div className="h-48 overflow-hidden relative">
                  <img
                  src={post.image}
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
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {post.author.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-slate-900">
                          {post.author}
                        </p>
                        <p className="text-slate-500">{post.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-16 flex justify-center">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            Load More Articles <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>);

}