import React from 'react';
import { UrnaTela } from './UrnaTela';
import { UrnaTecladoDiebold } from './UrnaTecladoDiebold';
import { CargoConfig, Candidato } from '../types';

interface UrnaTerminalGabineteProps {
  cargoAtual: CargoConfig;
  digitosDigitados: string[];
  candidatoSelecionado: Candidato | null;
  isVotoBranco: boolean;
  isNumeroInvalido: boolean;
  isSenadorRepetido: boolean;
  telaFim: boolean;
  gravando: boolean;
  onDigito: (digito: string) => void;
  onBranco: () => void;
  onCorrige: () => void;
  onConfirma: () => void;
  somAtivo: boolean;
  onToggleSom: () => void;
  desabilitado?: boolean;
}

export const UrnaTerminalGabinete: React.FC<UrnaTerminalGabineteProps> = ({
  cargoAtual,
  digitosDigitados,
  candidatoSelecionado,
  isVotoBranco,
  isNumeroInvalido,
  isSenadorRepetido,
  telaFim,
  gravando,
  onDigito,
  onBranco,
  onCorrige,
  onConfirma,
  somAtivo,
  onToggleSom,
  desabilitado = false,
}) => {
  return (
    <div
      id="urna-gabinete-real"
      className="relative bg-gradient-to-b from-[#edf0f5] via-[#e2e6ed] to-[#d4d8e0] p-4 sm:p-6 lg:p-7 rounded-2xl border-4 border-[#bcc2cc] shadow-[0_25px_60px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.8)] max-w-5xl mx-auto w-full"
    >
      {/* 1. TOPO CHANFRADO / INCLINADO DA URNA REAL */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-[#f8fafc] to-[#e2e6ed] rounded-t-xl border-b border-[#cbd5e1] opacity-90 pointer-events-none" />

      {/* 2. CORPO PRINCIPAL: TELA À ESQUERDA E TECLADO À DIREITA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch relative z-10 pt-1">
        {/* LADO ESQUERDO: TELA LCD COM FOTO ACIMA E NÚMEROS ABAIXO */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex-1 bg-[#262c22] p-2.5 sm:p-3 rounded-lg border-3 border-[#9aa0aa] shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]">
            <UrnaTela
              cargoAtual={cargoAtual}
              digitosDigitados={digitosDigitados}
              candidatoSelecionado={candidatoSelecionado}
              isVotoBranco={isVotoBranco}
              isNumeroInvalido={isNumeroInvalido}
              isSenadorRepetido={isSenadorRepetido}
              telaFim={telaFim}
              gravando={gravando}
            />
          </div>
        </div>

        {/* LADO DIREITO: TECLADO FÍSICO COM NÚMEROS E BOTÕES COLORIDOS */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex-1 bg-[#1a1b1f] p-2 rounded-lg border-3 border-[#9aa0aa] shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <UrnaTecladoDiebold
              onDigito={onDigito}
              onBranco={onBranco}
              onCorrige={onCorrige}
              onConfirma={onConfirma}
              somAtivo={somAtivo}
              onToggleSom={onToggleSom}
              desabilitado={desabilitado}
            />
          </div>
        </div>
      </div>

      {/* 3. BASE INFERIOR COM AS 7 RANHURAS DA URNA */}
      <div className="mt-4 pt-3 border-t border-[#cbd5e1] relative flex items-center justify-center min-h-[16px]">
        {/* 7 Ranhuras Verticais Icônicas da Urna Eletrônica Real */}
        <div className="absolute bottom-0 inset-x-8 sm:inset-x-16 flex justify-between pointer-events-none">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-3.5 bg-[#8e96a3] rounded-t shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] border-t border-l border-gray-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
