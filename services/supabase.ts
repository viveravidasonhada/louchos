
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
    name: 'Lançamento Semente',
    description: 'Validação de oferta com foco em feedback e caixa rápido.',
    phases: ['Pesquisa de Avatar e Dores', 'Conteúdo de Aquecimento (Narrativa)', 'Convite para Evento Único', 'Abertura de Carrinho', 'Debriefing e Depoimentos'],
    aiContext: 'Foque em gerar autoridade rápida e usar as dúvidas dos leads para fechar vendas.'
  },
  {
    id: 'seed-interno',
    name: 'Lançamento Interno (Fórmula)',
    description: 'A estratégia clássica de 3 vídeos (CPLs) para escala máxima.',
    phases: ['Pré-Pré-Lançamento (PPL)', 'Captação de Leads (Landing Page)', 'Evento de 3 CPLs (Pré-Lançamento)', 'O Carrinho (Lançamento)', 'Upsell e Recuperação'],
    aiContext: 'A copy deve ser carregada de gatilhos: Antecipação, Prova Social e Autoridade.'
  },
  {
    id: 'seed-perpetuo',
    name: 'Funil Perpétuo (Vendas Diárias)',
    description: 'Estratégia de vendas automáticas rodando 24/7 com tráfego direto.',
    phases: ['Configuração de Tracking e Pixel', 'VSL (Video Sales Letter) de Alta Conversão', 'Estrutura de Anúncios Cold/Warm', 'Otimização de Checkout', 'E-mail Marketing de Recuperação'],
    aiContext: 'O foco é ROI diário. A IA deve sugerir variações de anúncios para teste A/B constante.'
  },
  {
    id: 'seed-youtube',
    name: 'YouTube Authority Strategy',
    description: 'Crescimento orgânico e vendas através de vídeos longos e SEO.',
    phases: ['Pesquisa de Palavras-Chave (SEO)', 'Roteirização de Vídeos de Retenção', 'Estratégia de Thumbnails Magnéticas', 'Configuração de CTAs no Meio do Vídeo', 'Live de Vendas Semanal'],
    aiContext: 'Priorize roteiros que resolvam uma dor específica nos primeiros 30 segundos.'
  },
  {
    id: 'seed-instagram',
    name: 'Instagram Sales Machine',
    description: 'Foco em Stories, Reels e automação de Direct (ManyChat).',
    phases: ['Linha Editorial de Engajamento', 'Desafio de 15 dias nos Reels', 'Funil de Direct (Automação)', 'Venda via Stories (Sequência Diária)', 'Destaques Estratégicos'],
    aiContext: 'Sugira sequências de Stories que usem enquetes para segmentar o interesse do público.'
  },
  {
    id: 'seed-tiktok',
    name: 'TikTok Viral Growth',
    description: 'Captar atenção rápida e converter via Link na Bio ou WhatsApp.',
    phases: ['Monitoramento de Trends Relevantes', 'Produção em Massa de Hooks (Ganchos)', 'Edição Dinâmica (Estilo Retenção)', 'Transição de Perfil para Business', 'Funil de Atendimento no WhatsApp'],
    aiContext: 'Os vídeos devem ter ritmo acelerado. Cada tarefa deve focar em gerar curiosidade extrema.'
  },
  {
    id: 'seed-possuido',
    name: 'Lançamento Possuído',
    description: 'Venda baseada em oferta irresistível e bônus agressivos por tempo limitado.',
    phases: ['Construção da Super Oferta', 'Aquecimento Via Lista VIP', 'Abertura Antecipada (Early Bird)', 'O Dia do "Possuído" (Pico de Vendas)', 'Encerramento com Escassez Real'],
    aiContext: 'Foque 100% no gatilho do Bônus e na Inversão de Risco.'
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
  const strategy = sanitizeStrategy(proj.strategy_json);
  return { ...strategy, id: proj.id, theme: proj.theme, createdAt: proj.created_at };
};

export const saveProject = async (input: LaunchInput, strategy: LaunchStrategyJSON): Promise<LaunchStrategyJSON> => {
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
  const sanitizedStrategy = sanitizeStrategy(strategy);
  const { error } = await supabase.from('projects').update({ strategy_json: sanitizedStrategy }).eq('id', id);
  if (error) throw error;
};

export const deleteProject = async (id: string): Promise<void> => {
  await supabase.from('projects').delete().eq('id', id);
};
