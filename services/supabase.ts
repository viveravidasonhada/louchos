
import { createClient } from '@supabase/supabase-js';
import { Expert, TeamMember, LaunchInput, LaunchStrategyJSON, CampaignBlueprint, LaunchPhase, Task } from '../types';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qxmderuevqhhvgsdnrub.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bWRlcnVldnFoaHZnc2RucnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODk1MTQsImV4cCI6MjA4MTQ2NTUxNH0.02eFGfWFItIQRII9ltSY9lClK8LkKaxwv3qIUO0YRhA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `id-${timestamp}-${randomStr}`;
};

/**
 * Garante que a estratégia e todos os seus filhos (fases e tarefas) tenham IDs.
 * Isso previne o bug de "finalizar todas" caso algum dado antigo esteja sem ID.
 */
const sanitizeStrategy = (strategy: LaunchStrategyJSON): LaunchStrategyJSON => {
  const sanitizedPhases = (strategy.phases || []).map(phase => {
    const phaseId = phase.id && phase.id !== 'undefined' ? phase.id : generateId();
    return {
      ...phase,
      id: phaseId,
      tasks: (phase.tasks || []).map(task => {
        const taskId = task.id && task.id !== 'undefined' ? task.id : generateId();
        return {
          ...task,
          id: taskId,
          status: task.status || 'pending',
          attachments: task.attachments || []
        };
      })
    };
  });

  return {
    ...strategy,
    phases: sanitizedPhases
  };
};

const MOCK_BLUEPRINTS: CampaignBlueprint[] = [
  {
    id: 'seed-semente',
    name: 'Lançamento Semente (Validação)',
    description: 'Validar oferta e audiência com baixo investimento. Ideal para quem está começando.',
    phases: ['Pesquisa de Público e Avatar', 'Aquecimento no Instagram (Stories/Feed)', 'Convite para Aula ao Vivo (YouTube)', 'Abertura de Carrinho e Feedbacks'],
    aiContext: 'Foque em gerar desejo através de conteúdo educacional.'
  },
  {
    id: 'seed-interno',
    name: 'Lançamento Interno (Escala)',
    description: 'Escalar faturamento com base de leads e múltiplos vídeos de conteúdo.',
    phases: ['PPL (Pré-pré-lançamento)', 'PL (Pré-lançamento com 3 CPLs)', 'Lançamento (Venda)', 'Pós-venda e Downsell'],
    aiContext: 'Copy focada em antecipação.'
  },
  {
    id: 'seed-meteorico',
    name: 'Lançamento Meteórico (WhatsApp)',
    description: 'Estratégia de 3 dias focada em grupos de WhatsApp e escassez extrema.',
    phases: ['Captação de Leads para Grupos', 'Aquecimento nos Grupos', 'O Dia da Oferta (Abertura)', 'Encerramento e Limpeza'],
    aiContext: 'Foque 100% em escassez e urência.'
  }
];

export const getExperts = async (): Promise<Expert[]> => {
  const { data, error } = await supabase.from('experts').select('*').order('name');
  if (error) return [];
  return data.map((e: any) => ({
    id: e.id,
    name: e.name, niche: e.niche, communicationStyle: e.communication_style, branding: e.branding, avatar: e.avatar
  }));
};

export const saveExpert = async (expert: Expert): Promise<Expert> => {
  const id = expert.id && !expert.id.startsWith('local-') && !expert.id.startsWith('id-') ? expert.id : generateId();
  const payload = { 
    name: expert.name, 
    niche: expert.niche, 
    communication_style: expert.communicationStyle, 
    branding: expert.branding, 
    avatar: expert.avatar 
  };
  const { data, error } = await supabase.from('experts').upsert({ ...payload, id }).select().single();
  if (error) throw error;
  return data;
};

export const deleteExpert = async (id: string): Promise<void> => {
  await supabase.from('experts').delete().eq('id', id);
};

export const getTeam = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase.from('team').select('*').order('name');
  if (error) return [{ id: 'admin', name: 'Admin', role: 'Strategist', email: 'admin@launchos.ai' }];
  return data;
};

export const saveTeamMember = async (member: TeamMember): Promise<TeamMember> => {
  const id = member.id && !member.id.startsWith('local-') && !member.id.startsWith('id-') ? member.id : generateId();
  const { data, error } = await supabase.from('team').upsert({ ...member, id }).select().single();
  if (error) throw error;
  return data;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  await supabase.from('team').delete().eq('id', id);
};

export const getCampaignBlueprints = async (): Promise<CampaignBlueprint[]> => {
  const { data } = await supabase.from('campaign_blueprints').select('*').order('name');
  return [...MOCK_BLUEPRINTS, ...(data || [])];
};

export const saveCampaignBlueprint = async (bp: CampaignBlueprint): Promise<CampaignBlueprint> => {
  const id = bp.id && !bp.id.startsWith('seed-') && !bp.id.startsWith('id-') ? bp.id : generateId();
  const { data, error } = await supabase.from('campaign_blueprints').upsert({ ...bp, id }).select().single();
  if (error) throw error;
  return data;
};

export const deleteCampaignBlueprint = async (id: string): Promise<void> => {
  await supabase.from('campaign_blueprints').delete().eq('id', id);
};

export const getProjectsList = async (): Promise<Partial<LaunchStrategyJSON>[]> => {
  const { data } = await supabase.from('projects').select('id, theme, created_at').order('created_at', { ascending: false });
  return (data || []).map((p: any) => ({ id: p.id, theme: p.theme, createdAt: p.created_at }));
};

export const getProjectById = async (id: string): Promise<LaunchStrategyJSON | null> => {
  const { data: proj, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error || !proj) return null;
  // Sanitiza ao carregar para corrigir dados legados
  const strategy = sanitizeStrategy(proj.strategy_json);
  return { ...strategy, id: proj.id, theme: proj.theme, createdAt: proj.created_at };
};

export const saveProject = async (input: LaunchInput, strategy: LaunchStrategyJSON): Promise<LaunchStrategyJSON> => {
  // Sanitiza antes de salvar
  const sanitizedStrategy = sanitizeStrategy(strategy);

  const { data, error } = await supabase.from('projects').insert([{
      theme: input.theme,
      expert_id: input.expertId,
      input_json: input,
      strategy_json: sanitizedStrategy
  }]).select().single();

  if (error) throw error;
  return { ...sanitizedStrategy, id: data.id, theme: data.theme, createdAt: data.created_at };
};

export const updateProjectStrategy = async (id: string, strategy: LaunchStrategyJSON): Promise<void> => {
  // Sanitiza antes de atualizar para garantir integridade
  const sanitizedStrategy = sanitizeStrategy(strategy);
  const { error } = await supabase.from('projects').update({ strategy_json: sanitizedStrategy }).eq('id', id);
  if (error) throw error;
};

export const deleteProject = async (id: string): Promise<void> => {
  await supabase.from('projects').delete().eq('id', id);
};
