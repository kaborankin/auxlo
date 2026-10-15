'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, AlertCircle } from 'lucide-react';

export function SettingsActions({ 
  potId, 
  potSlug, 
  memberCount, 
  memberTarget,
  hasActiveCycle
}: { 
  potId: string, 
  potSlug: string, 
  memberCount: number, 
  memberTarget: number,
  hasActiveCycle: boolean
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStartCycle() {
    if (memberCount < memberTarget) {
      alert(`You need ${memberTarget} members to start. Currently have ${memberCount}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pajo/pots/${potSlug}/start`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Cycle started successfully!');
        router.refresh();
        router.push(`/pajo/${potSlug}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to start cycle');
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setLoading(false);
    }
  }

  if (hasActiveCycle) return null;

  return (
    <div className="rounded-lg border border-auxlo-lime/20 bg-auxlo-lime/5 p-6 space-y-4">
      <div className="flex items-center gap-3 text-auxlo-lime">
        <PlayCircle size={24} />
        <h4 className="font-bold">Ready to start?</h4>
      </div>
      <p className="text-sm text-auxlo-text/80">
        Once you have all {memberTarget} members, you can generate the payment schedule and start Cycle 1.
      </p>
      
      <button
        onClick={handleStartCycle}
        disabled={loading || memberCount < memberTarget}
        className="w-full rounded-lg bg-auxlo-lime px-4 py-3 text-sm font-bold text-auxlo-black transition hover:opacity-90 disabled:opacity-50 disabled:bg-auxlo-muted disabled:text-auxlo-surface"
      >
        {loading ? 'Starting...' : memberCount < memberTarget ? `Waiting for ${memberTarget - memberCount} more members` : 'Start Cycle 1 Now'}
      </button>
      
      {memberCount < memberTarget && (
        <p className="text-[10px] text-center text-auxlo-muted uppercase font-bold flex items-center justify-center gap-1">
          <AlertCircle size={10} /> Must reach member target first
        </p>
      )}
    </div>
  );
}
