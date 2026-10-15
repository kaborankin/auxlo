import { notFound } from 'next/navigation';
import { CalendarOff } from 'lucide-react';
import { getClientConfig } from '@/config/service-business';
import { BookingFlow } from '@/components/service-business/booking/BookingFlow';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * Booking is enabled or disabled per client config. When off, the route
 * explains the choice and routes visitors into the enquiry flow instead.
 */
export default async function BookingPage({
  params,
}: {
  params: Promise<{ client: string }>;
}) {
  const { client: slug } = await params;
  const config = getClientConfig(slug);
  if (!config) notFound();

  if (!config.booking.enabled) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-16 text-center sm:py-24">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sb-surface text-sb-muted">
          <CalendarOff className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h1 className="sb-heading mt-6 text-3xl font-bold tracking-tight text-sb-text">
          We book personally, not online
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-sb-muted">
          Every engagement starts with a proper conversation. Tell us about your business and
          we&apos;ll come back with a time that suits you.
        </p>
        <div className="mt-8 flex justify-center">
          <SbButton href={`/system/${config.slug}/enquire`} size="lg">
            {config.hero.primaryCta}
          </SbButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sb-accent">
          {config.name}
        </p>
        <h1 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
          {config.booking.heading}
        </h1>
      </div>
      <BookingFlow client={config} />
    </div>
  );
}
