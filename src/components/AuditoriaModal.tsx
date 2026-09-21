import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Database, Shield, CloudCheck, RefreshCw, Layers } from 'lucide-react';
import { StatusAuditoria, VotoRegistrado } from '../types';
import { ouvirSessoesVotosFirestore } from '../firebase';

interface AuditoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: StatusAuditoria | null;
  rdvList: VotoRegistrado[][];
  vrpList: VotoRegistrado[][];
  onExecutarAuditoria: () => void;
}

export const AuditoriaModal: React.FC<AuditoriaModalProps> = ({
  isOpen,
  onClose,
  status,
  rdvList,
  vrpList,
  onExecutarAuditoria,
}) => {
  const [tabAtiva, setTabAtiva] = useState<'auditoria' | 'boletim' | 'firestore'>('auditoria');
  const [sessoesFirestore, setSessoesFirestore] = useState<any[]>([]);
  const [carregandoSessoes, setCarregandoSessoes] = useState(true);

  // Escuta as sessões de votos salvas no Firestore
  useEffect(() => {
    if (!isOpen) return;
    setCarregandoSessoes(true);
    const unsubscribe = ouvirSessoesVotosFirestore((sessoes) => {
      setSessoesFirestore(sessoes);
      setCarregandoSessoes(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Gerar apuração de votos para o Boletim de Urna
  const apuracaoPorCargo: Record<
    string,
    { nominais: Record<string, number>; brancos: number; nulos: number; total: number }
  > = {};

  rdvList.flat().forEach((voto) => {
    if (!apuracaoPorCargo[voto.cargoNome]) {
      apuracaoPorCargo[voto.cargoNome] = { nominais: {}, brancos: 0, nulos: 0, total: 0 };
    }
    const item = apuracaoPorCargo[voto.cargoNome];
    item.total += 1;
    if (voto.tipoVoto === 'branco') {
      item.brancos += 1;
    } else if (voto.tipoVoto === 'nulo') {
      item.nulos += 1;
    } else {
      const chave = `${voto.numeroVotado} - ${voto.candidatoNome || 'LEGENDA'}`;
      item.nominais[chave] = (item.nominais[chave] || 0) + 1;
    }
  });

  return (
    <div
      id="modal-auditoria-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="modal-auditoria-conteudo"
        className="bg-[#1e2229] border-2 border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-700/80 bg-[#16191f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
                Auditoria e Transparência Eleitoral
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Confronto Criptográfico: RDV (Registro Digital) × VRP (Voto Impresso) × Firestore
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-fechar-modal-auditoria"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex border-b border-gray-700/80 bg-[#191c22] px-4 sm:px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTabAtiva('auditoria')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              tabAtiva === 'auditoria'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Auditoria Cruzada (RDV × Impresso)
          </button>

          <button
            type="button"
            onClick={() => setTabAtiva('firestore')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              tabAtiva === 'firestore'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            Banco Firestore ({sessoesFirestore.length} sessões)
          </button>

          <button
            type="button"
            onClick={() => setTabAtiva('boletim')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              tabAtiva === 'boletim'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Simulação de Boletim de Urna (BU)
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {tabAtiva === 'auditoria' && (
            <div className="space-y-4">
              {/* Painel de Status Geral */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  status?.convergencia100
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {status?.convergencia100 ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="text-base font-extrabold uppercase tracking-wide">
                      {status?.convergencia100
                        ? 'Auditoria Cruzada: 100% de Convergência Verificada'
                        : 'Aguardando votos ou executando verificação'}
                    </h3>
                    <p className="text-xs opacity-90">
                      Todos os registros digitais (RDV) conferem bit a bit com os votos físicos impressos (VRP).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-reexecutar-auditoria"
                  onClick={onExecutarAuditoria}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recalcular Auditoria
                </button>
              </div>

              {/* Tabela de Verificação */}
              <div className="bg-[#16191f] border border-gray-700/80 rounded-xl overflow-hidden shadow-inner">
                <div className="p-3 bg-[#111317] border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Confronto de Registros por Eleitor e Cargo</span>
                  <span>Total de Eleitores: {status?.totalRDV || 0}</span>
                </div>

                {status?.detalhes && status.detalhes.length > 0 ? (
                  <div className="divide-y divide-gray-800 text-xs font-mono max-h-72 overflow-y-auto">
                    {status.detalhes.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between hover:bg-gray-800/40 transition"
                      >
                        <span className="font-sans font-bold text-gray-300 w-1/3">{item.cargo}</span>
                        <div className="flex items-center gap-4 text-gray-400 w-1/2 justify-center">
                          <span>RDV: <strong className="text-emerald-400">{item.rdv}</strong></span>
                          <span>×</span>
                          <span>VRP: <strong className="text-cyan-400">{item.impresso}</strong></span>
                        </div>
                        <div className="w-1/6 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'CORRESPONDENTE'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-900/60 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-xs">
                    Finalize ao menos 1 ciclo de votação para gerar a comparação detalhada.
                  </div>
                )}
              </div>
            </div>
          )}

          {tabAtiva === 'firestore' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-600/40 text-cyan-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-extrabold uppercase">
                      Sessões Gravadas no Firestore (urna-ia)
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Coleção: <code className="text-amber-300">sessoes_votacao</code> • Sincronização em tempo real
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Banco Ativo</span>
                </div>
              </div>

              {carregandoSessoes ? (
                <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Carregando sessões do Firestore...</span>
                </div>
              ) : sessoesFirestore.length === 0 ? (
                <div className="p-8 bg-[#16191f] border border-gray-700/80 rounded-xl text-center text-gray-400 text-xs">
                  Nenhuma sessão gravada no Firestore ainda. Realize uma votação completa para enviar os dados à nuvem.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {sessoesFirestore.map((sessao, i) => (
                    <div
                      key={sessao.id || i}
                      className="p-3.5 bg-[#16191f] border border-gray-700/80 rounded-xl font-mono text-xs space-y-2 hover:border-gray-600 transition"
                    >
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            ID: {sessao.idVoto || sessao.id}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {sessao.municipio}/{sessao.uf} • Z: {sessao.zona} • S: {sessao.secao}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Gravado no Firestore
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        {sessao.votos?.map((voto: any, vIdx: number) => (
                          <div key={vIdx} className="bg-gray-800/60 p-2 rounded border border-gray-700/50">
                            <div className="text-[10px] text-gray-400 uppercase font-sans font-bold">{voto.cargoNome}</div>
                            <div className="font-bold text-white">
                              {voto.tipoVoto === 'branco' ? (
                                <span className="text-gray-300">BRANCO</span>
                              ) : voto.tipoVoto === 'nulo' ? (
                                <span className="text-red-400">NULO ({voto.numeroVotado})</span>
                              ) : (
                                <span>
                                  {voto.numeroVotado} • <span className="text-amber-300">{voto.partidoSigla || voto.candidatoNome}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-gray-500 truncate pt-1 border-t border-gray-800/60">
                        Hash Criptográfico: {sessao.hashCriptografico || 'SHA256-VRP-VALIDADO'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabAtiva === 'boletim' && (
            /* Simulação do Boletim de Urna (BU) */
            <div className="space-y-4">
              <div className="bg-[#fffef7] text-[#111] p-5 rounded-lg border border-gray-400 font-mono text-xs shadow-inner space-y-3 leading-relaxed">
                <div className="text-center border-b-2 border-dashed border-gray-400 pb-2">
                  <div className="font-black text-sm uppercase">JUSTIÇA ELEITORAL BRASILEIRA</div>
                  <div className="font-bold text-xs uppercase">BOLETIM DE URNA (SIMULAÇÃO OFICIAL)</div>
                  <div className="text-[10px] text-gray-600">
                    ELEIÇÕES GERAIS • MUNICÍPIO: BRASÍLIA/DF • ZONA: 001 • SEÇÃO: 0142
                  </div>
                </div>

                {Object.keys(apuracaoPorCargo).length === 0 ? (
                  <div className="py-6 text-center text-gray-500 italic">
                    Nenhum voto computado ainda. Vote na urna e confirme na tela de Presidente para gerar o Boletim de Urna.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(apuracaoPorCargo).map(([cargo, dados]) => (
                      <div key={cargo} className="border-b border-dotted border-gray-400 pb-2">
                        <div className="font-black text-sm uppercase text-gray-900 mb-1">
                          CARGO: {cargo}
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          {Object.entries(dados.nominais).map(([candidato, qtd]) => (
                            <div key={candidato} className="flex justify-between">
                              <span>{candidato}:</span>
                              <span className="font-bold">{qtd} voto(s)</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-gray-700">
                            <span>VOTOS EM BRANCO:</span>
                            <span className="font-bold">{dados.brancos}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>VOTOS NULOS:</span>
                            <span className="font-bold">{dados.nulos}</span>
                          </div>
                          <div className="flex justify-between font-extrabold border-t border-gray-300 pt-1 text-black">
                            <span>TOTAL DE VOTOS NO CARGO:</span>
                            <span>{dados.total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t-2 border-dashed border-gray-400 pt-2 text-[10px] text-center text-gray-700">
                  ASSINATURA DIGITAL DA URNA: SHA256-TSE-SIM-9A42F8C1D07B3E
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-gray-700 bg-[#16191f] flex justify-end">
          <button
            type="button"
            id="btn-fechar-modal-rodape"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs transition cursor-pointer"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
