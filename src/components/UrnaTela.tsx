import React from 'react';
import { CargoConfig, Candidato } from '../types';
import { BrasaoRepublica } from './BrasaoRepublica';

interface UrnaTelaProps {
  cargoAtual: CargoConfig;
  digitosDigitados: string[];
  candidatoSelecionado: Candidato | null;
  isVotoBranco: boolean;
  isNumeroInvalido: boolean;
  isSenadorRepetido: boolean;
  telaFim: boolean;
  gravando: boolean;
}

export const UrnaTela: React.FC<UrnaTelaProps> = ({
  cargoAtual,
  digitosDigitados,
  candidatoSelecionado,
  isVotoBranco,
  isNumeroInvalido,
  isSenadorRepetido,
  telaFim,
  gravando,
}) => {
  const totalDigitos = cargoAtual.digitos;
  const digitosPreenchidos = digitosDigitados.length;
  const todosDigitosInseridos = digitosPreenchidos === totalDigitos;

  // Tela Final "FIM"
  if (telaFim) {
    return (
      <div
        id="urna-tela-lcd"
        className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-[#dce5cf] text-[#1a2116] p-6 sm:p-8 flex flex-col items-center justify-center font-mono border-4 border-[#2b3325] shadow-[inset_0_4px_20px_rgba(0,0,0,0.35)] relative overflow-hidden select-none"
      >
        {/* Efeito scanlines LCD */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c2217_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />

        {gravando ? (
          <div className="flex flex-col items-center gap-4 animate-pulse text-center">
            <div className="text-3xl sm:text-5xl font-black tracking-widest uppercase text-[#141b10]">
              GRAVANDO...
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700">
              Criptografando Registro Digital do Voto (RDV) e acionando VRP
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center animate-pulse">
            <div className="text-8xl sm:text-9xl font-black tracking-widest text-[#141b10] drop-shadow-sm">
              FIM
            </div>
            <div className="mt-4 text-base sm:text-lg font-black tracking-widest uppercase border-t-2 border-b-2 border-[#1c2217] px-10 py-1.5 bg-[#d2dcbf]">
              VOTOU
            </div>
            <p className="mt-4 text-xs text-gray-700 uppercase tracking-wider font-semibold">
              Registro concluído com sucesso • Comprovante VRP impresso
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="urna-tela-lcd"
      className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-[#dce5cf] text-[#1a2116] p-4 sm:p-6 flex flex-col justify-between font-mono border-4 border-[#2b3325] shadow-[inset_0_4px_20px_rgba(0,0,0,0.35)] relative overflow-hidden select-none"
    >
      {/* Grade de textura LCD oficial */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c2217_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />

      {/* 1. TOPO: "SEU VOTO VAI PARA" e Cargo Atual */}
      <div className="relative z-10">
        <div className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-gray-700">
          SEU VOTO VAI PARA
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-[#12180e] border-b-2 border-[#2b3325]/40 pb-1.5 mt-0.5">
          {cargoAtual.nome}
        </h2>
      </div>

      {/* Alerta de Senador Repetido (Regra TSE) */}
      {isSenadorRepetido && (
        <div
          id="alerta-senador-repetido"
          className="relative z-20 my-1 bg-red-700 text-white p-2 rounded text-xs font-bold animate-bounce shadow-md border-2 border-red-900 text-center"
        >
          ⚠️ ATENÇÃO: CANDIDATO JÁ ESCOLHIDO PARA A 1ª VAGA!
          <span className="block text-[10px] font-normal mt-0.5">
            Aperte CORRIGE para escolher outro candidato ou vote em BRANCO/NULO.
          </span>
        </div>
      )}

      {/* =========================================================================
          2. MEIO DA TELA: FOTO DO CANDIDATO ACIMA DOS NÚMEROS DIGITADOS
          ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-2 space-y-3">
        {/* A) ACIMA DOS NÚMEROS: FOTO DO CANDIDATO (E VICE) COM DADOS OFICIAIS */}
        <div className="min-h-[130px] flex items-center justify-between gap-3 bg-[#d2dcbf]/60 p-2.5 rounded border border-[#2b3325]/25">
          {isVotoBranco ? (
            <div className="w-full py-6 text-center">
              <span className="text-2xl sm:text-3xl font-black tracking-widest uppercase animate-pulse">
                VOTO EM BRANCO
              </span>
            </div>
          ) : candidatoSelecionado ? (
            <div className="flex items-center justify-between w-full gap-3">
              {/* Informações textuais do candidato */}
              <div className="flex-1 min-w-0 space-y-1 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-700 font-bold">Nome: </span>
                  <span className="font-black text-[#12180e] text-sm sm:text-base uppercase">
                    {candidatoSelecionado.nomeUrna}
                  </span>
                </div>
                <div>
                  <span className="text-gray-700 font-bold">Partido: </span>
                  <span className="font-bold text-[#12180e] uppercase">
                    {candidatoSelecionado.siglaPartido} — {candidatoSelecionado.partido}
                  </span>
                </div>
                {candidatoSelecionado.vice && (
                  <div className="text-xs">
                    <span className="text-gray-700 font-bold">{candidatoSelecionado.vice.titulo}: </span>
                    <span className="font-bold uppercase text-[#12180e]">
                      {candidatoSelecionado.vice.nome}
                    </span>
                  </div>
                )}
                {candidatoSelecionado.suplentes && (
                  <div className="text-[10px] text-gray-800 space-y-0.5 pt-0.5">
                    <div>
                      <span className="font-bold">1º Suplente: </span>
                      <span className="uppercase">{candidatoSelecionado.suplentes.primeiro}</span>
                    </div>
                    <div>
                      <span className="font-bold">2º Suplente: </span>
                      <span className="uppercase">{candidatoSelecionado.suplentes.segundo}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Moldura da Foto do Candidato e Vice */}
              <div className="flex items-end gap-2 flex-shrink-0">
                {/* Foto do Titular */}
                <div className="bg-white p-1 border-2 border-[#1c2217] shadow text-center">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 overflow-hidden bg-gray-900">
                    <img
                      src={candidatoSelecionado.fotoUrl}
                      alt={candidatoSelecionado.nomeUrna}
                      className="w-full h-full object-cover filter grayscale contrast-125"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[9px] font-black uppercase text-gray-800 tracking-tighter mt-0.5">
                    {cargoAtual.nome.replace(' (1ª VAGA)', '').replace(' (2ª VAGA)', '')}
                  </div>
                </div>

                {/* Foto do Vice (se houver) */}
                {candidatoSelecionado.vice && (
                  <div className="bg-white p-0.5 border-2 border-[#1c2217] shadow text-center">
                    <div className="w-14 h-18 sm:w-16 sm:h-20 overflow-hidden bg-gray-900">
                      <img
                        src={candidatoSelecionado.vice.fotoUrl}
                        alt={candidatoSelecionado.vice.nome}
                        className="w-full h-full object-cover filter grayscale contrast-125"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[8px] font-black uppercase text-gray-800 tracking-tighter">
                      VICE
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isNumeroInvalido && todosDigitosInseridos ? (
            <div className="w-full py-4 text-center">
              <span className="px-2 py-0.5 bg-[#1c2217] text-[#dce5cf] text-xs font-black tracking-wider uppercase">
                NÚMERO ERRADO
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-widest text-[#151c11] mt-1.5 uppercase">
                VOTO NULO
              </div>
            </div>
          ) : (
            /* Estado de espera antes de completar o número */
            <div className="w-full flex items-center justify-between text-gray-600 px-2 py-3">
              <div className="space-y-1">
                <div className="text-xs text-gray-700">
                  Digite os <strong className="text-gray-900">{totalDigitos} dígitos</strong> do candidato
                </div>
              </div>
              <div className="w-18 h-22 sm:w-20 sm:h-24 border-2 border-dashed border-[#2b3325]/40 rounded flex flex-col items-center justify-center text-center p-1 bg-[#d5dec3]/50">
                <BrasaoRepublica size={32} monochrome />
                <span className="text-[8px] font-black text-gray-600 mt-1 uppercase">FOTO</span>
              </div>
            </div>
          )}
        </div>

        {/* B) CAMPO QUE MOSTRA OS NÚMEROS DIGITADOS (LOGO ABAIXO DA FOTO) */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs sm:text-sm font-black uppercase text-gray-800">
            Número:
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalDigitos }).map((_, index) => {
              const valor = digitosDigitados[index];
              const isAtual = index === digitosPreenchidos;
              return (
                <div
                  key={index}
                  id={`digito-box-${index}`}
                  className={`w-9 h-12 sm:w-11 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-black border-2 border-[#1c2217] bg-[#e6eed9] shadow-inner transition-all ${
                    isAtual
                      ? 'border-b-4 border-b-[#0f140d] bg-[#f0f7e4] ring-2 ring-[#2b3325]/30'
                      : ''
                  }`}
                >
                  {valor ? valor : ''}
                  {!valor && isAtual && (
                    <span className="w-4 h-1 bg-[#1c2217] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. RODAPÉ CLÁSSICO DE INSTRUÇÕES DA URNA ELETRÔNICA (Confirma, Corrige, Branco) */}
      <div className="relative z-10 border-t-2 border-[#1c2217] pt-2 text-[11px] sm:text-xs leading-relaxed">
        <div className="font-bold text-gray-800 mb-0.5">Aperte a tecla:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 font-medium">
          <div>
            <span className="font-black text-[#156e29]">CONFIRMA</span> para CONFIRMAR
          </div>
          <div>
            <span className="font-black text-[#b84807]">CORRIGE</span> para REINICIAR
          </div>
          <div>
            <span className="font-black text-gray-900">BRANCO</span> para votar em BRANCO
          </div>
        </div>
      </div>
    </div>
  );
};
