'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Package, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (!paymentIntentId) {
      router.push('/');
      return;
    }

    // Fetch order details
    fetchOrderDetails();
  }, [paymentIntentId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/by-payment-intent?paymentIntentId=${paymentIntentId}`);
      const data = await response.json();

      if (data.order) {
        setOrderDetails(data.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full mb-6 animate-bounce">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-xl text-slate-400">
            Thank you for your order. We've received your payment.
          </p>
        </div>

        {/* Order Details Card */}
        {orderDetails && (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <div>
                <p className="text-sm text-slate-400 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-white">{orderDetails.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-green-500">${orderDetails.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-400 mb-2">Shipping Address</p>
                <div className="text-white">
                  <p className="font-medium">{orderDetails.shippingName}</p>
                  <p className="text-slate-300">{orderDetails.shippingAddress}</p>
                  <p className="text-slate-300">
                    {orderDetails.shippingCity}, {orderDetails.shippingState} {orderDetails.shippingZip}
                  </p>
                  <p className="text-slate-300">{orderDetails.shippingCountry}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Contact Information</p>
                <div className="text-white">
                  <p className="text-slate-300">{orderDetails.shippingEmail}</p>
                  {orderDetails.shippingPhone && (
                    <p className="text-slate-300">{orderDetails.shippingPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-slate-400 mb-4">Order Items</p>
              <div className="space-y-3">
                {orderDetails.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-white font-medium">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span>${orderDetails.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span>
                  <span>${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <Mail className="w-10 h-10 text-indigo-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Confirmation Email</h3>
            <p className="text-slate-400 text-sm">
              We've sent an order confirmation email to {orderDetails?.shippingEmail || 'your email'} with all the details.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <Package className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Tracking Updates</h3>
            <p className="text-slate-400 text-sm">
              You'll receive tracking information via email once your order ships. Usually within 1-2 business days.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>

          {orderDetails && (
            <Link
              href={`/orders/${orderDetails.id}`}
              className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold rounded-xl transition-all text-center"
            >
              View Order Details
            </Link>
          )}
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@smartcommerce.com" className="text-indigo-400 hover:text-indigo-300">
              support@smartcommerce.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
