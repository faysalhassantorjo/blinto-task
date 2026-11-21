import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <PageContainer>
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-charcoal-100 flex items-center justify-center text-charcoal-400 mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-charcoal-500 max-w-sm mb-6 leading-relaxed">
          The timeline you are looking for does not exist in this branch of the multiverse.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" icon={Home} iconPosition="left">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
