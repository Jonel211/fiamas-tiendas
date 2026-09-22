/**
 * LoginSubmitButton
 * Botón de envío del formulario con estado "Ingresando..." y hover.
 */

const LoginSubmitButton = ({ isSubmitting }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full text-white text-[13px] font-medium py-2.5 rounded-lg transition-all mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
      style={{
        backgroundColor: '#1D9492',
        boxShadow: '0 6px 16px -6px rgba(29, 148, 146, 0.5)',
      }}
      onMouseEnter={(e) => {
        if (isSubmitting) return;
        e.currentTarget.style.backgroundColor = '#167572';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1D9492';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
    </button>
  );
};

export default LoginSubmitButton;