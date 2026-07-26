import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppBubble: React.FC = () => {
  const phoneNumber = '254740930686';
  const message = 'Hello Dynasty Bridge, I have a query about your products.';

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center justify-center"
      title="Request and Queries"
    >
      <MessageCircle size={32} />
      <span className="absolute -top-2 -left-2 flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500"></span>
      </span>
    </a>
  );
};

export default WhatsAppBubble;
