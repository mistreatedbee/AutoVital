import React, { useState, useCallback, useId, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  CarIcon,
  WrenchIcon,
  BellRingIcon,
  TrendingDownIcon,
  FileTextIcon,
  ActivityIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  StarIcon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PricingCard } from '../../components/ui/PricingCard';
import { Accordion } from '../../components/ui/Accordion';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface Step {
  icon: React.ReactElement;
  title: string;
  description: string;
}

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: 'red' | 'blue' | 'green'; // extend as needed
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

// -----------------------------------------------------------------------------
// Constants (moved outside component to avoid recreation)
// -----------------------------------------------------------------------------
const STEPS: Step[] = [
  {
    icon: <ShieldCheckIcon />,
    title: 'Create Account',
    description: 'Sign up securely in seconds.',
  },
  {
    icon: <CarIcon />,
    title: 'Add Vehicle',
    description: 'Enter your VIN or make/model.',
  },
  {
    icon: <WrenchIcon />,
    title: 'Log Maintenance',
    description: 'Add past services and expenses.',
  },
  {
    icon: <ActivityIcon />,
    title: 'Get Insights',
    description: 'Receive smart alerts and reports.',
  },
];

const FEATURES: Feature[] = [
  {
    icon: <CarIcon />,
    title: 'Vehicle Profiles',
    description:
      'Store all details, VIN, specs, and photos in one beautiful dashboard.',
    color: 'red',
  },
  {
    icon: <WrenchIcon />,
    title: 'Maintenance Logs',
    description:
      'Keep a digital service book. Never lose a receipt or forget a repair again.',
    color: 'red',
  },
  {
    icon: <BellRingIcon />,
    title: 'Smart Reminders',
    description:
      'Get notified before service is due based on time or tracked mileage.',
    color: 'red',
  },
  {
    icon: <TrendingDownIcon />,
    title: 'Expense Tracking',
    description:
      'Visualize your spending on fuel, repairs, and insurance over time.',
    color: 'red',
  },
  {
    icon: <ActivityIcon />,
    title: 'Health Score',
    description:
      'Our algorithm calculates a real-time health score based on service history.',
    color: 'red',
  },
  {
    icon: <FileTextIcon />,
    title: 'Document Storage',
    description:
      'Securely store insurance cards, registration, and warranties in the cloud.',
    color: 'red',
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      '"AutoVital completely changed how I manage my cars. The smart reminders saved me from a blown timing belt that I had completely forgotten about."',
    author: 'Michael T.',
    role: 'Car Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: '2',
    quote:
      '"The expense tracking is eye-opening. I finally know exactly how much my commute is costing me. The interface is gorgeous and so easy to use."',
    author: 'Sarah J.',
    role: 'Daily Commuter',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '3',
    quote:
      '"As a small business owner with 5 delivery vans, this platform is a lifesaver. I can track all maintenance in one dashboard instead of messy spreadsheets."',
    author: 'David R.',
    role: 'Fleet Manager',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
];

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'mo',
    description: 'Perfect for individuals with a single vehicle.',
    features: [
      '1 Vehicle Profile',
      'Basic Maintenance Log',
      'Standard Reminders',
      'Email Support',
    ],
    ctaText: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'mo',
    description: 'For enthusiasts and multi-car households.',
    features: [
      'Up to 5 Vehicles',
      'Advanced Health Score',
      'Expense & Fuel Tracking',
      'Document Storage (10GB)',
      'Priority Support',
    ],
    ctaText: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Fleet',
    price: '$39',
    period: 'mo',
    description: 'For small businesses managing multiple vehicles.',
    features: [
      'Unlimited Vehicles',
      'Fleet Dashboard',
      'Custom Maintenance Schedules',
      'Data Export & Reporting',
      '24/7 Phone Support',
    ],
    ctaText: 'Contact Sales',
    popular: false,
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does the Health Score work?',
    answer:
      'Our proprietary algorithm analyzes your logged maintenance records, current mileage, and vehicle age against manufacturer recommended service intervals. It identifies missed services and calculates an overall reliability percentage.',
  },
  {
    question: 'Can I import data from other apps or spreadsheets?',
    answer:
      'Yes! Pro and Fleet users can upload CSV files of their maintenance history, and our system will automatically parse and organize the records into your vehicle profiles.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use bank-level 256-bit encryption for all data transmission and storage. Your uploaded documents (like insurance and registration) are stored securely in AWS with strict access controls.',
  },
  {
    question: 'Do I need an OBD2 scanner to use AutoVital?',
    answer:
      'No, AutoVital is designed to work perfectly with manual entry. However, we are working on integrations with popular OBD2 scanners to automatically pull mileage and diagnostic codes in a future update.',
  },
];

// -----------------------------------------------------------------------------
// Animation variants (reused)
// -----------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

// -----------------------------------------------------------------------------
// Helper: safely clone icon with className
// -----------------------------------------------------------------------------
const cloneIcon = (icon: React.ReactElement, className?: string) => {
  return React.isValidElement(icon)
    ? React.cloneElement(icon, { className, 'aria-hidden': true })
    : icon;
};

// -----------------------------------------------------------------------------
// Sub-components (memoized for performance)
// -----------------------------------------------------------------------------
const TrustLogos = memo(() => (
  <section className="py-12 border-b border-slate-200 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">
        Trusted by <span className="text-red-600">10,432</span> vehicle owners and fleets
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <span className="text-xl font-bold font-heading text-slate-800">AutoNation</span>
        <span className="text-slate-300 hidden md:block" aria-hidden="true">|</span>
        <span className="text-xl font-bold font-heading text-slate-800">FleetWorks</span>
        <span className="text-slate-300 hidden md:block" aria-hidden="true">|</span>
        <span className="text-xl font-bold font-heading text-slate-800">DriveSafe</span>
        <span className="text-slate-300 hidden md:block" aria-hidden="true">|</span>
        <span className="text-xl font-bold font-heading text-slate-800">CarCare Pro</span>
        <span className="text-slate-300 hidden md:block" aria-hidden="true">|</span>
        <span className="text-xl font-bold font-heading text-slate-800">MechanicHub</span>
      </div>
    </div>
  </section>
));

TrustLogos.displayName = 'TrustLogos';

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
export function LandingPage() {
  const [heroImageError, setHeroImageError] = useState(false);
  const gradientId = useId(); // unique ID for SVG gradient

  const handleHeroImageError = useCallback(() => {
    setHeroImageError(true);
  }, []);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-red-600 p-4 rounded-md shadow-lg z-50"
      >
        Skip to main content
      </a>

      <div id="main-content" className="w-full overflow-hidden font-body">
        {/* HERO SECTION */}
        <section className="relative bg-white text-red-600 py-28 md:py-36 overflow-hidden">
          {/* Decorative circles – hidden from screen readers */}
          <div
            className="absolute top-[-100px] left-[-100px] w-72 h-72 bg-red-200 opacity-30 rounded-full animate-pulse-slow"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[-150px] right-[-150px] w-96 h-96 bg-red-300 opacity-20 rounded-full animate-pulse-slow"
            aria-hidden="true"
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Text content */}
              <div className="md:w-1/2 space-y-6">
                <motion.h1
                  custom={0}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                >
                  Track Your Vehicle's Health{' '}
                  <span className="text-red-600">Before Problems Start.</span>
                </motion.h1>

                <motion.p
                  custom={0.2}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-lg md:text-xl text-gray-600"
                >
                  The intelligent maintenance tracking platform that predicts repairs,
                  logs expenses, and ensures your vehicle stays reliable and safe on the road.
                </motion.p>

                <motion.div
                  custom={0.4}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-lg px-8 bg-red-600 text-white hover:bg-red-700 border-none shadow-lg"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button
                      size="lg"
                      variant="outline"
                      icon={<PlayCircleIcon className="w-5 h-5" aria-hidden="true" />}
                      className="w-full sm:w-auto text-lg px-8 bg-transparent text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Logo / Image with fallback */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:w-1/2 relative flex justify-center"
              >
                <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-xl">
                  {!heroImageError ? (
                    <img
                      src="/logo.jpeg"
                      alt="AutoVital – Vehicle Health Platform"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      width={500}
                      height={300}
                      onError={handleHeroImageError}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center rounded-xl">
                      <span className="text-red-600 text-2xl font-bold">AutoVital</span>
                    </div>
                  )}
                  {/* Glow behind logo */}
                  <div
                    className="absolute inset-0 bg-gradient-to-tr from-red-400 to-red-600 opacity-20 rounded-xl blur-3xl animate-pulse-slow"
                    aria-hidden="true"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <TrustLogos />

        {/* HOW IT WORKS */}
        <section className="py-32 bg-slate-50 relative">
          <div className="absolute inset-0 bg-dot-pattern opacity-50" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <SectionHeading
              badge="Simple Process"
              title="How AutoVital Works"
              description="Get your vehicle's health under control in minutes, not hours."
              centered
              className="mb-20"
            />

            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-8 relative"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {/* Connecting Line – hidden from screen readers */}
              <div
                className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-red-200 via-red-400 to-red-200 z-0"
                aria-hidden="true"
              />

              {STEPS.map((step, idx) => (
                <motion.div
                  key={step.title} // better than index, but title is unique enough
                  variants={itemVariants}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center text-red-600 mb-8 border border-slate-100 group-hover:-translate-y-2 transition-transform duration-300 relative">
                    <div
                      className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white z-20"
                      aria-label={`Step ${idx + 1}`}
                    >
                      {idx + 1}
                    </div>
                    {cloneIcon(step.icon, 'w-12 h-12')}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 font-medium">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Powerful Features"
              title="Everything You Need to Manage Your Vehicles"
              description="A comprehensive suite of tools designed to save you money and prevent breakdowns."
              className="mb-20"
            />

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {FEATURES.map((feature, idx) => {
                const colorMap: Record<string, string> = {
                  red: 'bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white',
                };
                const bgGradientMap: Record<string, string> = {
                  red: 'hover:bg-gradient-to-br hover:from-red-50/50 hover:to-white',
                };
                return (
                  <motion.div key={feature.title} variants={itemVariants}>
                    <Card
                      className={`h-full p-8 border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${bgGradientMap[feature.color]}`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-colors duration-300 ${colorMap[feature.color]}`}
                      >
                        {cloneIcon(feature.icon, 'w-7 h-7')}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 font-heading">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium mb-6 flex-1">
                        {feature.description}
                      </p>
                      <div className="mt-auto flex items-center text-sm font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        Learn more <ArrowRightIcon className="w-4 h-4 ml-1" aria-hidden="true" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* HEALTH SCORE SECTION (DARK) */}
        <section className="py-32 bg-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern-dark opacity-30" aria-hidden="true" />
          <div
            className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-red-900/30 blur-[120px] rounded-full transform -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-900/20 blur-[100px] rounded-full pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <SectionHeading
                  badge="Proprietary Algorithm"
                  title="Know Your Vehicle's True Health"
                  description="Our intelligent Health Score analyzes your maintenance history, mileage, and vehicle age to give you a clear picture of reliability."
                  light
                  className="mb-10"
                />
                <ul className="space-y-6 mb-10">
                  {[
                    'Predicts component failures before they happen',
                    'Increases resale value with verified health data',
                    'Identifies neglected maintenance areas instantly',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-300 font-medium text-lg">
                      <span className="mt-1 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/50">
                        <CheckCircle2Icon className="w-4 h-4 text-red-400" aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRightIcon className="w-5 h-5" aria-hidden="true" />}
                  className="bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  See How It Works
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-square max-w-lg mx-auto relative flex items-center justify-center">
                  {/* Animated SVG Ring – unique ID for gradient */}
                  <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                    viewBox="0 0 100 100"
                    aria-labelledby={`health-score-title-${gradientId}`}
                  >
                    <title id={`health-score-title-${gradientId}`}>Vehicle Health Score: 94% Excellent</title>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1E293B" strokeWidth="8" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="264"
                      initial={{ strokeDashoffset: 264 }}
                      whileInView={{ strokeDashoffset: 15.84 }} // 94% of 264
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                    />
                  </svg>

                  <div className="absolute inset-4 rounded-full bg-slate-900/80 backdrop-blur-sm shadow-inner flex flex-col items-center justify-center text-center p-8 border border-white/5">
                    <span className="text-red-400 font-bold text-xl mb-2 tracking-widest uppercase">
                      Excellent
                    </span>
                    <span className="text-8xl font-extrabold text-white font-heading mb-2 tracking-tighter">
                      94
                      <span className="text-4xl text-slate-500 font-normal">%</span>
                    </span>
                    <span className="text-slate-400 text-sm font-medium">Based on 12 service records</span>
                  </div>

                  {/* Floating Badges – decorative, hidden from screen readers */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-8 top-1/4"
                    aria-hidden="true"
                  >
                    <Card dark className="p-4 shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur-md ring-1 ring-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                          <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Engine Health</p>
                          <p className="text-green-400 text-xs font-medium">98% Optimal</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-8 bottom-1/4"
                    aria-hidden="true"
                  >
                    <Card dark className="p-4 shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur-md ring-1 ring-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                          <WrenchIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Brakes & Tires</p>
                          <p className="text-amber-400 text-xs font-medium">85% Good</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-32 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Loved by Car Enthusiasts and Daily Drivers"
              centered
              className="mb-20"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial) => (
                <Card key={testimonial.id} hover className="p-8 flex flex-col h-full bg-white relative">
                  <div className="absolute top-8 right-8 text-slate-200 opacity-50" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-amber-400"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <blockquote className="flex-grow mb-8 relative z-10">
                    <p className="text-lg text-slate-700 leading-relaxed font-medium">
                      {testimonial.quote}
                    </p>
                  </blockquote>
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                    <img
                      src={testimonial.avatar}
                      alt={`${testimonial.author}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                    <div>
                      <div className="font-bold text-slate-900">{testimonial.author}</div>
                      <div className="text-sm text-slate-500 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Simple, Transparent Pricing"
              description="Start for free, upgrade when you need more power."
              centered
              className="mb-20"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PRICING_PLANS.map((plan) => (
                <PricingCard
                  key={plan.name}
                  name={plan.name}
                  price={plan.price}
                  period={plan.period}
                  description={plan.description}
                  features={plan.features}
                  ctaText={plan.ctaText}
                  popular={plan.popular}
                  accentColor="red"
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title="Frequently Asked Questions" centered className="mb-16" />
            <Accordion items={FAQ_ITEMS} />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-red-600 relative overflow-hidden text-white">
          <div
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"
            aria-hidden="true"
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Badge variant="dark" className="mb-8 bg-white/10 border-white/20 backdrop-blur-md text-white px-4 py-1.5 shadow-xl">
              Join 10,432 vehicle owners today
            </Badge>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-8 font-heading tracking-tight leading-tight">
              Ready to Take Control of Your Vehicle's Health?
            </h2>
            <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Stop guessing about maintenance. Start saving money and preventing breakdowns with AutoVital's intelligent tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-10 py-4 bg-white text-red-600 hover:bg-slate-50 border-none shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300"
                >
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="text-red-200 text-sm font-medium">No credit card required</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
