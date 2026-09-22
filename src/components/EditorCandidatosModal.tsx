import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  Search,
  Image,
  Upload,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Users,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Candidato, CargoTipo } from '../types';
import { ORDEM_CARGOS } from '../data/candidatos';

interface EditorCandidatosModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidatos: Candidato[];
  onSalvarCandidato: (candidato: Candidato, antigo?: { cargo: string; numero: string }) => Promise<boolean>;
  onExcluirCandidato: (cargo: string, numero: string) => Promise<boolean>;
  onRestaurarPadrao: () => Promise<boolean>;
}

// Avatares e fotos de sugestão rápida
const FOTOS_SUGERIDAS = [
  { label: 'Avatar Padrão TSE', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Foto Oficial Masculino 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Foto Oficial Masculino 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Foto Oficial Feminino 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Foto Oficial Feminino 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
];

export const EditorCandidatosModal: React.FC<EditorCandidatosModalProps> = ({
  isOpen,
  onClose,
  candidatos,
  onSalvarCandidato,
  onExcluirCandidato,
  onRestaurarPadrao,
}) => {
  const [filtroCargo, setFiltroCargo] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');
  const [editando, setEditando] = useState<boolean>(false);
  const [candidatoOriginal, setCandidatoOriginal] = useState<{ cargo: string; numero: string } | null>(null);

  // Form State
  const [cargo, setCargo] = useState<CargoTipo>('presidente');
  const [numero, setNumero] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [nomeUrna, setNomeUrna] = useState<string>('');
  const [partido, setPartido] = useState<string>('');
  const [siglaPartido, setSiglaPartido] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');

  // Vice State
  const [temVice, setTemVice] = useState<boolean>(true);
  const [viceNome, setViceNome] = useState<string>('');
  const [viceTitulo, setViceTitulo] = useState<string>('Vice-Presidente');
  const [viceFotoUrl, setViceFotoUrl] = useState<string>('');

  // Suplentes State
  const [suplente1, setSuplente1] = useState<string>('');
  const [suplente2, setSuplente2] = useState<string>('');

  // Feedback State
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [candidatoParaExcluir, setCandidatoParaExcluir] = useState<Candidato | null>(null);
  const [confirmandoReset, setConfirmandoReset] = useState<boolean>(false);

  // Dicionário de dígitos por cargo
  const digitosPorCargo: Record<CargoTipo, number> = {
    'deputado-federal': 4,
    'deputado-estadual': 5,
    'senador-1': 3,
    'senador-2': 3,
    'governador': 2,
    'presidente': 2,
  };

  const digitosEsperados = digitosPorCargo[cargo] || 2;

  // Filtragem de candidatos
  const candidatosFiltrados = useMemo(() => {
    return candidatos.filter((c) => {
      const matchCargo =
        filtroCargo === 'todos' ||
        c.cargo === filtroCargo ||
        (filtroCargo === 'senador' && (c.cargo === 'senador-1' || c.cargo === 'senador-2'));

      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        c.nomeUrna.toLowerCase().includes(termo) ||
        c.numero.includes(termo) ||
        c.siglaPartido.toLowerCase().includes(termo) ||
        c.partido.toLowerCase().includes(termo);

      return matchCargo && matchBusca;
    });
  }, [candidatos, filtroCargo, busca]);

  if (!isOpen) return null;

  // Iniciar criação de novo candidato
  const handleNovoCandidato = () => {
    setCandidatoOriginal(null);
    setCargo('presidente');
    setNumero('');
    setNome('');
    setNomeUrna('');
    setPartido('');
    setSiglaPartido('');
    setFotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setTemVice(true);
    setViceNome('');
    setViceTitulo('Vice-Presidente');
    setViceFotoUrl('');
    setSuplente1('');
    setSuplente2('');
    setMensagemErro(null);
    setMensagemSucesso(null);
    setEditando(true);
  };

  // Iniciar edição de candidato existente
  const handleEditarCandidato = (c: Candidato) => {
    setCandidatoOriginal({ cargo: c.cargo, numero: c.numero });
    setCargo(c.cargo);
    setNumero(c.numero);
    setNome(c.nome);
    setNomeUrna(c.nomeUrna);
    setPartido(c.partido);
    setSiglaPartido(c.siglaPartido);
    setFotoUrl(c.fotoUrl);

    if (c.vice) {
      setTemVice(true);
      setViceNome(c.vice.nome);
      setViceTitulo(c.vice.titulo || (c.cargo === 'presidente' ? 'Vice-Presidente' : 'Vice-Governador'));
      setViceFotoUrl(c.vice.fotoUrl || '');
    } else {
      setTemVice(c.cargo === 'presidente' || c.cargo === 'governador');
      setViceNome('');
      setViceTitulo(c.cargo === 'presidente' ? 'Vice-Presidente' : 'Vice-Governador');
      setViceFotoUrl('');
    }

    if (c.suplentes) {
      setSuplente1(c.suplentes.primeiro);
      setSuplente2(c.suplentes.segundo);
    } else {
      setSuplente1('');
      setSuplente2('');
    }

    setMensagemErro(null);
    setMensagemSucesso(null);
    setEditando(true);
  };

  // Upload de arquivo local de imagem e conversão para Data URL
  const handleUploadFoto = (e: React.ChangeEvent<HTMLInputElement>, isVice = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMensagemErro('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isVice) {
        setViceFotoUrl(dataUrl);
      } else {
        setFotoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Salvar candidato (Criação ou Edição)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);
    setMensagemSucesso(null);

    // Validações
    const numLimpo = numero.replace(/\D/g, '');
    if (numLimpo.length !== digitosEsperados) {
      setMensagemErro(`O número para o cargo ${cargo} deve conter exatamente ${digitosEsperados} dígitos.`);
      return;
    }

    if (!nome.trim()) {
      setMensagemErro('Informe o nome completo do candidato.');
      return;
    }

    if (!nomeUrna.trim()) {
      setMensagemErro('Informe o nome que aparecerá na tela da urna.');
      return;
    }

    if (!siglaPartido.trim()) {
      setMensagemErro('Informe a sigla do partido.');
      return;
    }

    if (!fotoUrl.trim()) {
      setMensagemErro('Informe a URL da foto ou selecione uma imagem.');
      return;
    }

    // Verificar colisão de número em outro candidato no mesmo cargo
    const colisao = candidatos.find(
      (c) =>
        c.cargo === cargo &&
        c.numero === numLimpo &&
        (!candidatoOriginal || candidatoOriginal.cargo !== cargo || candidatoOriginal.numero !== numLimpo)
    );

    if (colisao) {
      setMensagemErro(`Já existe outro candidato cadastrado com o número ${numLimpo} para este cargo (${colisao.nomeUrna}).`);
      return;
    }

    const candidatoAtualizado: Candidato = {
      numero: numLimpo,
      nome: nome.trim(),
      nomeUrna: nomeUrna.trim().toUpperCase(),
      partido: partido.trim() || siglaPartido.trim().toUpperCase(),
      siglaPartido: siglaPartido.trim().toUpperCase(),
      cargo,
      fotoUrl: fotoUrl.trim(),
    };

    if ((cargo === 'presidente' || cargo === 'governador') && temVice && viceNome.trim()) {
      candidatoAtualizado.vice = {
        nome: viceNome.trim().toUpperCase(),
        titulo: viceTitulo || (cargo === 'presidente' ? 'Vice-Presidente' : 'Vice-Governador'),
        fotoUrl: viceFotoUrl.trim() || undefined,
      };
    }

    if ((cargo === 'senador-1' || cargo === 'senador-2') && (suplente1.trim() || suplente2.trim())) {
      candidatoAtualizado.suplentes = {
        primeiro: suplente1.trim().toUpperCase() || 'NÃO INFORMADO',
        segundo: suplente2.trim().toUpperCase() || 'NÃO INFORMADO',
      };
    }

    setSalvando(true);
    const sucesso = await onSalvarCandidato(
      candidatoAtualizado,
      candidatoOriginal || undefined
    );
    setSalvando(false);

    if (sucesso) {
      setMensagemSucesso('Candidato gravado com sucesso no sistema e no Firestore!');
      setTimeout(() => {
        setEditando(false);
        setMensagemSucesso(null);
      }, 1200);
    } else {
      setMensagemErro('Não foi possível salvar o candidato. Verifique a conexão com o banco de dados.');
    }
  };

  // Exclusão de candidato
  const handleConfirmarExclusao = async () => {
    if (!candidatoParaExcluir) return;
    setSalvando(true);
    const ok = await onExcluirCandidato(candidatoParaExcluir.cargo, candidatoParaExcluir.numero);
    setSalvando(false);
    if (ok) {
      setCandidatoParaExcluir(null);
      setMensagemSucesso(`Candidato ${candidatoParaExcluir.nomeUrna} removido com sucesso.`);
      setTimeout(() => setMensagemSucesso(null), 3000);
    } else {
      setMensagemErro('Erro ao excluir candidato do Firestore.');
    }
  };

  return (
    <div
      id="modal-admin-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="modal-admin-conteudo"
        className="bg-[#1a1e26] border-2 border-emerald-600/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal Admin */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-700/80 bg-[#14171d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  Editor de Candidatos • Modo Administrador
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                  <Lock className="w-2.5 h-2.5" /> Código 001322 Validado
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Adicione, edite números, nomes, fotos e partidos sincronizados com o Firestore da Urna.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editando && (
              <button
                type="button"
                id="btn-admin-novo-candidato"
                onClick={handleNovoCandidato}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo Candidato
              </button>
            )}

            <button
              type="button"
              id="btn-fechar-modal-admin"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
              title="Fechar Painel Administrador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {mensagemSucesso && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{mensagemErro}</span>
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {editando ? (
            /* Formulário de Criação / Edição */
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Lista
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  {candidatoOriginal ? 'Editando Candidato Existente' : 'Cadastrando Novo Candidato'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Coluna da Foto & Visualização do Card */}
                <div className="flex flex-col items-center gap-4 bg-[#14171d] p-4 rounded-xl border border-gray-700/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-emerald-400" /> Foto Oficial de Urna
                  </div>

                  <div className="w-36 h-44 bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden flex items-center justify-center relative shadow-lg">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt="Foto do Candidato"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-500" />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white font-mono text-[10px] text-center py-1">
                      {numero || '00'} • {siglaPartido || 'PART'}
                    </div>
                  </div>

                  {/* Upload de arquivo */}
                  <div className="w-full space-y-2">
                    <label className="text-[11px] font-bold text-gray-300 block">Enviar foto do computador:</label>
                    <label className="w-full py-2 px-3 rounded-lg border border-dashed border-gray-600 hover:border-emerald-500 bg-gray-800/60 hover:bg-gray-800 text-gray-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Escolher Arquivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadFoto(e, false)}
                      />
                    </label>
                  </div>

                  {/* Fotos de Exemplo Rápidas */}
                  <div className="w-full space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Sugestões Rápidas:</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {FOTOS_SUGERIDAS.map((f, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFotoUrl(f.url)}
                          title={f.label}
                          className="w-full aspect-square rounded border border-gray-700 hover:border-emerald-400 overflow-hidden cursor-pointer"
                        >
                          <img src={f.url} alt={f.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coluna dos Dados Principais */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cargo */}
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Cargo Político *</label>
                      <select
                        value={cargo}
                        onChange={(e) => {
                          const novoCargo = e.target.value as CargoTipo;
                          setCargo(novoCargo);
                          // Ajusta título do vice
                          if (novoCargo === 'presidente') setViceTitulo('Vice-Presidente');
                          if (novoCargo === 'governador') setViceTitulo('Vice-Governador');
                        }}
                        className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="presidente">Presidente da República (2 dígitos)</option>
                        <option value="governador">Governador de Estado (2 dígitos)</option>
                        <option value="senador-1">Senador - 1ª Vaga (3 dígitos)</option>
                        <option value="senador-2">Senador - 2ª Vaga (3 dígitos)</option>
                        <option value="deputado-federal">Deputado Federal (4 dígitos)</option>
                        <option value="deputado-estadual">Deputado Estadual (5 dígitos)</option>
                      </select>
                    </div>

                    {/* Número */}
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">
                        Número de Votação ({digitosEsperados} dígitos) *
                      </label>
                      <input
                        type="text"
                        maxLength={digitosEsperados}
                        value={numero}
                        onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, digitosEsperados))}
                        placeholder={`Ex: ${'9'.repeat(digitosEsperados)}`}
                        className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs font-mono font-bold text-amber-300 tracking-widest focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nome Completo */}
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Nome Completo Oficial *</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: SILVA SANTOS"
                        className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Nome na Urna */}
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Nome de Urna (Exibido na Tela) *</label>
                      <input
                        type="text"
                        value={nomeUrna}
                        onChange={(e) => setNomeUrna(e.target.value)}
                        placeholder="Ex: SILVA DA SAÚDE"
                        className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs font-bold text-emerald-400 uppercase focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sigla do Partido */}
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Sigla do Partido *</label>
                      <input
                        type="text"
                        value={siglaPartido}
                        onChange={(e) => setSiglaPartido(e.target.value.toUpperCase())}
                        placeholder="Ex: PTB, PL, PT, NOVO"
                        className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs font-bold text-white uppercase focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Nome Completo do Partido */}
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Nome Completo do Partido</label>
                      <input
                        type="text"
                        value={partido}
                        onChange={(e) => setPartido(e.target.value)}
                        placeholder="Ex: Partido Democrático"
                        className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* URL da Foto */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">URL da Imagem da Foto *</label>
                    <input
                      type="url"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#111317] border border-gray-700 rounded-lg p-2.5 text-xs font-mono text-gray-200 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Campos de Vice para Presidente ou Governador */}
                  {(cargo === 'presidente' || cargo === 'governador') && (
                    <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-700/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                          <Users className="w-3.5 h-3.5" /> Chapa Majoritária: {viceTitulo}
                        </span>
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={temVice}
                            onChange={(e) => setTemVice(e.target.checked)}
                            className="rounded accent-emerald-500"
                          />
                          Incluir Vice
                        </label>
                      </div>

                      {temVice && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">Nome do Vice</label>
                            <input
                              type="text"
                              value={viceNome}
                              onChange={(e) => setViceNome(e.target.value)}
                              placeholder={`Nome do ${viceTitulo}`}
                              className="w-full bg-[#111317] border border-gray-700 rounded p-2 text-xs text-white uppercase focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">Foto do Vice (URL)</label>
                            <input
                              type="url"
                              value={viceFotoUrl}
                              onChange={(e) => setViceFotoUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-[#111317] border border-gray-700 rounded p-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campos de Suplentes para Senador */}
                  {(cargo === 'senador-1' || cargo === 'senador-2') && (
                    <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-700/80 space-y-3">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                        <Users className="w-3.5 h-3.5" /> Suplentes do Senado Federal
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1">1º Suplente</label>
                          <input
                            type="text"
                            value={suplente1}
                            onChange={(e) => setSuplente1(e.target.value)}
                            placeholder="Nome do 1º Suplente"
                            className="w-full bg-[#111317] border border-gray-700 rounded p-2 text-xs text-white uppercase focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1">2º Suplente</label>
                          <input
                            type="text"
                            value={suplente2}
                            onChange={(e) => setSuplente2(e.target.value)}
                            placeholder="Nome do 2º Suplente"
                            className="w-full bg-[#111317] border border-gray-700 rounded p-2 text-xs text-white uppercase focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões do Formulário */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      disabled={salvando}
                      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {salvando ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Gravando no Firestore...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar Candidato
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Lista de Candidatos Cadastrados */
            <div className="space-y-4">
              {/* Barra de Filtro e Busca */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#14171d] p-3 rounded-xl border border-gray-700/80">
                {/* Abas de Cargo */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'deputado-federal', label: 'Dep. Federal' },
                    { id: 'deputado-estadual', label: 'Dep. Estadual' },
                    { id: 'senador', label: 'Senadores' },
                    { id: 'governador', label: 'Governador' },
                    { id: 'presidente', label: 'Presidente' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFiltroCargo(tab.id)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                        filtroCargo === tab.id
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-gray-800/80 text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Busca */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar nome, número..."
                    className="w-full bg-[#1b1f28] border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Contagem e Botão Restaurar */}
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>
                  Exibindo <strong>{candidatosFiltrados.length}</strong> de <strong>{candidatos.length}</strong> candidatos cadastrados.
                </span>

                {confirmandoReset ? (
                  <div className="flex items-center gap-2 bg-red-950/80 p-1.5 rounded border border-red-500 text-[11px] text-red-200">
                    <span>Restaurar todos os candidatos oficiais padrão?</span>
                    <button
                      type="button"
                      onClick={async () => {
                        setSalvando(true);
                        await onRestaurarPadrao();
                        setSalvando(false);
                        setConfirmandoReset(false);
                        setMensagemSucesso('Candidatos padrão restaurados com sucesso.');
                        setTimeout(() => setMensagemSucesso(null), 3000);
                      }}
                      className="px-2 py-0.5 rounded bg-red-600 text-white font-bold cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoReset(false)}
                      className="px-2 py-0.5 rounded bg-gray-700 text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoReset(true)}
                    className="text-[11px] text-gray-400 hover:text-amber-400 underline transition cursor-pointer"
                  >
                    Restaurar Candidatos Padrão
                  </button>
                )}
              </div>

              {/* Grid de Candidatos */}
              {candidatosFiltrados.length === 0 ? (
                <div className="p-12 text-center bg-[#14171d] rounded-xl border border-gray-700/80 text-gray-400 text-xs">
                  Nenhum candidato encontrado com os filtros selecionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {candidatosFiltrados.map((c) => (
                    <div
                      key={`${c.cargo}_${c.numero}`}
                      className="bg-[#14171d] border border-gray-700/80 hover:border-gray-600 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow transition"
                    >
                      <div className="flex items-start gap-3">
                        {/* Foto Thumbnail */}
                        <div className="w-16 h-20 bg-gray-800 border border-gray-600 rounded flex-shrink-0 overflow-hidden relative shadow">
                          <img
                            src={c.fotoUrl}
                            alt={c.nomeUrna}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                              Nº {c.numero}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-mono font-bold truncate">
                              {c.cargo.replace('-', ' ')}
                            </span>
                          </div>

                          <div className="font-extrabold text-sm text-white uppercase truncate pt-1">
                            {c.nomeUrna}
                          </div>

                          <div className="text-[11px] text-gray-400 truncate">
                            {c.nome}
                          </div>

                          <div className="text-[11px] text-emerald-400 font-bold">
                            {c.siglaPartido} • <span className="text-gray-400 font-normal">{c.partido}</span>
                          </div>

                          {c.vice && (
                            <div className="text-[10px] text-amber-400/90 truncate pt-0.5">
                              Vice: {c.vice.nome}
                            </div>
                          )}

                          {c.suplentes && (
                            <div className="text-[10px] text-cyan-400/90 truncate pt-0.5">
                              1º Supl.: {c.suplentes.primeiro}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                        <button
                          type="button"
                          onClick={() => handleEditarCandidato(c)}
                          className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setCandidatoParaExcluir(c)}
                          className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold transition flex items-center gap-1 border border-red-500/30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {candidatoParaExcluir && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75">
            <div className="bg-[#1f242e] border-2 border-red-600 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-black text-sm uppercase text-white">Confirmar Exclusão de Candidato</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Tem certeza que deseja apagar o candidato <strong>{candidatoParaExcluir.nomeUrna}</strong> (Nº {candidatoParaExcluir.numero} - {candidatoParaExcluir.siglaPartido})?
                Esta ação removerá o candidato do banco de dados Firestore e da Urna Eletrônica.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCandidatoParaExcluir(null)}
                  className="px-3.5 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs font-bold text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarExclusao}
                  disabled={salvando}
                  className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {salvando ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Sim, Apagar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé do Modal Admin */}
        <div className="p-3.5 sm:p-4 border-t border-gray-700/80 bg-[#14171d] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div className="font-mono text-[11px] text-gray-500">
            Dica: Para abrir este painel a qualquer momento, digite <span className="text-emerald-400 font-bold">001322</span> no teclado da Urna.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Fechar Editor
          </button>
        </div>
      </div>
    </div>
  );
};
