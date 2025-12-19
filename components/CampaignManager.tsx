
import React, { useState } from 'react';
import { CampaignBlueprint } from '../types';
import { LayoutTemplate, Plus, Save, Trash2, X, List, Sparkles, Loader2, Info } from 'lucide-react';
import { saveCampaignBlueprint, deleteCampaignBlueprint } from '../services/supabase';

interface CampaignManagerProps {
  blueprints: CampaignBlueprint[];
  onSave: (blueprints: CampaignBlueprint[]) => void;
  onClose: () => void;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ blueprints, onSave, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignBlueprint>({
    id: '',
    name: '',
    description: '',
    phases: [],
    aiContext: ''
  });

  // Helper para converter array de strings em texto para textarea (uma por linha)
  const phasesToString = (phases: string[]) => phases.join('\n');
  const stringToPhases = (str: string) => str.split('\n').filter(line => line.trim() !== '');

  const handleEdit = (bp: CampaignBlueprint) => {
    setEditingId(bp.id);
    setFormData(bp);
  };

  const handleNew = () => {
    setEditingId('new');
    setFormData({
      id: '',
      name: '',
      description: '',
      phases: ['Fase 1: ', 'Fase 2: ', 'Fase 3: '],
      aiContext: 'Descreva aqui os tipos de criativos, mensagens chaves e papéis da equipe que funcionam para este lançamento.'
    });
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsLoading(true);

    try {
        const savedBp = await saveCampaignBlueprint(formData);
        
        let newList = [...blueprints];
        const exists = blueprints.find(b => b.id === savedBp.id);
        
        if (exists) {
            newList = newList.map(b => b.id === savedBp.id ? savedBp : b);
        } else {
            newList.push(savedBp);
        }
        
        onSave(newList);
        setEditingId(null);
    } catch (error) {
        console.error("Erro ao salvar blueprint", error);
        
        // Fallback local
        const localId = formData.id || `local-${Date.now()}`;
        const localBp = { ...formData, id: localId };
        
        let newList = [...blueprints];
        const exists = blueprints.find(b => b.id === localId);
        if (exists) {
             newList = newList.map(b => b.id === localId ? localBp : b);
        } else {
            newList.push(localBp);
        }
        onSave(newList);
        setEditingId(null);
        alert("Salvo localmente (Offline ou erro de conexão).");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(id.startsWith('seed-')) {
        alert("Modelos padrão do sistema não podem ser deletados, mas você pode criar novos baseados neles.");
        return;
    }

    if (window.confirm('Tem certeza? Isso removerá este modelo de campanha.')) {
        setIsLoading(true);
        try {
            await deleteCampaignBlueprint(id).catch(console.warn);
            onSave(blueprints.filter(b => b.id !== id));
            if (editingId === id) setEditingId(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm h-full flex flex-col animate-fadeIn">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <LayoutTemplate className="text-indigo-400" size={24} />
          Tipos de Campanha (Blueprints)
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
            className="w-full py-3 px-4 mb-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} /> Novo Modelo
          </button>
          
          {blueprints.map(bp => (
            <div 
              key={bp.id}
              onClick={() => !isLoading && handleEdit(bp)}
              className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${
                editingId === bp.id 
                  ? 'bg-indigo-500/10 border-indigo-500/50' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${bp.id.startsWith('seed-') ? 'bg-amber-900/30 text-amber-500' : 'bg-indigo-900/30 text-indigo-500'}`}>
                  {bp.id.startsWith('seed-') ? 'STD' : 'CUS'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{bp.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{bp.phases.length} fases configuradas</p>
                </div>
                {!bp.id.startsWith('seed-') && (
                    <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(bp.id); }}
                    disabled={isLoading}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-opacity"
                    >
                    <Trash2 size={14} />
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pl-4">
          {editingId ? (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block">Nome da Estratégia</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="Ex: Lançamento Espartano"
                />
              </div>
              
              <div>
                 <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block">Descrição Curta</label>
                 <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-indigo-500 outline-none"
                  placeholder="Ex: Focado em ticket alto com poucos leads..."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Fases */}
                 <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                        <List size={18} />
                        <span className="font-semibold text-sm">Estrutura de Fases</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">Uma fase por linha. A IA seguirá esta ordem rigorosamente.</p>
                    <textarea 
                        value={phasesToString(formData.phases)}
                        onChange={e => setFormData({...formData, phases: stringToPhases(e.target.value)})}
                        className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 font-mono leading-relaxed focus:border-indigo-500 outline-none resize-none"
                        placeholder="Fase 1: Captação..."
                    />
                 </div>

                 {/* Contexto IA */}
                 <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-amber-400">
                        <Sparkles size={18} />
                        <span className="font-semibold text-sm">Diretrizes de Inteligência</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">Instrua a IA sobre criativos, copy e execução ideal para este modelo.</p>
                    <textarea 
                        value={formData.aiContext}
                        onChange={e => setFormData({...formData, aiContext: e.target.value})}
                        className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 font-mono leading-relaxed focus:border-amber-500 outline-none resize-none"
                        placeholder="CRIATIVOS: Devem ser agressivos... COPY: Foque na dor..."
                    />
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
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
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                  Salvar Estratégia
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 text-center p-8">
              <LayoutTemplate size={48} className="mb-4" />
              <p className="max-w-xs">Selecione um modelo para editar suas fases e inteligência, ou crie um novo do zero.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;
