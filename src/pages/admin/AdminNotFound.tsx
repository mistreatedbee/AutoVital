import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboardIcon, SearchIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <SearchIcon className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading mb-2">
          Page not found
        </h1>
        <p className="text-slate-600 mb-6">
          This admin section doesn't exist or you don't have access to it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/admin">
            <Button variant="primary" icon={<LayoutDashboardIcon className="w-4 h-4" />}>
              Back to Admin
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
