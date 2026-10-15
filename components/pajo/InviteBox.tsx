'use client';

import { useState, useEffect } from 'react';

/**
 * Lightweight invite-link box shown on the pot overview page while the pot
 * is still filling up. Full token-based invite management (view/regenerate)
 * lives in InviteLinkCard on the Settings page — this is just a quick copy
 * link for convenience during setup.
 */
export function InviteBox({ potSlug }: { potSlug: string }) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = `${origin}/pajo/${potSlug}/join`;

  const copy = () => {
    navigator.clipboard.writeText(inviteUrl);
    alert('Link copied!');
  };

  return (
    <div className="flex gap-2">
      <input
        readOnly
        className="bg-pajo-bg border border-pajo-border rounded-pajo px-3 py-2 text-xs w-64 text-pajo-secondary font-medium"
        value={inviteUrl}
      />
      <button
        onClick={copy}
        className="bg-pajo-accent text-white px-4 py-2 rounded-pajo font-bold text-sm hover:bg-pajo-accent/90 transition shadow-sm"
      >
        Copy Link
      </button>
    </div>
  );
}

