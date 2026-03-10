import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../../components/ui/SectionHeading';
import {
  CarIcon,
  WrenchIcon,
  BellRingIcon,
  TrendingDownIcon,
  FileTextIcon,
  ActivityIcon,
  CheckCircle2Icon } from
'lucide-react';
export function FeaturesPage() {
  const features = [
  {
    id: 'profiles',
    title: 'Comprehensive Vehicle Profiles',
    description:
    'Store every detail about your vehicle in one beautiful, easily accessible place. From VIN and license plate to exact engine specifications and tire sizes.',
    bullets: [
    'Store multiple photos',
    'Quick access to VIN and specs',
    'Track registration renewal dates'],

    icon: <CarIcon className="w-6 h-6" />,
    image: 'bg-gradient-to-br from-blue-100 to-blue-50'
  },
  {
    id: 'logs',
    title: 'Digital Maintenance Logs',
    description:
    'Throw away the messy glovebox receipts. Log every service, repair, and modification with costs, dates, and attached invoices.',
    bullets: [
    'Categorize service types',
    'Upload PDF receipts',
    'Search past repairs instantly'],

    icon: <WrenchIcon className="w-6 h-6" />,
    image: 'bg-gradient-to-br from-slate-100 to-slate-50',
    reverse: true
  },
  {
    id: 'reminders',
    title: 'Smart Service Reminders',
    description:
    'Never miss an oil change again. AutoVital calculates when your next service is due based on time elapsed or your average mileage driven.',
    bullets: [
    'Email and in-app notifications',
    'Customizable intervals',
    'Overdue alerts'],

    icon: <BellRingIcon className="w-6 h-6" />,
    image: 'bg-gradient-to-br from-amber-100 to-amber-50'
  },
  {
    id: 'expenses',
    title: 'Expense & Fuel Tracking',
    description:
    'Understand the true cost of ownership. Log fuel fill-ups to calculate real-world MPG and view beautiful charts of your maintenance spending.',
    bullets: [
    'Cost per mile analysis',
    'Monthly spending charts',
    'Fuel efficiency tracking'],

    icon: <TrendingDownIcon className="w-6 h-6" />,
    image: 'bg-gradient-to-br from-green-100 to-green-50',
    reverse: true
  }];

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 font-heading"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}>

            Everything You Need to Manage Your Vehicles
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.1
            }}>

            Explore the powerful tools designed to give you complete control
            over your vehicle's health and expenses.
          </motion.p>
        </div>

        <div className="space-y-32">
          {features.map((feature, idx) =>
          <motion.div
            key={feature.id}
            className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center`}
            initial={{
              opacity: 0,
              y: 40
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true,
              margin: '-100px'
            }}
            transition={{
              duration: 0.6
            }}>

              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 font-heading">
                  {feature.title}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3 pt-4">
                  {feature.bullets.map((bullet, i) =>
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-700 font-medium">

                      <CheckCircle2Icon className="w-5 h-5 text-accent-500" />
                      {bullet}
                    </li>
                )}
                </ul>
              </div>
              <div className="flex-1 w-full">
                {/* Mock UI Placeholder */}
                <div
                className={`w-full aspect-video rounded-2xl ${feature.image} border border-slate-200 shadow-xl flex items-center justify-center p-8 relative overflow-hidden`}>

                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                  <div className="relative z-10 w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                    <div className="h-8 w-1/3 bg-slate-100 rounded-md"></div>
                    <div className="h-4 w-1/2 bg-slate-50 rounded-md"></div>
                    <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 mt-4"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>);

}