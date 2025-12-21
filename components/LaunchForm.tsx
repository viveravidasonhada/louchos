
import React, { useState, useEffect } from 'react';
import { LaunchInput, Expert, CampaignBlueprint } from '../types';
import { Rocket, Target, Users, DollarSign, Calendar, Box, Loader2, ArrowRight, User, AlertCircle, Info } from 'lucide-react';

interface LaunchFormProps {
  experts: Expert[];
  blueprints: CampaignBlueprint[];
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const [suggestedEndDate, setSuggestedEndDate] = useState<string | null>(null);

  const calculateEndDate = (start: string, days: number) => {
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() + days);
    return startDate.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'blueprintId') {
        const selectedBp = blueprints.find(b => b.id === value);
        const duration = selectedBp?.defaultDurationDays || 0;
        const newEndDate = calculateEndDate(formData.startDate || new Date().toISOString().split('T')[0], duration);
        
        setFormData(prev => ({ 
            ...prev, 
            blueprintId: value,
            projectType: selectedBp ? selectedBp.name : '',
            endDate: newEndDate
        }));
        setSuggestedEndDate(newEndDate);
    } else if (name === 'startDate') {
        setFormData(prev => {
            const selectedBp = blueprints.find(b => b.id === prev.blueprintId);
            const duration = selectedBp?.defaultDurationDays || 0;
            const newEndDate = value ? calculateEndDate(value, duration) : prev.endDate;
            return { ...prev, startDate: value, endDate: newEndDate };
        });
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
          <p className="text-slate-400 mb-6">Para iniciar um projeto, primeiro você precisa cadastrar um Expert e seu contexto de branding.</p>
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
          Configurar Lançamento
        </h2>
        <p className="text-slate-400 mt-2">Defina o período, o expert e a estratégia de campanha.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Box size={14} className="text-indigo-400" /> Estratégia (Blueprint)
            </label>
            <select
              name="blueprintId"
              required
              value={formData.blueprintId}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="" disabled>Selecione o Modelo...</option>
              {blueprints.map(bp => (
                <option key={bp.id} value={bp.id}>{bp.name}</option>
              ))}
            </select>
            {formData.blueprintId && (
                <p className="text-[10px] text-slate-400 px-1 flex items-center gap-2">
                    <Info size={10} className="text-indigo-400" />
                    Duração sugerida: {blueprints.find(b => b.id === formData.blueprintId)?.defaultDurationDays} dias.
                </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Target size={14} className="text-indigo-400" /> Nome da Campanha
          </label>
          <input
            type="text"
            name="theme"
            required
            value={formData.theme}
            onChange={handleChange}
            placeholder="Ex: Lançamento Semente Turma 1 - Método Elite"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-400" /> Início do Aquecimento
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
                    <Calendar size={14} className="text-emerald-400" /> Fechamento de Carrinho
                </label>
                <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all [color-scheme:dark]"
                />
            </div>
            {formData.blueprintId && (
                <div className="col-span-full text-center text-[10px] text-slate-500 flex items-center justify-center gap-2 font-black uppercase tracking-widest bg-slate-900/50 py-2 rounded-xl border border-slate-800">
                    <AlertCircle size={12} className="text-indigo-500" />
                    Cronograma ajustado automaticamente para {blueprints.find(b => b.id === formData.blueprintId)?.name}
                </div>
            )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> Avatar do Lançamento
          </label>
          <textarea
            name="targetAudience"
            required
            rows={2}
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="Descreva as dores e desejos específicos que atacaremos neste lançamento."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Target size={14} className="text-indigo-400" /> Meta Financeira / Leads
            </label>
            <input
                type="text"
                name="goal"
                required
                value={formData.goal}
                onChange={handleChange}
                placeholder="Ex: R$ 100.000 ou 2.000 Leads"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-400" /> Investimento em Tráfego
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Ex: R$ 10.000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-8 py-4 px-6 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.98] uppercase tracking-widest ${
            isLoading
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Configurando Campanhas...
            </>
          ) : (
            <>
              Orquestrar Estratégia
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LaunchForm;
