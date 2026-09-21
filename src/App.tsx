import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ORDEM_CARGOS, CANDIDATOS_BASE } from './data/candidatos';
import { CargoConfig, Candidato, VotoRegistrado, RegistroAuditoriaVRP, StatusAuditoria } from './types';
import { UrnaTerminalGabinete } from './components/UrnaTerminalGabinete';
import { ModuloVRP } from './components/ModuloVRP';
import { AuditoriaModal } from './components/AuditoriaModal';
import { urnaAudio } from './utils/audio';
import { RelacaoCandidatosModal } from './components/RelacaoCandidatosModal';
import { RotateCcw, ShieldCheck, Printer, Users, X, CloudCheck, CheckCircle2, Database, Wifi } from 'lucide-react';
import {
  salvarVotoFirebase,
  semearCandidatosFirestore,
  ouvirCandidatosFirestore,
  buscarCandidatoDiretoFirestore,
} from './firebase';

// Declarar globais para auditoria no console conforme especificação técnica
declare global {
  interface Window {
    RDV: VotoRegistrado[][];
    VotosImpressos: VotoRegistrado[][];
    realizarAuditoriaCruzada: () => StatusAuditoria;
  }
}

// Inicializa arrays paralelos em memória
if (typeof window !== 'undefined') {
  window.RDV = window.RDV || [];
  window.VotosImpressos = window.VotosImpressos || [];
}

export default function App() {
  const [etapaIndex, setEtapaIndex] = useState<number>(0);
  const [digitosDigitados, setDigitosDigitados] = useState<string[]>([]);
  const [isVotoBranco, setIsVotoBranco] = useState<boolean>(false);
  const [isSenadorRepetido, setIsSenadorRepetido] = useState<boolean>(false);

  // Número votado no Senador 1 (para checar repetição na 2ª vaga)
  const [numeroSenador1, setNumeroSenador1] = useState<string | null>(null);

  // Votos da sessão corrente do eleitor
  const [votosSessao, setVotosSessao] = useState<VotoRegistrado[]>([]);
  const [registroFinalizado, setRegistroFinalizado] = useState<RegistroAuditoriaVRP | null>(null);

  // Estados de animação e tela
  const [telaFim, setTelaFim] = useState<boolean>(false);
  const [gravando, setGravando] = useState<boolean>(false);
  const [animarCortePapel, setAnimarCortePapel] = useState<boolean>(false);
  const [totalCedulasDepositadas, setTotalCedulasDepositadas] = useState<number>(0);

  // Sons e Modais
  const [somAtivo, setSomAtivo] = useState<boolean>(true);
  const [modalAuditoriaAberto, setModalAuditoriaAberto] = useState<boolean>(false);
  const [modalRelacaoAberto, setModalRelacaoAberto] = useState<boolean>(false);
  const [modalVrpAberto, setModalVrpAberto] = useState<boolean>(false);
  const [statusAuditoria, setStatusAuditoria] = useState<StatusAuditoria | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<'idle' | 'salvando' | 'sucesso' | 'erro'>('idle');
  const [firebaseDocId, setFirebaseDocId] = useState<string | null>(null);
  const [candidatosBanco, setCandidatosBanco] = useState<Candidato[]>(CANDIDATOS_BASE);
  const [dbSincronizado, setDbSincronizado] = useState<boolean>(true);
  const [candidatoBuscadoDireto, setCandidatoBuscadoDireto] = useState<Candidato | null>(null);

  // Escuta em tempo real a coleção de candidatos no Firestore
  useEffect(() => {
    const unsubscribe = ouvirCandidatosFirestore((novosCandidatos) => {
      setCandidatosBanco(novosCandidatos);
      setDbSincronizado(true);
      console.log(`[FIREBASE] ${novosCandidatos.length} candidatos sincronizados em tempo real com o Firestore.`);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const cargoAtual: CargoConfig = ORDEM_CARGOS[etapaIndex] || ORDEM_CARGOS[0];
  const numeroDigitado = digitosDigitados.join('');

  // Identifica candidato correspondente no banco de dados sincronizado em tempo real
  const candidatoSelecionado: Candidato | null = useMemo(() => {
    if (numeroDigitado.length !== cargoAtual.digitos) {
      return null;
    }

    // Busca na base sincronizada do Firestore
    const encontrado = candidatosBanco.find((c) => {
      const matchCargo =
        cargoAtual.id === 'senador-1' || cargoAtual.id === 'senador-2'
          ? c.cargo === 'senador-1' || c.cargo === 'senador-2'
          : c.cargo === cargoAtual.id;
      return matchCargo && String(c.numero) === String(numeroDigitado);
    });

    if (encontrado) return encontrado;
    if (candidatoBuscadoDireto && String(candidatoBuscadoDireto.numero) === String(numeroDigitado)) {
      return candidatoBuscadoDireto;
    }

    return null;
  }, [candidatosBanco, cargoAtual.id, cargoAtual.digitos, numeroDigitado, candidatoBuscadoDireto]);

  // Consulta assíncrona direta ao Firestore caso não esteja no cache em memória
  useEffect(() => {
    let cancelado = false;
    if (numeroDigitado.length === cargoAtual.digitos && !candidatoSelecionado) {
      buscarCandidatoDiretoFirestore(cargoAtual.id, numeroDigitado).then((cand) => {
        if (!cancelado && cand) {
          setCandidatoBuscadoDireto(cand);
        }
      });
    } else {
      setCandidatoBuscadoDireto(null);
    }
    return () => {
      cancelado = true;
    };
  }, [numeroDigitado, cargoAtual.id, cargoAtual.digitos, candidatoSelecionado]);

  const isNumeroInvalido =
    digitosDigitados.length === cargoAtual.digitos && !candidatoSelecionado && !isVotoBranco;

  // Selecionar candidato através do Modal de Relação Oficial de Candidatos
  const handleSelecionarCandidatoModal = (candidato: Candidato) => {
    if (telaFim || gravando) return;

    // Se o candidato pertencer a outro cargo, sincroniza a etapa
    const cargoIdx = ORDEM_CARGOS.findIndex((c) => {
      if (c.id === 'senador-1' || c.id === 'senador-2') {
        return candidato.cargo === 'senador-1' || candidato.cargo === 'senador-2';
      }
      return c.id === candidato.cargo;
    });

    if (cargoIdx !== -1 && cargoIdx !== etapaIndex) {
      setEtapaIndex(cargoIdx);
    }

    setIsVotoBranco(false);
    setDigitosDigitados(candidato.numero.split(''));
    urnaAudio.playKeyBeep();

    if (
      (cargoAtual.id === 'senador-2' || (cargoIdx !== -1 && ORDEM_CARGOS[cargoIdx].id === 'senador-2')) &&
      candidato.numero === numeroSenador1
    ) {
      setIsSenadorRepetido(true);
      urnaAudio.playAlert();
    } else {
      setIsSenadorRepetido(false);
    }
  };

  // Função para gerar hash criptográfico fictício de 16 caracteres
  const gerarHash = (): string => {
    const chars = '0123456789ABCDEF';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
      if ((i + 1) % 4 === 0 && i !== 15) res += '-';
    }
    return res;
  };

  // Função Global de Auditoria Cruzada
  const executarAuditoriaCruzada = useCallback((): StatusAuditoria => {
    const rdv = window.RDV || [];
    const impressos = window.VotosImpressos || [];

    let discrepancias = 0;
    const detalhes: StatusAuditoria['detalhes'] = [];

    const totalSessoes = Math.max(rdv.length, impressos.length);

    for (let s = 0; s < totalSessoes; s++) {
      const sessaoRDV = rdv[s] || [];
      const sessaoVRP = impressos[s] || [];

      for (let c = 0; c < ORDEM_CARGOS.length; c++) {
        const vr = sessaoRDV[c];
        const vi = sessaoVRP[c];
        const cargoNome = ORDEM_CARGOS[c].nome;

        const strRDV = vr ? `${vr.tipoVoto.toUpperCase()}:${vr.numeroVotado}` : 'NULO/AUSENTE';
        const strVRP = vi ? `${vi.tipoVoto.toUpperCase()}:${vi.numeroVotado}` : 'NULO/AUSENTE';

        const match = strRDV === strVRP;
        if (!match) discrepancias++;

        detalhes.push({
          cargo: `${cargoNome} (Eleitor #${s + 1})`,
          rdv: strRDV,
          impresso: strVRP,
          status: match ? 'CORRESPONDENTE' : 'DIVERGENTE',
        });
      }
    }

    const resultado: StatusAuditoria = {
      totalRDV: rdv.length,
      totalImpressos: impressos.length,
      discrepancias,
      convergencia100: discrepancias === 0 && totalSessoes > 0,
      detalhes,
      hashRDV: 'SHA256-RDV-' + (rdv.length > 0 ? 'CONFORME-INTEGRO' : 'VAZIO'),
      hashVRP: 'SHA256-VRP-' + (impressos.length > 0 ? 'CONFORME-INTEGRO' : 'VAZIO'),
      dataHora: new Date().toLocaleTimeString('pt-BR'),
    };

    console.group('%c=== AUDITORIA CRUZADA: RDV × VOTO IMPRESSO (VRP) ===', 'color:#10b981;font-weight:bold;font-size:14px;');
    console.log(`Total de Eleitores Processados: ${totalSessoes}`);
    console.log(`Discrepâncias Encontradas: ${discrepancias}`);
    if (resultado.convergencia100) {
      console.log('%cSUCESSO: Auditoria bateu 100% de convergência! Nenhuma divergência detectada.', 'color:#10b981;font-weight:bold;');
    } else if (totalSessoes === 0) {
      console.log('%cAviso: Nenhum eleitor concluiu a votação ainda.', 'color:#f59e0b;');
    } else {
      console.warn('%cALERTA: Foram encontradas divergências na checagem!', 'color:#ef4444;font-weight:bold;');
    }
    console.table(detalhes);
    console.groupEnd();

    setStatusAuditoria(resultado);
    return resultado;
  }, []);

  // Registrar função no objeto window
  useEffect(() => {
    window.realizarAuditoriaCruzada = executarAuditoriaCruzada;
  }, [executarAuditoriaCruzada]);

  // Impressão do Boletim de Urna no Console do Navegador
  const imprimirBoletimNoConsole = (votos: VotoRegistrado[]) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    console.group('%c=====================================================', 'color:#3b82f6;');
    console.log('%c       JUSTIÇA ELEITORAL - BOLETIM DE URNA (BU)      ', 'color:#3b82f6;font-weight:bold;font-size:14px;');
    console.log('%c=====================================================', 'color:#3b82f6;');
    console.log(`MUNICÍPIO: BRASÍLIA/DF | ZONA: 001 | SEÇÃO: 0142`);
    console.log(`DATA/HORA EMISSÃO: ${dataHora}`);
    console.log(`URNA ELETRÔNICA MODELO: UE2026-TSE | SÉRIE: 89412-A`);
    console.log('-----------------------------------------------------');
    votos.forEach((v) => {
      console.log(
        `CARGO: ${v.cargoNome.padEnd(26)} | VOTO: ${v.tipoVoto.toUpperCase().padEnd(8)} | Nº: ${v.numeroVotado.padEnd(6)} | CANDIDATO: ${v.candidatoNome || 'N/A'}`
      );
    });
    console.log('-----------------------------------------------------');
    console.log('%cSTATUS: VOTO AUDITADO E GRAVADO NO RDV E VRP COM SUCESSO', 'color:#10b981;font-weight:bold;');
    console.groupEnd();
  };

  // Teclado: Digitação de número
  const handleDigito = (digito: string) => {
    if (telaFim || gravando) return;
    if (isVotoBranco) {
      setIsVotoBranco(false);
    }

    if (digitosDigitados.length < cargoAtual.digitos) {
      const novosDigitos = [...digitosDigitados, digito];
      setDigitosDigitados(novosDigitos);
      setIsSenadorRepetido(false);

      // Se for a 2ª vaga de Senador e digitou todos os dígitos, valida se é repetido
      if (cargoAtual.id === 'senador-2' && novosDigitos.length === cargoAtual.digitos) {
        const num = novosDigitos.join('');
        if (num === numeroSenador1) {
          setIsSenadorRepetido(true);
          urnaAudio.playAlert();
        }
      }
    }
  };

  // Teclado: Botão BRANCO
  const handleBranco = () => {
    if (telaFim || gravando) return;
    setDigitosDigitados([]);
    setIsVotoBranco(true);
    setIsSenadorRepetido(false);
  };

  // Teclado: Botão CORRIGE
  const handleCorrige = () => {
    if (telaFim) {
      reiniciarNovoEleitor();
      return;
    }
    if (gravando) return;

    setDigitosDigitados([]);
    setIsVotoBranco(false);
    setIsSenadorRepetido(false);
  };

  // Teclado: Botão CONFIRMA
  const handleConfirma = () => {
    if (telaFim) {
      reiniciarNovoEleitor();
      return;
    }
    if (gravando) return;

    // Regra: Não pode confirmar incompleto a não ser que seja BRANCO
    if (!isVotoBranco && digitosDigitados.length < cargoAtual.digitos) {
      urnaAudio.playAlert();
      return;
    }

    // Regra do TSE: Senador 2ª Vaga não pode ser idêntico ao Senador 1ª Vaga
    if (cargoAtual.id === 'senador-2' && !isVotoBranco && numeroDigitado === numeroSenador1) {
      setIsSenadorRepetido(true);
      urnaAudio.playAlert();
      return;
    }

    // Monta objeto do voto confirmado
    let tipoVoto: VotoRegistrado['tipoVoto'] = 'nominal';
    let nomeCandidato = candidatoSelecionado?.nomeUrna;
    let siglaPartido = candidatoSelecionado?.siglaPartido;

    if (isVotoBranco) {
      tipoVoto = 'branco';
      nomeCandidato = 'VOTO EM BRANCO';
      siglaPartido = '';
    } else if (!candidatoSelecionado) {
      tipoVoto = 'nulo';
      nomeCandidato = 'VOTO NULO';
      siglaPartido = '';
    }

    const novoVoto: VotoRegistrado = {
      cargoId: cargoAtual.id,
      cargoNome: cargoAtual.nome,
      tipoVoto,
      numeroVotado: isVotoBranco ? 'BRANCO' : numeroDigitado,
      candidatoNome: nomeCandidato,
      partidoSigla: siglaPartido,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    };

    const novosVotosSessao = [...votosSessao, novoVoto];
    setVotosSessao(novosVotosSessao);

    // Guarda voto de Senador 1
    if (cargoAtual.id === 'senador-1' && !isVotoBranco) {
      setNumeroSenador1(numeroDigitado);
    }

    // Limpa estado para o próximo cargo
    setDigitosDigitados([]);
    setIsVotoBranco(false);
    setIsSenadorRepetido(false);

    const proximaEtapa = etapaIndex + 1;

    if (proximaEtapa < ORDEM_CARGOS.length) {
      // Voto intermediário confirmado
      urnaAudio.playIntermediateConfirm();
      setEtapaIndex(proximaEtapa);
    } else {
      // ÚLTIMO CARGO CONFIRMADO (PRESIDENTE): Inicia encerramento da urna
      finalizarSessaoVotacao(novosVotosSessao);
    }
  };

  // Encerramento da Votação após confirmação do Presidente
  const finalizarSessaoVotacao = (votosCompletos: VotoRegistrado[]) => {
    setGravando(true);
    setFirebaseStatus('salvando');

    const hashSessao = gerarHash();
    const dataHoraStr = new Date().toLocaleString('pt-BR');

    const registroVRP: RegistroAuditoriaVRP = {
      idVoto: 'VRP-' + Math.floor(Math.random() * 90000 + 10000),
      timestamp: dataHoraStr,
      zona: '001',
      secao: '0142',
      municipio: 'BRASÍLIA',
      uf: 'DF',
      votos: votosCompletos,
      hashCriptografico: hashSessao,
    };

    setRegistroFinalizado(registroVRP);

    // Grava nos arrays paralelos de auditoria
    window.RDV.push([...votosCompletos]);
    window.VotosImpressos.push([...votosCompletos]);

    // Salva de forma persistente no Firebase Firestore
    salvarVotoFirebase(votosCompletos, registroVRP).then((res) => {
      if (res.sucesso) {
        setFirebaseStatus('sucesso');
        setFirebaseDocId(res.id || null);
      } else {
        setFirebaseStatus('erro');
      }
    });

    // Transição para tela de FIM e áudio clássico da urna
    setTimeout(() => {
      setGravando(false);
      setTelaFim(true);

      // Toca o som oficial da urna eletrônica brasileira
      urnaAudio.playUrnaFim();

      // Animação de corte e queda do papel no depósito lacrado
      setTimeout(() => {
        setAnimarCortePapel(true);
        setTotalCedulasDepositadas((prev) => prev + 1);
      }, 1500);

      // Imprime Boletim de Urna formatado no console
      imprimirBoletimNoConsole(votosCompletos);
    }, 800);
  };

  // Reiniciar urna para o próximo eleitor
  const reiniciarNovoEleitor = () => {
    setEtapaIndex(0);
    setDigitosDigitados([]);
    setIsVotoBranco(false);
    setIsSenadorRepetido(false);
    setNumeroSenador1(null);
    setVotosSessao([]);
    setRegistroFinalizado(null);
    setTelaFim(false);
    setGravando(false);
    setAnimarCortePapel(false);
    setFirebaseStatus('idle');
    setFirebaseDocId(null);
  };

  const handleToggleSom = () => {
    const novoValor = !somAtivo;
    setSomAtivo(novoValor);
    urnaAudio.setMuted(!novoValor);
  };

  return (
    <main className="min-h-screen bg-[#14161a] text-gray-100 flex flex-col justify-between p-3 sm:p-5 font-sans">
      {/* Barra de Topo Institucional */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-800/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-green-600 via-amber-500 to-blue-600 p-0.5 shadow-md flex-shrink-0">
            <div className="w-full h-full bg-[#181b21] rounded-[7px] flex items-center justify-center font-black text-xs text-amber-300">
              TSE
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-white flex items-center gap-2">
              Urna Eletrônica Brasileira
            </h1>
          </div>
        </div>

        {/* Botões de Ação do Cabeçalho */}
        <div className="flex items-center gap-2 flex-wrap">
          {telaFim && (
            <>
              <button
                type="button"
                id="btn-novo-eleitor"
                onClick={reiniciarNovoEleitor}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Novo Eleitor
              </button>

              <button
                type="button"
                id="btn-abrir-vrp-header"
                onClick={() => setModalVrpAberto(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow animate-pulse"
              >
                <Printer className="w-3.5 h-3.5" />
                Impressão VRP
              </button>
            </>
          )}

          <button
            type="button"
            id="btn-abrir-relacao-candidatos"
            onClick={() => setModalRelacaoAberto(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black transition flex items-center gap-1.5 shadow"
          >
            <Users className="w-3.5 h-3.5" />
            Relação dos Candidatos
          </button>

          <button
            type="button"
            id="btn-abrir-auditoria"
            onClick={() => {
              executarAuditoriaCruzada();
              setModalAuditoriaAberto(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#22262f] hover:bg-[#2e3440] text-gray-200 border border-gray-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Painel de Auditoria (RDV × VRP)
          </button>
        </div>
      </header>

      {/* Seletor de Progresso das Etapas dos 6 Cargos TSE */}
      <section className="max-w-5xl mx-auto w-full my-2.5">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
          {ORDEM_CARGOS.map((cargo, idx) => {
            const jaVotado = idx < etapaIndex;
            const isAtual = idx === etapaIndex && !telaFim;
            return (
              <div
                key={cargo.id}
                className={`flex-1 min-w-[120px] p-2 rounded-lg border text-center transition ${
                  isAtual
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold shadow'
                    : jaVotado
                    ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-400'
                    : 'bg-[#1b1e24] border-gray-800 text-gray-400'
                }`}
              >
                <div className="text-[10px] text-gray-400 uppercase">
                  {idx + 1}º • {cargo.digitos} dígitos
                </div>
                <div className="truncate font-semibold">{cargo.nome}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          ÁREA PRINCIPAL: URNA ELETRÔNICA CENTRALIZADA
          ========================================================================= */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center items-center my-2">
        <section
          id="gabinete-urna-eletronica"
          className="w-full flex flex-col justify-between"
        >
          <UrnaTerminalGabinete
            cargoAtual={cargoAtual}
            digitosDigitados={digitosDigitados}
            candidatoSelecionado={candidatoSelecionado}
            isVotoBranco={isVotoBranco}
            isNumeroInvalido={isNumeroInvalido}
            isSenadorRepetido={isSenadorRepetido}
            telaFim={telaFim}
            gravando={gravando}
            onDigito={handleDigito}
            onBranco={handleBranco}
            onCorrige={handleCorrige}
            onConfirma={handleConfirma}
            somAtivo={somAtivo}
            onToggleSom={handleToggleSom}
            desabilitado={gravando}
          />
        </section>

        {/* Botão de Acesso à Impressão VRP exibido ao terminar a votação */}
        {telaFim && (
          <div className="mt-4 w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#1b2028] border-2 border-emerald-700/60 rounded-xl shadow-lg">
            <div className="text-center sm:text-left">
              <div className="text-sm font-black text-emerald-300 uppercase flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Votação Concluída com Sucesso!
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>O voto foi criptografado e a impressão VRP foi gerada.</span>
                {firebaseStatus === 'salvando' && (
                  <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                    <Database className="w-3 h-3 animate-spin" /> Salvando no Firebase...
                  </span>
                )}
                {firebaseStatus === 'sucesso' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px] font-bold">
                    <CloudCheck className="w-3.5 h-3.5" /> Salvo no Firebase Firestore (urna-ia)
                  </span>
                )}
                {firebaseStatus === 'erro' && (
                  <span className="text-rose-400 font-mono text-[11px]">
                    (Armazenamento local ativo)
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              id="btn-ver-impressao-vrp"
              onClick={() => setModalVrpAberto(true)}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Acessar Impressão VRP
            </button>
          </div>
        )}
      </div>

      <footer className="max-w-5xl mx-auto w-full mt-3 space-y-2.5">
        <div className="text-center text-xs text-gray-400 font-mono flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-gray-800">
          <span>Justiça Eleitoral • Simulador de Urna com Voto Registrado em Papel (VRP)</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-amber-400" /> Integrado ao Firebase Firestore (urna-ia)
          </span>
          <span>•</span>
          <span className="text-gray-400">Web Audio API Nativa</span>
        </div>
      </footer>

      {/* Modal de Relação Oficial de Candidatos */}
      <RelacaoCandidatosModal
        isOpen={modalRelacaoAberto}
        onClose={() => setModalRelacaoAberto(false)}
        cargoAtualId={cargoAtual.id}
        candidatos={candidatosBanco}
        onSelecionarCandidato={handleSelecionarCandidatoModal}
      />

      {/* Modal de Impressão e Módulo VRP (Acessado após término da votação) */}
      {modalVrpAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-[#1c1f26] border-2 border-gray-700 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider">
                  Módulo de Impressão VRP
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalVrpAberto(false)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ModuloVRP
              votosSessao={votosSessao}
              registroFinalizado={registroFinalizado}
              animarCortePapel={animarCortePapel}
              totalCedulasDepositadas={totalCedulasDepositadas}
              onAuditoriaCruzada={() => {
                setModalVrpAberto(false);
                executarAuditoriaCruzada();
                setModalAuditoriaAberto(true);
              }}
              onAbrirBoletim={() => {
                setModalVrpAberto(false);
                setModalAuditoriaAberto(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Auditoria e Boletim de Urna */}
      <AuditoriaModal
        isOpen={modalAuditoriaAberto}
        onClose={() => setModalAuditoriaAberto(false)}
        status={statusAuditoria}
        rdvList={window.RDV || []}
        vrpList={window.VotosImpressos || []}
        onExecutarAuditoria={executarAuditoriaCruzada}
      />
    </main>
  );
}
