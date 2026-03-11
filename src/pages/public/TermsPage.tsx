import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Card className="p-8 sm:p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 font-heading mb-3">
            Terms of Service
          </h1>
          <p className="text-slate-600 leading-relaxed">
            These Terms govern your access to and use of AutoVital’s websites,
            apps, and services. By using AutoVital, you agree to these Terms.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Last updated: <span className="font-medium text-slate-700">March 11, 2026</span>
          </p>
        </header>

        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary-600">
          <h2>1. Who we are</h2>
          <p>
            AutoVital provides tools to help you track vehicle maintenance,
            expenses, reminders, and related documents. Throughout these Terms,
            “AutoVital,” “we,” and “us” refer to AutoVital and its operators.
          </p>

          <h2>2. Eligibility and accounts</h2>
          <ul>
            <li>
              You must be able to form a binding contract in your jurisdiction to
              use AutoVital.
            </li>
            <li>
              You’re responsible for safeguarding your credentials and for all
              activity under your account.
            </li>
          </ul>

          <h2>3. Subscriptions, trials, and billing</h2>
          <p>
            Some features require a paid subscription. If a free trial is offered,
            you can cancel before the trial ends to avoid charges. Taxes may apply
            depending on your location.
          </p>

          <h2>4. Your content and vehicle data</h2>
          <p>
            You may submit information such as vehicle details, maintenance logs,
            receipts, and other content (“User Content”). You retain ownership of
            your User Content. You grant AutoVital a limited license to host,
            process, and display your User Content solely to provide and improve
            the service.
          </p>

          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for unlawful, harmful, or deceptive purposes.</li>
            <li>Probe, scan, or test the vulnerability of our systems.</li>
            <li>Reverse engineer or attempt to access source code not provided to you.</li>
            <li>Interfere with or disrupt the service or other users.</li>
          </ul>

          <h2>6. Third-party services</h2>
          <p>
            AutoVital may integrate with third-party services (for example,
            analytics, payments, email, or storage). Your use of third-party
            services is governed by their terms and policies.
          </p>

          <h2>7. Service availability and changes</h2>
          <p>
            We may modify, suspend, or discontinue the service (in whole or in
            part) at any time, including adding or removing features. We’ll try
            to provide reasonable notice when practical.
          </p>

          <h2>8. Disclaimers</h2>
          <p>
            AutoVital provides organizational and reminder tools, not professional
            mechanical advice. You are responsible for verifying maintenance
            intervals, safety-critical repairs, and vehicle condition. The service
            is provided “as is” and “as available.”
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, AutoVital will not be liable
            for indirect, incidental, special, consequential, or punitive damages,
            or any loss of profits, data, or goodwill.
          </p>

          <h2>10. Termination</h2>
          <p>
            You may stop using AutoVital at any time. We may suspend or terminate
            access if we reasonably believe you violated these Terms or if needed
            to protect the service and users.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:support@autovital.com">support@autovital.com</a> or
            via the <Link to="/contact">contact page</Link>.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/" className="text-primary-600 hover:text-primary-500 font-medium">
            Back to home
          </Link>
          <Link to="/privacy" className="text-slate-600 hover:text-slate-900 font-medium">
            Read privacy policy
          </Link>
        </div>
      </Card>
    </div>
  );
}

