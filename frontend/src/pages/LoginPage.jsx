// src/pages/LoginPage.jsx
import AuthBranding from '../components/modules/Auth/AuthBranding';
import LoginForm from '../components/modules/Auth/LoginForm';

const LoginPage = () => {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{ backgroundColor: '#d9ede0' }}
    >

      {/* Confetti global */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute top-[8%] left-[12%] w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F2C94C' }} />
        <span className="absolute top-[18%] left-[42%] w-2 h-2 rounded-full" style={{ backgroundColor: '#1F8A4C', opacity: 0.4 }} />
        <span className="absolute top-[10%] left-[68%] w-3 h-3 rounded-full" style={{ backgroundColor: '#E63946', opacity: 0.35 }} />
        <span className="absolute top-[22%] right-[8%] w-2 h-2 rounded-full" style={{ backgroundColor: '#F2C94C', opacity: 0.7 }} />
        <span className="absolute top-[38%] left-[8%] w-3 h-3 rounded-full" style={{ backgroundColor: '#1F8A4C', opacity: 0.3 }} />
        <span className="absolute top-[42%] right-[5%] w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E63946', opacity: 0.45 }} />
        <span className="absolute top-[55%] left-[18%] w-2 h-2 rounded-full" style={{ backgroundColor: '#F2C94C', opacity: 0.6 }} />
        <span className="absolute top-[62%] right-[14%] w-3 h-3 rounded-full" style={{ backgroundColor: '#1F8A4C', opacity: 0.35 }} />
        <span className="absolute top-[72%] left-[6%] w-2 h-2 rounded-full" style={{ backgroundColor: '#E63946', opacity: 0.5 }} />
        <span className="absolute top-[78%] left-[55%] w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1F8A4C', opacity: 0.4 }} />
        <span className="absolute bottom-[8%] right-[10%] w-2 h-2 rounded-full" style={{ backgroundColor: '#F2C94C' }} />
        <span className="absolute bottom-[15%] left-[28%] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1F8A4C', opacity: 0.5 }} />
        <span className="absolute bottom-[22%] right-[32%] w-2 h-2 rounded-full" style={{ backgroundColor: '#E63946', opacity: 0.4 }} />
        <span className="absolute top-[48%] left-[48%] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#F2C94C', opacity: 0.6 }} />
        <span className="absolute top-[30%] left-[88%] w-2 h-2 rounded-full" style={{ backgroundColor: '#1F8A4C', opacity: 0.45 }} />
      </div>

      {/* Imagen espejada de fondo */}
      <img
        src="/images/tienda.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none hidden lg:block"
        style={{
          left: '-18%',
          top: '50%',
          transform: 'translateY(-50%) scaleX(-1)',
          width: '1100px',
          opacity: 0.28,
          filter: 'blur(3px)',
        }}
      />

      {/* Tarjeta exterior - MÁS GRANDE */}
      <div
        className="relative w-full max-w-5xl rounded-[28px] overflow-hidden flex min-h-[560px]"
        style={{
          border: '1px solid rgba(31, 138, 76, 0.36)',
          boxShadow: '0 24px 70px -25px rgba(15, 61, 36, 0.71)',
        }}
      >
        {/* Formulario - izquierda */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-8 sm:px-10">
          <LoginForm />
        </div>

        {/* Ilustración - derecha */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
          <AuthBranding />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;