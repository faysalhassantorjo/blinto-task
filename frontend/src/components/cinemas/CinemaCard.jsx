import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ticket, Edit3, Trash2, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function CinemaCard({ cinema, onEdit, onDelete }) {
  const bundles = cinema.bundle_sizes || [];

  return (
    <div className="group bg-card border border-charcoal-200 rounded-xl p-5 shadow-card hover:border-charcoal-300 hover:shadow-elevated transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-charcoal-100 text-charcoal-700 group-hover:bg-primary-light group-hover:text-primary transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900 group-hover:text-primary transition-colors line-clamp-1">
              {cinema.name}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(cinema)}
              className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
              title="Edit cinema"
              aria-label={`Edit ${cinema.name}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(cinema)}
              className="p-1.5 rounded-md text-charcoal-400 hover:text-status-error hover:bg-status-errorBg transition-colors"
              title="Delete cinema"
              aria-label={`Delete ${cinema.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bundle Sizes Display */}
        <div className="mt-4 mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 block mb-2">
            Available Bundle Sizes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {bundles.length === 0 ? (
              <span className="text-xs text-charcoal-400 italic">No bundle sizes configured</span>
            ) : (
              bundles.map((size) => (
                <Badge
                  key={size}
                  variant="outline"
                  size="sm"
                  className="font-semibold text-charcoal-800 bg-charcoal-50"
                >
                  {size} {size === 1 ? 'seat' : 'seats'}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-charcoal-100 flex items-center justify-between">
        <span className="text-xs text-charcoal-400">
          {bundles.length} {bundles.length === 1 ? 'bundle package' : 'bundle packages'}
        </span>

        <Link to={`/booking/${cinema.id}`}>
          <Button
            variant="primary"
            size="sm"
            icon={Ticket}
            iconPosition="left"
            className="text-xs"
          >
            Calculate Booking
          </Button>
        </Link>
      </div>
    </div>
  );
}
