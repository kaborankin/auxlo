import { notFound } from 'next/navigation';
import { getPotBySlug } from '@/lib/pajo/queries';

/**
 * "Everyone agrees to these rules before sending any money." Displays the
 * group rules doc that was generated when the pot was created (or a custom
 * one an admin has since edited).
 */
export default async function RulesPage({
  params,
}: {
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;
  const pot = await getPotBySlug(potSlug);
  if (!pot) notFound();

  return (
    <div className="max-w-3xl space-y-4">
      <h3 className="font-manrope text-lg font-bold text-auxlo-text">Group rules</h3>
      <div className="rounded-lg border border-auxlo-line bg-auxlo-surface p-6">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-auxlo-text">
          {pot.rulesText ?? 'No rules text has been set for this pot yet.'}
        </pre>
      </div>
    </div>
  );
}
