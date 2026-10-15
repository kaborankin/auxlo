'use client';

import { useEffect, useState } from 'react';
import { Link2, RefreshCw, Copy, Check } from 'lucide-react';

/**
 * Treasurer-only invite link management. Fetches the current token via the
 * authenticated /invite endpoint (never the public preview endpoint) and
 * lets the treasurer regenerate it, which immediately revokes the old link.
 */
export function InviteLinkCard({ potSlug }: { potSlug: string }) {
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pajo/pots/${potSlug}/invite`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setInviteToken(data.inviteToken);
        setInviteExpiresAt(data.inviteExpiresAt);
      } else {
        setError(data.error || 'Failed to load invite link');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [potSlug]);

  async function handleRegenerate() {
    if (!confirm('Regenerating will immediately invalidate the current invite link for anyone who still has it. Continue?')) {
      return;
    }
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/pajo/pots/${potSlug}/invite`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setInviteToken(data.inviteToken);
        setInviteExpiresAt(data.inviteExpiresAt);
      } else {
        setError(data.error || 'Failed to regenerate invite link');
      }
    } catch {
      setError('Connection error');
    } finally {
      setRegenerating(false);
    }
  }

  const inviteUrl =
    inviteToken && typeof window !== 'undefined'
      ? `${window.location.origin}/pajo/${potSlug}/join?token=${inviteToken}`
      : '';

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-auxlo-line bg-auxlo-surface p-6 space-y-4">
      <div className="flex items-center gap-3 text-auxlo-lime">
        <Link2 size={20} />
        <h4 className="font-bold text-auxlo-text">Invite members</h4>
      </div>
      <p className="text-sm text-auxlo-muted">
        Share this link with people you want to invite. Anyone with the link can join until it
        expires or you regenerate it — regenerating instantly revokes the old link.
      </p>

      {error ? <p className="text-sm text-auxlo-warning">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-auxlo-muted">Loading…</p>
      ) : inviteToken ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-auxlo-line bg-auxlo-black px-4 py-3">
            <code className="flex-1 truncate text-xs text-auxlo-text">{inviteUrl}</code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md bg-auxlo-lime/10 px-3 py-1.5 text-xs font-bold text-auxlo-lime hover:bg-auxlo-lime/20"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {inviteExpiresAt ? (
            <p className="text-xs text-auxlo-muted">
              Expires {new Date(inviteExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-auxlo-muted">No active invite link.</p>
      )}

      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="flex items-center gap-2 rounded-lg border border-auxlo-line px-4 py-2 text-xs font-bold uppercase tracking-wide text-auxlo-text transition hover:border-auxlo-lime disabled:opacity-50"
      >
        <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
        {regenerating ? 'Regenerating…' : 'Regenerate link'}
      </button>
    </div>
  );
}
