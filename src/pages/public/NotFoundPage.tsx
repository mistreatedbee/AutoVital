import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Card className="p-8 sm:p-10">
        <p className="text-sm font-medium text-slate-500 mb-2">404</p>
        <h1 className="text-3xl font-bold text-slate-900 font-heading mb-3">
          Page not found
        </h1>
        <p className="text-slate-600 leading-relaxed mb-8">
          The page you’re looking for doesn’t exist (or was moved).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/">
            <Button variant="primary">Go home</Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary">Contact us</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

