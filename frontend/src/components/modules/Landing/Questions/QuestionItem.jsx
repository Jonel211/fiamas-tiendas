/**
 * FaqItem
 * Ítem individual del acordeón de Preguntas Frecuentes.
 * Muestra: pregunta (botón clickeable) + respuesta (colapsable).
 * Solo un ítem puede estar abierto a la vez (lo maneja FaqSection).
 */

import './QuestionItem.css';

const QuestionItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="faq-item">
      <button
        className="faq-item__question"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{question}</span>
        <span className="faq-item__icon" aria-hidden="true"></span>
      </button>
      <div className="faq-item__answer">
        <p>{answer}</p>
      </div>
    </div>
  );
};

export default QuestionItem;