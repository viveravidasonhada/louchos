
import React, { useState } from 'react';
import { Expert, BrandIdentity } from '../types';
import { User, BrainCircuit, Plus, Save, Trash2, X, Loader2, Fingerprint, Palette, Mic2, FileText, Layers } from 'lucide-react';
import { saveExpert, deleteExpert } from '../services/supabase';

interface ExpertManagerProps {
  experts: Expert[];
  onSave: (experts: Expert[]) => void;
  onClose: () => void;
}

const ExpertManager: React.FC<ExpertManagerProps> = ({ experts, onSave, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'branding'>('profile');
  
  const [formData, setFormData] = useState<Expert>({
    id: '',
    name: '',
    niche: '',
    communicationStyle: '',
    branding: {
        archetype: '',
        toneOfVoice: '',
        contentPillars: '',
        visualIdentity: '',
        brandManifesto: ''
    }
  });

  const handleEdit = (expert: Expert) => {
    setEditingId(expert.id);
    setActiveTab('profile');
    setFormData({
        ...expert,
        branding: expert.branding || {
            archetype: '',
            toneOfVoice: '',
            contentPillars: '',
            visualIdentity: '',
            brandManifesto: ''
        }
    });
  };

  const handleNew = () => {
    setEditingId('new');
    setActiveTab('profile');
    setFormData({
      id: '',
      name: '',
      niche: '',
      communicationStyle: '',
      branding: {
        archetype: '',
        toneOfVoice: '',
        contentPillars: '',
        visualIdentity: '',
        brandManifesto: ''
      }
    });
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsLoading(true);

    try {
        const savedExpert = await saveExpert(formData);
        
        let newExperts = [...experts];
        const existsIndex = experts.findIndex(e => e.id === savedExpert.id);
        
        if (existsIndex > -1) {
            newExperts[existsIndex] = savedExpert;
        } else {
            newExperts.push(savedExpert);
        }
        
        onSave(newExperts);
        setEditingId(null);
    } catch (error: any) {
        console.error("Erro crítico ao salvar Expert:", error);
        alert(`ERRO DE PERSISTÊNCIA: O Expert não foi salvo no servidor.\n\nDetalhe: ${error.message}\n\nVerifique se as tabelas do Supabase estão criadas corretamente conforme a documentação.`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza? Isso removerá o contexto de aprendizado e curadoria deste expert permanentemente.')) {
        setIsLoading(true);
        try {
            await deleteExpert(id);
            onSave(experts.filter(e => e.id !== id));
            if (editingId === id) setEditingId(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir do banco de dados.");
        } finally {
            setIsLoading(false);
        }
    }
  };

  const updateBranding = (field: keyof BrandIdentity, value: string) => {
      setFormData(prev => ({
          ...prev,
          branding: {
              ...prev.branding!,
              [field]: value
          }
      }));
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm h-full flex flex-col animate-fadeIn">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Fingerprint className="text-amber-400" size={24} />
          Central de Marca & Curadoria
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Sidebar List */}
        <div className="w-1/3 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar border-r border-slate-700/50">
          <button
            onClick={handleNew}
            disabled={isLoading}
            className="w-full py-3 px-4 mb-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-amber-500 hover:text-amber-400 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} /> Nova Marca/Expert
          </button>
          
          {experts.map(expert => (
            <div 
              key={expert.id}
              onClick={() => !isLoading && handleEdit(expert)}
              className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${
                editingId === expert.id 
                  ? 'bg-amber-500/10 border-amber-500/50' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                  {expert.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{expert.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{expert.niche}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(expert.id); }}
                  disabled={isLoading}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {experts.length === 0 && !isLoading && (
              <div className="text-center py-8 text-slate-600 text-xs italic">
                  Nenhum expert encontrado no servidor.
              </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="flex-1 flex flex-col pl-2 overflow-hidden">
          {editingId ? (
            <>
                {/* Tabs */}
                <div className="flex border-b border-slate-700 mb-4">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
                            activeTab === 'profile' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <User size={16} /> Perfil Básico
                    </button>
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
                            activeTab === 'branding' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Palette size={16} /> Curadoria de Marca
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
                    {activeTab === 'profile' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block">Nome do Expert/Marca</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                                    placeholder="Ex: Pedro Sobral"
                                />
                                </div>
                                <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block">Nicho de Atuação</label>
                                <input
                                    type="text"
                                    value={formData.niche}
                                    onChange={e => setFormData({...formData, niche: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                                    placeholder="Ex: Tráfego Pago"
                                />
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <BrainCircuit size={18} />
                                    <span className="font-semibold text-sm">Base de Conhecimento Legada (Texto Puro)</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">
                                    Cole aqui transcrições antigas ou e-mails. Para um resultado melhor, use a aba "Curadoria de Marca".
                                </p>
                                <textarea
                                    value={formData.communicationStyle}
                                    onChange={e => setFormData({...formData, communicationStyle: e.target.value})}
                                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 font-mono leading-relaxed focus:border-amber-500 outline-none resize-none"
                                    placeholder="Cole textos gerais aqui..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                         <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block flex items-center gap-2">
                                        <Fingerprint size={14} className="text-amber-400"/> Arquétipo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.branding?.archetype}
                                        onChange={e => updateBranding('archetype', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none placeholder-slate-600"
                                        placeholder="Ex: O Herói, O Rebelde, O Sábio..."
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">A personalidade central da marca.</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block flex items-center gap-2">
                                        <Mic2 size={14} className="text-amber-400"/> Tom de Voz
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.branding?.toneOfVoice}
                                        onChange={e => updateBranding('toneOfVoice', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none placeholder-slate-600"
                                        placeholder="Ex: Provocativo, Acolhedor, Técnico, Inspirador..."
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Como a marca fala com o público.</p>
                                </div>
                            </div>

                             <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block flex items-center gap-2">
                                    <Palette size={14} className="text-amber-400"/> Identidade Visual (Descrição)
                                </label>
                                <textarea
                                    value={formData.branding?.visualIdentity}
                                    onChange={e => updateBranding('visualIdentity', e.target.value)}
                                    className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none resize-none placeholder-slate-600"
                                    placeholder="Ex: Minimalista, cores escuras (Preto e Dourado), fotos em preto e branco, tipografia bold..."
                                />
                             </div>

                             <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block flex items-center gap-2">
                                    <Layers size={14} className="text-amber-400"/> Pilares de Conteúdo
                                </label>
                                <textarea
                                    value={formData.branding?.contentPillars}
                                    onChange={e => updateBranding('contentPillars', e.target.value)}
                                    className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none resize-none placeholder-slate-600"
                                    placeholder="Ex: 1. Vida Pessoal (Lifestyle), 2. Dicas Técnicas de Tráfego, 3. Estudos de Caso, 4. Opinião Forte sobre o Mercado..."
                                />
                             </div>

                             <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block flex items-center gap-2">
                                    <FileText size={14} className="text-amber-400"/> Manifesto / Posicionamento
                                </label>
                                <textarea
                                    value={formData.branding?.brandManifesto}
                                    onChange={e => updateBranding('brandManifesto', e.target.value)}
                                    className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none resize-none placeholder-slate-600"
                                    placeholder="Cole aqui o manifesto da marca, a missão, ou frases de efeito que o expert sempre repete."
                                />
                             </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-2">
                    <button
                    onClick={() => setEditingId(null)}
                    disabled={isLoading}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                    Cancelar
                    </button>
                    <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                    {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                    Salvar Dados na Cloud
                    </button>
                </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <User size={48} className="mb-4" />
              <p>Selecione uma marca/expert para editar a curadoria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertManager;
