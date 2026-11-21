import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Cinemas from './pages/Cinemas';
import Booking from './pages/Booking';
import NotFound from './pages/NotFound';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background text-charcoal-900 selection:bg-primary-light selection:text-primary">
          {/* Main Top Navigation */}
          <Navbar />

          {/* Dynamic Content Routes */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/movies" element={<Movies />} />
              {/* Rewatch is now integrated directly into Movies graph modal */}
              <Route path="/rewatch" element={<Navigate to="/movies" replace />} />
              <Route path="/cinemas" element={<Cinemas />} />
              <Route path="/booking/:cinemaId" element={<Booking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          {/* Minimal SaaS Footer */}
          <footer className="border-t border-charcoal-200 py-6 text-center text-xs text-charcoal-500 bg-white">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-charcoal-800">Doomsday Ready</span>
                <span>•</span>
                <span>MCU Marathon & Opening-Night Watch Suite</span>
              </div>
              <p className="text-charcoal-400">
                Topological graph sorting & dynamic programming seat optimization
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
