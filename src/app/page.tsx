import Hero from "@/components/home/Hero";
import RouteTimeline from "@/components/home/RouteTimeline";
import { BusTypes, CTA, HowItWorks, PopularFares, StopsMarquee, Stats, Testimonials } from "@/components/home/Sections";
import { getStops } from "@/lib/data";

export default async function HomePage() {
  const stops = await getStops();
  return (
    <>
      <Hero stops={stops} />
      <StopsMarquee stops={stops} />
      <Stats stops={stops} />
      <RouteTimeline stops={stops} />
      <BusTypes />
      <HowItWorks />
      <PopularFares stops={stops} rate={4} />
      <Testimonials />
      <CTA />
    </>
  );
}
