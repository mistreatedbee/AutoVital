import React, { useState } from 'react';
import {
  EditIcon,
  LayoutTemplateIcon,
  MessageSquareIcon,
  FileTextIcon } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
export function ContentManagement() {
  const [activeTab, setActiveTab] = useState('landing');
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
        <Card className="p-6 text-center py-12">
            <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Blog CMS</h3>
            <p className="text-slate-500 mt-1 mb-6">
              Manage articles, categories, and authors.
            </p>
            <Button
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700 border-none">

              Go to Blog CMS
            </Button>
          </Card>
        }
      </div>
    </div>);

}