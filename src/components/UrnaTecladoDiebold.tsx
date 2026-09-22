import React, { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { BrasaoRepublica } from './BrasaoRepublica';
import { urnaAudio } from '../utils/audio';

interface UrnaTecladoDieboldProps {
  onDigito: (digito: string) => void;
  onBranco: () => void;
  onCorrige: () => void;
  onConfirma: () => void;
  somAtivo: boolean;
  onToggleSom: () => void;
  desabilitado?: boolean;
}

export const UrnaTecladoDiebold: React.FC<UrnaTecladoDieboldProps> = ({
  onDigito,
  onBranco,
  onCorrige,
  onConfirma,
  somAtivo,
  onToggleSom,
  desabilitado = false,
}) => {
  // Suporte a digitação pelo teclado físico do computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (desabilitado) return;

      // Se o foco estiver em um campo de formulário (input, textarea, select, contentEditable),
      // NUNCA capture nem previna teclas de digitação (espaço, backspace, números, etc.)
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

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

  // Braille dots representation for 0-9
  const getBrailleDots = (num: string) => {
    switch (num) {
      case '1': return '⠁';
      case '2': return '⠃';
      case '3': return '⠉';
      case '4': return '⠙';
      case '5': return '⠑';
      case '6': return '⠋';
      case '7': return '⠛';
      case '8': return '⠓';
      case '9': return '⠊';
      case '0': return '⠚';
      default: return '';
    }
  };

  return (
    <div
      id="urna-teclado-diebold"
      className="flex flex-col justify-between w-full h-full select-none"
    >
      {/* 1. PLACA SUPERIOR IDENTICA À URNA REAL: BRASÃO + JUSTIÇA ELEITORAL */}
      <div className="bg-gradient-to-b from-[#ffffff] to-[#f3f4f6] border-2 border-[#cbd5e1] rounded-t-lg p-3 sm:p-4 shadow-sm flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-0.5 bg-white rounded shadow-sm border border-gray-200">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSpsvafpqt7xzGBEeySYgDoyFqllBnQLkqpixJjv9lt-Y1BYH68V1ghcY&s=10"
              alt="Brasão Oficial da República / TSE"
              className="w-11 h-11 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-widest text-[#111827] uppercase leading-none font-sans">
              JUSTIÇA
            </div>
            <div className="text-base sm:text-lg font-black tracking-widest text-[#111827] uppercase leading-none font-sans mt-0.5">
              ELEITORAL
            </div>
          </div>
        </div>

        {/* Botão sutil de mute/unmute som */}
        <button
          type="button"
          onClick={onToggleSom}
          title={somAtivo ? 'Silenciar Urna' : 'Ativar Sons Oficiais'}
          className={`p-1.5 rounded text-xs transition flex items-center gap-1 ${
            somAtivo
              ? 'text-emerald-700 hover:bg-emerald-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          {somAtivo ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[10px] font-bold font-mono uppercase hidden sm:inline">
            {somAtivo ? 'Som' : 'Mudo'}
          </span>
        </button>
      </div>

      {/* 2. PLACA DO TECLADO NUMÉRICO E BOTÕES DE AÇÃO (RECESSÃO PRETA COMO NA URNA REAL) */}
      <div className="bg-[#18191d] border-4 border-[#121316] rounded-b-lg p-3 sm:p-5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex-1 flex flex-col justify-between">
        {/* Grade Numérica 3x3 + 0 */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-auto max-w-[280px] mx-auto w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              id={`tecla-urna-${num}`}
              onClick={() => handleTecla(num)}
              disabled={desabilitado}
              className="relative group h-12 sm:h-14 bg-gradient-to-b from-[#2e3037] to-[#1e2025] hover:from-[#383a42] hover:to-[#25282e] active:scale-95 active:from-[#1a1b20] active:to-[#121317] border-t border-l border-gray-600 border-r-2 border-b-4 border-black rounded-md shadow-[0_5px_8px_rgba(0,0,0,0.7)] text-white font-mono text-xl sm:text-2xl font-black flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{num}</span>

              {/* Ponto Braille e Alto-Relevo no número 5 oficial */}
              {num === '5' && (
                <span
                  className="absolute bottom-1 w-1.5 h-1.5 bg-gray-400 rounded-full shadow"
                  title="Ponto tátil de identificação central (Braille)"
                />
              )}

              {/* Braille tátil sutil no topo do botão */}
              <span className="absolute top-0.5 right-1.5 text-[8px] text-gray-500 font-sans opacity-60">
                {getBrailleDots(num)}
              </span>
            </button>
          ))}

          {/* Linha do dígito 0 (centralizado na 2ª coluna) */}
          <div />
          <button
            type="button"
            id="tecla-urna-0"
            onClick={() => handleTecla('0')}
            disabled={desabilitado}
            className="relative group h-12 sm:h-14 bg-gradient-to-b from-[#2e3037] to-[#1e2025] hover:from-[#383a42] hover:to-[#25282e] active:scale-95 active:from-[#1a1b20] active:to-[#121317] border-t border-l border-gray-600 border-r-2 border-b-4 border-black rounded-md shadow-[0_5px_8px_rgba(0,0,0,0.7)] text-white font-mono text-xl sm:text-2xl font-black flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>0</span>
            <span className="absolute top-0.5 right-1.5 text-[8px] text-gray-500 font-sans opacity-60">
              {getBrailleDots('0')}
            </span>
          </button>
          <div />
        </div>

        {/* 3. BOTÕES DE AÇÃO: BRANCO, CORRIGE E CONFIRMA (EXATAMENTE COMO NA FOTO REAL) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-3 mt-2 border-t border-gray-800/80 max-w-[320px] mx-auto w-full items-end">
          {/* Botão BRANCO */}
          <button
            type="button"
            id="tecla-branco"
            onClick={handleBranco}
            disabled={desabilitado}
            className="h-11 sm:h-12 bg-gradient-to-b from-[#ffffff] to-[#e5e7eb] hover:from-[#f9fafb] hover:to-[#d1d5db] active:scale-95 active:from-[#d1d5db] active:to-[#9ca3af] border-t border-l border-white border-r-2 border-b-4 border-gray-950 rounded-md shadow-[0_5px_8px_rgba(0,0,0,0.6)] text-[#111827] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            BRANCO
          </button>

          {/* Botão CORRIGE */}
          <button
            type="button"
            id="tecla-corrige"
            onClick={handleCorrige}
            disabled={desabilitado}
            className="h-11 sm:h-12 bg-gradient-to-b from-[#f97316] to-[#c2410c] hover:from-[#fb923c] hover:to-[#ea580c] active:scale-95 active:from-[#9a3412] active:to-[#7c2d12] border-t border-l border-amber-300 border-r-2 border-b-4 border-gray-950 rounded-md shadow-[0_5px_8px_rgba(0,0,0,0.6)] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            CORRIGE
          </button>

          {/* Botão CONFIRMA (Mais alto e proeminente, exatamente como na foto) */}
          <button
            type="button"
            id="tecla-confirma"
            onClick={handleConfirma}
            disabled={desabilitado}
            className="h-13 sm:h-14 bg-gradient-to-b from-[#22c55e] to-[#15803d] hover:from-[#4ade80] hover:to-[#16a34a] active:scale-95 active:from-[#166534] active:to-[#14532d] border-t border-l border-emerald-300 border-r-2 border-b-4 border-gray-950 rounded-md shadow-[0_6px_10px_rgba(0,0,0,0.8)] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 ring-1 ring-emerald-500/50"
          >
            CONFIRMA
          </button>
        </div>
      </div>
    </div>
  );
};
