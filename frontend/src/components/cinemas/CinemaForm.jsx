import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import BundleSizeInput from './BundleSizeInput';
import { AlertCircle } from 'lucide-react';
import { createCinema, updateCinema } from '../../api/cinemas';
import { parseApiError } from '../../utils/errorHandlers';
import { useToast } from '../../hooks/useToast';

export default function CinemaForm({
  isOpen,
  onClose,
  cinema = null, // If set, editing; else creating
  onSuccess,
}) {
  const isEditing = Boolean(cinema);
  const toast = useToast();

  const [name, setName] = useState('');
  const [bundleSizes, setBundleSizes] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cinema) {
      setName(cinema.name || '');
      setBundleSizes(Array.isArray(cinema.bundle_sizes) ? [...cinema.bundle_sizes] : []);
    } else {
      setName('');
      setBundleSizes([2, 4, 8]); // Sensible defaults
    }
    setErrors({});
    setApiError(null);
  }, [cinema, isOpen]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Cinema name is required.';
    }

    if (!bundleSizes || bundleSizes.length === 0) {
      errs.bundleSizes = 'At least 1 bundle size is required.';
    } else if (bundleSizes.length > 10) {
      errs.bundleSizes = 'A cinema can have at most 10 bundle sizes.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      name: name.trim(),
      bundle_sizes: bundleSizes,
    };

    try {
      if (isEditing) {
        await updateCinema(cinema.id, payload);
        toast.success(`Updated "${name}"`);
      } else {
        await createCinema(payload);
        toast.success(`Added "${name}"`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      setApiError(parsed);
      // Map DRF field errors if available
      if (err.response?.data && typeof err.response.data === 'object') {
        const fieldErrs = {};
        if (err.response.data.name) fieldErrs.name = [].concat(err.response.data.name).join(' ');
        if (err.response.data.bundle_sizes) fieldErrs.bundleSizes = [].concat(err.response.data.bundle_sizes).join(' ');
        setErrors(fieldErrs);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Cinema' : 'Add New Cinema'}
      description={
        isEditing
          ? 'Update the cinema name or available opening-night seat bundle packages.'
          : 'Configure a venue and its available ticket package bundle sizes.'
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* API Error Banner */}
        {apiError && (
          <div className="p-3 rounded-lg bg-status-errorBg border border-status-error/30 text-status-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{apiError}</span>
          </div>
        )}

        {/* Name */}
        <Input
          label="Cinema Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Star Cineplex, AMC Lincoln Square"
          error={errors.name}
          required
        />

        {/* Dynamic Bundle Sizes */}
        <BundleSizeInput
          bundleSizes={bundleSizes}
          onChange={setBundleSizes}
          error={errors.bundleSizes}
        />

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-charcoal-200">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Cinema' : 'Create Cinema'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
