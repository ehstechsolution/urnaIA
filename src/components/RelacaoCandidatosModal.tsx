import React, { useState, useMemo } from 'react';
import { X, Search, Users, Vote, Check, Shield, Database, CloudCheck, RefreshCw } from 'lucide-react';
import { CANDIDATOS_BASE, ORDEM_CARGOS } from '../data/candidatos';
import { Candidato, CargoTipo } from '../types';
import { semearCandidatosFirestore } from '../firebase';

interface RelacaoCandidatosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoAtualId: CargoTipo;
  onSelecionarCandidato: (candidato: Candidato) => void;
  candidatos?: Candidato[];
}

export const RelacaoCandidatosModal: React.FC<RelacaoCandidatosModalProps> = ({
  isOpen,
  onClose,
  cargoAtualId,
  onSelecionarCandidato,
  candidatos = CANDIDATOS_BASE,
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCargo, setFiltroCargo] = useState<string>('todos');
  const [sincronizandoFirebase, setSincronizandoFirebase] = useState(false);
  const [syncSucesso, setSyncSucesso] = useState(false);

  const handleSincronizarFirebase = async () => {
    setSincronizandoFirebase(true);
    setSyncSucesso(false);
    const res = await semearCandidatosFirestore(CANDIDATOS_BASE);
    setSincronizandoFirebase(false);
    if (res.sucesso) {
      setSyncSucesso(true);
      setTimeout(() => setSyncSucesso(false), 4000);
    }
  };

  // Mapeamento de rótulos dos cargos
  const getCargoNome = (cargo: CargoTipo) => {
    switch (cargo) {
      case 'deputado-federal':
        return 'Deputado Federal';
      case 'deputado-estadual':
        return 'Deputado Estadual';
      case 'senador-1':
      case 'senador-2':
        return 'Senador';
      case 'governador':
        return 'Governador';
      case 'presidente':
        return 'Presidente da República';
      default:
        return cargo;
    }
  };

  // Candidatos filtrados por texto e cargo
  const candidatosFiltrados = useMemo(() => {
    return candidatos.filter((c) => {
      // Filtro por cargo
      if (filtroCargo !== 'todos') {
        if (filtroCargo === 'senador') {
          if (c.cargo !== 'senador-1' && c.cargo !== 'senador-2') return false;
        } else if (c.cargo !== filtroCargo) {
          return false;
        }
      }

      // Filtro por busca de texto
      if (termoBusca.trim() !== '') {
        const busca = termoBusca.toLowerCase();
        const bateNome = c.nome.toLowerCase().includes(busca);
        const bateNomeUrna = c.nomeUrna.toLowerCase().includes(busca);
        const bateNumero = c.numero.includes(busca);
        const batePartido = c.partido.toLowerCase().includes(busca);
        const bateSigla = c.siglaPartido.toLowerCase().includes(busca);
        const bateVice = c.vice?.nome.toLowerCase().includes(busca) || false;
        return bateNome || bateNomeUrna || bateNumero || batePartido || bateSigla || bateVice;
      }

      return true;
    });
  }, [filtroCargo, termoBusca]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-relacao-candidatos"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#1e232c] border-2 border-gray-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 bg-[#171a21] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Relação Oficial de Candidatos
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  {CANDIDATOS_BASE.length} Registrados
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Guia eleitoral completo para consulta e teste de votação na Urna Eletrônica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-sync-firebase-candidatos"
              onClick={handleSincronizarFirebase}
              disabled={sincronizandoFirebase}
              title="Salvar/Atualizar todos os candidatos diretamente no Firestore (urna-ia)"
              className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {sincronizandoFirebase ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando no Firestore...</span>
                </>
              ) : syncSucesso ? (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Salvo no Firestore!</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sincronizar no Firestore</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-fechar-relacao"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#252b36] hover:bg-[#323946] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="p-3 sm:p-4 bg-[#1b1e26] border-b border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Campo de Busca */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar por nome, número ou partido..."
                className="w-full pl-9 pr-3 py-2 bg-[#262b35] border border-gray-700 rounded-lg text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Aviso sobre cargo ativo na urna */}
            <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 self-start sm:self-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Votação atual da Urna: <strong className="text-amber-300">{getCargoNome(cargoAtualId)}</strong>
              </span>
            </div>
          </div>

          {/* Abas / Filtros de Cargos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'todos', label: 'Todos os Cargos' },
              { id: 'deputado-federal', label: 'Dep. Federal (4 dígitos)' },
              { id: 'deputado-estadual', label: 'Dep. Estadual (5 dígitos)' },
              { id: 'senador', label: 'Senador (3 dígitos)' },
              { id: 'governador', label: 'Governador (2 dígitos)' },
              { id: 'presidente', label: 'Presidente (2 dígitos)' },
            ].map((filtro) => {
              const ativo = filtroCargo === filtro.id;
              return (
                <button
                  key={filtro.id}
                  type="button"
                  onClick={() => setFiltroCargo(filtro.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                    ativo
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'bg-[#252b36] text-gray-300 hover:bg-[#323946] border border-gray-700/80'
                  }`}
                >
                  {filtro.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista / Grade de Candidatos */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {candidatosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-sm font-bold">Nenhum candidato encontrado com estes critérios.</p>
              <p className="text-xs text-gray-400 mt-1">Tente ajustar o termo de pesquisa ou trocar de cargo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {candidatosFiltrados.map((c) => {
                const compatibilidadeDireta =
                  c.cargo === cargoAtualId ||
                  ((cargoAtualId === 'senador-1' || cargoAtualId === 'senador-2') &&
                    (c.cargo === 'senador-1' || c.cargo === 'senador-2'));

                return (
                  <div
                    key={`${c.cargo}-${c.numero}`}
                    className={`bg-[#262c38] border rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:border-amber-500/80 shadow-md ${
                      compatibilidadeDireta ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-gray-700/80'
                    }`}
                  >
                    <div>
                      {/* Topo do Card: Badge do Cargo e Número */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#171a21] text-gray-300 border border-gray-700">
                          {getCargoNome(c.cargo)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 tracking-wider">
                            {c.numero}
                          </span>
                        </div>
                      </div>

                      {/* Dados Centrais: Foto e Identificação */}
                      <div className="flex items-start gap-3">
                        <div className="relative w-16 h-20 rounded-md overflow-hidden bg-gray-900 border border-gray-700 flex-shrink-0 shadow">
                          <img
                            src={c.fotoUrl}
                            alt={c.nomeUrna}
                            className="w-full h-full object-cover filter grayscale contrast-125"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-white uppercase leading-tight truncate">
                            {c.nomeUrna}
                          </h4>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5" title={c.nome}>
                            {c.nome}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono font-bold text-[10px] border border-amber-800/80">
                              {c.siglaPartido}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate" title={c.partido}>
                              {c.partido}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vice ou Suplentes */}
                      {c.vice && (
                        <div className="mt-2.5 pt-2 border-t border-gray-700/70 flex items-center gap-2 text-[11px] text-gray-300">
                          <img
                            src={c.vice.fotoUrl}
                            alt={c.vice.nome}
                            className="w-6 h-7 rounded object-cover filter grayscale"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <span className="text-gray-500 font-bold">{c.vice.titulo}: </span>
                            <span className="font-semibold">{c.vice.nome}</span>
                          </div>
                        </div>
                      )}

                      {c.suplentes && (
                        <div className="mt-2 pt-1.5 border-t border-gray-700/70 text-[10px] text-gray-400 space-y-0.5">
                          <div className="truncate">
                            <span className="text-gray-500">1º Suplente:</span> {c.suplentes.primeiro}
                          </div>
                          <div className="truncate">
                            <span className="text-gray-500">2º Suplente:</span> {c.suplentes.segundo}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botão de Ação para Teste */}
                    <div className="mt-3 pt-2.5 border-t border-gray-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {c.numero.length} dígitos
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelecionarCandidato(c);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          compatibilidadeDireta
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            : 'bg-[#1b1f28] hover:bg-[#323946] text-amber-300 border border-gray-700'
                        }`}
                      >
                        <Vote className="w-3.5 h-3.5" />
                        {compatibilidadeDireta ? 'Votar na Urna' : 'Selecionar Número'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 sm:p-4 bg-[#171a21] border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div>
            Total de <strong>{candidatosFiltrados.length}</strong> candidato(s) exibido(s).
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#262c38] hover:bg-[#343b49] text-gray-200 font-bold transition"
          >
            Fechar Relação
          </button>
        </div>
      </div>
    </div>
  );
};
