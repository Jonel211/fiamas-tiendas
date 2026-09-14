const AuthBranding = () => {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ paddingRight: '45px' }}
    >
      <img
        src="/images/tienda.png"
        alt="Ilustración Fiamas"
        className="w-full h-full object-contain select-none"
        style={{
          transform: 'scale(1.08)',
        }}
      />
    </div>
  );
};

export default AuthBranding;
