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
  // Phase 4: CMS editing is deferred. This screen is intentionally read-only and
  // communicates that inline so admins are not misled into expecting full CRUD.

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
          Admin-editable CMS features are not yet available in this environment. Public
          content (blog, FAQs, testimonials, pricing) is currently managed via code and
          migrations.
        </p>
      </div>

      <Card className="p-8 text-center">
        <LayoutTemplateIcon className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          CMS Editing Coming Soon
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          This page is a placeholder for future content management capabilities. For now,
          please update marketing and blog content via the codebase and database seed
          scripts instead of this UI.
        </p>
      </Card>
    </div>
  );

}