import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Accordion } from '../../components/ui/Accordion';

export function FaqPage() {
  return (
    <div className="w-full pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionHeading
            title="Frequently Asked Questions"
            description="Quick answers about accounts, pricing, privacy, and how AutoVital works."
            centered
          />
        </div>

        <Card className="p-6 sm:p-8 md:p-10">
          <Accordion
            items={[
              {
                question: 'What is AutoVital?',
                answer:
                  'AutoVital is a vehicle maintenance and expense tracking platform. It helps you log service history, track costs, store documents, and receive reminders so you can stay ahead of repairs.'
              },
              {
                question: 'Do I need an OBD2 device to use AutoVital?',
                answer:
                  'No. AutoVital works great with manual entry. You can track maintenance, expenses, and reminders without any hardware.'
              },
              {
                question: 'Can I manage more than one vehicle?',
                answer:
                  'Yes. Depending on your plan, you can manage multiple vehicles (households) or an unlimited number (fleet).'
              },
              {
                question: 'Can I import my existing maintenance history?',
                answer:
                  'You can add records manually, and we also support structured imports for certain plans. If you have data in a spreadsheet, contact us and we’ll help you get it into AutoVital.'
              },
              {
                question: 'Is my data secure?',
                answer:
                  'We use modern security practices and least-privilege access controls. Like any online service, no system is perfect, but we take security seriously and continuously improve protections.'
              },
              {
                question: 'How do reminders work?',
                answer:
              'Reminders can be based on time (e.g., every 6 months) or distance (e.g., every 10,000 km). AutoVital uses the data you provide to determine what’s due and when.'
              },
              {
                question: 'How do I contact support?',
                answer:
                  'Use the contact form and our team will respond as soon as possible. Paid plans may receive faster response times.'
              }
            ]}
          />

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <p className="font-bold text-slate-900">Still have questions?</p>
              <p className="text-slate-600 text-sm mt-1">
                Reach out and we’ll help you pick the right plan or solve an issue.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/contact" className="text-primary-600 hover:text-primary-500 font-medium">
                Contact support
              </Link>
              <Link to="/pricing" className="text-slate-700 hover:text-slate-900 font-medium">
                View pricing
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

