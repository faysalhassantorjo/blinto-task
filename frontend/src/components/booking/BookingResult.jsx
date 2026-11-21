import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import BundleBreakdown from './BundleBreakdown';
import Badge from '../common/Badge';

export default function BookingResult({
  result,
  cinema,
  onChangeGroupSize,
}) {
  if (!result) return null;

  if (result.possible) {
    return <BundleBreakdown quote={result} />;
  }

  // Impossible Result state
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6 rounded-xl border border-status-warning/40 bg-status-warningBg/30 flex flex-col gap-4 text-charcoal-900 shadow-card"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-full bg-status-warningBg text-status-warning border border-status-warning/30 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-charcoal-900">
            No Exact Seat Combination Available
          </h3>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Unfortunately, these bundle sizes cannot accommodate exactly{' '}
            <strong>{result.group_size} people</strong>.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-white/80 border border-charcoal-200/80 flex flex-col gap-2 mt-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          {cinema?.name} Available Bundle Sizes:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {cinema?.bundle_sizes?.map((size) => (
            <Badge key={size} variant="outline" size="sm" className="font-semibold">
              {size} seats
            </Badge>
          ))}
        </div>
        <p className="text-xs text-charcoal-500 mt-2">
          Tip: Try adjusting your party size (for example, inviting one more friend) to match a combination of the bundle sizes above.
        </p>
      </div>
    </motion.div>
  );
}
