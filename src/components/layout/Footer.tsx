import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, LinkedinIcon, GithubIcon } from 'lucide-react';
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-dark text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-3 font-heading font-bold text-2xl text-white mb-6">

              <img
                src="/logo.svg"
                alt="AutoVital"
                className="h-9 w-9 rounded-lg object-contain bg-white shadow-md" />
              <span>AutoVital</span>
            </Link>
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
              The intelligent vehicle maintenance tracking platform. Stay ahead
              of repairs, track expenses, and ensure your vehicle's longevity.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-colors">

                <TwitterIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-colors">

                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-colors">

                <GithubIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/features"
                  className="hover:text-primary-400 transition-colors">

                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-primary-400 transition-colors">

                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-primary-400 transition-colors">

                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  to="/changelog"
                  className="hover:text-primary-400 transition-colors">

                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary-400 transition-colors">

                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-primary-400 transition-colors">

                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-primary-400 transition-colors">

                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary-400 transition-colors">

                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary-400 transition-colors">

                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary-400 transition-colors">

                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="hover:text-primary-400 transition-colors">

                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-primary-400 transition-colors">

                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} AutoVital Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Designed with</span>
            <span className="text-red-500">♥</span>
            <span>for car owners everywhere.</span>
          </div>
        </div>
      </div>
    </footer>);

}