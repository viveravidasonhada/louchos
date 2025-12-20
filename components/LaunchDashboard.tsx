
import React, { useState, useRef } from 'react';
import { LaunchStrategyJSON, Task, TeamMember, Attachment, AttachmentType } from '../types';
import { generateId } from '../services/supabase';
import { 
  Layout, 
  ListTodo, 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  X,
  File,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  Calendar as CalendarIcon,
  Lock,
  Plus,
  MessageSquare,
  Youtube,
  Mail,
  Send,
  Copy,
  Check,
  Zap,
  Target,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';

interface LaunchDashboardProps {
  data: LaunchStrategyJSON;
  projectsList: Partial<LaunchStrategyJSON>[]; 
  currentUser: TeamMember | 'admin';
  onUpdateProject: (newData: LaunchStrategyJSON) => void;
  onSwitchProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const LaunchDashboard: React.FC<LaunchDashboardProps> = ({ data, currentUser, onUpdateProject, onDeleteProject }) => {
  const [activeView, setActiveView] = useState<'overview' | 'kanban' | 'team' | 'calendar' | 'strategy'>('overview');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTasks = (data.phases || []).flatMap(p => p.tasks || []);

  const canEditTask = (task: Task) => {
    if (currentUser === 'admin') return true;
    return currentUser.name === task.assignee;
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const projId = data.id;
    if (!projId) {
        alert("Erro técnico: O ID deste projeto não foi encontrado para exclusão.");
        return;
    }
    if (window.confirm("CONFIRMAR EXCLUSÃO: Isso apagará permanentemente toda a estratégia e tarefas deste lançamento. Prosseguir?")) {
        onDeleteProject(projId);
    }
  };

  const handleUpdateTaskData = (taskId: string, updates: Partial<Task>) => {
    if (!taskId) return;
    const taskToUpdate = allTasks.find(t => t.id === taskId);
    if (taskToUpdate && !canEditTask(taskToUpdate)) {
        alert("Ação negada: Você só pode editar tarefas atribuídas a você.");
        return;
    }
    const newPhases = data.phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        if (t.id === taskId) return { ...t, ...updates };
        return t;
      })
    }));
    onUpdateProject({ ...data, phases: newPhases });
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleAddExternalLink = () => {
    if (!selectedTask || !newLinkName || !newLinkUrl) return;
    let url = newLinkUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    const newAtt: Attachment = {
        id: generateId(),
        name: newLinkName.trim(),
        url,
        type: 'link',
        uploadedAt: new Date().toISOString()
    };
    handleUpdateTaskData(selectedTask.id, { attachments: [...(selectedTask.attachments || []), newAtt] });
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const renderOverview = () => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'done').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Status de Execução</h3>
            <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">{percentage}%</span>
                <span className="text-slate-500 mb-1 text-xs">concluído</span>
            </div>
            <div className="w-full bg-slate-700/30 h-1.5 rounded-full mt-6 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{width: `${percentage}%`}}></div>
            </div>
          </div>
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Tarefas Pendentes</h3>
            <div className="text-5xl font-black text-amber-500">{total - completed}</div>
            <p className="text-slate-500 text-xs mt-4 uppercase font-bold tracking-tighter">De um total de {total} tarefas</p>
          </div>
          <div className="bg-indigo-600/10 p-6 rounded-2xl border border-indigo-500/20 shadow-xl relative group">
            <h3 className="text-indigo-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Painel de Controle</h3>
            <div className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2">{data.theme}</div>
            <p className="text-slate-500 text-[10px] uppercase font-bold">{new Date(data.createdAt || '').toLocaleDateString()}</p>
            {currentUser === 'admin' && (
                <button 
                    onClick={handleDelete}
                    className="absolute top-4 right-4 p-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                    title="Excluir Lançamento"
                >
                    <Trash2 size={16} />
                </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Target size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Estratégia Mestre do Lançamento</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Baseado no Blueprint e DNA do Especialista</p>
                </div>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium border-l-2 border-indigo-500/30 pl-6 py-2">
                {data.executiveSummary}
            </div>
        </div>
      </div>
    );
  };

  const renderKanban = () => (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full items-start custom-scrollbar">
      {(data.phases || []).map(phase => (
        <div key={phase.id} className="w-80 flex-shrink-0 flex flex-col bg-slate-900/60 rounded-3xl border border-slate-800 shadow-2xl max-h-full">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <h3 className="font-black text-white text-[10px] uppercase tracking-widest truncate">{phase.name}</h3>
            <span className="text-[10px] bg-slate-700 px-2 py-1 rounded-lg text-slate-300 font-black">{(phase.tasks || []).length}</span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {(phase.tasks || []).map(task => {
                const isMine = canEditTask(task);
                const hasScript = !!task.script;
                return (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className={`p-5 bg-slate-800/90 border rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all ${task.status === 'done' ? 'grayscale opacity-50 border-emerald-500/30' : 'border-slate-700'} group/card relative overflow-hidden shadow-md`}>
                        {hasScript && <div className="absolute top-2 right-2"><Zap size={14} className="text-indigo-400" /></div>}
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5 ${isMine ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-700 text-slate-400'}`}>
                                <UserIcon size={10}/> {task.assignee}
                            </span>
                            {task.status === 'done' && <CheckCircle2 size={16} className="text-emerald-500" />}
                        </div>
                        <h4 className="text-xs text-slate-100 font-bold mb-3 leading-snug line-clamp-2">{task.title}</h4>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                            <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase"><Clock size={12}/> {task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '--/--'}</span>
                            {hasScript && (
                                <div className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">EXECUTÁVEL</div>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 h-20 sticky top-0 z-20 backdrop-blur-xl">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', icon: <Layout size={18}/>, label: 'Estratégia Macro' },
            { id: 'kanban', icon: <ListTodo size={18}/>, label: 'Kanban Operacional' },
            { id: 'team', icon: <Users size={18}/>, label: 'Equipe' },
            { id: 'calendar', icon: <CalendarIcon size={18}/>, label: 'Calendário' },
          ].map(view => (
            <button key={view.id} onClick={() => setActiveView(view.id as any)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-3 flex-shrink-0 ${activeView === view.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
              {view.icon} {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'kanban' && renderKanban()}
        {activeView === 'team' && <TeamView data={data} currentUser={currentUser} setSelectedTask={setSelectedTask} />}
        {activeView === 'calendar' && <CalendarView data={data} setSelectedTask={setSelectedTask} />}
      </div>

      {selectedTask && (
        <TaskModal 
            task={selectedTask} 
            canEdit={canEditTask(selectedTask)} 
            copyFeedback={copyFeedback}
            onCopy={handleCopy}
            onClose={() => setSelectedTask(null)} 
            onUpdate={handleUpdateTaskData}
            onUpload={() => fileInputRef.current?.click()}
            onAddLink={handleAddExternalLink}
            onRemoveAtt={(attId: string) => {
                const updated = (selectedTask.attachments || []).filter(a => a.id !== attId);
                handleUpdateTaskData(selectedTask.id, { attachments: updated });
            }}
            newLinkName={newLinkName}
            setNewLinkName={setNewLinkName}
            newLinkUrl={newLinkUrl}
            setNewLinkUrl={setNewLinkUrl}
            fileInputRef={fileInputRef}
        />
      )}
    </div>
  );
};

const TeamView = ({ data, currentUser, setSelectedTask }: any) => {
    const allTasks = (data.phases || []).flatMap((p: any) => p.tasks || []);
    const tasksByAssignee = allTasks.reduce((acc: any, task: any) => {
        const assignee = task.assignee || 'Sem Responsável';
        if (!acc[assignee]) acc[assignee] = [];
        acc[assignee].push(task);
        return acc;
    }, {});

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {Object.entries(tasksByAssignee).map(([assignee, tasks]: any) => {
                const isMyColumn = typeof currentUser !== 'string' && currentUser.name === assignee;
                return (
                    <div key={assignee} className={`bg-slate-900/40 rounded-3xl border overflow-hidden ${isMyColumn ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800'}`}>
                        <div className="p-6 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">{assignee}</h3>
                            <span className="text-[10px] font-bold text-slate-500">{tasks.length} tarefas</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {tasks.map((t: any) => (
                                <div key={t.id} onClick={() => setSelectedTask(t)} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-indigo-500 transition-all cursor-pointer">
                                    <p className="text-xs font-bold text-slate-200 line-clamp-1">{t.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const CalendarView = ({ data, setSelectedTask }: any) => {
    const allTasks = (data.phases || []).flatMap((p: any) => p.tasks || []);
    const sorted = [...allTasks].sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
    return (
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-4">
            {sorted.map(task => (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-6 p-4 hover:bg-slate-800/60 rounded-2xl cursor-pointer group transition-all">
                    <div className="w-20 text-indigo-400 font-black text-sm">{task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '??/??'}</div>
                    <div className="w-1 bg-slate-800 h-8 group-hover:bg-indigo-500 transition-colors"></div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-slate-200 uppercase tracking-tight">{task.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{task.assignee}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-700 group-hover:text-white transition-all"/>
                </div>
            ))}
        </div>
    );
};

const TaskModal = ({ task, canEdit, copyFeedback, onCopy, onClose, onUpdate, onAddLink, onRemoveAtt, newLinkName, setNewLinkName, newLinkUrl, setNewLinkUrl }: any) => (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
        <div className="bg-[#0f172a] border border-slate-700 w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border-indigo-500/10">
            <div className="p-10 border-b border-slate-800 flex justify-between items-start">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-600/20">{task.assignee}</span>
                        {task.scriptChannel && <span className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"><Send size={12}/> {task.scriptChannel}</span>}
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight">{task.title}</h2>
                </div>
                <button onClick={onClose} className="p-3 text-slate-500 hover:text-white transition-all bg-slate-800 rounded-2xl"><X size={28} /></button>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1 space-y-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2"><Target size={14}/> Rationale Estratégico</h3>
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl text-slate-300 text-sm italic leading-relaxed">
                            {task.strategicRationale}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><FileText size={14}/> Guia de Execução</h3>
                        <div className="text-slate-400 text-sm leading-relaxed">
                            {task.description}
                        </div>
                    </div>
                </div>

                {task.script && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2"><Zap size={14}/> Script de Comunicação Prontuário</h3>
                            <button 
                                onClick={() => onCopy(task.script, task.id)}
                                className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl active:scale-95 ${copyFeedback === task.id ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                            >
                                {copyFeedback === task.id ? <Check size={16}/> : <Copy size={16}/>}
                                {copyFeedback === task.id ? 'Copiado para Área de Transferência' : 'Copiar e Disparar'}
                            </button>
                        </div>
                        <div className="bg-slate-900 border-2 border-slate-800 border-dashed p-8 rounded-[2rem] text-slate-100 text-base font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                            {task.script}
                        </div>
                    </div>
                )}

                <div className="space-y-4 pt-6 border-t border-slate-800/50">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><MessageSquare size={14}/> Notas do Executor</h3>
                    <textarea 
                        value={task.observations || ''}
                        onChange={(e) => onUpdate(task.id, { observations: e.target.value })}
                        disabled={!canEdit}
                        placeholder="Insira detalhes sobre a execução ou links de entrega..."
                        className="w-full h-32 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-sm text-slate-300 outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Anexos e Entregas</h3>
                        {canEdit && (
                            <div className="flex gap-2">
                                <input type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="Título" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                                <input type="text" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Link URL" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
                                <button onClick={onAddLink} className="bg-indigo-600 p-2 rounded-xl text-white"><Plus size={20}/></button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(task.attachments || []).map((att: any) => (
                            <div key={att.id} className="flex items-center justify-between p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl group transition-all">
                                <div className="flex items-center gap-4">
                                    <LinkIcon size={16} className="text-indigo-400"/>
                                    <p className="text-xs font-bold text-white truncate w-40">{att.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white"><ExternalLink size={16}/></a>
                                    {canEdit && <button onClick={() => onRemoveAtt(att.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-10 border-t border-slate-800 flex justify-end gap-6 bg-slate-900/50">
                {canEdit ? (
                    <button onClick={() => { onUpdate(task.id, { status: task.status === 'done' ? 'pending' : 'done' }); onClose(); }} className={`px-16 py-5 font-black rounded-3xl transition-all shadow-2xl active:scale-95 text-sm uppercase tracking-widest ${task.status === 'done' ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'}`}>
                        {task.status === 'done' ? 'Reabrir para Ajustes' : 'Concluir Execução'}
                    </button>
                ) : <span className="text-slate-500 text-xs italic font-bold uppercase tracking-widest">Visualização Restrita ao Responsável</span>}
            </div>
        </div>
    </div>
);

export default LaunchDashboard;
