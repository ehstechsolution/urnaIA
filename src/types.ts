export type CargoTipo =
  | 'deputado-federal'
  | 'deputado-estadual'
  | 'senador-1'
  | 'senador-2'
  | 'governador'
  | 'presidente';

export interface CargoConfig {
  id: CargoTipo;
  nome: string;
  digitos: number;
  descricaoInstrucao?: string;
  permiteLegenda?: boolean;
}

export interface Candidato {
  numero: string;
  nome: string;
  nomeUrna: string;
  partido: string;
  siglaPartido: string;
  cargo: CargoTipo;
  fotoUrl: string;
  vice?: {
    nome: string;
    fotoUrl?: string;
    titulo: string; // "Vice-Presidente", "Vice-Governador"
  };
  suplentes?: {
    primeiro: string;
    segundo: string;
  };
}

export interface VotoRegistrado {
  cargoId: CargoTipo;
  cargoNome: string;
  tipoVoto: 'nominal' | 'legenda' | 'branco' | 'nulo';
  numeroVotado: string;
  candidatoNome?: string;
  partidoSigla?: string;
  timestamp: string;
}

export interface RegistroAuditoriaVRP {
  idVoto: string;
  timestamp: string;
  zona: string;
  secao: string;
  municipio: string;
  uf: string;
  votos: VotoRegistrado[];
  hashCriptografico: string;
}

export interface StatusAuditoria {
  totalRDV: number;
  totalImpressos: number;
  discrepancias: number;
  convergencia100: boolean;
  detalhes: {
    cargo: string;
    rdv: string;
    impresso: string;
    status: 'CORRESPONDENTE' | 'DIVERGENTE';
  }[];
  hashRDV: string;
  hashVRP: string;
  dataHora: string;
}
