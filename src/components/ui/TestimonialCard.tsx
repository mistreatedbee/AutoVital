import React from 'react';
import { StarIcon } from 'lucide-react';
import { Card } from './Card';
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating?: number;
}
export function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
  rating = 5
}: TestimonialCardProps) {
  return (
    <Card hover className="p-8 flex flex-col h-full bg-white">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) =>
        <StarIcon
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />

        )}
      </div>

      <blockquote className="flex-grow mb-8">
        <p className="text-lg text-slate-700 leading-relaxed font-medium">
          "{quote}"
        </p>
      </blockquote>

      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
        <img
          src={avatar}
          alt={author}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />

        <div>
          <div className="font-bold text-slate-900">{author}</div>
          <div className="text-sm text-slate-500">
            {role}, {company}
          </div>
        </div>
      </div>
    </Card>);

}