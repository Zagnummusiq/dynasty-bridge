import React, { useEffect, useState } from 'react';

const ShopStatus: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const checkStatus = () => {
    const now = new Date();
    const kenyaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Nairobi',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'long',
    }).formatToParts(now);

    const parts = kenyaTime.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as any);

    const hour = parseInt(parts.hour);
    const day = parts.weekday;

    let openTime = 7;
    let closeTime = 18; // 6 PM

    if (day === 'Friday') {
      closeTime = 20; // 8 PM
    }

    setIsOpen(hour >= openTime && hour < closeTime);
    setCurrentTime(`${parts.hour}:${parts.minute} EAT`);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
      <span className="text-sm font-medium">
        {isOpen ? 'Open Now' : 'Closed'} • {currentTime}
      </span>
    </div>
  );
};

export default ShopStatus;
