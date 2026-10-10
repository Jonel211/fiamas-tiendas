/**
 * LandingPage
 * Página completa de la landing pública de Fiadito.
 * Ensambla todas las secciones en orden.
 * Aplica los efectos globales: scroll reveal y base CSS.
 */

// src/pages/LandingPage.jsx
import { useScrollReveal } from '@/hooks/useScrollReveal';

import Navbar from '@/components/modules/Landing/Navbar/Navbar';
import HeroSection from '@/components/modules/Landing/Hero/HeroSection';
import FeaturesSection from '@/components/modules/Landing/Features/FeaturesSection';
import HowItWorksSection from '@/components/modules/Landing/HowItWorks/HowItWorksSection';
import TeamSection from '@/components/modules/Landing/Team/TeamSection';
import QuestionsSection from '@/components/modules/Landing/Questions/QuestionsSection';
import AccessSection from '@/components/modules/Landing/Access/AccessSection';
import Footer from '@/components/modules/Landing/Footer/Footer';

import '@/components/modules/Landing/shared/LandingBase.css';

const LandingPage = () => {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TeamSection />
        <QuestionsSection />
        <AccessSection />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;