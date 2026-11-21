import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, MapPin, Info, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AboutModal from './AboutModal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const navLinks = [
    { to: '/movies', label: 'Movies & Rewatch Graph', icon: Film },
    { to: '/cinemas', label: 'Cinemas & Party Calculator', icon: MapPin },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-charcoal-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-charcoal-900 flex items-center justify-center text-white font-bold text-base shadow-subtle group-hover:bg-primary transition-colors">
              <span className="text-primary group-hover:text-white transition-colors">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-charcoal-900 flex items-center gap-1.5">
                DOOMSDAY READY
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[10px] tracking-wider uppercase font-medium text-charcoal-400">
                MCU Watch Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-light/60 font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
                }`
              }
            >
              Dashboard
            </NavLink>

            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-light/60 font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action / About */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-100 border border-charcoal-200 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-charcoal-200 bg-white px-4 pt-2 pb-4 flex flex-col gap-1 overflow-hidden"
            >
              <NavLink
                to="/"
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-light/60 font-semibold'
                      : 'text-charcoal-700 hover:bg-charcoal-100'
                  }`
                }
              >
                Dashboard
              </NavLink>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-primary-light/60 font-semibold'
                        : 'text-charcoal-700 hover:bg-charcoal-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-charcoal-400" />
                  <span>{label}</span>
                </NavLink>
              ))}
              <div className="pt-2 mt-1 border-t border-charcoal-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAboutOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-charcoal-600 hover:bg-charcoal-100 text-left"
                >
                  <Info className="w-4 h-4 text-charcoal-400" />
                  <span>About Doomsday Ready</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
