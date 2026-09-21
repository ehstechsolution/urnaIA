import React, { useEffect } from 'react';
import { Volume2, VolumeX, User } from 'lucide-react';
import { Candidato, CargoConfig } from '../types';
import { CandidatoFoto } from './CandidatoFoto';
import { urnaAudio } from '../utils/audio';

interface UrnaPainelDireitoProps {
  cargoAtual: CargoConfig;
  candidatoSelecionado: Candidato | null;
  isVotoBranco: boolean;
  onDigito: (digito: string) => void;
  onBranco: () => void;
  onCorrige: () => void;
  onConfirma: () => void;
  somAtivo: boolean;
  onToggleSom: () => void;
  desabilitado?: boolean;
}

export const UrnaPainelDireito: React.FC<UrnaPainelDireitoProps> = ({
  cargoAtual,
  candidatoSelecionado,
  isVotoBranco,
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

  const temFotoValida = Boolean(candidatoSelecionado && !isVotoBranco);

  return (
    <div
      id="urna-painel-direito"
      className="bg-[#2c3038] p-4 sm:p-5 rounded-xl border-4 border-[#1f2227] shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between w-full h-full select-none"
    >
      {/* =========================================================================
          1. QUADRO DE FOTO DO CANDIDATO (SURGE AO COMPLETAR O NÚMERO VÁLIDO)
          ========================================================================= */}
      <div className="bg-[#202329] p-3 rounded-lg border-2 border-gray-700/80 mb-4 shadow-inner">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-700 text-[11px] font-mono text-gray-400 uppercase">
          <span className="font-bold flex items-center gap-1.5 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Quadro de Foto Oficial
          </span>
          <span className="text-[10px] text-gray-500">
            {temFotoValida ? 'Candidato Identificado' : 'Aguardando Número'}
          </span>
        </div>

        {temFotoValida && candidatoSelecionado ? (
          /* Foto em Exibição com Transição Suave */
          <div
            id="quadro-foto-candidato"
            className="flex items-center justify-center gap-3 py-1 transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
          >
            {/* Foto Titular */}
            <div className="flex flex-col items-center">
              <CandidatoFoto
                url={candidatoSelecionado.fotoUrl}
                nome={candidatoSelecionado.nomeUrna}
                cargoTitulo={cargoAtual.nome.replace(' (1ª VAGA)', '').replace(' (2ª VAGA)', '')}
                tamanho="normal"
              />
            </div>

            {/* Foto do Vice se existir (Presidente / Governador) */}
            {candidatoSelecionado.vice && (
              <div className="flex flex-col items-center">
                <CandidatoFoto
                  url={candidatoSelecionado.vice.fotoUrl}
                  nome={candidatoSelecionado.vice.nome}
                  cargoTitulo={candidatoSelecionado.vice.titulo}
                  tamanho="pequeno"
                />
              </div>
            )}
          </div>
        ) : (
          /* Moldura Vazia de Espera (Estilo Caixa de Foto da Urna) */
          <div
            id="quadro-foto-vazio"
            className="w-full h-36 sm:h-40 border-2 border-dashed border-gray-600/80 rounded bg-[#181a1f]/80 flex flex-col items-center justify-center text-center p-3 text-gray-400"
          >
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 mb-2">
              <User className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
              Foto do Candidato
            </span>
            <span className="text-[10px] text-gray-500 font-mono mt-0.5">
              {isVotoBranco
                ? 'Voto em branco selecionado'
                : `Digite os ${cargoAtual.digitos} dígitos do candidato`}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. TECLADO NUMÉRICO DE 0 A 9
          ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Cabeçalho do Teclado */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center font-black text-[9px] text-[#1c2217] shadow">
              BR
            </div>
            <div>
              <h3 className="text-xs font-black tracking-wider text-gray-200 uppercase leading-none">
                JUSTIÇA ELEITORAL
              </h3>
              <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">
                Teclado Oficial da Urna
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-toggle-som"
            onClick={onToggleSom}
            title={somAtivo ? 'Desativar Sons da Urna' : 'Ativar Sons da Urna'}
            aria-label={somAtivo ? 'Desativar Sons da Urna' : 'Ativar Sons da Urna'}
            className="p-1.5 rounded bg-[#202329] hover:bg-[#383d47] text-gray-300 hover:text-white transition-colors border border-gray-700"
          >
            {somAtivo ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
        </div>

        {/* Grade Numérica 1 a 9 e 0 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              id={`btn-tecla-${num}`}
              disabled={desabilitado}
              onClick={() => handleTecla(num)}
              className="group relative h-12 sm:h-13 bg-gradient-to-b from-[#3a3f4a] to-[#202328] text-white font-mono text-xl sm:text-2xl font-black rounded-lg border-t border-l border-[#525968] border-b-4 border-r-2 border-[#15171c] shadow-[0_4px_6px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex flex-col items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{num}</span>
              {/* Ponto tátil em alto relevo no número 5 (Acessibilidade TSE) */}
              {num === '5' && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-gray-400/90 shadow-sm" />
              )}
            </button>
          ))}

          {/* Linha do Zero Centralizado */}
          <div className="col-start-2">
            <button
              type="button"
              id="btn-tecla-0"
              disabled={desabilitado}
              onClick={() => handleTecla('0')}
              className="w-full h-12 sm:h-13 bg-gradient-to-b from-[#3a3f4a] to-[#202328] text-white font-mono text-xl sm:text-2xl font-black rounded-lg border-t border-l border-[#525968] border-b-4 border-r-2 border-[#15171c] shadow-[0_4px_6px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
            >
              0
            </button>
          </div>
        </div>

        {/* =========================================================================
            3. BOTÕES COLORIDOS DE AÇÃO: BRANCO, CORRIGE E CONFIRMA
            ========================================================================= */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3 pt-3 border-t border-gray-700/70 items-end">
          {/* BRANCO (Botão branco com texto preto) */}
          <button
            type="button"
            id="btn-branco"
            disabled={desabilitado}
            onClick={handleBranco}
            className="h-11 sm:h-12 bg-gradient-to-b from-[#ffffff] to-[#e5e7eb] text-[#111827] font-black text-xs sm:text-[13px] rounded-lg border-t border-l border-white border-b-4 border-r-2 border-[#9ca3af] shadow-[0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center uppercase tracking-wider hover:brightness-105 disabled:opacity-50 disabled:pointer-events-none"
          >
            BRANCO
          </button>

          {/* CORRIGE (Botão laranja com texto branco) */}
          <button
            type="button"
            id="btn-corrige"
            disabled={desabilitado}
            onClick={handleCorrige}
            className="h-11 sm:h-12 bg-gradient-to-b from-[#ea580c] to-[#c2410c] text-white font-black text-xs sm:text-[13px] rounded-lg border-t border-l border-orange-400 border-b-4 border-r-2 border-[#7c2d12] shadow-[0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
          >
            CORRIGE
          </button>

          {/* CONFIRMA (Botão verde oficial, mais alto/destacado com texto branco) */}
          <button
            type="button"
            id="btn-confirma"
            disabled={desabilitado}
            onClick={handleConfirma}
            className="h-14 sm:h-15 bg-gradient-to-b from-[#16a34a] to-[#15803d] text-white font-black text-sm sm:text-base rounded-lg border-t border-l border-emerald-400 border-b-4 border-r-2 border-[#14532d] shadow-[0_6px_10px_rgba(0,0,0,0.5)] active:translate-y-1 active:border-b-2 active:shadow-inner transition-all flex items-center justify-center uppercase tracking-wider hover:brightness-110 -mt-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            CONFIRMA
          </button>
        </div>
      </div>
    </div>
  );
};
