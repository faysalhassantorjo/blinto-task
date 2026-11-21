import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Search, X, Check, AlertCircle } from 'lucide-react';
import { createMovie, updateMovie } from '../../api/movies';
import { parseApiError } from '../../utils/errorHandlers';
import { useToast } from '../../hooks/useToast';

export default function MovieForm({
  isOpen,
  onClose,
  movie = null, // If provided, we're editing; otherwise creating
  availableMovies = [], // All movies in DB for prerequisites selection
  onSuccess,
}) {
  const isEditing = Boolean(movie);
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [runtime, setRuntime] = useState('');
  const [watched, setWatched] = useState(false);
  const [selectedPrereqIds, setSelectedPrereqIds] = useState([]);
  const [prereqSearch, setPrereqSearch] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form values
  useEffect(() => {
    if (movie) {
      setTitle(movie.title || '');
      setReleaseYear(movie.release_year ? String(movie.release_year) : '');
      setRuntime(movie.runtime ? String(movie.runtime) : '');
      setWatched(Boolean(movie.watched));
      // In DRF, movie.prerequisites is an array of IDs: [1, 2]
      setSelectedPrereqIds(Array.isArray(movie.prerequisites) ? movie.prerequisites : []);
    } else {
      setTitle('');
      setReleaseYear(new Date().getFullYear().toString());
      setRuntime('120');
      setWatched(false);
      setSelectedPrereqIds([]);
    }
    setPrereqSearch('');
    setErrors({});
    setApiError(null);
  }, [movie, isOpen]);

  // Movies that can be chosen as prerequisites (exclude current movie)
  const selectableMovies = availableMovies.filter((m) => !isEditing || m.id !== movie.id);

  // Filtered by search input
  const filteredPrereqs = selectableMovies.filter((m) =>
    m.title.toLowerCase().includes(prereqSearch.toLowerCase())
  );

  const togglePrereq = (id) => {
    setSelectedPrereqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const removePrereq = (id) => {
    setSelectedPrereqIds((prev) => prev.filter((item) => item !== id));
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Movie title is required.';
    }

    const yearNum = Number(releaseYear);
    if (!releaseYear || isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      errs.releaseYear = 'Please enter a valid release year (e.g. 2008).';
    }

    const runtimeNum = Number(runtime);
    if (!runtime || isNaN(runtimeNum) || runtimeNum < 1 || runtimeNum > 300) {
      errs.runtime = 'Runtime must be between 1 and 300 minutes.';
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
      title: title.trim(),
      release_year: Number(releaseYear),
      runtime: Number(runtime),
      prerequisites: selectedPrereqIds,
      watched,
    };

    try {
      if (isEditing) {
        await updateMovie(movie.id, payload);
        toast.success(`Updated "${title}"`);
      } else {
        await createMovie(payload);
        toast.success(`Added "${title}"`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      setApiError(parsed);
      // Map DRF field errors if available
      if (err.response?.data && typeof err.response.data === 'object') {
        const fieldErrs = {};
        if (err.response.data.title) fieldErrs.title = [].concat(err.response.data.title).join(' ');
        if (err.response.data.runtime) fieldErrs.runtime = [].concat(err.response.data.runtime).join(' ');
        if (err.response.data.release_year) fieldErrs.releaseYear = [].concat(err.response.data.release_year).join(' ');
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
      title={isEditing ? 'Edit Movie' : 'Add New Movie'}
      description={
        isEditing
          ? 'Update movie details, prerequisites, and viewing status.'
          : 'Add a Marvel movie to your catalog to track watch order and parties.'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Global / API Error (including CIRCULAR_DEPENDENCY) */}
        {apiError && (
          <div className="p-3 rounded-lg bg-status-errorBg border border-status-error/30 text-status-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{apiError}</span>
          </div>
        )}

        {/* Title */}
        <Input
          label="Movie Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Captain America: Civil War"
          error={errors.title}
          required
        />

        {/* Grid for Year & Runtime */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Release Year"
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            placeholder="e.g. 2016"
            min={1900}
            max={2100}
            error={errors.releaseYear}
            required
          />

          <Input
            label="Runtime (minutes)"
            type="number"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            placeholder="1 to 300"
            min={1}
            max={300}
            helperText="Between 1 and 300 mins"
            error={errors.runtime}
            required
          />
        </div>

        {/* Watched Status Checkbox */}
        <div className="flex items-center gap-2.5 p-3 rounded-lg border border-charcoal-200 bg-charcoal-50/50 hover:bg-charcoal-50 transition-colors cursor-pointer select-none"
             onClick={() => setWatched(!watched)}>
          <input
            id="watched-status"
            type="checkbox"
            checked={watched}
            onChange={(e) => setWatched(e.target.checked)}
            className="w-4 h-4 rounded border-charcoal-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="watched-status" className="text-xs font-semibold text-charcoal-800 cursor-pointer">
            Mark this movie as already watched
          </label>
        </div>

        {/* Prerequisites Multi-Select */}
        <div className="flex flex-col gap-2 pt-1 border-t border-charcoal-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              Prerequisite Movies ({selectedPrereqIds.length})
            </label>
            <span className="text-[11px] text-charcoal-400">
              Must watch before this movie
            </span>
          </div>

          {/* Selected Badges */}
          {selectedPrereqIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-charcoal-50 border border-charcoal-200">
              {selectedPrereqIds.map((id) => {
                const found = availableMovies.find((m) => m.id === id);
                return (
                  <Badge
                    key={id}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1 bg-white"
                  >
                    <span>{found ? found.title : `Movie #${id}`}</span>
                    <button
                      type="button"
                      onClick={() => removePrereq(id)}
                      className="hover:text-status-error p-0.5 rounded transition-colors"
                      aria-label="Remove prerequisite"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Search Input for Prereqs */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-400" />
            <input
              type="text"
              value={prereqSearch}
              onChange={(e) => setPrereqSearch(e.target.value)}
              placeholder="Search movies to add as prerequisites..."
              className="w-full bg-white border border-charcoal-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* List of selectable movies */}
          <div className="max-h-36 overflow-y-auto border border-charcoal-200 rounded-lg divide-y divide-charcoal-100 bg-white">
            {selectableMovies.length === 0 ? (
              <p className="p-3 text-xs text-charcoal-400 text-center">
                No other movies available in catalog.
              </p>
            ) : filteredPrereqs.length === 0 ? (
              <p className="p-3 text-xs text-charcoal-400 text-center">
                No movies match "{prereqSearch}".
              </p>
            ) : (
              filteredPrereqs.map((m) => {
                const isSelected = selectedPrereqIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => togglePrereq(m.id)}
                    className={`flex items-center justify-between p-2 px-3 text-xs cursor-pointer hover:bg-charcoal-50 transition-colors ${
                      isSelected ? 'bg-primary-light/40 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-charcoal-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className="text-charcoal-800">{m.title}</span>
                    </div>
                    <span className="text-[11px] text-charcoal-400">
                      {m.release_year}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

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
            {isEditing ? 'Save Changes' : 'Create Movie'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
