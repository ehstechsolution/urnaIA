import React from 'react';

interface BrasaoRepublicaProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
}

export const BrasaoRepublica: React.FC<BrasaoRepublicaProps> = ({
  className = '',
  size = 40,
  monochrome = false,
}) => {
  if (monochrome) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Espada central e Estrela estilizada do Brasão da República */}
        <circle cx="50" cy="50" r="46" stroke="#4b5563" strokeWidth="2.5" fill="#f3f4f6" />
        <path
          d="M50 8 L58 35 L86 35 L64 52 L72 79 L50 63 L28 79 L36 52 L14 35 L42 35 Z"
          fill="#374151"
        />
        <circle cx="50" cy="48" r="16" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
        {/* Cruzeiro do Sul */}
        <circle cx="50" cy="42" r="2" fill="#ffffff" />
        <circle cx="50" cy="54" r="2" fill="#ffffff" />
        <circle cx="44" cy="48" r="2" fill="#ffffff" />
        <circle cx="56" cy="47" r="2" fill="#ffffff" />
        <circle cx="53" cy="51" r="1.5" fill="#ffffff" />
        {/* Ramo estilizado */}
        <path d="M25 85 C35 78 45 78 50 80 C55 78 65 78 75 85" stroke="#4b5563" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brasaoGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="brasaoGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="brasaoBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Coroa de Louros e Ramos */}
      <circle cx="60" cy="58" r="50" stroke="#16a34a" strokeWidth="4" strokeDasharray="6 4" fill="none" />
      <circle cx="60" cy="58" r="45" stroke="#ca8a04" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Grande Estrela de 5 Pontas Bicolor (Verde e Amarelo) */}
      <path
        d="M60 12 L69 43 L101 43 L76 63 L85 94 L60 76 L35 94 L44 63 L19 43 L51 43 Z"
        fill="url(#brasaoGreen)"
        stroke="url(#brasaoGold)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M60 22 L66 45 L90 45 L71 60 L78 83 L60 70 L42 83 L49 60 L30 45 L54 45 Z"
        fill="url(#brasaoGold)"
        opacity="0.85"
      />

      {/* Disco Central Azul do Cruzeiro do Sul */}
      <circle cx="60" cy="56" r="20" fill="url(#brasaoBlue)" stroke="#ffffff" strokeWidth="2.5" />

      {/* 5 Estrelas do Cruzeiro do Sul */}
      <circle cx="60" cy="47" r="2.2" fill="#ffffff" />
      <circle cx="60" cy="65" r="2.2" fill="#ffffff" />
      <circle cx="51" cy="56" r="2.2" fill="#ffffff" />
      <circle cx="69" cy="54" r="2.2" fill="#ffffff" />
      <circle cx="64" cy="60" r="1.6" fill="#ffffff" />

      {/* Estrelas do Anel Exterior */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const x = 60 + 16.5 * Math.cos(rad);
        const y = 56 + 16.5 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="0.9" fill="#ffffff" opacity="0.9" />;
      })}

      {/* Faixa Inferior com cores da bandeira */}
      <path
        d="M25 100 Q60 92 95 100 L93 107 Q60 99 27 107 Z"
        fill="#1e40af"
        stroke="#ca8a04"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="100" r="2.5" fill="#facc15" />
    </svg>
  );
};
