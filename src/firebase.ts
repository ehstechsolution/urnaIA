import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { VotoRegistrado, RegistroAuditoriaVRP, Candidato, CargoTipo } from './types';
import { CANDIDATOS_BASE } from './data/candidatos';

// Configuração oficial do Firebase fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyAg7NEImUHdiV_G_jmuQhvvUpNjRKqRXdk",
  authDomain: "urna-ia.firebaseapp.com",
  projectId: "urna-ia",
  storageBucket: "urna-ia.firebasestorage.app",
  messagingSenderId: "642072021010",
  appId: "1:642072021010:web:639635f7b7b3b557b070cb"
};

// Inicialização segura do app Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

/**
 * Escuta em tempo real a coleção de candidatos no Firestore.
 * Sempre que um candidato for adicionado, alterado ou excluído no Firestore,
 * a interface se atualiza instantaneamente.
 */
export function ouvirCandidatosFirestore(callback: (candidatos: Candidato[]) => void): () => void {
  try {
    const candidatosRef = collection(db, 'candidatos');
    const unsubscribe = onSnapshot(
      candidatosRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const lista: Candidato[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            lista.push({
              numero: String(data.numero),
              nome: data.nome,
              nomeUrna: data.nomeUrna,
              partido: data.partido,
              siglaPartido: data.siglaPartido,
              cargo: data.cargo as CargoTipo,
              fotoUrl: data.fotoUrl,
              vice: data.vice || undefined,
              suplentes: data.suplentes || undefined,
            });
          });
          callback(lista);
        } else {
          // Se estiver vazia, semeia e devolve base padrão
          semearCandidatosFirestore(CANDIDATOS_BASE).then(() => {
            callback(CANDIDATOS_BASE);
          });
        }
      },
      (error) => {
        console.warn('Erro no snapshot do Firestore para candidatos, utilizando base local:', error);
        callback(CANDIDATOS_BASE);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Falha ao conectar listener do Firestore:', error);
    callback(CANDIDATOS_BASE);
    return () => {};
  }
}

/**
 * Busca um candidato diretamente no Firestore por Cargo e Número
 */
export async function buscarCandidatoDiretoFirestore(
  cargo: string,
  numero: string
): Promise<Candidato | null> {
  try {
    // Tenta ID direto "cargo_numero"
    const cargoBase = cargo === 'senador-2' ? 'senador-1' : cargo;
    const docRef = doc(db, 'candidatos', `${cargoBase}_${numero}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        numero: String(data.numero),
        nome: data.nome,
        nomeUrna: data.nomeUrna,
        partido: data.partido,
        siglaPartido: data.siglaPartido,
        cargo: cargo as CargoTipo,
        fotoUrl: data.fotoUrl,
        vice: data.vice || undefined,
        suplentes: data.suplentes || undefined,
      };
    }
    return null;
  } catch (error) {
    console.warn('Erro na busca direta do Firestore:', error);
    return null;
  }
}

/**
 * Escuta em tempo real todas as sessões de votos gravadas no Firestore
 */
export function ouvirSessoesVotosFirestore(callback: (sessoes: any[]) => void): () => void {
  try {
    const sessoesRef = collection(db, 'sessoes_votacao');
    const q = query(sessoesRef, orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const sessoes = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        callback(sessoes);
      },
      (error) => {
        console.warn('Erro ao escutar sessões no Firestore:', error);
      }
    );
  } catch (error) {
    console.warn('Erro ao iniciar listener de sessões:', error);
    return () => {};
  }
}

/**
 * Cria/Popula todos os candidatos oficiais no Firestore na coleção 'candidatos'.
 */
export async function semearCandidatosFirestore(
  candidatosLista: Candidato[] = CANDIDATOS_BASE
): Promise<{ sucesso: boolean; total: number; erro?: string }> {
  try {
    const batch = writeBatch(db);

    candidatosLista.forEach((c) => {
      const cargoBase = c.cargo === 'senador-2' ? 'senador-1' : c.cargo;
      const docId = `${cargoBase}_${c.numero}`;
      const candidatoRef = doc(db, 'candidatos', docId);

      const dadosCandidato: Record<string, any> = {
        numero: String(c.numero),
        nome: c.nome,
        nomeUrna: c.nomeUrna,
        partido: c.partido,
        siglaPartido: c.siglaPartido,
        cargo: c.cargo,
        fotoUrl: c.fotoUrl,
        ativo: true,
        dataCadastro: serverTimestamp(),
      };

      if (c.vice) {
        dadosCandidato.vice = {
          nome: c.vice.nome,
          titulo: c.vice.titulo,
          fotoUrl: c.vice.fotoUrl || null,
        };
      }

      if (c.suplentes) {
        dadosCandidato.suplentes = {
          primeiro: c.suplentes.primeiro,
          segundo: c.suplentes.segundo,
        };
      }

      batch.set(candidatoRef, dadosCandidato, { merge: true });
    });

    await batch.commit();
    return { sucesso: true, total: candidatosLista.length };
  } catch (error: any) {
    console.error('Erro ao semear candidatos no Firestore:', error);
    return { sucesso: false, total: 0, erro: error?.message || 'Falha ao salvar no Firestore' };
  }
}

/**
 * Salva ou atualiza um candidato no Firestore.
 * Se o cargo ou número tiverem mudado em relação ao original, apaga o documento anterior.
 */
export async function salvarOuAtualizarCandidatoFirestore(
  candidato: Candidato,
  idAntigo?: { cargo: string; numero: string }
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const cargoBase = candidato.cargo === 'senador-2' ? 'senador-1' : candidato.cargo;
    const docId = `${cargoBase}_${candidato.numero}`;
    const candidatoRef = doc(db, 'candidatos', docId);

    const dadosCandidato: Record<string, any> = {
      numero: String(candidato.numero),
      nome: candidato.nome.trim(),
      nomeUrna: candidato.nomeUrna.trim(),
      partido: candidato.partido.trim(),
      siglaPartido: candidato.siglaPartido.trim().toUpperCase(),
      cargo: candidato.cargo,
      fotoUrl: candidato.fotoUrl.trim(),
      ativo: true,
      atualizadoEm: serverTimestamp(),
    };

    if (candidato.vice && (candidato.cargo === 'presidente' || candidato.cargo === 'governador')) {
      dadosCandidato.vice = {
        nome: candidato.vice.nome.trim(),
        titulo: candidato.vice.titulo || (candidato.cargo === 'presidente' ? 'Vice-Presidente' : 'Vice-Governador'),
        fotoUrl: candidato.vice.fotoUrl?.trim() || null,
      };
    } else {
      dadosCandidato.vice = null;
    }

    if (candidato.suplentes && (candidato.cargo === 'senador-1' || candidato.cargo === 'senador-2')) {
      dadosCandidato.suplentes = {
        primeiro: candidato.suplentes.primeiro.trim(),
        segundo: candidato.suplentes.segundo.trim(),
      };
    } else {
      dadosCandidato.suplentes = null;
    }

    // Se houve mudança de número ou cargo, remove o documento anterior
    if (idAntigo) {
      const cargoBaseAntigo = idAntigo.cargo === 'senador-2' ? 'senador-1' : idAntigo.cargo;
      const docIdAntigo = `${cargoBaseAntigo}_${idAntigo.numero}`;
      if (docIdAntigo !== docId) {
        try {
          await deleteDoc(doc(db, 'candidatos', docIdAntigo));
        } catch (delErr) {
          console.warn('Erro ao remover documento antigo do Firestore:', delErr);
        }
      }
    }

    await setDoc(candidatoRef, dadosCandidato, { merge: true });
    return { sucesso: true };
  } catch (error: any) {
    console.error('Erro ao salvar candidato no Firestore:', error);
    return { sucesso: false, erro: error?.message || 'Falha ao salvar candidato no Firestore' };
  }
}

/**
 * Exclui um candidato do Firestore.
 */
export async function excluirCandidatoFirestore(
  cargo: string,
  numero: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const cargoBase = cargo === 'senador-2' ? 'senador-1' : cargo;
    const docId = `${cargoBase}_${numero}`;
    const docRef = doc(db, 'candidatos', docId);
    await deleteDoc(docRef);
    return { sucesso: true };
  } catch (error: any) {
    console.error('Erro ao excluir candidato no Firestore:', error);
    return { sucesso: false, erro: error?.message || 'Falha ao excluir candidato do Firestore' };
  }
}

/**
 * Restaura todos os candidatos padrão no Firestore.
 */
export async function restaurarCandidatosPadraoFirestore(): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    // 1. Obter todos os candidatos atuais e deletar
    const snapshot = await getDocs(collection(db, 'candidatos'));
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();

    // 2. Semear com base inicial
    await semearCandidatosFirestore(CANDIDATOS_BASE);
    return { sucesso: true };
  } catch (error: any) {
    console.error('Erro ao restaurar candidatos padrão no Firestore:', error);
    return { sucesso: false, erro: error?.message || 'Falha ao restaurar candidatos padrão' };
  }
}

/**
 * Salva a sessão de voto completa no Firestore (Coleção `sessoes_votacao` e totalizadores por candidato).
 */
export async function salvarVotoFirebase(
  votos: VotoRegistrado[],
  registroAuditoria: RegistroAuditoriaVRP
): Promise<{ sucesso: boolean; id?: string; erro?: string }> {
  try {
    const sessoesRef = collection(db, 'sessoes_votacao');
    
    // Mapeamento dos votos para formato sanitizado Firestore
    const votosData = votos.map((v) => ({
      cargoId: v.cargoId,
      cargoNome: v.cargoNome,
      tipoVoto: v.tipoVoto,
      numeroVotado: v.numeroVotado,
      candidatoNome: v.candidatoNome || '',
      partidoSigla: v.partidoSigla || '',
      timestamp: v.timestamp,
    }));

    const docRef = await addDoc(sessoesRef, {
      idVoto: registroAuditoria.idVoto,
      hashCriptografico: registroAuditoria.hashCriptografico,
      zona: registroAuditoria.zona,
      secao: registroAuditoria.secao,
      municipio: registroAuditoria.municipio,
      uf: registroAuditoria.uf,
      votos: votosData,
      totalCargosVotados: votos.length,
      createdAt: serverTimestamp(),
    });

    // Atualiza contadores individuais de cada candidato no Firestore
    const batch = writeBatch(db);
    for (const v of votos) {
      if (v.tipoVoto === 'nominal' || v.tipoVoto === 'legenda') {
        const cargoBase = v.cargoId === 'senador-2' ? 'senador-1' : v.cargoId;
        const totalizadorRef = doc(db, 'totalizadores_candidatos', `${cargoBase}_${v.numeroVotado}`);
        batch.set(
          totalizadorRef,
          {
            cargoId: v.cargoId,
            numero: v.numeroVotado,
            candidatoNome: v.candidatoNome || '',
            partidoSigla: v.partidoSigla || '',
            totalVotos: increment(1),
            ultimaAtualizacao: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    // Atualiza estatísticas globais da eleição no Firestore
    const statsDocRef = doc(db, 'estatisticas_eleicao', 'geral');
    batch.set(
      statsDocRef,
      {
        totalEleitores: increment(1),
        totalVotosRegistrados: increment(votos.length),
        ultimaAtualizacao: serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();

    return { sucesso: true, id: docRef.id };
  } catch (error: any) {
    console.error('Erro ao salvar votos no Firebase Firestore:', error);
    return { sucesso: false, erro: error?.message || 'Erro de conexão com o banco de dados' };
  }
}
