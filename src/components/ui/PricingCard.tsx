import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  onCtaClick?: () => void;
}
export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular = false,
  ctaText,
  onCtaClick
}: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col h-full p-8 ${popular ? 'border-2 border-primary-500 shadow-glow scale-105 z-10' : 'border border-slate-200 mt-4 mb-4'}`}>

      {popular &&
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Badge variant="primary" className="px-4 py-1 text-sm shadow-sm">
            Most Popular
          </Badge>
        </div>
      }

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{name}</h3>
        <p className="text-slate-500 mb-6 h-12">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900">
            {price}
          </span>
          <span className="text-slate-500 font-medium">/{period}</span>
        </div>
      </div>

      <div className="flex-grow">
        <ul className="space-y-4 mb-8">
          {features.map((feature, idx) =>
          <li key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                <CheckIcon className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <span className="text-slate-600">{feature}</span>
            </li>
          )}
        </ul>
      </div>

      <Button
        variant={popular ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
        onClick={onCtaClick}>

        {ctaText}
      </Button>
    </Card>);

}