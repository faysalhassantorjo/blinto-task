import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Network, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  CircleDashed, 
  ArrowRight
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { CardSkeletonList, Skeleton } from '../components/common/Loading';
import { useMovies } from '../hooks/useMovies';
import { formatRuntime, formatYear } from '../utils/formatters';

export default function Dashboard() {
  const { movies, isLoading, error, refetch, toggleWatched } = useMovies();

  // Compute live statistics from backend movie records
  const totalMovies = movies.length;
  const watchedMovies = movies.filter((m) => m.watched).length;
  const unwatchedMovies = totalMovies - watchedMovies;
  const watchedPercent = totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0;
  const totalUnwatchedRuntime = movies
    .filter((m) => !m.watched)
    .reduce((sum, m) => sum + (m.runtime || 0), 0);

  // Recent 4 movies
  const recentMovies = [...movies].reverse().slice(0, 4);

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="py-8 sm:py-12 border-b border-charcoal-200">
        <div className="max-w-3xl">
          <Badge variant="primary" size="sm" className="mb-3">
            Avengers: Doomsday Countdown
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-charcoal-900 leading-tight">
            Your journey to Doomsday starts here.
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-charcoal-500 leading-relaxed max-w-2xl">
            Catch up on the MCU. Build your watch order. Get your squad ready for opening night.
          </p>

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link to="/movies">
              <Button size="lg" icon={Network} iconPosition="left">
                Explore Movies & Rewatch Graphs
              </Button>
            </Link>
            <Link to="/cinemas">
              <Button variant="outline" size="lg" icon={Ticket} iconPosition="left">
                Organize a Watch Party
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="py-8 flex flex-col gap-8">
        {/* Statistics Bar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal-500">
              MCU Marathon Overview
            </h2>
            {totalMovies > 0 && (
              <span className="text-xs text-charcoal-500 font-medium">
                {watchedPercent}% Complete
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-charcoal-200 bg-card shadow-subtle flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-14" />
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl border border-charcoal-200 bg-card shadow-subtle">
                <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 mb-1">
                  <Film className="w-3.5 h-3.5" />
                  <span>Total Movies</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-charcoal-900">{totalMovies}</p>
              </div>

              <div className="p-4 rounded-xl border border-charcoal-200 bg-card shadow-subtle">
                <div className="flex items-center gap-1.5 text-xs font-medium text-status-success mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Watched</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-status-success">{watchedMovies}</p>
              </div>

              <div className="p-4 rounded-xl border border-charcoal-200 bg-card shadow-subtle">
                <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-500 mb-1">
                  <CircleDashed className="w-3.5 h-3.5" />
                  <span>Unwatched</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-charcoal-700">{unwatchedMovies}</p>
              </div>

              <div className="p-4 rounded-xl border border-charcoal-200 bg-card shadow-subtle">
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Remaining Watch Time</span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-charcoal-900">
                  {formatRuntime(totalUnwatchedRuntime)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action Card 1: Rewatch Graph */}
          <Link
            to="/movies"
            className="group p-6 rounded-xl border border-charcoal-200 bg-card hover:border-charcoal-300 hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 flex items-center gap-2">
                Prerequisite Dependency Graph
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
                Click any MCU movie card in your library to open its topological DAG graph. Follow the directed prerequisite flow with zero circular loops.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
              <span>Topological Graph Traversal</span>
              <span className="font-semibold text-primary">Browse Movie Library &rarr;</span>
            </div>
          </Link>

          {/* Action Card 2: Cinema Calculator */}
          <Link
            to="/cinemas"
            className="group p-6 rounded-xl border border-charcoal-200 bg-card hover:border-charcoal-300 hover:shadow-elevated transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 text-charcoal-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 flex items-center gap-2">
                Squad Watch Party Booking
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-900 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
                Assemble your squad for opening night. Enter your group size and let our dynamic programming algorithm calculate the minimum seat bundles required.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
              <span>DP Bundle Minimizer</span>
              <span className="font-semibold text-charcoal-800">Explore Cinemas &rarr;</span>
            </div>
          </Link>
        </div>

        {/* Recently Added Movies Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-charcoal-900">MCU Catalog</h2>
              <p className="text-xs text-charcoal-500">Click any movie card to inspect its prerequisite DAG graph</p>
            </div>
            {totalMovies > 0 && (
              <Link to="/movies" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View all ({totalMovies}) &rarr;
              </Link>
            )}
          </div>

          {isLoading ? (
            <CardSkeletonList count={3} />
          ) : totalMovies === 0 ? (
            <EmptyState
              icon={Film}
              title="Your movie catalog is empty"
              description="Start building your MCU library to calculate rewatch orders and track viewing progress."
              actionLabel="Add First Movie"
              onAction={() => window.location.href = '/movies'}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-4 rounded-xl border border-charcoal-200 bg-card shadow-card flex flex-col justify-between hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-charcoal-900 line-clamp-1">
                        {movie.title}
                      </h4>
                      {movie.watched ? (
                        <Badge variant="success" size="sm">Watched</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Unwatched</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-3">
                      <span>{formatYear(movie.release_year)}</span>
                      <span>•</span>
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
                    <Link
                      to={`/movies?target=${movie.id}`}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Network className="w-3.5 h-3.5" />
                      <span>View Graph</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWatched(movie.id, movie.watched)}
                      className="text-xs font-medium text-charcoal-600 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {movie.watched ? 'Mark Unwatched' : 'Mark Watched'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
