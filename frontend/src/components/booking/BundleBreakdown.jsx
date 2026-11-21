import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle2, Users, Package } from 'lucide-react';
import Badge from '../common/Badge';

export default function BundleBreakdown({ quote }) {
  const { group_size, total_seats, total_bundles, bundles } = quote;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-card border border-charcoal-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col gap-6"
    >
      {/* Success banner */}
      <div className="flex items-start gap-3.5 p-4 rounded-xl bg-status-successBg border border-status-success/20">
        <div className="p-1.5 rounded-full bg-status-success text-white shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-status-success">
            Exact Match Found
          </h4>
          <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">
            All {group_size} squad members get seats with zero wasted tickets using {total_bundles} {total_bundles === 1 ? 'bundle' : 'bundles'}.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-charcoal-200 bg-charcoal-50/60">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium mb-1">
            <Users className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Group Size</span>
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{group_size}</p>
        </div>

        <div className="p-4 rounded-xl border border-charcoal-200 bg-charcoal-50/60">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium mb-1">
            <Ticket className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Total Seats Booked</span>
          </div>
          <p className="text-2xl font-bold text-charcoal-900">{total_seats}</p>
        </div>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary-light/40">
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Minimum Bundles</span>
          </div>
          <p className="text-2xl font-bold text-primary">{total_bundles}</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-3">
          Optimal Ticket Bundle Breakdown
        </h4>

        <div className="border border-charcoal-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal-50 border-b border-charcoal-200 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Bundle Size</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Total Seats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 bg-white">
              {bundles.map((bundle) => (
                <tr key={bundle.size} className="hover:bg-charcoal-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                    <Badge variant="outline" size="md">
                      {bundle.size} seats
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-charcoal-800">
                    × {bundle.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-charcoal-900">
                    {bundle.seats} {bundle.seats === 1 ? 'seat' : 'seats'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-charcoal-50/80 border-t border-charcoal-200 text-xs font-bold text-charcoal-900">
              <tr>
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-center">{total_bundles} bundles</td>
                <td className="py-3 px-4 text-right">{total_seats} seats</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
