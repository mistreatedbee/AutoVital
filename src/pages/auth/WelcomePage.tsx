import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, ArrowRightIcon } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
export function WelcomePage() {
  const navigate = useNavigate();
  return (
    <AuthLayout
      title="Account Verified!"
      subtitle="Welcome to AutoVital. Let's get your first vehicle set up.">

      <div className="flex flex-col items-center justify-center py-6">
        <motion.div
          initial={{
            scale: 0
          }}
          animate={{
            scale: 1
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20
          }}
          className="w-20 h-20 bg-accent-100 text-accent-500 rounded-full flex items-center justify-center mb-8">

          <CheckCircle2Icon className="w-10 h-10" />
        </motion.div>

        <Button
          variant="primary"
          className="w-full"
          size="lg"
          onClick={() => navigate('/onboarding')}
          icon={<ArrowRightIcon className="w-5 h-5" />}>

          Continue to Setup
        </Button>
      </div>
    </AuthLayout>);

}