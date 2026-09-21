import { Candidato, CargoConfig } from '../types';

export const ORDEM_CARGOS: CargoConfig[] = [
  {
    id: 'deputado-federal',
    nome: 'DEPUTADO FEDERAL',
    digitos: 4,
    permiteLegenda: true,
  },
  {
    id: 'deputado-estadual',
    nome: 'DEPUTADO ESTADUAL',
    digitos: 5,
    permiteLegenda: true,
  },
  {
    id: 'senador-1',
    nome: 'SENADOR (1ª VAGA)',
    digitos: 3,
    permiteLegenda: false,
  },
  {
    id: 'senador-2',
    nome: 'SENADOR (2ª VAGA)',
    digitos: 3,
    permiteLegenda: false,
  },
  {
    id: 'governador',
    nome: 'GOVERNADOR',
    digitos: 2,
    permiteLegenda: false,
  },
  {
    id: 'presidente',
    nome: 'PRESIDENTE DA REPÚBLICA',
    digitos: 2,
    permiteLegenda: false,
  },
];

export const CANDIDATOS_BASE: Candidato[] = [
  // 1. DEPUTADO FEDERAL (4 dígitos)
  {
    numero: '1010',
    nome: 'MARIA APARECIDA SILVA',
    nomeUrna: 'MARIA SILVA',
    partido: 'PARTIDO DA LIBERDADE E DESENVOLVIMENTO',
    siglaPartido: 'PLD',
    cargo: 'deputado-federal',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '1515',
    nome: 'CARLOS EDUARDO ALMEIDA',
    nomeUrna: 'CARLOS EDUARDO',
    partido: 'PARTIDO DO MOVIMENTO BRASILEIRO',
    siglaPartido: 'PMB',
    cargo: 'deputado-federal',
    fotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '2222',
    nome: 'ROBERTO ALENCAR BARROS',
    nomeUrna: 'ROBERTO ALENCAR',
    partido: 'PARTIDO DA RENOVAÇÃO NACIONAL',
    siglaPartido: 'PRN',
    cargo: 'deputado-federal',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '4545',
    nome: 'JULIANA CASTRO FERREIRA',
    nomeUrna: 'JULIANA CASTRO',
    partido: 'PARTIDO SOCIAL DEMOCRÁTICO',
    siglaPartido: 'PSD',
    cargo: 'deputado-federal',
    fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '1313',
    nome: 'FERNANDO SANTOS LIMA',
    nomeUrna: 'FERNANDO SANTOS',
    partido: 'PARTIDO SOCIAL DOS TRABALHADORES',
    siglaPartido: 'PST',
    cargo: 'deputado-federal',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },

  // 2. DEPUTADO ESTADUAL (5 dígitos)
  {
    numero: '10123',
    nome: 'LUCIANA PRADO MENEZES',
    nomeUrna: 'PROFESSORA LUCIANA',
    partido: 'PARTIDO DA LIBERDADE E DESENVOLVIMENTO',
    siglaPartido: 'PLD',
    cargo: 'deputado-estadual',
    fotoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '15456',
    nome: 'MARCOS VINICIUS COSTA',
    nomeUrna: 'MARCOS VINICIUS',
    partido: 'PARTIDO DO MOVIMENTO BRASILEIRO',
    siglaPartido: 'PMB',
    cargo: 'deputado-estadual',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '22789',
    nome: 'BEATRIZ ALBUQUERQUE GOMES',
    nomeUrna: 'DRA. BEATRIZ',
    partido: 'PARTIDO DA RENOVAÇÃO NACIONAL',
    siglaPartido: 'PRN',
    cargo: 'deputado-estadual',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '45100',
    nome: 'ANDRÉ BARRETO SIQUEIRA',
    nomeUrna: 'ANDRÉ BARRETO',
    partido: 'PARTIDO SOCIAL DEMOCRÁTICO',
    siglaPartido: 'PSD',
    cargo: 'deputado-estadual',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    numero: '13555',
    nome: 'RENATA FAGUNDES DIAS',
    nomeUrna: 'RENATA DO POVO',
    partido: 'PARTIDO SOCIAL DOS TRABALHADORES',
    siglaPartido: 'PST',
    cargo: 'deputado-estadual',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },

  // 3. SENADOR (Vagas 1 e 2 concorrem da mesma lista de senadores)
  {
    numero: '101',
    nome: 'PAULO ROBERTO MENDES',
    nomeUrna: 'DR. PAULO MENDES',
    partido: 'PARTIDO DA LIBERDADE E DESENVOLVIMENTO',
    siglaPartido: 'PLD',
    cargo: 'senador-1',
    fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    suplentes: {
      primeiro: 'TEREZA CRISTINA DIAS',
      segundo: 'JORGE LUIZ VIANA',
    },
  },
  {
    numero: '151',
    nome: 'CRISTINA FONTES CARDOSO',
    nomeUrna: 'DRA. CRISTINA FONTES',
    partido: 'PARTIDO DO MOVIMENTO BRASILEIRO',
    siglaPartido: 'PMB',
    cargo: 'senador-1',
    fotoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    suplentes: {
      primeiro: 'MÁRIO SÉRGIO COELHO',
      segundo: 'ANA PAULA TEIXEIRA',
    },
  },
  {
    numero: '222',
    nome: 'OTÁVIO AUGUSTO SOARES',
    nomeUrna: 'COMANDANTE SOARES',
    partido: 'PARTIDO DA RENOVAÇÃO NACIONAL',
    siglaPartido: 'PRN',
    cargo: 'senador-1',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    suplentes: {
      primeiro: 'VALDIR RAMOS NETO',
      segundo: 'CLÁUDIA MARIA LINS',
    },
  },
  {
    numero: '455',
    nome: 'AMANDA REIS MONTEIRO',
    nomeUrna: 'PROFESSORA AMANDA',
    partido: 'PARTIDO SOCIAL DEMOCRÁTICO',
    siglaPartido: 'PSD',
    cargo: 'senador-1',
    fotoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80',
    suplentes: {
      primeiro: 'DANIEL MORAIS ROCHA',
      segundo: 'CÁTIA REGINA NEVES',
    },
  },
  {
    numero: '131',
    nome: 'GERALDO ANTUNES MOREIRA',
    nomeUrna: 'GERALDO ANTUNES',
    partido: 'PARTIDO SOCIAL DOS TRABALHADORES',
    siglaPartido: 'PST',
    cargo: 'senador-1',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    suplentes: {
      primeiro: 'EDUARDO MOURA FILHO',
      segundo: 'SÔNIA BARBOSA PINTO',
    },
  },

  // 5. GOVERNADOR (2 dígitos)
  {
    numero: '10',
    nome: 'MARCELO REZENDE GUIMARÃES',
    nomeUrna: 'MARCELO REZENDE',
    partido: 'PARTIDO DA LIBERDADE E DESENVOLVIMENTO',
    siglaPartido: 'PLD',
    cargo: 'governador',
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'DRA. LÚCIA CARVALHO',
      titulo: 'VICE-GOVERNADOR(A)',
      fotoUrl: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '15',
    nome: 'ARTHUR QUEIROZ TAVARES',
    nomeUrna: 'ARTHUR QUEIROZ',
    partido: 'PARTIDO DO MOVIMENTO BRASILEIRO',
    siglaPartido: 'PMB',
    cargo: 'governador',
    fotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'CORONEL JOSÉ GUIMARÃES',
      titulo: 'VICE-GOVERNADOR(A)',
      fotoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '22',
    nome: 'GUSTAVO BRANDÃO LEITE',
    nomeUrna: 'GUSTAVO BRANDÃO',
    partido: 'PARTIDO DA RENOVAÇÃO NACIONAL',
    siglaPartido: 'PRN',
    cargo: 'governador',
    fotoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'MARIANA FIGUEIRA',
      titulo: 'VICE-GOVERNADOR(A)',
      fotoUrl: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '45',
    nome: 'PATRÍCIA HOLANDA CAMPOS',
    nomeUrna: 'PATRÍCIA HOLANDA',
    partido: 'PARTIDO SOCIAL DEMOCRÁTICO',
    siglaPartido: 'PSD',
    cargo: 'governador',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'SÉRGIO TOLEDO DE PAULA',
      titulo: 'VICE-GOVERNADOR(A)',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '13',
    nome: 'TIAGO NOGUEIRA SALES',
    nomeUrna: 'TIAGO NOGUEIRA',
    partido: 'PARTIDO SOCIAL DOS TRABALHADORES',
    siglaPartido: 'PST',
    cargo: 'governador',
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'LAURA PEIXOTO MACIEL',
      titulo: 'VICE-GOVERNADOR(A)',
      fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
  },

  // 6. PRESIDENTE DA REPÚBLICA (2 dígitos)
  {
    numero: '10',
    nome: 'EDUARDO VASCONCELOS PAIVA',
    nomeUrna: 'EDUARDO VASCONCELOS',
    partido: 'PARTIDO DA LIBERDADE E DESENVOLVIMENTO',
    siglaPartido: 'PLD',
    cargo: 'presidente',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'SIMONE MEDEIROS BRAGA',
      titulo: 'VICE-PRESIDENTE',
      fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '15',
    nome: 'HENRIQUE MEIRELES SILVEIRA',
    nomeUrna: 'HENRIQUE MEIRELES',
    partido: 'PARTIDO DO MOVIMENTO BRASILEIRO',
    siglaPartido: 'PMB',
    cargo: 'presidente',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'GABRIEL ALCKMIN FONTES',
      titulo: 'VICE-PRESIDENTE',
      fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '22',
    nome: 'JAIR DE OLIVEIRA CAMPOS',
    nomeUrna: 'JAIR DE OLIVEIRA',
    partido: 'PARTIDO DA RENOVAÇÃO NACIONAL',
    siglaPartido: 'PRN',
    cargo: 'presidente',
    fotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'GENERAL BRAGA NOGUEIRA',
      titulo: 'VICE-PRESIDENTE',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '45',
    nome: 'GERALDO GUIMARÃES NETO',
    nomeUrna: 'GERALDO GUIMARÃES',
    partido: 'PARTIDO SOCIAL DEMOCRÁTICO',
    siglaPartido: 'PSD',
    cargo: 'presidente',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'LUIZA TRAJANO MORAES',
      titulo: 'VICE-PRESIDENTE',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    numero: '13',
    nome: 'LUIZ CARLOS RIBEIRO',
    nomeUrna: 'LUIZ RIBEIRO',
    partido: 'PARTIDO SOCIAL DOS TRABALHADORES',
    siglaPartido: 'PST',
    cargo: 'presidente',
    fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    vice: {
      nome: 'GERALDO ALENCAR BRASIL',
      titulo: 'VICE-PRESIDENTE',
      fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    },
  },
];

export const PARTIDOS_LEGENDA: Record<string, { nome: string; sigla: string }> = {
  '10': { nome: 'PARTIDO DA LIBERDADE E DESENVOLVIMENTO', sigla: 'PLD' },
  '15': { nome: 'PARTIDO DO MOVIMENTO BRASILEIRO', sigla: 'PMB' },
  '22': { nome: 'PARTIDO DA RENOVAÇÃO NACIONAL', sigla: 'PRN' },
  '45': { nome: 'PARTIDO SOCIAL DEMOCRÁTICO', sigla: 'PSD' },
  '13': { nome: 'PARTIDO SOCIAL DOS TRABALHADORES', sigla: 'PST' },
};

/**
 * Busca candidato pelo cargo e número
 */
export function buscarCandidato(cargoId: string, numero: string): Candidato | null {
  // Senador 1 e 2 compartilham a mesma lista de senadores
  const cargoBusca = cargoId.startsWith('senador') ? 'senador-1' : cargoId;
  return CANDIDATOS_BASE.find((c) => c.cargo === cargoBusca && c.numero === numero) || null;
}
