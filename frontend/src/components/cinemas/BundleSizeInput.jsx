import React, { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function BundleSizeInput({
  bundleSizes = [],
  onChange,
  error,
}) {
  const [currentInput, setCurrentInput] = useState('');
  const [localError, setLocalError] = useState('');

  const handleAddSize = (e) => {
    if (e) e.preventDefault();
    setLocalError('');

    const sizeNum = Number(currentInput);
    if (!currentInput || isNaN(sizeNum)) {
      setLocalError('Please enter a valid number.');
      return;
    }

    if (sizeNum < 1 || sizeNum > 500) {
      setLocalError('Bundle size must be between 1 and 500 seats.');
      return;
    }

    if (bundleSizes.includes(sizeNum)) {
      setLocalError(`Bundle size of ${sizeNum} already exists.`);
      return;
    }

    if (bundleSizes.length >= 10) {
      setLocalError('Maximum of 10 bundle sizes allowed per cinema.');
      return;
    }

    const updated = [...bundleSizes, sizeNum].sort((a, b) => a - b);
    onChange(updated);
    setCurrentInput('');
  };

  const handleRemoveSize = (sizeToRemove) => {
    const updated = bundleSizes.filter((s) => s !== sizeToRemove);
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
          Seat Bundle Sizes ({bundleSizes.length}/10) <span className="text-status-error">*</span>
        </label>
        <span className="text-[11px] text-charcoal-400">
          Between 1 and 500 seats each
        </span>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={500}
          value={currentInput}
          onChange={(e) => {
            setCurrentInput(e.target.value);
            setLocalError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 2, 5, 10"
          className="flex-1 bg-white border border-charcoal-200 rounded-lg px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring shadow-subtle"
        />
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={handleAddSize}
          disabled={!currentInput || bundleSizes.length >= 10}
        >
          Add Size
        </Button>
      </div>

      {/* Local or Parent Error */}
      {(localError || error) && (
        <p className="text-xs text-status-error font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{localError || error}</span>
        </p>
      )}

      {/* Existing Chips */}
      <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-charcoal-200 bg-charcoal-50 min-h-12 items-center">
        {bundleSizes.length === 0 ? (
          <span className="text-xs text-charcoal-400 italic">
            No bundle sizes added yet. Enter bundle sizes (e.g. 2, 4, 8) above.
          </span>
        ) : (
          bundleSizes.map((size) => (
            <Badge
              key={size}
              variant="default"
              size="md"
              className="bg-white text-charcoal-800 border-charcoal-200 shadow-subtle flex items-center gap-1.5"
            >
              <span className="font-semibold">{size}</span>
              <span className="text-charcoal-400 font-normal">seats</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                className="hover:text-status-error transition-colors p-0.5 rounded"
                title={`Remove bundle size ${size}`}
                aria-label={`Remove bundle size ${size}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
