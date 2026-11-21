import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Film, Calendar, Ticket, CheckCircle2 } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About Doomsday Ready"
      description="The definitive MCU marathon and opening-night watch party planner."
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-4 text-sm text-charcoal-700">
        <p className="leading-relaxed">
          <strong>Doomsday Ready</strong> is designed for Marvel Cinematic Universe fans gearing up for the arrival of <em>Avengers: Doomsday</em>. It solves two critical challenges:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-charcoal-200 bg-charcoal-50 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-primary font-medium text-xs">
              <Film className="w-4 h-4" />
              <span>Prerequisite Rewatch</span>
            </div>
            <p className="text-xs text-charcoal-500 leading-normal">
              Backend-powered topological sorting determines the exact prerequisite movie sequence with zero circular loops.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-charcoal-200 bg-charcoal-50 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-primary font-medium text-xs">
              <Ticket className="w-4 h-4" />
              <span>Seat Bundle Optimizer</span>
            </div>
            <p className="text-xs text-charcoal-500 leading-normal">
              Backend dynamic programming solves the coin-change problem to find the minimum number of seat bundles with zero wasted seats.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-charcoal-200 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
            Technology Stack
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Badge size="sm">React 19</Badge>
            <Badge size="sm">Vite</Badge>
            <Badge size="sm">Tailwind CSS</Badge>
            <Badge size="sm">Framer Motion</Badge>
            <Badge size="sm">Axios</Badge>
            <Badge size="sm">Django REST Framework</Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
}
