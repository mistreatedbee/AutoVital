import React, { cloneElement, useEffect, useState } from 'react';
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
  ChevronRightIcon,
  GaugeIcon,
  BarChart3Icon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { PricingCard } from '../../components/ui/PricingCard';
import { Accordion } from '../../components/ui/Accordion';
import type { BlogPost } from '../../services/blog';
import { fetchPublishedBlogPosts } from '../../services/blog';
import { usePageSeo } from '../../hooks/usePageSeo';

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchPublishedBlogPosts({ page: 1, pageSize: 1 });
      if (!cancelled) {
        setFeaturedPost(res.posts[0] ?? null);
      }
    })().catch(() => {
      // ignore; homepage still functions without featured post
    });
    return () => {
      cancelled = true;
    };
  }, []);

  usePageSeo({
    title: 'Vehicle Maintenance Tracking',
    description:
      "AutoVital helps you track vehicle maintenance, expenses, and documents so you can prevent breakdowns and keep your car's health in the green.",
  });

  const stats = [
    { value: '10,432', label: 'Active Users' },
    { value: 'R2,400', label: 'Avg. Annual Savings' },
    { value: '98.4%', label: 'Uptime' },
    { value: '4.9★', label: 'User Rating' },
  ];

  return (
    <div className="w-full overflow-hidden font-body">

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-sidebar text-white min-h-[92vh] flex items-center overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Red glow orbs */}
        <div className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full bg-red-700 opacity-[0.12] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-150px] w-[500px] h-[500px] rounded-full bg-red-900 opacity-[0.15] blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10 py-24 md:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* ── Left: Copy */}
            <div className="lg:w-[55%] space-y-8">
              <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/25 text-red-400 text-sm font-semibold tracking-wide">
                  <ZapIcon className="w-3.5 h-3.5" /> Intelligent Vehicle Management
                </span>
              </motion.div>

              <motion.h1
                custom={0.1}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.06] tracking-tight"
              >
                Know Your Car's{' '}
                <span className="relative">
                  <span className="text-red-500">Health</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="6"
                    viewBox="0 0 200 6"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
                {' '}Before Problems Start.
              </motion.h1>

              <motion.p
                custom={0.2}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed"
              >
                The intelligent maintenance platform that predicts repairs, tracks expenses,
                and keeps your vehicle running at its peak — before breakdowns catch you off guard.
              </motion.p>

              <motion.div
                custom={0.3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4 pt-2"
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto text-base px-8 bg-red-600 text-white hover:bg-red-500 border-none shadow-[0_0_40px_rgba(220,38,38,0.35)] hover:shadow-[0_0_60px_rgba(220,38,38,0.5)] transition-all duration-300 font-semibold"
                  >
                    Start Free Trial
                    <ChevronRightIcon className="w-4 h-4 ml-1 inline group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    icon={<PlayCircleIcon className="w-5 h-5" />}
                    className="w-full sm:w-auto text-base px-8 bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600 font-semibold"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>

              {/* Micro trust signals */}
              <motion.div custom={0.4} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {[11, 5, 33, 25, 44].map((n) => (
                    <img key={n} src={`https://i.pravatar.cc/40?img=${n}`} alt="" className="w-8 h-8 rounded-full border-2 border-sidebar object-cover" />
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Joined by <span className="text-white font-semibold">10,432</span> drivers this month
                </p>
              </motion.div>
            </div>

            {/* ── Right: Logo + floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:w-[45%] w-full flex justify-center"
            >
              <div className="relative w-full max-w-lg">

                {/* Pulsing glow ring behind logo */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-[-32px] rounded-3xl bg-gradient-to-br from-red-600/30 to-red-900/10 blur-3xl pointer-events-none"
                />

                {/* Logo container */}
                <motion.div
                  whileHover={{ scale: 1.02, rotate: 0.5 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.75),0_0_60px_rgba(220,38,38,0.12)] bg-slate-950/70 backdrop-blur-sm p-8"
                >
                  <img
                    src="/logo.svg"
                    alt="AutoVital"
                    className="w-full h-auto object-contain rounded-2xl"
                    style={{ minHeight: '280px' }}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      const p = t.parentElement;
                      if (p && !p.querySelector('.logo-fallback')) {
                        const fb = document.createElement('div');
                        fb.className = 'logo-fallback w-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-900/40 to-slate-900';
                        fb.style.minHeight = '280px';
                        fb.innerHTML = '<span style="color:hsl(var(--primary));font-size:3rem;font-weight:900;letter-spacing:-0.04em">AutoVital</span>';
                        p.appendChild(fb);
                      }
                    }}
                  />
                  {/* Subtle red shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 via-transparent to-red-400/5 rounded-3xl pointer-events-none" />
                </motion.div>

                {/* Floating badge — top right */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -top-6 -right-2 md:-right-8"
                >
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-slate-900/95 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 border border-green-500/25 shrink-0">
                        <ShieldCheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">Engine Health</p>
                        <p className="text-green-400 text-xs font-semibold">98% Optimal</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Floating badge — bottom left */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-6 -left-2 md:-left-8"
                >
                  <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-slate-900/95 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-600/15 flex items-center justify-center text-red-400 border border-red-500/25 shrink-0">
                        <BellRingIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">Smart Alert</p>
                        <p className="text-red-400 text-xs font-semibold">Saved you R900</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Floating badge — mid right */}
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-[55%] -right-2 md:-right-10"
                >
                  <motion.div
                    animate={{ x: [4, -4, 4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-slate-900/95 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/25 shrink-0">
                        <WrenchIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">Oil Change</p>
                        <p className="text-amber-400 text-xs font-semibold">Due in 340 km</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

              </div>
            </motion.div>

          </div>

          {/* ── Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]"
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-slate-900/50 backdrop-blur-sm px-8 py-6 text-center">
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST LOGOS ───────────────────────────────────────────────── */}
      <section className="py-10 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-400 mb-7 uppercase tracking-widest">Trusted by leading vehicle companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {['AutoNation', 'FleetWorks', 'DriveSafe', 'CarCare Pro', 'MechanicHub'].map((name, i, arr) => (
              <React.Fragment key={name}>
                <span className="text-base font-bold font-heading text-slate-400 hover:text-slate-700 transition-colors duration-200 cursor-default tracking-tight">{name}</span>
                {i < arr.length - 1 && <span className="text-slate-200 hidden md:block text-lg">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            badge="Simple Process"
            title="Up and running in minutes"
            description="Four steps to complete visibility over your vehicle's health."
            centered
            className="mb-20"
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-red-200 to-transparent z-0" />

            {[
              { icon: <ShieldCheckIcon />, title: 'Create Account', desc: 'Sign up securely in under 60 seconds.' },
              { icon: <CarIcon />, title: 'Add Your Vehicle', desc: 'Enter your VIN or make, model, and year.' },
              { icon: <WrenchIcon />, title: 'Log Maintenance', desc: 'Import past services or add them manually.' },
              { icon: <ActivityIcon />, title: 'Get Insights', desc: 'Receive predictive alerts and health reports.' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="relative mb-7">
                  <div className="w-28 h-28 rounded-[20px] bg-slate-50 border border-slate-200 flex items-center justify-center text-red-600 shadow-sm group-hover:shadow-md group-hover:-translate-y-2 transition-all duration-300">
                    {cloneElement(step.icon as React.ReactElement, { className: 'w-10 h-10' })}
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-2">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─────────────────────────────────────────────── */}
      <section className="py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            badge="Features"
            title="Everything your vehicle needs"
            description="A comprehensive suite of tools built to save you money and prevent surprises."
            className="mb-16"
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {[
              { icon: <CarIcon />, title: 'Vehicle Profiles', desc: 'Store VIN, specs, photos, and full history in one beautiful dashboard.' },
              { icon: <WrenchIcon />, title: 'Maintenance Logs', desc: 'Keep a digital service book. Never lose a receipt or forget a repair.' },
              { icon: <BellRingIcon />, title: 'Smart Reminders', desc: 'Get notified before service is due — by time, mileage, or both.' },
              { icon: <TrendingDownIcon />, title: 'Expense Tracking', desc: 'Visualize spending across fuel, repairs, and insurance over time.' },
              { icon: <GaugeIcon />, title: 'Health Score', desc: 'Real-time reliability score based on your full service history.' },
              { icon: <FileTextIcon />, title: 'Document Storage', desc: 'Insurance cards, registration, and warranties — all in the cloud.' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="group h-full p-7 border border-slate-200/80 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-6 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors duration-300">
                    {cloneElement(feature.icon as React.ReactElement, { className: 'w-5 h-5' })}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2.5 font-heading">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm flex-1">{feature.desc}</p>
                  <div className="mt-5 flex items-center text-sm font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-300">
                    Learn more <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HEALTH SCORE (DARK) ───────────────────────────────────────── */}
      <section className="py-28 bg-sidebar relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[700px] h-[700px] bg-red-900/20 blur-[140px] rounded-full transform -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionHeading
                badge="Proprietary Algorithm"
                title="Know Your Vehicle's True Health"
                description="Our Health Score analyzes maintenance history, mileage, and vehicle age to give you a clear, honest picture of reliability."
                light
                className="mb-10"
              />
              <ul className="space-y-5 mb-10">
                {[
                  'Predicts component failures before they happen',
                  'Increases resale value with verified health data',
                  'Instantly surfaces neglected maintenance areas',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-300 text-base">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/40">
                      <CheckCircle2Icon className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon className="w-4 h-4" />}
                className="bg-red-600 hover:bg-red-500 text-white border-none shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.4)] transition-all duration-300"
              >
                See How It Works
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-sm">
                {/* Score ring */}
                <div className="aspect-square flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_40px_rgba(220,38,38,0.25)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="264"
                      initial={{ strokeDashoffset: 264 }}
                      whileInView={{ strokeDashoffset: 15.84 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: 'easeOut', delay: 0.4 }}
                    />
                  </svg>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center px-8">
                    <span className="text-red-400 font-bold text-sm mb-1 tracking-[0.2em] uppercase">Excellent</span>
                    <span className="text-8xl font-extrabold text-white font-heading leading-none tracking-tighter">
                      94<span className="text-3xl text-slate-500 font-normal align-top mt-3 ml-0.5">%</span>
                    </span>
                    <span className="text-slate-500 text-xs mt-2">Based on 12 service records</span>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-4 top-1/4"
                >
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 border border-green-500/25">
                        <ShieldCheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">Engine Health</p>
                        <p className="text-green-400 text-[10px] font-medium">98% Optimal</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-4 bottom-1/4"
                >
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/25">
                        <WrenchIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">Brakes & Tires</p>
                        <p className="text-amber-400 text-[10px] font-medium">85% Good</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            title="Loved by car owners everywhere"
            description="From daily commuters to fleet managers, AutoVital keeps every vehicle in check."
            centered
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                body: "AutoVital completely changed how I manage my cars. The smart reminders saved me from a blown timing belt I'd completely forgotten about.",
                name: 'Michael T.',
                role: 'Car Enthusiast',
                img: 11,
              },
              {
                body: "The expense tracking is eye-opening. I finally know exactly how much my commute costs me. The interface is gorgeous and so easy to use.",
                name: 'Sarah J.',
                role: 'Daily Commuter',
                img: 5,
                featured: true,
              },
              {
                body: "As a business owner with 5 delivery vans, this platform is a lifesaver. All maintenance in one dashboard instead of messy spreadsheets.",
                name: 'David R.',
                role: 'Fleet Manager',
                img: 33,
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  t.featured
                    ? 'bg-red-600 text-white ring-2 ring-red-500 shadow-[0_20px_60px_rgba(220,38,38,0.25)]'
                    : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              >
                <div className={`flex gap-1 mb-5 ${t.featured ? 'text-red-200' : 'text-amber-400'}`}>
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className={`text-base leading-relaxed flex-1 mb-7 ${t.featured ? 'text-red-50' : 'text-slate-600'}`}>
                  "{t.body}"
                </p>
                <div className={`flex items-center gap-3 pt-5 border-t ${t.featured ? 'border-red-500/40' : 'border-slate-200'}`}>
                  <img
                    src={`https://i.pravatar.cc/80?img=${t.img}`}
                    alt={t.name}
                    className={`w-10 h-10 rounded-full object-cover border-2 ${t.featured ? 'border-red-400' : 'border-white shadow-sm'}`}
                  />
                  <div>
                    <p className={`font-bold text-sm ${t.featured ? 'text-white' : 'text-slate-900'}`}>{t.name}</p>
                    <p className={`text-xs ${t.featured ? 'text-red-200' : 'text-slate-500'}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────────── */}
      <section className="py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            title="Simple, transparent pricing"
            description="Start for free. Upgrade only when you need more power."
            centered
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="R0"
              period="mo"
              description="Perfect for individuals with a single vehicle."
              features={['1 Vehicle Profile', 'Basic Maintenance Log', 'Standard Reminders', 'Email Support']}
              ctaText="Get Started Free"
              accentColor="red"
            />
            <PricingCard
              name="Pro"
              price="R169"
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
              accentColor="red"
            />
            <PricingCard
              name="Fleet"
              price="R729"
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
              accentColor="red"
            />
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-6">
          <SectionHeading title="Frequently asked questions" centered className="mb-14" />
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
                  'Absolutely. We use bank-level 256-bit encryption for all data transmission and storage. Your uploaded documents are stored securely in AWS with strict access controls.',
              },
              {
                question: 'Do I need an OBD2 scanner to use AutoVital?',
                answer:
                  "No — AutoVital works perfectly with manual entry. We're also building integrations with popular OBD2 scanners to automatically pull mileage and diagnostic codes in a future update.",
              },
            ]}
          />
        </div>
      </section>

      {/* ─── FEATURED BLOG POST ────────────────────────────────────────── */}
      {featuredPost && (
        <section className="py-24 bg-background border-t border-slate-100/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
              <div>
                <SectionHeading
                  badge="From the blog"
                  title="Latest from AutoVital"
                  description="Deep dives, maintenance checklists, and product updates from the team."
                  className="mb-0"
                />
              </div>
              <Link to="/blog">
                <Button variant="ghost" className="inline-flex items-center gap-1.5 text-sm">
                  View all articles
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <Card className="flex flex-col md:flex-row gap-8 overflow-hidden border border-slate-200 bg-white rounded-2xl">
              <div className="md:w-1/2">
                <Link to={`/blog/${featuredPost.slug}`}>
                  <div className="h-64 md:h-full overflow-hidden">
                    <img
                      src={
                        featuredPost.cover_image_url ??
                        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80'
                      }
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </Link>
              </div>
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {featuredPost.category && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-700 font-semibold">
                      <SparklesIcon className="w-3 h-3" />
                      {featuredPost.category}
                    </span>
                  )}
                </div>
                <Link to={`/blog/${featuredPost.slug}`}>
                  <h3 className="text-2xl font-bold text-slate-900 font-heading hover:text-red-600 transition-colors">
                    {featuredPost.title}
                  </h3>
                </Link>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                      {(featuredPost.author_name ?? 'A').charAt(0)}
                    </div>
                    <span>{featuredPost.author_name ?? 'AutoVital Team'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      {featuredPost.reading_time_minutes
                        ? `${featuredPost.reading_time_minutes} min read`
                        : ''}
                    </span>
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-500 font-semibold"
                    >
                      Read article
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-28 bg-sidebar relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="dark" className="mb-8 bg-white/[0.06] border-white/[0.1] text-slate-300 px-4 py-1.5 inline-flex items-center gap-2">
              <SparklesIcon className="w-3.5 h-3.5 text-red-400" />
              Join 10,432 vehicle owners today
            </Badge>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 font-heading tracking-tight leading-[1.08]">
              Take control of your vehicle's health.
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Stop guessing about maintenance. Start saving money and preventing breakdowns with AutoVital's intelligent tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 bg-red-600 text-white hover:bg-red-500 border-none shadow-[0_0_50px_rgba(220,38,38,0.35)] hover:shadow-[0_0_70px_rgba(220,38,38,0.5)] transition-all duration-300 font-semibold text-base"
                >
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="text-slate-500 text-sm">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
