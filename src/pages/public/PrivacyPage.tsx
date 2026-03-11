import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Card className="p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900 font-heading mb-3">
          Privacy Policy
        </h1>
        <p className="text-slate-600 leading-relaxed">
          This page is a placeholder for Phase 0. Add your privacy policy here before going live.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}

