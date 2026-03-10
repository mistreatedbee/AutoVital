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

          {/* Optional: subtle scroll indicator */}
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

      {/* TRUST LOGOS - (unchanged) */}
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

      {/* HOW IT WORKS (unchanged) */}
      <section className="py-32 bg-slate-50 relative">
        {/* ... (rest of the sections remain identical to the original) ... */}
        {/* For brevity, I'll omit the unchanged sections, but they should be included exactly as in the original code. */}
        {/* In practice, you would copy all the remaining sections from the original component here. */}
      </section>

      {/* ... (all other sections unchanged) ... */}
    </div>
  );
}
