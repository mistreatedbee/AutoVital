import React from 'react';
import { LayoutTemplateIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
export function ContentManagement() {
  // Phase 4: CMS editing is deferred. This screen is intentionally read-only and
  // communicates that inline so admins are not misled into expecting full CRUD.

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
