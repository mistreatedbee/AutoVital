import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CarIcon,
  UserIcon,
  BellIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ArrowLeftIcon } from
'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Toggle';
export function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };
  const steps = [
  {
    id: 1,
    title: 'Profile',
    icon: <UserIcon className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'Vehicle',
    icon: <CarIcon className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'Preferences',
    icon: <BellIcon className="w-5 h-5" />
  },
  {
    id: 4,
    title: 'Complete',
    icon: <CheckCircle2Icon className="w-5 h-5" />
  }];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
              <CarIcon className="w-5 h-5" />
            </div>
            AutoVital
          </div>
          <div className="text-sm font-medium text-slate-500">
            Step {step} of 4
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{
                  width: '0%'
                }}
                animate={{
                  width: `${(step - 1) / 3 * 100}%`
                }}
                transition={{
                  duration: 0.3
                }} />

            </div>
            {steps.map((s) =>
            <div
              key={s.id}
              className="flex flex-col items-center gap-2 bg-slate-50 px-2">

                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= s.id ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>

                  {s.icon}
                </div>
                <span
                className={`text-xs font-medium ${step >= s.id ? 'text-slate-900' : 'text-slate-500'}`}>

                  {s.title}
                </span>
              </div>
            )}
          </div>

          {/* Form Container */}
          <Card className="p-8 md:p-10 bg-white shadow-xl border-slate-100">
            <AnimatePresence mode="wait">
              {step === 1 &&
              <motion.div
                key="step1"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-6">

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">
                      Personal Details
                    </h2>
                    <p className="text-slate-500">
                      Let's start with some basic information.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" placeholder="John" />
                      <Input label="Last Name" placeholder="Doe" />
                    </div>
                    <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="+1 (555) 000-0000" />

                    <div className="pt-4">
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Measurement System
                      </label>
                      <Toggle
                      options={['Miles / Gallons', 'Kilometers / Liters']}
                      value="Miles / Gallons"
                      onChange={() => undefined} />

                    </div>
                  </div>
                </motion.div>
              }

              {step === 2 &&
              <motion.div
                key="step2"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-6">

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">
                      Add Your First Vehicle
                    </h2>
                    <p className="text-slate-500">
                      You can add more vehicles later from your dashboard.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Input
                    label="Vehicle Nickname"
                    placeholder="e.g. Daily Driver, Weekend Toy" />

                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Make" placeholder="e.g. Toyota" />
                      <Input label="Model" placeholder="e.g. Camry" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Year" type="number" placeholder="2020" />
                      <Input
                      label="Current Mileage"
                      type="number"
                      placeholder="45000" />

                    </div>
                    <Input
                    label="VIN (Optional)"
                    placeholder="17-character Vehicle Identification Number" />

                  </div>
                </motion.div>
              }

              {step === 3 &&
              <motion.div
                key="step3"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-6">

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2">
                      Service Preferences
                    </h2>
                    <p className="text-slate-500">
                      How would you like us to remind you about upcoming
                      maintenance?
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary-300 bg-slate-50">
                      <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      defaultChecked />

                      <div>
                        <p className="font-medium text-slate-900">
                          Email Reminders
                        </p>
                        <p className="text-sm text-slate-500">
                          Receive alerts directly in your inbox when service is
                          due.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary-300 bg-slate-50">
                      <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      defaultChecked />

                      <div>
                        <p className="font-medium text-slate-900">
                          In-App Notifications
                        </p>
                        <p className="text-sm text-slate-500">
                          See alerts on your dashboard when you log in.
                        </p>
                      </div>
                    </label>
                    <div className="pt-4">
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Alert me before service is due by:
                      </label>
                      <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                        <option>500 miles / 2 weeks</option>
                        <option>1,000 miles / 1 month</option>
                        <option>Just in time</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              }

              {step === 4 &&
              <motion.div
                key="step4"
                initial={{
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                className="text-center py-8">

                  <div className="w-24 h-24 bg-accent-100 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2Icon className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">
                    You're All Set!
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Your profile and vehicle have been successfully set up.
                    We've generated your initial health score and maintenance
                    timeline.
                  </p>
                </motion.div>
              }
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
              {
              step > 1 && step < 4 ?
              <Button
                variant="ghost"
                onClick={handleBack}
                icon={<ArrowLeftIcon className="w-4 h-4" />}>

                    Back
                  </Button> :

              <div />
              // Empty div to maintain flex spacing
              }

              {step < 4 ?
              <Button variant="primary" onClick={handleNext}>
                  Continue <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button> :

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleFinish}
                loading={loading}>

                  Go to Dashboard
                </Button>
              }
            </div>
          </Card>
        </div>
      </main>
    </div>);

}