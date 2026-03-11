import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Card className="p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900 font-heading mb-3">Careers</h1>
        <p className="text-slate-600 leading-relaxed">
          Placeholder for Phase 0. Add roles and hiring info here when you’re ready.
        </p>
        <div className="mt-8">
          <Link
            to="/contact"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Get in touch
          </Link>
        </div>
      </Card>
    </div>
  );
}

