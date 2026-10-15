import { notFound } from 'next/navigation';
import { getClientConfig } from '@/config/service-business';
import { Hero } from '@/components/service-business/landing/Hero';
import { TrustBar } from '@/components/service-business/landing/TrustBar';
import { Problem } from '@/components/service-business/landing/Problem';
import { Services } from '@/components/service-business/landing/Services';
import { About } from '@/components/service-business/landing/About';
import { WhyChooseUs } from '@/components/service-business/landing/WhyChooseUs';
import { Process } from '@/components/service-business/landing/Process';
import { FeaturedWork } from '@/components/service-business/landing/FeaturedWork';
import { Testimonials } from '@/components/service-business/landing/Testimonials';
import { ContactSection } from '@/components/service-business/landing/ContactSection';

/**
 * The reusable landing page. Section order is fixed by the system; every
 * word, colour, font and service comes from the client configuration.
 */
export default async function ClientLandingPage({
  params,
}: {
  params: Promise<{ client: string }>;
}) {
  const { client: slug } = await params;
  const config = getClientConfig(slug);
  if (!config) notFound();

  return (
    <>
      <Hero client={config} />
      <TrustBar client={config} />
      <Problem client={config} />
      <Services client={config} />
      <About client={config} />
      <WhyChooseUs client={config} />
      <Process client={config} />
      <FeaturedWork client={config} />
      <Testimonials client={config} />
      <ContactSection client={config} />
    </>
  );
}
