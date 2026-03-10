import React, { Children, cloneElement } from 'react';
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

export function LandingPage() {
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

  return (
    <div className="w-full overflow-hidden font-body">
      {/* MODERNIZED HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-dark overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-dot-pattern-dark opacity-50"></div>

        {/* Enhanced background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-600/30 rounded-full blur-[120px] mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] mix-blend-screen"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Left Column - Text and CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Badge
                  variant="dark"
                  className="border-white/10 bg-white/5 text-primary-300 backdrop-blur-md px-4 py-1.5 shadow-2xl"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <SparklesIcon className="w-4 h-4 text-accent-400" />
                    AutoVital 2.0 is now live
                  </span>
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] font-heading tracking-tight">
                Track Your Vehicle's Health{' '}
                <br className="hidden md:block" />
                <span className="text-gradient-light">Before Problems Start.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl lg:max-w-none lg:pr-10 leading-relaxed font-medium">
                The intelligent maintenance tracking platform that predicts repairs, logs expenses,
                and ensures your vehicle stays reliable and safe on the road.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-start gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8 shadow-[0_0_30px_rgba(18,115,234,0.4)] hover:shadow-[0_0_40px_rgba(18,115,234,0.6)] border-none"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button
                    size="lg"
                    variant="white"
                    icon={<PlayCircleIcon className="w-5 h-5" />}
                    className="w-full sm:w-auto text-lg px-8 bg-white/5 text-white border-white/10 hover:bg-white/10 backdrop-blur-md"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-12 text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="w-5 h-5 text-accent-400" />
                  <span className="text-sm">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZapIcon className="w-5 h-5 text-accent-400" />
                  <span className="text-sm">5-min setup</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Large Animated Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', damping: 15 }}
              className="relative flex justify-center items-center perspective-1000"
            >
              {/* 3D Card Effect Container */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, 10, 0],
                  rotateX: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-80 h-80 lg:w-96 lg:h-96"
              >
                {/* Glow behind logo */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>

                {/* Main Logo Container */}
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group">
                  {/* Animated scanning line effect */}
                  <motion.div
                    animate={{ top: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-primary-500/30 to-transparent"
                  />

                  {/* Logo Image */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <motion.img
                      src="/logo.jpeg"
                      alt="AutoVital"
                      className="w-full h-full object-contain drop-shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                  </div>

                  {/* Floating Tech Elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-2 right-2 w-16 h-16 border-2 border-primary-500/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-2 left-2 w-24 h-24 border-2 border-accent-500/20 rounded-full"
                  />

                  {/* Animated Dots */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                        className="absolute w-2 h-2 bg-primary-400 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Orbiting Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-8 border border-primary-500/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-16 border border-accent-500/10 rounded-full"
                />
              </motion.div>

              {/* Floating Labels */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full border border-primary-500/30 shadow-xl"
              >
                <span className="text-sm font-medium text-primary-400">AI-Powered</span>
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full border border-accent-500/30 shadow-xl"
              >
                <span className="text-sm font-medium text-accent-400">Real-time</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Subtle scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
          >
            <div className="w-6 h-10 rounded-full border border-white/20 flex justify-center">
              <div className="w-1 h-2 bg-white/40 rounded-full mt-2"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST LOGOS */}
      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">
            Trusted by <span className="text-primary-600">10,432</span> vehicle owners and fleets
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold font-heading text-slate-800">AutoNation</span>
            <span className="text-slate-300 hidden md:block">|</span>
            <span className="text-xl font-bold font-heading text-slate-800">FleetWorks</span>
            <span className="text-slate-300 hidden md:block">|</span>
            <span className="text-xl font-bold font-heading text-slate-800">DriveSafe</span>
            <span className="text-slate-300 hidden md:block">|</span>
            <span className="text-xl font-bold font-heading text-slate-800">CarCare Pro</span>
            <span className="text-slate-300 hidden md:block">|</span>
            <span className="text-xl font-bold font-heading text-slate-800">MechanicHub</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 bg-slate-50 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
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
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 z-0" />

            {[
              { icon: <ShieldCheckIcon />, title: 'Create Account', desc: 'Sign up securely in seconds.' },
              { icon: <CarIcon />, title: 'Add Vehicle', desc: 'Enter your VIN or make/model.' },
              { icon: <WrenchIcon />, title: 'Log Maintenance', desc: 'Add past services and expenses.' },
              { icon: <ActivityIcon />, title: 'Get Insights', desc: 'Receive smart alerts and reports.' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center text-primary-600 mb-8 border border-slate-100 group-hover:-translate-y-2 transition-transform duration-300 relative">
                  <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white z-20">
                    {idx + 1}
                  </div>
                  {cloneElement(step.icon as React.ReactElement, { className: 'w-12 h-12' })}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">{step.title}</h3>
                <p className="text-slate-600 font-medium">{step.desc}</p>
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
            {[
              {
                icon: <CarIcon />,
                title: 'Vehicle Profiles',
                desc: 'Store all details, VIN, specs, and photos in one beautiful dashboard.',
                color: 'blue',
              },
              {
                icon: <WrenchIcon />,
                title: 'Maintenance Logs',
                desc: 'Keep a digital service book. Never lose a receipt or forget a repair again.',
                color: 'emerald',
              },
              {
                icon: <BellRingIcon />,
                title: 'Smart Reminders',
                desc: 'Get notified before service is due based on time or tracked mileage.',
                color: 'amber',
              },
              {
                icon: <TrendingDownIcon />,
                title: 'Expense Tracking',
                desc: 'Visualize your spending on fuel, repairs, and insurance over time.',
                color: 'rose',
              },
              {
                icon: <ActivityIcon />,
                title: 'Health Score',
                desc: 'Our algorithm calculates a real-time health score based on service history.',
                color: 'purple',
              },
              {
                icon: <FileTextIcon />,
                title: 'Document Storage',
                desc: 'Securely store insurance cards, registration, and warranties in the cloud.',
                color: 'indigo',
              },
            ].map((feature, idx) => {
              const colorMap: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
                amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
                rose: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white',
                purple: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
              };
              const bgGradientMap: Record<string, string> = {
                blue: 'hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-white',
                emerald: 'hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-white',
                amber: 'hover:bg-gradient-to-br hover:from-amber-50/50 hover:to-white',
                rose: 'hover:bg-gradient-to-br hover:from-rose-50/50 hover:to-white',
                purple: 'hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-white',
                indigo: 'hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-white',
              };
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card
                    className={`h-full p-8 border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${bgGradientMap[feature.color]}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-colors duration-300 ${colorMap[feature.color]}`}
                    >
                      {cloneElement(feature.icon as React.ReactElement, { className: 'w-7 h-7' })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 font-heading">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed font-medium mb-6 flex-1">{feature.desc}</p>
                    <div className="mt-auto flex items-center text-sm font-bold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      Learn more <ArrowRightIcon className="w-4 h-4 ml-1" />
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
        <div className="absolute inset-0 bg-dot-pattern-dark opacity-30"></div>
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-primary-900/30 blur-[120px] rounded-full transform -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-900/20 blur-[100px] rounded-full pointer-events-none" />

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
                    <div className="mt-1 w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0 border border-accent-500/50">
                      <CheckCircle2Icon className="w-4 h-4 text-accent-400" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon className="w-5 h-5" />}
                className="shadow-[0_0_20px_rgba(18,115,234,0.3)]"
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
                {/* Animated SVG Ring */}
                <svg
                  className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_30px_rgba(57,211,83,0.3)]"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1E293B" strokeWidth="8" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#22C55E"
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
                  <span className="text-accent-400 font-bold text-xl mb-2 tracking-widest uppercase">
                    Excellent
                  </span>
                  <span className="text-8xl font-extrabold text-white font-heading mb-2 tracking-tighter">
                    94
                    <span className="text-4xl text-slate-500 font-normal">%</span>
                  </span>
                  <span className="text-slate-400 text-sm font-medium">Based on 12 service records</span>
                </div>

                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-8 top-1/4"
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
            <Card hover className="p-8 flex flex-col h-full bg-white relative">
              <div className="absolute top-8 right-8 text-slate-200 opacity-50">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="flex-grow mb-8 relative z-10">
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                  "AutoVital completely changed how I manage my cars. The smart reminders saved me from a blown timing belt that I had completely forgotten about."
                </p>
              </blockquote>
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                <img
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Michael T."
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-slate-900">Michael T.</div>
                  <div className="text-sm text-slate-500 font-medium">Car Enthusiast</div>
                </div>
              </div>
            </Card>

            <Card hover className="p-8 flex flex-col h-full bg-white relative">
              <div className="absolute top-8 right-8 text-slate-200 opacity-50">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="flex-grow mb-8 relative z-10">
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                  "The expense tracking is eye-opening. I finally know exactly how much my commute is costing me. The interface is gorgeous and so easy to use."
                </p>
              </blockquote>
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                <img
                  src="https://i.pravatar.cc/150?img=5"
                  alt="Sarah J."
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-slate-900">Sarah J.</div>
                  <div className="text-sm text-slate-500 font-medium">Daily Commuter</div>
                </div>
              </div>
            </Card>

            <Card hover className="p-8 flex flex-col h-full bg-white relative">
              <div className="absolute top-8 right-8 text-slate-200 opacity-50">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="flex-grow mb-8 relative z-10">
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                  "As a small business owner with 5 delivery vans, this platform is a lifesaver. I can track all maintenance in one dashboard instead of messy spreadsheets."
                </p>
              </blockquote>
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                <img
                  src="https://i.pravatar.cc/150?img=33"
                  alt="David R."
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-slate-900">David R.</div>
                  <div className="text-sm text-slate-500 font-medium">Fleet Manager</div>
                </div>
              </div>
            </Card>
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
            <PricingCard
              name="Starter"
              price="$0"
              period="mo"
              description="Perfect for individuals with a single vehicle."
              features={['1 Vehicle Profile', 'Basic Maintenance Log', 'Standard Reminders', 'Email Support']}
              ctaText="Get Started Free"
            />
            <PricingCard
              name="Pro"
              price="$9"
              period="mo"
              description="For enthusiasts and multi-car households."
              popular
              features={[
                'Up to 5 Vehicles',
                'Advanced Health Score',
                'Expense & Fuel Tracking',
                'Document Storage (10GB)',
                'Priority Support',
              ]}
              ctaText="Start 14-Day Trial"
            />
            <PricingCard
              name="Fleet"
              price="$39"
              period="mo"
              description="For small businesses managing multiple vehicles."
              features={[
                'Unlimited Vehicles',
                'Fleet Dashboard',
                'Custom Maintenance Schedules',
                'Data Export & Reporting',
                '24/7 Phone Support',
              ]}
              ctaText="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Frequently Asked Questions" centered className="mb-16" />

          <Accordion
            items={[
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
            ]}
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-animated-gradient relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="dark" className="mb-8 bg-white/10 border-white/20 backdrop-blur-md text-white px-4 py-1.5 shadow-xl">
            Join 10,432 vehicle owners today
          </Badge>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8 font-heading tracking-tight leading-tight">
            Ready to Take Control of Your Vehicle's Health?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop guessing about maintenance. Start saving money and preventing breakdowns with AutoVital's intelligent tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/signup">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-4 bg-white text-primary-900 hover:bg-slate-50 border-none shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300"
              >
                Start Your Free Trial
              </Button>
            </Link>
            <p className="text-blue-200 text-sm font-medium">No credit card required</p>
          </div>
        </div>
      </section>
    </div>
  );
}
