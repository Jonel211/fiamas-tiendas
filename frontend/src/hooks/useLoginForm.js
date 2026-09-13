// src/hooks/useLoginForm.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = '';

    if (name === 'email') {
      if (!value) error = 'El correo es obligatorio';
      else if (!value.includes('@')) error = 'El correo debe contener una @';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = 'Formato de correo inválido (ej: usuario@dominio.com)';
    }

    if (name === 'password') {
      if (!value) error = 'La contraseña es obligatoria';
      else if (value.length < 4) error = 'La contraseña debe tener al menos 4 caracteres';
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {
      email: validateField('email', form.email),
      password: validateField('password', form.password),
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      localStorage.setItem('fiamas_auth', 'true');
      localStorage.setItem('fiamas_user', form.email);
      navigate('/panel');
      setIsSubmitting(false);
    }, 500);
  };

  const toggleRemember = (checked) => setForm({ ...form, remember: checked });

  return { form, errors, isSubmitting, handleChange, handleSubmit, toggleRemember };
};