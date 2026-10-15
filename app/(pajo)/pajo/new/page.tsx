'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HomeTopbar } from '@/components/pajo/HomeTopbar';
import { useSession } from 'next-auth/react';

function NewPotForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(searchParams.get('orgId'));

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    contributionAmount: 50,
    memberTarget: 10,
    frequency: 'weekly',
    dueDay: 5, // Friday
    dueTime: '18:00',
    payoutMethod: 'AGREED',
  });

  // Fetch the user's organization on load if not in URL
  useEffect(() => {
    if (orgId) return;
    
    async function fetchOrg() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        // memberships are in session.user.memberships
        const adminMembership = data?.user?.memberships?.find((m: any) => 
          m.role === 'ORG_ADMIN' || m.role === 'ORG_MANAGER'
        );
        if (adminMembership) {
          setOrgId(adminMembership.organizationId);
        } else {
          setError('You must be a treasurer to create a pot.');
        }
      } catch (err) {
        setError('Failed to load organization data.');
      }
    }
    fetchOrg();
  }, [orgId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  }, [formData.name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) {
      setError('No organization found. Try refreshing.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pajo/pots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, organizationId: orgId }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/pajo/${data.pot.slug}`);
      } else {
        setError(data.error || 'Failed to create pot');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-auxlo-line bg-auxlo-black px-4 py-3 text-sm text-auxlo-text focus:border-auxlo-lime focus:outline-none transition";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-auxlo-muted";

  return (
    <div className="min-h-screen bg-auxlo-black text-auxlo-text flex flex-col">
      <HomeTopbar userEmail={session?.user?.email || ''} userName={session?.user?.name || ''} />
      
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="font-manrope text-3xl font-bold">Create a new circle</h1>
            <p className="mt-2 text-sm text-auxlo-muted">Set up your rotation savings pot and invite members.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-auxlo-warning/40 bg-auxlo-warning/10 px-4 py-3 text-sm text-auxlo-warning">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-auxlo-line bg-auxlo-surface p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelCls}>Pot Name</label>
                <input 
                  required
                  className={inputCls}
                  placeholder="e.g. Friday £50 Thrift"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className={labelCls}>Contribution Amount (£)</label>
                <input 
                  type="number"
                  required
                  className={inputCls}
                  value={formData.contributionAmount}
                  onChange={e => setFormData({...formData, contributionAmount: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className={labelCls}>Member Target</label>
                <input 
                  type="number"
                  required
                  className={inputCls}
                  value={formData.memberTarget}
                  onChange={e => setFormData({...formData, memberTarget: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className={labelCls}>Frequency</label>
                <select 
                  className={inputCls}
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value})}
                >
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Payout Method</label>
                <select 
                  className={inputCls}
                  value={formData.payoutMethod}
                  onChange={e => setFormData({...formData, payoutMethod: e.target.value})}
                >
                  <option value="AGREED">Agreed Order</option>
                  <option value="RANDOM">Random Draw</option>
                  <option value="BY_NEED">By Need / Request</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-auxlo-lime px-6 py-4 text-sm font-bold text-auxlo-black transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating Circle...' : 'Create Circle & Start Cycle 1'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewPotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-auxlo-black text-auxlo-muted p-10">Loading...</div>}>
      <NewPotForm />
    </Suspense>
  );
}
