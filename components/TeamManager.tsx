import React, { useState } from 'react';
import { TeamMember } from '../types';
import { Users, Plus, Trash2, X, Mail, Key, Loader2, AlertTriangle } from 'lucide-react';
import { saveTeamMember, deleteTeamMember } from '../services/supabase';

interface TeamManagerProps {
  team: TeamMember[];
  onSave: (team: TeamMember[]) => void;
  onClose: () => void;
}

const ROLES = ['Especialista','Estrategista', 'Copywriter', 'Closer', 'Tráfego', 'Designer', 'Tech', 'VideoMaker', 'Social Media', 'Suporte'];

const TeamManager: React.FC<TeamManagerProps> = ({ team, onSave, onClose }) => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(ROLES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName || !newEmail) return;
    setIsLoading(true);

    const newMember: TeamMember = {
      id: '', // Empty triggers insert
      name: newName,
      email: newEmail,
      password: '123', // Senha padrão para facilitar
      role: newRole as any
    };

    try {
        const savedMember = await saveTeamMember(newMember);
        onSave([...team, savedMember]);
        setNewName('');
        setNewEmail('');
    } catch (error) {
        console.warn("Falha no DB, salvando localmente", error);
        // Fallback Local
        const localMember = { ...newMember, id: `local-${Date.now()}` };
        onSave([...team, localMember]);
        setNewName('');
        setNewEmail('');
        alert("Aviso: Membro adicionado temporariamente (Offline Mode).");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if(!window.confirm("Remover este membro?")) return;
    
    setIsLoading(true);
    try {
        await deleteTeamMember(id).catch(err => console.warn("Erro delete DB", err));
        onSave(team.filter(t => t.id !== id));
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm h-full animate-fadeIn flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="text-emerald-400" size={24} />
          Gestão de Equipe e Acessos
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Add New */}
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Novo Membro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                    type="text"
                    placeholder="Nome completo"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                />
                <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                >
                    {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                <div className="relative md:col-span-2">
                    <Mail className="absolute left-3 top-2.5 text-slate-500" size={14} />
                     <input
                        type="email"
                        placeholder="Email de acesso (Login)"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md pl-9 pr-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                    />
                </div>
            </div>
            <button
                onClick={handleAdd}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                Adicionar Membro
            </button>
            <p className="text-[10px] text-slate-500 text-center">Senha padrão criada: "123"</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-3">
            {team.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm font-bold">
                    {member.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                    <div className="font-bold text-slate-200 text-sm">{member.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300 border border-slate-600">{member.role}</span>
                        <span className="flex items-center gap-1"><Mail size={10} /> {member.email}</span>
                        {member.id.startsWith('local-') && (
                            <span className="text-amber-500 flex items-center gap-0.5"><AlertTriangle size={10} /> Offline</span>
                        )}
                    </div>
                    </div>
                </div>
                <button
                    onClick={() => handleRemove(member.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-2"
                >
                    <Trash2 size={18} />
                </button>
                </div>
            ))}
            {team.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                Nenhum membro na equipe. Adicione alguém para configurar os acessos.
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManager;