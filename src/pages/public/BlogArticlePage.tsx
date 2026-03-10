import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Share2Icon } from
'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
export function BlogArticlePage() {
  return (
    <div className="w-full pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 mb-8 transition-colors">

          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to all articles
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <Badge variant="primary" className="mb-6">
            Guides
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-heading mb-6 leading-tight">
            The Ultimate Guide to Preventative Car Maintenance
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                AM
              </div>
              <div>
                <p className="font-bold text-slate-900">Alex Morgan</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" /> Oct 12, 2023
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" /> 8 min read
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Share2Icon className="w-4 h-4" />}>

              Share
            </Button>
          </div>
        </header>

        {/* Hero Image */}
        <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-16 bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Car maintenance"
            className="w-full h-full object-cover" />

        </div>

        {/* Article Content Layout */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Main Content */}
          <article className="flex-1 prose prose-lg prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary-600">
            <p className="lead text-xl text-slate-600 mb-8">
              Maintaining a vehicle doesn't have to be complicated. By following
              a few simple preventative steps, you can avoid massive repair
              bills and keep your car running smoothly for years to come.
            </p>

            <h2>1. Check Your Oil Regularly</h2>
            <p>
              Engine oil is the lifeblood of your vehicle. It lubricates moving
              parts, reduces friction, and helps carry heat away from the
              engine. Checking your oil level once a month takes less than two
              minutes but can save you from catastrophic engine failure.
            </p>
            <ul>
              <li>Park on level ground and let the engine cool.</li>
              <li>
                Pull the dipstick, wipe it clean, reinsert it fully, and pull it
                out again.
              </li>
              <li>Check the level against the indicator marks.</li>
            </ul>

            <h2>2. Don't Ignore Tire Pressure</h2>
            <p>
              Under-inflated tires reduce fuel efficiency, wear out faster, and
              negatively impact handling. Over-inflated tires reduce traction
              and result in a harsher ride. Check your tire pressure monthly
              using a reliable gauge.
            </p>
            <blockquote>
              "The cost of a simple tire pressure gauge is nothing compared to
              replacing a set of prematurely worn tires."
            </blockquote>

            <h2>3. Replace Air Filters</h2>
            <p>
              Your engine needs to breathe. A clogged air filter reduces fuel
              efficiency and acceleration. Most manufacturers recommend changing
              the engine air filter every 15,000 to 30,000 miles. Don't forget
              the cabin air filter, which keeps the air inside your car clean!
            </p>

            <h2>4. Listen to Your Brakes</h2>
            <p>
              Brake pads have built-in wear indicators that emit a high-pitched
              squeal when they need replacing. If you hear grinding, you've
              waited too long and may need to replace the rotors as well. Have
              your brakes inspected at every oil change.
            </p>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 my-10">
              <h3 className="text-primary-900 mt-0">
                Track it all with AutoVital
              </h3>
              <p className="text-primary-800 mb-6">
                Keeping track of all these intervals manually is tough.
                AutoVital does the heavy lifting for you, sending smart
                reminders before critical maintenance is due.
              </p>
              <Link to="/signup">
                <Button variant="primary">Start Tracking Free</Button>
              </Link>
            </div>
          </article>

          {/* Sidebar / Table of Contents */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-32 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 font-heading">
                In this article
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-600 transition-colors">

                    1. Check Your Oil Regularly
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-600 transition-colors">

                    2. Don't Ignore Tire Pressure
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-600 transition-colors">

                    3. Replace Air Filters
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-600 transition-colors">

                    4. Listen to Your Brakes
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>);

}