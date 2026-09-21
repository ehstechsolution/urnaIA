import React, { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { urnaAudio } from '../utils/audio';

interface UrnaTecladoProps {
  onDigito: (digito: string) => void;
  onBranco: () => void;
  onCorrige: () => void;
  onConfirma: () => void;
  somAtivo: boolean;
  onToggleSom: () => void;
  desabilitado?: boolean;
}

export const UrnaTeclado: React.FC<UrnaTecladoProps> = ({
  onDigito,
  onBranco,
  onCorrige,
  onConfirma,
  somAtivo,
  onToggleSom,
  desabilitado = false,
}) => {
  // Suporte a teclado físico do computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (desabilitado) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        urnaAudio.playKeyBeep();
        onDigito(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirma();
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        urnaAudio.playKeyBeep();
        onCorrige();
      } else if (e.key.toLowerCase() === 'b' || e.key === ' ') {
        e.preventDefault();
        urnaAudio.playKeyBeep();
        onBranco();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [desabilitado, onDigito, onConfirma, onCorrige, onBranco]);

  const handleTecla = (valor: string) => {
    if (desabilitado) return;
    urnaAudio.playKeyBeep();
    onDigito(valor);
  };

  const handleBranco = () => {
    if (desabilitado) return;
    urnaAudio.playKeyBeep();
    onBranco();
  };

  const handleCorrige = () => {
    if (desabilitado) return;
    urnaAudio.playKeyBeep();
    onCorrige();
  };

  const handleConfirma = () => {
    if (desabilitado) return;
    onConfirma();
  };

  return (
    <div
      id="urna-modulo-teclado"
      className="bg-[#2c3038] p-5 sm:p-6 rounded-xl border-4 border-[#1f2227] shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between max-w-sm mx-auto w-full select-none"
    >
      {/* Cabeçalho do Teclado com Brasão / Logotipo TSE */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          {/* Emblema estilizado da Justiça Eleitoral */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 flex items-center justify-center shadow">
            <div className="w-full h-full rounded-full bg-[#202329] flex items-center justify-center text-[10px] font-black text-amber-300">
              BR
            </div>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase leading-none">
              JUSTIÇA ELEITORAL
            </h3>
            <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">
              Urna Eletrônica UE2026
            </span>
          </div>
        </div>

        {/* Botão de Som / Mudo para acessibilidade */}
        <button
          type="button"
          id="btn-toggle-som"
          onClick={onToggleSom}
          title={somAtivo ? 'Desativar Sons' : 'Ativar Sons'}
          aria-label={somAtivo ? 'Desativar Sons' : 'Ativar Sons'}
          className="p-1.5 rounded bg-[#202329] hover:bg-[#383d47] text-gray-300 hover:text-white transition-colors border border-gray-700"
        >
          {somAtivo ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>
      </div>

      {/* Grade Numérica 1 a 9 e 0 */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            id={`btn-tecla-${num}`}
            disabled={desabilitado}
            onClick={() => handleTecla(num)}
            className="group relative h-13 sm:h-14 bg-gradient-to-b from-[#3a3f4a] to-[#202328] text-white font-mono text-xl sm:text-2xl font-black rounded-lg border-t border-l border-[#525968] border-b-4 border-r-2 border-[#15171c] shadow-[0_4px_6px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex flex-col items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{num}</span>
            {/* Ponto tátil em alto relevo no número 5 (Padrão de acessibilidade TSE) */}
            {num === '5' && (
              <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-gray-400/80 shadow-sm" />
            )}
          </button>
        ))}

        {/* Linha do Zero centralizado */}
        <div className="col-start-2">
          <button
            type="button"
            id="btn-tecla-0"
            disabled={desabilitado}
            onClick={() => handleTecla('0')}
            className="w-full h-13 sm:h-14 bg-gradient-to-b from-[#3a3f4a] to-[#202328] text-white font-mono text-xl sm:text-2xl font-black rounded-lg border-t border-l border-[#525968] border-b-4 border-r-2 border-[#15171c] shadow-[0_4px_6px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
          >
            0
          </button>
        </div>
      </div>

      {/* Botões de Ação: BRANCO, CORRIGE e CONFIRMA */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-5 pt-3 border-t border-gray-700/60 items-end">
        {/* BRANCO */}
        <button
          type="button"
          id="btn-branco"
          disabled={desabilitado}
          onClick={handleBranco}
          className="h-12 sm:h-13 bg-gradient-to-b from-[#f8f9fa] to-[#e2e6ea] text-[#111] font-bold text-xs sm:text-[13px] rounded-lg border-t border-l border-white border-b-4 border-r-2 border-[#a0a5ad] shadow-[0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center uppercase tracking-wider hover:brightness-105 disabled:opacity-50 disabled:pointer-events-none"
        >
          BRANCO
        </button>

        {/* CORRIGE */}
        <button
          type="button"
          id="btn-corrige"
          disabled={desabilitado}
          onClick={handleCorrige}
          className="h-12 sm:h-13 bg-gradient-to-b from-[#f97316] to-[#c2410c] text-white font-bold text-xs sm:text-[13px] rounded-lg border-t border-l border-orange-400 border-b-4 border-r-2 border-[#7c2d12] shadow-[0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
        >
          CORRIGE
        </button>

        {/* CONFIRMA (Mais alto / destaque) */}
        <button
          type="button"
          id="btn-confirma"
          disabled={desabilitado}
          onClick={handleConfirma}
          className="h-14 sm:h-16 bg-gradient-to-b from-[#22c55e] to-[#15803d] text-white font-black text-sm sm:text-base rounded-lg border-t border-l border-emerald-400 border-b-4 border-r-2 border-[#14532d] shadow-[0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center uppercase tracking-wider hover:brightness-110 -mt-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          CONFIRMA
        </button>
      </div>

      <div className="mt-3 text-center text-[10px] text-gray-400 font-mono tracking-tight">
        Teclado numérico, [Enter] Confirma, [Backspace] Corrige, [Espaço] Branco
      </div>
    </div>
  );
};
