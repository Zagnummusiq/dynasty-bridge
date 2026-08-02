import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="text-white fill-current">
        {/* Bridge Icon */}
        <path d="M5 30 V20 Q20 10 35 20 V30 H32 V22 Q20 15 8 22 V30 Z" />
        <rect x="18" y="25" width="4" height="5" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-white font-black text-xl tracking-tighter uppercase">Dynasty</span>
        <span className="text-white/80 font-bold text-xs tracking-[0.2em] uppercase -mt-1">Bridge</span>
      </div>
    </div>
  );
};

export default Logo;
