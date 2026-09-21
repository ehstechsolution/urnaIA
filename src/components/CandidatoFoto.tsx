import React, { useState } from 'react';
import { User } from 'lucide-react';

interface CandidatoFotoProps {
  url?: string;
  nome: string;
  tamanho?: 'normal' | 'pequeno';
  cargoTitulo?: string;
}

export const CandidatoFoto: React.FC<CandidatoFotoProps> = ({
  url,
  nome,
  tamanho = 'normal',
  cargoTitulo,
}) => {
  const [carregouErro, setCarregouErro] = useState(false);

  const dimensoes =
    tamanho === 'normal'
      ? 'w-32 h-40 sm:w-36 sm:h-44'
      : 'w-20 h-24 sm:w-24 sm:h-28';

  return (
    <div
      id={`foto-${nome.replace(/\s+/g, '-').toLowerCase()}`}
      className={`relative flex flex-col items-center bg-[#c8c4b7] border-2 border-[#555] shadow-inner p-1 ${dimensoes}`}
    >
      <div className="w-full h-full bg-[#111] overflow-hidden flex items-center justify-center relative border border-[#333]">
        {!carregouErro && url ? (
          <img
            src={url}
            alt={`Foto oficial de ${nome}`}
            referrerPolicy="no-referrer"
            onError={() => setCarregouErro(true)}
            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-900 text-gray-200">
            <User className={tamanho === 'normal' ? 'w-16 h-16' : 'w-10 h-10'} />
            <span className="text-[9px] uppercase tracking-wider text-center px-1 mt-1 font-mono font-bold">
              Foto Oficial
            </span>
          </div>
        )}
      </div>

      {cargoTitulo && (
        <div className="w-full text-center bg-[#222] text-white text-[10px] sm:text-[11px] font-bold py-0.5 mt-0.5 tracking-tight uppercase truncate">
          {cargoTitulo}
        </div>
      )}
    </div>
  );
};
