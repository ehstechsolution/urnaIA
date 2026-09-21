import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { CANDIDATOS_BASE } from '../src/data/candidatos.js';

const firebaseConfig = {
  apiKey: "AIzaSyAg7NEImUHdiV_G_jmuQhvvUpNjRKqRXdk",
  authDomain: "urna-ia.firebaseapp.com",
  projectId: "urna-ia",
  storageBucket: "urna-ia.firebasestorage.app",
  messagingSenderId: "642072021010",
  appId: "1:642072021010:web:639635f7b7b3b557b070cb"
};

async function seed() {
  console.log('Iniciando conexão com o Firebase Firestore (urna-ia)...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Total de candidatos a inserir: ${CANDIDATOS_BASE.length}`);

  let inseridos = 0;
  for (const c of CANDIDATOS_BASE) {
    const docId = `${c.cargo}_${c.numero}`;
    const docRef = doc(db, 'candidatos', docId);

    const data: Record<string, any> = {
      numero: c.numero,
      nome: c.nome,
      nomeUrna: c.nomeUrna,
      partido: c.partido,
      siglaPartido: c.siglaPartido,
      cargo: c.cargo,
      fotoUrl: c.fotoUrl,
      ativo: true,
      criadoEm: new Date().toISOString()
    };

    if (c.vice) {
      data.vice = {
        nome: c.vice.nome,
        titulo: c.vice.titulo,
        fotoUrl: c.vice.fotoUrl || null
      };
    }

    if (c.suplentes) {
      data.suplentes = {
        primeiro: c.suplentes.primeiro,
        segundo: c.suplentes.segundo
      };
    }

    await setDoc(docRef, data, { merge: true });
    inseridos++;
    console.log(`[OK] Candidato inserido: [${c.cargo.toUpperCase()}] ${c.numero} - ${c.nomeUrna} (${c.siglaPartido}) -> Doc ID: ${docId}`);
  }

  // Verifica contagem
  const snapshot = await getDocs(collection(db, 'candidatos'));
  console.log(`\n🎉 SUCESSO! Total de documentos na coleção 'candidatos' do Firestore: ${snapshot.size}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Erro ao semear candidatos:', err);
  process.exit(1);
});
