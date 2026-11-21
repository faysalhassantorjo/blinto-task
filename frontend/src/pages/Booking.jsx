import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Ticket, 
  MapPin, 
  Users, 
  Calculator, 
  AlertCircle 
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import BookingResult from '../components/booking/BookingResult';
import { getCinemas, getCinema } from '../api/cinemas';
import { getBookingQuote } from '../api/booking';
import { parseApiError } from '../utils/errorHandlers';
import { useToast } from '../hooks/useToast';

export default function Booking() {
  const { cinemaId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [cinema, setCinema] = useState(null);
  const [allCinemas, setAllCinemas] = useState([]);
  const [isLoadingCinema, setIsLoadingCinema] = useState(true);
  const [cinemaError, setCinemaError] = useState(null);

  // Form state
  const [groupSize, setGroupSize] = useState('11');
  const [inputError, setInputError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);

  // Load cinema details and list of all cinemas
  useEffect(() => {
    async function loadData() {
      setIsLoadingCinema(true);
      setCinemaError(null);
      setCalculationResult(null);
      try {
        const [targetCinema, list] = await Promise.all([
          getCinema(cinemaId),
          getCinemas(),
        ]);
        setCinema(targetCinema);
        setAllCinemas(list);
      } catch (err) {
        setCinemaError(parseApiError(err));
      } finally {
        setIsLoadingCinema(false);
      }
    }
    loadData();
  }, [cinemaId]);

  // Validation
  const validateGroupSize = () => {
    setInputError('');
    const val = Number(groupSize);
    if (!groupSize || isNaN(val) || !Number.isInteger(val)) {
      setInputError('Please enter a valid whole number.');
      return false;
    }
    if (val < 1 || val > 10000) {
      setInputError('Group size must be between 1 and 10,000 people.');
      return false;
    }
    return true;
  };

  // Submit calculation
  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!validateGroupSize()) return;

    setIsCalculating(true);
    setCalculationResult(null);

    try {
      const data = await getBookingQuote(cinemaId, Number(groupSize));
      setCalculationResult(data);
    } catch (err) {
      const parsed = parseApiError(err);
      setInputError(parsed);
      toast.error(parsed);
    } finally {
      setIsCalculating(false);
    }
  };

  const presetSizes = [2, 4, 7, 10, 11, 15, 20];

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/cinemas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cinemas</span>
        </Link>
      </div>

      {isLoadingCinema ? (
        <Loading message="Loading cinema configuration..." />
      ) : cinemaError ? (
        <ErrorState
          title="Cinema not found"
          message={cinemaError}
          onRetry={() => navigate('/cinemas')}
        />
      ) : (
        <div className="flex flex-col gap-8 max-w-3xl mx-auto">
          {/* Cinema Header Card */}
          <div className="bg-card border border-charcoal-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-md bg-primary-light text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                  {cinema.name}
                </h1>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-charcoal-500 mt-2">
                <span className="font-medium text-charcoal-700">Bundle Sizes:</span>
                {cinema.bundle_sizes?.map((size) => (
                  <Badge key={size} variant="outline" size="sm" className="bg-charcoal-50 font-semibold">
                    {size} seats
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Switcher */}
            {allCinemas.length > 1 && (
              <div className="flex flex-col gap-1 sm:items-end">
                <label className="text-[11px] font-medium text-charcoal-400">
                  Switch Cinema:
                </label>
                <select
                  value={cinemaId}
                  onChange={(e) => navigate(`/booking/${e.target.value}`)}
                  className="bg-white border border-charcoal-200 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-800 focus:outline-none focus:border-primary shadow-subtle cursor-pointer font-medium"
                >
                  {allCinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Calculator Input Form */}
          <div className="bg-card border border-charcoal-200 rounded-xl p-5 sm:p-6 shadow-card flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>How many people are joining your squad?</span>
              </h2>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Enter your exact squad count. The dynamic programming optimizer calculates the minimum number of ticket packages needed without any excess seats.
              </p>
            </div>

            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-full sm:max-w-xs">
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={groupSize}
                    onChange={(e) => {
                      setGroupSize(e.target.value);
                      setInputError('');
                    }}
                    placeholder="Enter squad size (1 - 10000)"
                    error={inputError}
                    icon={Users}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Calculator}
                  isLoading={isCalculating}
                  className="w-full sm:w-auto h-10 mt-1 sm:mt-0"
                >
                  Calculate My Booking
                </Button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-charcoal-400 font-medium mr-1">
                  Quick party sizes:
                </span>
                {presetSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setGroupSize(String(size));
                      setInputError('');
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                      groupSize === String(size)
                        ? 'bg-charcoal-900 text-white border-charcoal-900'
                        : 'bg-charcoal-50 text-charcoal-600 border-charcoal-200 hover:bg-charcoal-100'
                    }`}
                  >
                    {size} people
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Result Section */}
          {calculationResult && (
            <BookingResult
              result={calculationResult}
              cinema={cinema}
              onChangeGroupSize={() => {}}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
