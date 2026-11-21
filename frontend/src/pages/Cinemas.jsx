import React, { useState } from 'react';
import { MapPin, Plus, Ticket, Search } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CardSkeletonList } from '../components/common/Loading';
import CinemaCard from '../components/cinemas/CinemaCard';
import CinemaForm from '../components/cinemas/CinemaForm';
import { useCinemas } from '../hooks/useCinemas';
import { deleteCinema } from '../api/cinemas';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandlers';

export default function Cinemas() {
  const { cinemas, isLoading, error, refetch } = useCinemas();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null); // When editing
  const [cinemaToDelete, setCinemaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCinemas = cinemas.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleOpenAdd = () => {
    setSelectedCinema(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cinema) => {
    setSelectedCinema(cinema);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cinemaToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCinema(cinemaToDelete.id);
      toast.success(`Deleted cinema "${cinemaToDelete.name}"`);
      setCinemaToDelete(null);
      refetch();
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-charcoal-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
            Cinema Venues & Bundles
          </h1>
          <p className="mt-1 text-sm text-charcoal-500">
            Manage theatre partners and opening-night seat bundle configurations.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenAdd}
          className="self-start sm:self-auto"
        >
          Add Cinema
        </Button>
      </div>

      {/* Search Bar */}
      <div className="py-5 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cinemas..."
            className="w-full bg-white border border-charcoal-200 rounded-lg pl-9 pr-3 py-1.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-subtle"
          />
        </div>
        <span className="text-xs text-charcoal-500 hidden sm:inline">
          {cinemas.length} {cinemas.length === 1 ? 'cinema configured' : 'cinemas configured'}
        </span>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <CardSkeletonList count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : cinemas.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No cinemas configured"
          description="Add a cinema venue with available seat bundle sizes to calculate watch party bookings."
          actionLabel="Add First Cinema"
          onAction={handleOpenAdd}
        />
      ) : filteredCinemas.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No cinemas found"
          description={`No cinema matches "${searchQuery}".`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCinemas.map((cinema) => (
            <CinemaCard
              key={cinema.id}
              cinema={cinema}
              onEdit={handleOpenEdit}
              onDelete={setCinemaToDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Cinema Modal */}
      <CinemaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        cinema={selectedCinema}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cinemaToDelete)}
        onClose={() => setCinemaToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${cinemaToDelete?.name}"?`}
        description="Are you sure you want to delete this cinema? All associated seat bundle sizes will be permanently removed. This action cannot be undone."
        confirmText="Delete Cinema"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
