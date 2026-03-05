'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MobileBackButton({ fallbackUrl = '/dashboard' }) {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in history, if not possible go to fallback
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="lg:hidden inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm mb-4"
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
}
