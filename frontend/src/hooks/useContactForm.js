/**
 * useContactForm
 * Hook del formulario de acceso anticipado en la sección CTA.
 * - Guarda el email ingresado.
 * - Muestra un mensaje de éxito o error al enviar.
 */

import { useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useContactForm = () => {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setNote('Ingresa un correo válido para avisarte.');
      return;
    }
    setNote(`Listo, te escribiremos a ${email} apenas esté disponible.`);
    setEmail('');
  };

  return { email, setEmail, note, handleSubmit };
};