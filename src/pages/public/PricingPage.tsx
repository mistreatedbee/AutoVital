import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PricingCard } from '../../components/ui/PricingCard';
import { Toggle } from '../../components/ui/Toggle';
import { Accordion } from '../../components/ui/Accordion';
export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<string>('Monthly');
  const isAnnual = billingCycle === 'Annually';
  return (
    <div className="pt-32 pb-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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

            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600 mb-10"
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

            Choose the perfect plan for your garage. Upgrade or downgrade at any
            time.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.2
            }}
            className="flex flex-col items-center gap-4">

            <Toggle
              options={['Monthly', 'Annually']}
              value={billingCycle}
              onChange={setBillingCycle} />

            <span className="text-sm font-medium text-accent-600 bg-accent-50 px-3 py-1 rounded-full">
              Save 20% with annual billing
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          <PricingCard
            name="Starter"
            price={isAnnual ? '$0' : '$0'}
            period="mo"
            description="Perfect for individuals with a single vehicle."
            features={[
            '1 Vehicle Profile',
            'Basic Maintenance Log',
            'Standard Reminders',
            'Email Support']
            }
            ctaText="Get Started Free" />

          <PricingCard
            name="Pro"
            price={isAnnual ? '$7' : '$9'}
            period="mo"
            description="For enthusiasts and multi-car households."
            popular
            features={[
            'Up to 5 Vehicles',
            'Advanced Health Score',
            'Expense & Fuel Tracking',
            'Document Storage (10GB)',
            'Priority Support']
            }
            ctaText="Start 14-Day Trial" />

          <PricingCard
            name="Fleet"
            price={isAnnual ? '$31' : '$39'}
            period="mo"
            description="For small businesses managing multiple vehicles."
            features={[
            'Unlimited Vehicles',
            'Fleet Dashboard',
            'Custom Maintenance Schedules',
            'Data Export & Reporting',
            '24/7 Phone Support']
            }
            ctaText="Contact Sales" />

        </div>

        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Pricing FAQ" centered className="mb-12" />
          <Accordion
            items={[
            {
              question: 'Can I switch plans later?',
              answer:
              "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the prorated difference will be charged to your card. If you downgrade, you'll receive credit on your next billing cycle."
            },
            {
              question: 'What happens after the 14-day Pro trial?',
              answer:
              "If you don't enter a credit card before your trial ends, your account will automatically be downgraded to the free Starter plan. You won't lose any data, but you will lose access to Pro features."
            },
            {
              question: 'Do you offer refunds?',
              answer:
              'We offer a 30-day money-back guarantee for all annual plans. Monthly plans can be canceled at any time, but we do not provide partial refunds for the current month.'
            }]
            } />

        </div>
      </div>
    </div>);

}