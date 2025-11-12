import {
  CTASection,
  FeaturesSection,
  Footer,
  Header,
  HeroSection,
  StatsSection,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
