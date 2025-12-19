
import React, { useState } from 'react';
import { LaunchInput, Expert, CampaignBlueprint } from '../types';
import { Rocket, Target, Users, DollarSign, Calendar, Box, Loader2, ArrowRight, User, AlertCircle } from 'lucide-react';

interface LaunchFormProps {
  experts: Expert[];
  blueprints: CampaignBlueprint[]; // Lista dinâmica
  onSubmit: (data: LaunchInput) => void;
  isLoading: boolean;
  onOpenExpertManager: () => void;
}

const LaunchForm: React.FC<LaunchFormProps> = ({ experts, blueprints, onSubmit, isLoading, onOpenExpertManager }) => {
  const [formData, setFormData] = useState<LaunchInput>({
    expertId: '',
    projectType: '',
    blueprintId: '', 
    theme: '',
    targetAudience: '',
    goal: '',
    budget: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Se mudar o blueprint, atualiza também o nome do projectType para compatibilidade
    if (name === 'blueprintId') {
        const selectedBp = blueprints.find(b => b.id === value);
        setFormData(prev => ({ 
            ...prev, 
            blueprintId: value,
            projectType: selectedBp ? selectedBp.name : ''
        }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.endDate < formData.startDate) {
        alert("A data final não pode ser anterior à data de início.");
        return;
    }
    onSubmit(formData);
  };

  if (experts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md mx-auto">
          <User className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum Expert Cadastrado</h3>
          <p className="text-slate-400 mb-6">Para iniciar um projeto, primeiro você precisa cadastrar um Expert e seu contexto de aprendizado.</p>
          <button 
            onClick={onOpenExpertManager}
            className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors"
          >
            Cadastrar Expert Agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-xl backdrop-blur-sm animate-fadeIn">
      <div className="mb-8 border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Rocket className="text-indigo-400" size={28} />
          Novo Projeto
        </h2>
        <p className="text-slate-400 mt-2">Defina o período, o expert e o modelo estratégico.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expert Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-amber-400" /> Expert Responsável
            </label>
            <select
              name="expertId"
              required
              value={formData.expertId}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="" disabled>Selecione o Expert...</option>
              {experts.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Project Type (Blueprint Select) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Box size={14} className="text-indigo-400" /> Tipo do Projeto
            </label>
            <select
              name="blueprintId"
              required
              value={formData.blueprintId}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="" disabled>Selecione a Estratégia...</option>
              {blueprints.map(bp => (
                <option key={bp.id} value={bp.id}>{bp.name}</option>
              ))}
            </select>
            {formData.blueprintId && (
                <p className="text-[10px] text-slate-400 px-1">
                    {blueprints.find(b => b.id === formData.blueprintId)?.description}
                </p>
            )}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Rocket size={14} className="text-indigo-400" /> Nome/Tema da Campanha
          </label>
          <input
            type="text"
            name="theme"
            required
            value={formData.theme}
            onChange={handleChange}
            placeholder="Ex: Lançamento Turma 5 - Método X"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Datas (Range) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400" /> Data de Início
                </label>
                <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [color-scheme:dark]"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400" /> Data Final (Evento/Carrinho)
                </label>
                <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate} // Impede selecionar data anterior ao início
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [color-scheme:dark]"
                />
            </div>
            {formData.startDate && formData.endDate && (
                <div className="col-span-full text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <AlertCircle size={12} />
                    As tarefas serão distribuídas automaticamente entre {new Date(formData.startDate).toLocaleDateString('pt-BR')} e {new Date(formData.endDate).toLocaleDateString('pt-BR')}.
                </div>
            )}
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> Público-Alvo Específico
          </label>
          <textarea
            name="targetAudience"
            required
            rows={2}
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="Quem queremos atingir nesta campanha específica?"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Target size={14} className="text-indigo-400" /> Objetivo
            </label>
            <input
                type="text"
                name="goal"
                required
                value={formData.goal}
                onChange={handleChange}
                placeholder="Ex: 1000 Leads / R$ 50k"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            </div>
          {/* Budget */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="text-indigo-400" /> Verba
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Ex: R$ 10.000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-8 py-4 px-6 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
            isLoading
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Criando Estratégia...
            </>
          ) : (
            <>
              Gerar Plano Operacional
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LaunchForm;
