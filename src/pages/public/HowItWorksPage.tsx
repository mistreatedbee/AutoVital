import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  CarIcon,
  WrenchIcon,
  BellRingIcon,
  BarChart3Icon } from
'lucide-react';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
export function HowItWorksPage() {
  const steps = [
  {
    icon: <UserPlusIcon className="w-8 h-8" />,
    title: '1. Create Your Account',
    description:
    'Sign up in seconds. Set your preferences for measurement units (km, with optional miles support) and how you want to receive notifications.',
    image: 'bg-gradient-to-br from-primary-100 to-primary-50'
  },
  {
    icon: <CarIcon className="w-8 h-8" />,
    title: '2. Add Your Vehicles',
    description:
    "Enter your vehicle's make, model, year, and current mileage. You can add multiple vehicles if you're managing a household or small fleet.",
    image: 'bg-gradient-to-br from-accent-100 to-accent-50'
  },
  {
    icon: <WrenchIcon className="w-8 h-8" />,
    title: '3. Log Past Maintenance',
    description:
    'Input your recent service history. AutoVital uses this baseline to calculate your initial Vehicle Health Score and predict future needs.',
    image: 'bg-gradient-to-br from-amber-100 to-amber-50'
  },
  {
    icon: <BellRingIcon className="w-8 h-8" />,
    title: '4. Get Smart Reminders',
    description:
    'Our algorithm tracks your average mileage and time elapsed to send you alerts before crucial maintenance is due.',
    image: 'bg-gradient-to-br from-purple-100 to-purple-50'
  },
  {
    icon: <BarChart3Icon className="w-8 h-8" />,
    title: '5. Track Expenses & Health',
    description:
    'View beautiful charts of your fuel efficiency, repair costs, and overall vehicle reliability over time.',
    image: 'bg-gradient-to-br from-blue-100 to-blue-50'
  }];

  return (
    <div className="w-full pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <SectionHeading
            badge="The Journey"
            title="From Chaos to Total Control"
            description="See how AutoVital transforms the way you manage your vehicle's health and maintenance schedule."
            centered />

        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />

          <div className="space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 50
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
                  }}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isEven ? '' : 'md:flex-row-reverse'}`}>

                  {/* Content */}
                  <div
                    className={`flex-1 text-center md:text-left ${isEven ? 'md:text-right' : ''}`}>

                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 text-primary-600 mb-6 ${isEven ? 'md:ml-auto' : ''}`}>

                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 font-heading">
                      {step.title}
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-primary-100 items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-primary-500" />
                  </div>

                  {/* Visual Mockup */}
                  <div className="flex-1 w-full">
                    <Card
                      className={`aspect-video ${step.image} border-slate-200 p-6 flex items-center justify-center relative overflow-hidden`}>

                      {/* Abstract UI representation */}
                      <div className="w-3/4 h-3/4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm flex flex-col p-4 gap-3">
                        <div className="w-1/3 h-4 bg-slate-200 rounded-full" />
                        <div className="w-full h-24 bg-slate-100 rounded-lg mt-2" />
                        <div className="flex gap-2 mt-auto">
                          <div className="flex-1 h-8 bg-slate-200 rounded-md" />
                          <div className="flex-1 h-8 bg-primary-200 rounded-md" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>);

            })}
          </div>
        </div>

        <div className="mt-32 text-center bg-slate-50 rounded-3xl p-12 border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 font-heading">
            Ready to get started?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of smart vehicle owners who are saving money and
            preventing breakdowns.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="primary">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>);

}