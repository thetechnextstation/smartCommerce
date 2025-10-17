'use client';

import { useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface PriceAlertButtonProps {
  productId: string;
  currentPrice: number;
  productName: string;
}

export default function PriceAlertButton({
  productId,
  currentPrice,
  productName,
}: PriceAlertButtonProps) {
  const { isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(false);
          setTargetPrice('');
        }, 2000);
      } else {
        alert(data.error || 'Failed to create price alert');
      }
    } catch (error) {
      alert('Failed to create price alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span>Notify Me When Price Drops</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Alert Set!
                  </h3>
                  <p className="text-gray-600">
                    We'll notify you when the price drops to your target.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Bell className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Set Price Alert
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {productName}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-sm text-gray-600">
                        Current Price:
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${currentPrice.toFixed(2)}
                      </span>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <label className="block mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Notify me when price drops to:
                        </span>
                        <div className="mt-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            max={currentPrice - 0.01}
                            required
                            className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </label>

                      {targetPrice && parseFloat(targetPrice) < currentPrice && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            You'll save $
                            {(currentPrice - parseFloat(targetPrice)).toFixed(
                              2
                            )}{' '}
                            (
                            {(
                              ((currentPrice - parseFloat(targetPrice)) /
                                currentPrice) *
                              100
                            ).toFixed(0)}
                            % off)
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !targetPrice}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Setting...' : 'Set Alert'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    We'll send you an email when the price reaches your target
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
