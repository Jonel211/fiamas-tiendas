import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Hook para manejar el login
export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Validación de campos
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
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await login({
        email: form.email,
        password: form.password,
        remember: form.remember,
      });
      navigate('/panel');
    } catch (error) {
      setServerError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRemember = (checked) => setForm({ ...form, remember: checked });

  return {
    form,
    errors,
    serverError,
    isSubmitting,
    handleChange,
    handleSubmit,
    toggleRemember,
  };
};