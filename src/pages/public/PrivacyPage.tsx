import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Card className="p-8 sm:p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 font-heading mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-600 leading-relaxed">
            This Policy explains what information AutoVital collects, how we use
            it, and the choices you have.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Last updated: <span className="font-medium text-slate-700">March 11, 2026</span>
          </p>
        </header>

        <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary-600">
          <h2>1. Information we collect</h2>
          <ul>
            <li>
              <strong>Account information</strong> (e.g., name, email, login
              credentials).
            </li>
            <li>
              <strong>Vehicle and maintenance data</strong> you provide (e.g.,
              vehicle details, mileage, service history, expenses).
            </li>
            <li>
              <strong>Files and documents</strong> you upload (e.g., receipts,
              registration/insurance documents).
            </li>
            <li>
              <strong>Usage data</strong> (e.g., pages viewed, feature usage,
              approximate location derived from IP).
            </li>
          </ul>

          <h2>2. How we use information</h2>
          <ul>
            <li>Provide, operate, and maintain the service.</li>
            <li>Send reminders, service notifications, and account messages.</li>
            <li>Improve performance, security, and user experience.</li>
            <li>Comply with legal obligations and enforce our Terms.</li>
          </ul>

          <h2>3. How we share information</h2>
          <p>
            We do not sell your personal information. We may share information
            with service providers who help us run AutoVital (for example,
            hosting, email delivery, analytics, and payment processing). These
            providers are permitted to use your information only to provide
            services to us.
          </p>

          <h2>4. Data retention</h2>
          <p>
            We retain information for as long as needed to provide the service
            and for legitimate business purposes (such as security, compliance,
            and dispute resolution). You can request deletion subject to
            applicable law.
          </p>

          <h2>5. Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect
            your information. No method of transmission or storage is 100%
            secure, so we cannot guarantee absolute security.
          </p>

          <h2>6. Your choices</h2>
          <ul>
            <li>Update your profile and account settings within the app.</li>
            <li>Opt out of non-essential communications where available.</li>
            <li>Request access, correction, or deletion of your information.</li>
          </ul>

          <h2>7. International users</h2>
          <p>
            If you access AutoVital from outside the country where we operate,
            your information may be processed in other jurisdictions, which may
            have different data protection rules.
          </p>

          <h2>8. Contact</h2>
          <p>
            For privacy questions or requests, contact{' '}
            <a href="mailto:privacy@autovital.com">privacy@autovital.com</a> or
            use our <Link to="/contact">contact form</Link>.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/" className="text-primary-600 hover:text-primary-500 font-medium">
            Back to home
          </Link>
          <Link to="/terms" className="text-slate-600 hover:text-slate-900 font-medium">
            Read terms of service
          </Link>
        </div>
      </Card>
    </div>
  );
}

