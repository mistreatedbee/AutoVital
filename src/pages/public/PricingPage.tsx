import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PricingCard } from '../../components/ui/PricingCard';
import { Toggle } from '../../components/ui/Toggle';
import { Accordion } from '../../components/ui/Accordion';
import { fetchPublicPlans } from '../../services/adminPlans';
import { formatCurrencyZAR } from '../../lib/formatters';

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<string>('Monthly');
  const isAnnual = billingCycle === 'Annually';

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['public', 'plans'],
    queryFn: fetchPublicPlans,
  });

  const priceForPlan = (cents: number) => {
    if (cents === 0) return 'R 0';
    if (isAnnual) {
      const monthlyEquivalent = Math.round(cents * 0.8);
      return formatCurrencyZAR(monthlyEquivalent);
    }
    return formatCurrencyZAR(cents);
  };

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
          {isLoading ? (
            <div className="col-span-3 py-12 text-center text-slate-500">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-slate-500">No plans available. Check back soon.</div>
          ) : (
            plans.map((plan, idx) => (
              <PricingCard
                key={plan.id}
                name={plan.name}
                price={priceForPlan(plan.priceMonthlyCents)}
                period="mo"
                description={
                  plan.code === 'starter'
                    ? 'Perfect for individuals with a single vehicle.'
                    : plan.code === 'pro'
                      ? 'For enthusiasts and multi-car households.'
                      : 'For small businesses managing multiple vehicles.'
                }
                popular={plan.code === 'pro'}
                features={
                  plan.code === 'starter'
                    ? ['1 Vehicle Profile', 'Basic Maintenance Log', 'Standard Reminders', 'Email Support']
                    : plan.code === 'pro'
                      ? ['Up to 5 Vehicles', 'Advanced Health Score', 'Expense & Fuel Tracking', 'Document Storage (10GB)', 'Priority Support']
                      : ['Unlimited Vehicles', 'Fleet Dashboard', 'Custom Maintenance Schedules', 'Data Export & Reporting', '24/7 Phone Support']
                }
                ctaText={plan.code === 'starter' ? 'Get Started Free' : plan.code === 'pro' ? 'Start 14-Day Trial' : 'Contact Sales'}
              />
            ))
          )}
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