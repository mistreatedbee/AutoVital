import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  UsersIcon,
  GlobeIcon,
  TrendingUpIcon } from
'lucide-react';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card } from '../../components/ui/Card';
export function AboutPage() {
  const stats = [
  {
    label: 'Active Users',
    value: '10,000+',
    icon: <UsersIcon />
  },
  {
    label: 'Vehicles Tracked',
    value: '25,000+',
    icon: <ShieldCheckIcon />
  },
  {
    label: 'Services Logged',
    value: '1.2M',
    icon: <TrendingUpIcon />
  },
  {
    label: 'Countries',
    value: '42',
    icon: <GlobeIcon />
  }];

  return (
    <div className="w-full pt-32 pb-24">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-4xl mx-auto">
          <SectionHeading
            badge="Our Story"
            title="Mission: Smarter Vehicle Ownership"
            description="We believe that maintaining a vehicle shouldn't require a filing cabinet full of receipts or the constant fear of a sudden breakdown."
            centered />

        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{
                opacity: 0,
                x: -30
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
              className="space-y-6 text-lg text-slate-600 leading-relaxed">

              <h3 className="text-3xl font-bold text-slate-900 font-heading mb-6">
                Built out of frustration.
              </h3>
              <p>
                AutoVital started in 2023 when our founder missed a critical
                timing belt replacement because the sticker fell off the
                windshield. The resulting engine failure cost thousands of
                dollars—a completely preventable expense.
              </p>
              <p>
                We looked for tools to manage vehicle maintenance, but
                everything was either a clunky spreadsheet, an outdated app from
                2010, or enterprise software meant for massive trucking fleets.
              </p>
              <p>
                So we built AutoVital: a premium, intelligent platform designed
                for everyday drivers, enthusiasts, and small businesses who want
                total control over their vehicle's health and expenses.
              </p>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              whileInView={{
                opacity: 1,
                scale: 1
              }}
              viewport={{
                once: true
              }}>

              <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Mechanic working on car"
                  className="object-cover w-full h-full opacity-90" />

                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex items-end p-8">
                  <p className="text-white font-medium text-xl">
                    Preventative maintenance is the key to longevity.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) =>
          <Card
            key={idx}
            className="p-8 text-center border-slate-100 bg-slate-50">

              <div className="w-12 h-12 mx-auto bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-slate-900 font-heading mb-2">
                {stat.value}
              </div>
              <div className="text-slate-500 font-medium">{stat.label}</div>
            </Card>
          )}
        </div>
      </div>
    </div>);

}