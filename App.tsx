
import React, { useState, useEffect, useCallback } from 'react';
import LaunchForm from './components/LaunchForm';
import LaunchDashboard from './components/LaunchDashboard';
import ExpertManager from './components/ExpertManager';
import TeamManager from './components/TeamManager';
import CampaignManager from './components/CampaignManager';
import Login from './components/Login';
import { generateLaunchStrategy } from './services/geminiService';
import { 
  getExperts, 
  getTeam, 
  getProjectsList, 
  getProjectById, 
  saveProject, 
  updateProjectStrategy, 
  getCampaignBlueprints, 
  deleteProject
} from './services/supabase';
import { LaunchInput, LaunchPlanState, Expert, TeamMember, LaunchStrategyJSON, CampaignBlueprint } from './types';
import { 
  Cpu, 
  PlusCircle, 
  LogOut, 
  Loader2, 
  LayoutTemplate, 
  Rocket, 
  ArrowRight, 
  Fingerprint,
  Trash2,
  RefreshCw,
  Users,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';

type ViewState = 'login' | 'home' | 'experts' | 'team' | 'campaigns' | 'new_project' | 'dashboard';

const App: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [blueprints, setBlueprints] = useState<CampaignBlueprint[]>([]);
  const [projectsList, setProjectsList] = useState<Partial<LaunchStrategyJSON>[]>([]);
  const [projectData, setProjectData] = useState<LaunchStrategyJSON | null>(null);
  
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember | 'admin' | null>(null);
  const [view, setView] = useState<ViewState>('login');

  const [planState, setPlanState] = useState<LaunchPlanState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const loadInitialData = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const [expertsData, teamData, blueprintsData, projectsData] = await Promise.all([
        getExperts(),
        getTeam(),
        getCampaignBlueprints(),
        getProjectsList()
      ]);
      
      setExperts(expertsData);
      setTeam(teamData);
      setBlueprints(blueprintsData);
      setProjectsList(projectsData);
    } catch (error: any) {
      console.error("Critical: Failed to sync with Supabase:", error);
    } finally {
      setIsAppLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData(true);
  }, [loadInitialData]);

  const handleLogin = (user: TeamMember | 'admin') => {
    setCurrentUser(user);
    setView('home');
    loadInitialData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setProjectData(null);
  };

  const handleSwitchProject = async (projectId: string) => {
      setPlanState(prev => ({ ...prev, isLoading: true }));
      try {
          const project = await getProjectById(projectId);
          if (project) {
              setProjectData(project);
              setPlanState({ isLoading: false, error: null, data: project });
              setView('dashboard');
          }
      } catch (err) {
          console.error("Erro ao carregar projeto:", err);
      } finally {
          setPlanState(prev => ({ ...prev, isLoading: false }));
      }
  };

  const handleCreateLaunch = async (input: LaunchInput) => {
    const selectedExpert = experts.find(e => e.id === input.expertId);
    if (!selectedExpert) return;

    const selectedBlueprint = blueprints.find(b => b.id === input.blueprintId);
    setPlanState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const generatedStrategy = await generateLaunchStrategy(input, selectedExpert, team, selectedBlueprint);
      const savedStrategy = await saveProject(input, generatedStrategy);
      
      // Sincronizar lista local
      setProjectsList(prev => [{ id: savedStrategy.id, theme: savedStrategy.theme, createdAt: savedStrategy.createdAt }, ...prev]);
      
      setProjectData(savedStrategy);
      setPlanState({ isLoading: false, error: null, data: savedStrategy });
      setView('dashboard');
    } catch (error: any) {
      console.error("Erro na criação:", error);
      setPlanState(prev => ({ ...prev, isLoading: false, error: error.message }));
    }
  };

  const handleUpdateProject = async (newData: LaunchStrategyJSON) => {
    setProjectData(newData);
    if (newData.id) {
      try {
        await updateProjectStrategy(newData.id, newData);
      } catch (e) {
        console.error("Falha ao salvar atualização no DB");
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) return;
    
    // Feedback visual imediato
    setIsSyncing(true);
    
    try {
      await deleteProject(projectId);
      
      // Atualizar estados locais sem esperar novo load completo
      setProjectsList(prev => prev.filter(p => p.id !== projectId));
      
      if (projectData?.id === projectId) {
         setProjectData(null);
         setView('home');
      }
      
      console.log(`Lançamento ${projectId} removido com sucesso.`);
    } catch (error: any) {
      console.error("Erro ao deletar projeto:", error);
      alert(`Falha ao excluir do servidor: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isAppLoading) return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-4">
            <Cpu className="text-indigo-500 animate-pulse" size={48} />
            <p className="text-slate-400 font-medium tracking-widest text-xs uppercase">Conectando ao LaunchOS Cloud...</p>
          </div>
      </div>
  );

  if (!currentUser) return <Login team={team} onLogin={handleLogin} />;

  const renderContent = () => {
    switch(view) {
      case 'experts':
        return <ExpertManager experts={experts} onSave={(exs: Expert[]) => { setExperts(exs); loadInitialData(true); }} onClose={() => setView('home')} />;
      case 'team':
        return <TeamManager team={team} onSave={(t: TeamMember[]) => { setTeam(t); loadInitialData(true); }} onClose={() => setView('home')} />;
      case 'campaigns':
        return <CampaignManager blueprints={blueprints} onSave={(b: CampaignBlueprint[]) => { setBlueprints(b); loadInitialData(true); }} onClose={() => setView('home')} />;
      case 'new_project':
        return (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setView('home')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 transition-colors group"><ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Voltar para Home</button>
            <LaunchForm experts={experts} blueprints={blueprints} onSubmit={handleCreateLaunch} isLoading={planState.isLoading} onOpenExpertManager={() => setView('experts')} />
          </div>
        );
      case 'dashboard':
        return (
          <div className="h-full">
            {planState.isLoading ? (
               <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-indigo-500" size={48} />
                  <p className="text-slate-500 text-sm animate-pulse">Sincronizando estratégia mestre com a nuvem...</p>
               </div>
            ) : projectData ? (
              <LaunchDashboard 
                data={projectData} 
                projectsList={projectsList} 
                currentUser={currentUser} 
                onUpdateProject={handleUpdateProject} 
                onSwitchProject={handleSwitchProject} 
                onDeleteProject={handleDeleteProject} 
              />
            ) : <p className="text-center p-20 text-slate-500">Projeto não encontrado.</p>}
          </div>
        );
      default:
        return (
          <div className="max-w-6xl mx-auto animate-fadeIn space-y-12 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">Launch<span className="text-indigo-500">OS</span></h1>
                <p className="text-slate-400 mt-2 font-medium tracking-tight">Estrategista Inteligente • Execução Unificada</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => loadInitialData()} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all shadow-sm">
                  <RefreshCw size={20} className={isSyncing ? 'animate-spin text-indigo-400' : ''} />
                </button>
                <button onClick={() => setView('new_project')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                  <PlusCircle size={20} /> Novo Lançamento
                </button>
              </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div onClick={() => setView('experts')} className="group bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-lg">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                        <Fingerprint size={28} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Experts & Branding</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">Arquétipos e Tom de Voz que guiam a IA.</p>
                    <div className="text-amber-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        {experts.length} Expert(s) <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
                 <div onClick={() => setView('team')} className="group bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-lg">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <Users size={28} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Equipe Operacional</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">Atribua tarefas e gerencie responsabilidades.</p>
                    <div className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        {team.length} Colaboradores <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
                 <div onClick={() => setView('campaigns')} className="group bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-lg">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                        <LayoutTemplate size={28} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Blueprints Mestre</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">Estruturas táticas que a IA deve replicar.</p>
                    <div className="text-indigo-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        {blueprints.length} Modelos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {projectsList.map(p => (
                   <div key={p.id} className="relative group">
                     <div onClick={() => p.id && handleSwitchProject(p.id)} className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer group hover:shadow-2xl h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Rocket size={24} /></div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 uppercase tracking-tighter">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : ''}</span>
                        </div>
                        <h3 className="font-bold text-white truncate mb-6 text-xl">{p.theme}</h3>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-700/50 pt-6">
                          <div className="text-[10px] font-black text-indigo-400/60 flex items-center gap-2 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Execução Ativa
                          </div>
                          <div className="flex items-center text-xs text-white font-bold bg-indigo-600/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            Dashboard <ArrowRight size={14} className="ml-2" />
                          </div>
                        </div>
                     </div>
                     {currentUser === 'admin' && p.id && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); p.id && handleDeleteProject(p.id); }}
                        className="absolute -top-2 -right-2 bg-red-600 p-2 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10 hover:scale-110 active:scale-90"
                       >
                         <Trash2 size={14} />
                       </button>
                     )}
                   </div>
                 ))}
                 {projectsList.length === 0 && !isSyncing && (
                   <div className="col-span-full py-20 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600">
                      <Rocket size={48} className="mb-4 opacity-20"/>
                      <p className="font-bold uppercase tracking-widest text-xs">Nenhum lançamento ativo no momento</p>
                   </div>
                 )}
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      <nav className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-2xl sticky top-0 z-50 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/30">
                <Cpu className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">Launch<span className="text-indigo-500">OS</span></span>
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl animate-fadeIn">
                <ShieldCheck size={16} className="text-indigo-400" />
                <span className="text-xs font-black text-white uppercase tracking-tighter">{currentUser === 'admin' ? 'Acesso Total: Admin' : `${(currentUser as TeamMember).name} (${(currentUser as TeamMember).role})`}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 shadow-sm active:scale-95">
              <LogOut size={18} />
            </button>
          </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full p-8">{renderContent()}</main>
      <footer className="py-10 border-t border-slate-800 text-center bg-slate-900/50">
        <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-2">LaunchOS Cloud Enterprise v3.7 ELITE</div>
      </footer>
    </div>
  );
};

export default App;
