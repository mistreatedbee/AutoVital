import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
interface AccordionItem {
  question: string;
  answer: string;
}
interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}
export function Accordion({ items, className = '' }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <motion.div
            key={index}
            initial={false}
            className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${isOpen ? 'bg-white border-primary-200 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-primary-300'}`}>

            <button
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              onClick={() => setOpenIndex(isOpen ? null : index)}>

              <span className="font-semibold text-slate-900 pr-8">
                {item.question}
              </span>
              <motion.div
                animate={{
                  rotate: isOpen ? 180 : 0
                }}
                transition={{
                  duration: 0.2
                }}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>

                <ChevronDownIcon className="w-5 h-5" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut'
                }}>

                  <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </motion.div>);

      })}
    </div>);

}