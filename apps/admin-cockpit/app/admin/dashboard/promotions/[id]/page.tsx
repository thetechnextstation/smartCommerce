'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PromotionForm from '../promotion-form';

export default function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchPromotion(p.id);
    });
  }, []);

  const fetchPromotion = async (promotionId: string) => {
    try {
      const res = await fetch(`/api/promotions/${promotionId}`);
      if (res.ok) {
        const data = await res.json();
        setPromotion(data);
      } else {
        toast.error('Promotion not found');
        router.push('/admin/dashboard/promotions');
      }
    } catch (error) {
      toast.error('Failed to fetch promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Promotion updated successfully');
        router.push('/admin/dashboard/promotions');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update promotion');
      }
    } catch (error) {
      toast.error('Failed to update promotion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading promotion...</p>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return null;
  }

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
        <h1 className="text-3xl font-bold text-white">Edit Promotion</h1>
        <p className="text-slate-400 mt-2">{promotion.name}</p>
      </div>

      <PromotionForm
        initialData={promotion}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
