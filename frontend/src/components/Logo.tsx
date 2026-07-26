import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center bg-mustard p-4 rounded-lg ${className}`}>
      <svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        {/* DYNASTY Text */}
        <text x="10" y="40" className="font-bold fill-black" style={{ fontSize: '24px', letterSpacing: '2px' }}>
          DYNA
          <tspan className="italic" style={{ fontSize: '42px' }} dy="6px">S</tspan>
          <tspan dy="-6px">TY</tspan>
        </text>
        
        {/* BRIDGE Text starting below 'N' of DYNASTY */}
        <text x="68" y="75" className="fill-black" style={{ fontSize: '24px', fontFamily: '"Brush Script MT", cursive' }}>
          Bridge
        </text>
        
        {/* Bridge graphic under Dynasty */}
        <path d="M 10 50 Q 100 80 190 50" fill="none" stroke="black" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default Logo;
