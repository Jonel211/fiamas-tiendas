/**
 * FaqSection
 * Sección "Preguntas frecuentes".
 * Lista de 5 ítems con comportamiento de acordeón:
 * al abrir uno, se cierra el anterior.
 */

import { useState } from 'react';
import { FAQS } from '@/constants/landingData';
import SectionHead from '../shared/SectionHead';
import FaqItem from './FaqItem';
import './FaqSection.css';

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section" id="faq">
      <div className="container container--narrow">
        <SectionHead title="Preguntas frecuentes" />

        <div className="faq" data-reveal>
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.q}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;