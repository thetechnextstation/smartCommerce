'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PromotionForm from '../promotion-form';

export default function NewPromotionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Promotion created successfully');
        router.push('/admin/dashboard/promotions');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create promotion');
      }
    } catch (error) {
      toast.error('Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard/promotions"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Promotions
        </Link>
        <h1 className="text-3xl font-bold text-white">Create New Promotion</h1>
        <p className="text-slate-400 mt-2">
          Set up a new promotion, discount, or special offer
        </p>
      </div>

      <PromotionForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
