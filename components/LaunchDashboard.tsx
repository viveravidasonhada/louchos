
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
  UploadCloud,
  File,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Sparkles,
  Lock,
  Plus,
  MessageSquare
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // States para novos links
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allTasks = (data.phases || []).flatMap(p => p.tasks || []);

  const canEditTask = (task: Task) => {
    if (currentUser === 'admin') return true;
    return currentUser.name === task.assignee;
  };

  const handleUpdateTaskData = (taskId: string, updates: Partial<Task>) => {
    if (!taskId || taskId === 'undefined') return;

    const taskToUpdate = allTasks.find(t => t.id === taskId);
    if (taskToUpdate && !canEditTask(taskToUpdate)) {
        alert("Ação negada: Você só pode editar tarefas atribuídas a você.");
        return;
    }

    const newPhases = data.phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, ...updates };
        }
        return t;
      })
    }));
    
    const updatedData: LaunchStrategyJSON = { ...data, phases: newPhases };
    onUpdateProject(updatedData);

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleAddExternalLink = () => {
    if (!selectedTask || !newLinkName || !newLinkUrl) return;
    
    // Validação básica de URL
    let url = newLinkUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    const newAtt: Attachment = {
        id: generateId(),
        name: newLinkName.trim(),
        url: url,
        type: 'link',
        size: 'Externo',
        uploadedAt: new Date().toISOString()
    };

    const updatedAtts = [...(selectedTask.attachments || []), newAtt];
    handleUpdateTaskData(selectedTask.id, { attachments: updatedAtts });
    
    // Reset campos
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    if (!canEditTask(selectedTask)) {
        alert("Acesso Negado: Apenas o responsável pode anexar arquivos a esta tarefa.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        let type: AttachmentType = 'doc';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';

        const newAtt: Attachment = {
            id: generateId(),
            name: file.name,
            url: event.target?.result as string,
            type,
            size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
            uploadedAt: new Date().toISOString()
        };

        const updatedAtts = [...(selectedTask.attachments || []), newAtt];
        handleUpdateTaskData(selectedTask.id, { attachments: updatedAtts });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!selectedTask) return;
    if (!canEditTask(selectedTask)) return;
    
    const updatedAtts = (selectedTask.attachments || []).filter(a => a.id !== attachmentId);
    handleUpdateTaskData(selectedTask.id, { attachments: updatedAtts });
  };

  const renderOverview = () => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'done').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-widest">Progresso Geral</h3>
            <div className="text-4xl font-black text-white">{percentage}%</div>
            <div className="w-full bg-slate-700/50 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-700" style={{width: `${percentage}%`}}></div>
            </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-widest">Tarefas Entregues</h3>
            <div className="text-4xl font-black text-emerald-400">{completed}<span className="text-slate-500 text-lg font-normal ml-2">/ {total}</span></div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg relative group">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-widest">Configurações</h3>
            <div className="text-lg font-bold text-white truncate">{data.theme}</div>
            {currentUser === 'admin' && (
                <button 
                    onClick={() => data.id && onDeleteProject(data.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderKanban = () => (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full items-start custom-scrollbar">
      {(data.phases || []).map(phase => (
        <div key={phase.id} className="w-80 flex-shrink-0 flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl max-h-full">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <h3 className="font-bold text-white text-sm truncate">{phase.name}</h3>
            <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400">{(phase.tasks || []).length}</span>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {(phase.tasks || []).map(task => {
                const isMine = canEditTask(task);
                return (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className={`p-4 bg-slate-800/80 border rounded-xl cursor-pointer hover:border-indigo-500/50 transition-all ${task.status === 'done' ? 'grayscale opacity-50 border-emerald-500/30' : 'border-slate-700'} ${!isMine && task.status !== 'done' ? 'border-dashed' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isMine ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>{task.assignee} {isMine && ' (Você)'}</span>
                        {task.status === 'done' && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {!isMine && <Lock size={12} className="text-slate-600" />}
                        </div>
                        <h4 className="text-xs text-slate-100 font-semibold mb-2 line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-3 text-[9px] text-slate-500">
                            <span className="flex items-center gap-1"><Clock size={10}/> {task.deadline}</span>
                            {(task.attachments?.length || 0) > 0 && <span className="flex items-center gap-1"><UploadCloud size={10}/> {task.attachments.length}</span>}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTeamView = () => {
    const tasksByAssignee = allTasks.reduce((acc, task) => {
        const assignee = task.assignee || 'Sem Responsável';
        if (!acc[assignee]) acc[assignee] = [];
        acc[assignee].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {Object.entries(tasksByAssignee).map(([assignee, tasks]) => {
                const isMyColumn = typeof currentUser !== 'string' && currentUser.name === assignee;
                return (
                    <div key={assignee} className={`bg-slate-900/40 rounded-2xl border overflow-hidden ${isMyColumn ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800'}`}>
                        <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isMyColumn ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{assignee.substring(0,2).toUpperCase()}</div>
                                <h3 className="text-sm font-bold text-white">{assignee} {isMyColumn && '(Você)'}</h3>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{tasks.length} Tarefas</span>
                        </div>
                        <div className="p-4 space-y-3">
                            {tasks.map(t => (
                                <div key={t.id} onClick={() => setSelectedTask(t)} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-indigo-500 transition-all cursor-pointer group">
                                    <p className="text-xs font-medium text-slate-200 line-clamp-1">{t.title}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[9px] text-slate-500 flex items-center gap-1"><Clock size={10}/> {t.deadline}</span>
                                        {t.status === 'done' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  const renderCalendarView = () => {
    const sortedTasks = [...allTasks].sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
    return (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 animate-fadeIn">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2"><CalendarIcon size={20} className="text-indigo-400" /> Cronograma de Execução</h3>
            <div className="space-y-4">
                {sortedTasks.map((task) => (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className="group flex items-start gap-4 p-4 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer border-b border-slate-800/50 last:border-0">
                        <div className="w-24 text-right pt-1">
                            <span className="text-[10px] font-black text-indigo-400 block uppercase tracking-tighter">{task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR', { weekday: 'short' }) : '---'}</span>
                            <span className="text-sm font-bold text-white">{task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '---'}</span>
                        </div>
                        <div className="w-1 bg-slate-800 rounded-full h-12 group-hover:bg-indigo-500 transition-colors"></div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-200">{task.title}</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                                {task.assignee} {canEditTask(task) && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1 rounded">Sua</span>}
                            </p>
                        </div>
                        <div className="pt-1">
                            {task.status === 'done' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700"></div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 h-16 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', icon: <Layout size={16}/>, label: 'Resumo' },
            { id: 'kanban', icon: <ListTodo size={16}/>, label: 'Kanban' },
            { id: 'team', icon: <Users size={16}/>, label: 'Equipe' },
            { id: 'calendar', icon: <CalendarIcon size={16}/>, label: 'Calendário' },
            { id: 'strategy', icon: <FileText size={16}/>, label: 'IA Plan' }
          ].map(view => (
            <button key={view.id} onClick={() => setActiveView(view.id as any)} className={`px-5 py-2 text-xs font-bold uppercase border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${activeView === view.id ? 'border-indigo-500 text-white bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-200'}`}>
              {view.icon} {view.label}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center bg-slate-800/40 border border-slate-700 rounded-lg px-3 py-1.5 gap-2">
            <Search size={14} className="text-slate-500" />
            <input 
                type="text" 
                placeholder="Buscar tarefa..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-xs text-white outline-none w-32 focus:w-48 transition-all"
            />
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'kanban' && renderKanban()}
        {activeView === 'team' && renderTeamView()}
        {activeView === 'calendar' && renderCalendarView()}
        {activeView === 'strategy' && <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap bg-slate-900/40 p-8 rounded-2xl border border-slate-800">{data.fullStrategyContent}</div>}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
              <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${canEditTask(selectedTask) ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>{selectedTask.assignee} {canEditTask(selectedTask) && ' (Você)'}</span>
                      <span className="text-slate-500 text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> {selectedTask.deadline}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar bg-[#0f172a]">
                {!canEditTask(selectedTask) && (
                    <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-xl flex items-center gap-3 text-amber-500 text-xs">
                        <Lock size={16} /> Você está visualizando esta tarefa em modo de leitura. Apenas {selectedTask.assignee} pode modificá-la.
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><FileText size={14}/> Guia de Execução (IA)</h3>
                    <div className="text-slate-300 bg-slate-800/40 p-6 rounded-2xl border border-slate-800/50 leading-relaxed text-sm shadow-inner">{selectedTask.description}</div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2"><MessageSquare size={14}/> Observações do Executor</h3>
                    <textarea 
                        value={selectedTask.observations || ''}
                        onChange={(e) => handleUpdateTaskData(selectedTask.id, { observations: e.target.value })}
                        disabled={!canEditTask(selectedTask)}
                        placeholder="Adicione observações, status ou links importantes aqui..."
                        className="w-full h-24 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-sm text-slate-300 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-600 disabled:opacity-50"
                    />
                </div>

                {selectedTask.examples && selectedTask.examples.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-2"><Sparkles size={14}/> Exemplos Criativos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedTask.examples.map((ex, i) => (
                                <div key={i} className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-100 italic leading-relaxed">
                                    "{ex}"
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><UploadCloud size={14}/> Entregáveis & Arquivos</h3>
                        {canEditTask(selectedTask) && (
                            <div className="flex gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black bg-emerald-600/20 text-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-600/30 hover:bg-emerald-600 hover:text-white transition-all">Upload Mídia</button>
                            </div>
                        )}
                    </div>

                    {/* Novo Bloco de Link Externo */}
                    {canEditTask(selectedTask) && (
                        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-3">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase">Adicionar Link Externo (Drive, Notion, etc)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input 
                                    type="text" 
                                    value={newLinkName}
                                    onChange={e => setNewLinkName(e.target.value)}
                                    placeholder="Descrição do link (ex: Roteiro Drive)"
                                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newLinkUrl}
                                        onChange={e => setNewLinkUrl(e.target.value)}
                                        placeholder="URL completa"
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                                    />
                                    <button 
                                        onClick={handleAddExternalLink}
                                        className="bg-indigo-600 p-2 rounded-lg text-white hover:bg-indigo-500 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(selectedTask.attachments || []).map(att => (
                            <div key={att.id} className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700 rounded-2xl group">
                                <div className="flex items-center gap-4">
                                    {att.type === 'link' ? <LinkIcon size={20} className="text-indigo-400"/> : <File size={20} className="text-slate-500"/>}
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-white truncate w-40">{att.name}</p>
                                        <p className="text-[10px] text-slate-500">{att.size || 'Externo'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors"><ExternalLink size={14}/></a>
                                    {canEditTask(selectedTask) && (
                                        <button onClick={() => handleRemoveAttachment(att.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-8 border-t border-slate-800 flex justify-end gap-4 bg-slate-900/50">
                {canEditTask(selectedTask) ? (
                    <button 
                        onClick={() => { handleUpdateTaskData(selectedTask.id, { status: selectedTask.status === 'done' ? 'pending' : 'done' }); setSelectedTask(null); }} 
                        className={`px-10 py-4 font-black rounded-2xl transition-all shadow-xl active:scale-95 ${selectedTask.status === 'done' ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
                    >
                        {selectedTask.status === 'done' ? 'Marcar como Pendente' : 'Finalizar Tarefa'}
                    </button>
                ) : (
                    <button disabled className="px-10 py-4 font-black rounded-2xl bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700">
                        Acesso Restrito
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchDashboard;
