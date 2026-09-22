import React from 'react';
import { ShieldCheck, Lock, Scissors, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { VotoRegistrado, RegistroAuditoriaVRP } from '../types';

interface ModuloVRPProps {
  votosSessao: VotoRegistrado[];
  registroFinalizado: RegistroAuditoriaVRP | null;
  animarCortePapel: boolean;
  totalCedulasDepositadas: number;
  onAuditoriaCruzada: () => void;
  onAbrirBoletim: () => void;
}

export const ModuloVRP: React.FC<ModuloVRPProps> = ({
  votosSessao,
  registroFinalizado,
  animarCortePapel,
  totalCedulasDepositadas,
  onAuditoriaCruzada,
  onAbrirBoletim,
}) => {
  return (
    <div
      id="modulo-vrp-container"
      className="bg-[#242830] p-4 sm:p-5 rounded-xl border-4 border-[#181a1f] shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between max-w-sm mx-auto w-full select-none relative"
    >
      {/* Cabeçalho do Módulo VRP */}
      <div className="border-b border-gray-700/80 pb-2.5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-gray-200 uppercase tracking-wider leading-none">
              MÓDULO VRP
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">
              Voto Registrado em Papel (Auditável)
            </span>
          </div>
        </div>

        {/* Status de Alimentação do Papel */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#16181d] border border-gray-700 text-[10px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </div>
      </div>

      {/* Visor de Vidro / Acrílico com a Fita Térmica */}
      <div className="relative rounded-lg p-3 bg-gradient-to-b from-[#111317] via-[#1a1d24] to-[#111317] border-2 border-gray-600 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] min-h-[360px] flex flex-col overflow-hidden">
        {/* Reflexo de Vidro Acrílico */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
        <div className="absolute top-1 right-2 text-[9px] text-gray-500 font-mono tracking-widest uppercase z-10">
          VISOR ACRÍLICO SELADO
        </div>

        {/* Linha de Guilhotina / Cortador */}
        <div className="w-full flex items-center justify-between border-b-2 border-dashed border-red-500/50 pb-1 mb-2 text-[9px] text-red-400/80 font-mono">
          <span className="flex items-center gap-1">
            <Scissors className="w-3 h-3" /> LINHA DE CORTE AUTOMÁTICO
          </span>
          <span>SERRILHA TSE</span>
        </div>

        {/* Papel Térmico (Cupom Eleitoral) */}
        <div
          id="fita-papel-termico"
          className={`bg-[#fffff0] text-[#111] p-3.5 rounded-sm shadow-md font-mono text-xs transition-all duration-700 ease-in-out border-l-2 border-r-2 border-gray-300 relative ${
            animarCortePapel
              ? 'translate-y-48 opacity-0 rotate-1 scale-95'
              : 'translate-y-0 opacity-100'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(#d5d5d5 0.75px, transparent 0.75px)',
            backgroundSize: '8px 8px',
          }}
        >
          {/* Cabeçalho do Cupom Oficial */}
          <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
            <div className="text-[10px] font-bold tracking-tight text-gray-700 uppercase">
              República Federativa do Brasil
            </div>
            <div className="text-xs font-black tracking-wider text-black uppercase">
              COMPROVANTE DE VOTAÇÃO (VRP)
            </div>
            <div className="text-[9px] text-gray-600">
              ELEIÇÕES GERAIS • NÃO IDENTIFICA O ELEITOR
            </div>
          </div>

          {/* Votos Registrados Sequencialmente na Fita */}
          {votosSessao.length === 0 ? (
            <div className="py-8 text-center text-gray-400 italic text-[11px]">
              Aguardando confirmação do 1º voto na urna...
            </div>
          ) : (
            <div className="space-y-2 py-1">
              {votosSessao.map((voto, idx) => (
                <div
                  key={idx}
                  className="border-b border-dotted border-gray-300 pb-1.5"
                >
                  <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase">
                    <span>{voto.cargoNome}</span>
                    <span>#{idx + 1}</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <span className="font-extrabold text-sm text-black">
                      {voto.tipoVoto === 'branco'
                        ? 'VOTO EM BRANCO'
                        : voto.tipoVoto === 'nulo'
                        ? 'VOTO NULO'
                        : `Nº ${voto.numeroVotado}`}
                    </span>
                    {voto.partidoSigla && (
                      <span className="text-[11px] font-bold text-gray-800">
                        {voto.partidoSigla}
                      </span>
                    )}
                  </div>
                  {voto.candidatoNome && (
                    <div className="text-[10px] font-semibold text-gray-900 uppercase truncate">
                      {voto.candidatoNome}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rodapé do VRP com Dados de Auditoria e Hash */}
          {!registroFinalizado && votosSessao.length > 0 && (
            <div className="mt-2 pt-2 border-t border-dashed border-gray-400 text-[9px] text-center text-emerald-800 font-mono font-bold bg-emerald-100/70 p-1.5 rounded">
              • IMPRESSÃO EM PROGRESSO • CONFERÊNCIA VISUAL DO ELEITOR
            </div>
          )}

          {registroFinalizado && (
            <div className="mt-2 pt-2 border-t-2 border-dashed border-gray-400 text-[9px] leading-tight space-y-1">
              <div className="flex justify-between text-gray-700">
                <span>MUNICÍPIO: {registroFinalizado.municipio}</span>
                <span>UF: {registroFinalizado.uf}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>ZONA: {registroFinalizado.zona}</span>
                <span>SEÇÃO: {registroFinalizado.secao}</span>
              </div>
              <div className="text-gray-700 font-mono">
                DATA/HORA: {registroFinalizado.timestamp}
              </div>
              <div className="bg-gray-200 p-1 rounded font-mono text-[9px] font-bold text-center border border-gray-300 break-all text-gray-900">
                HASH: {registroFinalizado.hashCriptografico}
              </div>
              <div className="text-[8px] text-center text-gray-500 font-bold uppercase tracking-wider pt-0.5">
                AUTENTICADO DIGITALMENTE PELO TSE
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compartimento Físico / Urna de Depósito Lacrada */}
      <div className="mt-3 bg-[#17191e] p-3 rounded-lg border-2 border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-950/60 border border-red-700/60 text-red-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-200 uppercase tracking-tight">
              Urna de Depósito Físico
            </div>
            <div className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Lacre nº 89412-TSE • Lacrado
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-black text-amber-400 font-mono">
            {totalCedulasDepositadas}
          </div>
          <div className="text-[9px] text-gray-400 uppercase">Cédulas</div>
        </div>
      </div>

      {/* Ações de Auditoria e Transparência */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-700">
        <button
          type="button"
          id="btn-auditoria-cruzada"
          onClick={onAuditoriaCruzada}
          className="px-2.5 py-2 rounded bg-[#2b333f] hover:bg-[#394354] text-xs font-bold text-gray-200 border border-gray-600 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Auditar RDV × VRP</span>
        </button>

        <button
          type="button"
          id="btn-ver-boletim"
          onClick={onAbrirBoletim}
          className="px-2.5 py-2 rounded bg-[#2b333f] hover:bg-[#394354] text-xs font-bold text-gray-200 border border-gray-600 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Boletim de Urna</span>
        </button>
      </div>
    </div>
  );
};
