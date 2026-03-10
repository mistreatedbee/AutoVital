import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, BellRingIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white font-body">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        <div className="p-8 flex items-center">
          <Link
            to="/"
            className="flex items-center gap-3 font-heading font-bold text-xl text-slate-900">

            <img
              src="/logo.jpeg"
              alt="AutoVital"
              className="h-9 w-9 rounded-lg object-contain shadow-md bg-white" />
            <span>AutoVital</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 pb-20">
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
              duration: 0.5
            }}
            className="w-full max-w-md mx-auto">

            <h1 className="text-3xl font-bold text-slate-900 font-heading mb-3">
              {title}
            </h1>
            <p className="text-slate-500 mb-8">{subtitle}</p>
            {children}
          </motion.div>
        </div>
      </div>

      {/* Right Column - Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark relative overflow-hidden items-center justify-center p-12">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl mix-blend-screen" />

        {/* Abstract Dashboard UI */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 0.7,
            delay: 0.2
          }}
          className="relative w-full max-w-lg z-10">

          <Card dark glass className="p-8 border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-heading font-semibold text-lg">
                  Vehicle Health
                </h3>
                <p className="text-slate-400 text-sm">
                  Real-time monitoring active
                </p>
              </div>
              <Badge
                variant="accent"
                className="bg-accent-500/20 text-accent-400 border-accent-500/30">

                System Optimal
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 w-[94%]" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-slate-400">Overall Score</span>
                    <span className="text-white font-medium">94%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <BellRingIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    Upcoming Service
                  </p>
                  <p className="text-slate-400 text-xs">
                    Oil Change in 450 miles
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [-10, 10, -10]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -bottom-6 -right-6">

            <Card
              dark
              glass
              className="p-4 border-white/10 shadow-xl flex items-center gap-3">

              <div className="w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-white text-sm font-medium">
                Data Synced
              </span>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>);

}