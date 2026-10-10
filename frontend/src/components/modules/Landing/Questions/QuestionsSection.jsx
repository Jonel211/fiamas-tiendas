/**
 * FaqSection
 * Sección "Preguntas frecuentes".
 * Lista de 5 ítems con comportamiento de acordeón:
 * al abrir uno, se cierra el anterior.
 */

import { useState } from 'react';
import { QUESTIONS } from '@/constants/landingData';
import SectionHead from '../shared/SectionHead';
import QuestionItem from './QuestionItem';
import './QuestionsSection.css';

const QuestionsSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section" id="faq">
      <div className="container container--narrow">
        <SectionHead title="Preguntas frecuentes" />

        <div className="faq" data-reveal>
          {QUESTIONS.map((faq, index) => (
            <QuestionItem
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

export default QuestionsSection;