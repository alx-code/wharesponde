import React from 'react';
import Header from '../../features/Header';
import HeroSection from '../../features/HeroSection';
import LogosSection from '../../features/LogosSection';
import ChatLinkGeneratorSection from '../../features/ChatLinkGeneratorSection';
// Importar otras secciones aquí
// import FeaturesOverviewSection from '../../features/FeaturesOverviewSection';
// import TestimonialsSection from '../../features/TestimonialsSection';
// import PricingSection from '../../features/PricingSection';
// import FAQSection from '../../features/FAQSection';
// import Footer from '../../features/Footer';

const LandingPage = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <LogosSection />
      <ChatLinkGeneratorSection />
      {/* Renderizar otras secciones aquí */}
      {/* <FeaturesOverviewSection /> */}
      {/* <TestimonialsSection /> */}
      {/* <PricingSection /> */}
      {/* <FAQSection /> */}
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;
