
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
  const sanitizedPhases: LaunchPhase[] = (strategy.phases || []).map(phase => {
    const phaseId = phase.id && phase.id !== 'undefined' ? phase.id : generateId();
    return {
      ...phase,
      id: phaseId,
      status: phase.status || 'locked',
      tasks: (phase.tasks || []).map(task => {
        const taskId = task.id && task.id !== 'undefined' ? task.id : generateId();
        return {
          ...task,
          id: taskId,
          status: task.status || 'pending',
          attachments: task.attachments || [],
          observations: task.observations || '',
          script: task.script || '',
          strategicRationale: task.strategicRationale || '',
          scriptChannel: task.scriptChannel || 'whatsapp'
        };
      })
    };
  });

  return {
    ...strategy,
    phases: sanitizedPhases,
    messageFlows: strategy.messageFlows || []
  };
};

const MOCK_BLUEPRINTS: CampaignBlueprint[] = [
  {
    id: 'seed-semente',
    name: 'Lançamento Semente',
    description: 'Validação de oferta e produto. Venda antes da produção final.',
    phases: ['Pré-lançamento (Atração)', 'Lançamento (Webinário)', 'Fechamento (Urgência)', 'Pós-lançamento (Onboarding)'],
    aiContext: `ESTRUTURA TÁTICA SEMENTE:
    1. PRÉ: Conteúdo de valor em Reels/Stories, isca digital e convite para aula ao vivo única.
    2. LANÇAMENTO: Live de vendas única com pitch de gatilho de escassez. Interação em tempo real no chat.
    3. FECHAMENTO: Sequência de e-mails diários (4 dias) e WhatsApp Broadcast. Contato 1-a-1 com leads quentes (Closer).
    4. PÓS: Entrega de módulos semanais ao vivo para colher feedback e criar o produto com os alunos.`
  },
  {
    id: 'seed-interno',
    name: 'Lançamento Interno (Clássico)',
    description: 'Estratégia de 3 CPLs para escala máxima com base própria.',
    phases: ['Aquecimento (PPL)', 'Pré-lançamento (CPLs)', 'Lançamento (Carrinho)', 'Fechamento & Pós'],
    aiContext: `ESTRUTURA TÁTICA INTERNO:
    1. AQUECIMENTO (3 semanas): Reativar audiência com posts de valor e "Tiro de Alerta".
    2. PRÉ-LANÇAMENTO: 3 Vídeos (CPL1: Oportunidade, CPL2: Metodologia, CPL3: Atalho/Oferta).
    3. LANÇAMENTO (7 dias): Carrinho aberto. Sequência de e-mails D1-D7. Live de Q&A no dia 1 e dia 7.
    4. PÓS: Onboarding automatizado e Reabertura Passariana (se aplicável).`
  },
  {
    id: 'seed-externo',
    name: 'Lançamento Externo',
    description: 'Foco em parcerias, afiliados e influenciadores para escala externa.',
    phases: ['Recrutamento de Parceiros', 'Pré-lançamento Ampliado', 'Execução (CPL + Carrinho)', 'Debriefing com Parceiros'],
    aiContext: `ESTRUTURA TÁTICA EXTERNO:
    1. RECRUTAMENTO: Seleção de parceiros, kit de materiais (swipes, artes, links) e alinhamento de comissões (30-50%).
    2. AQUECIMENTO: Colabs com parceiros e lives conjuntas para transferir autoridade.
    3. EXECUÇÃO: Gestão de tráfego em escala. Suporte robusto para dúvidas de público frio.
    4. FECHAMENTO: Cálculo de comissões e análise de performance por afiliado.`
  },
  {
    id: 'seed-perpetuo',
    name: 'Lançamento Perpétuo',
    description: 'Vendas diárias automáticas com funil de nutrição constante.',
    phases: ['Setup do Funil', 'Aquisição de Tráfego', 'Nutrição & Vendas', 'Suporte & Manutenção'],
    aiContext: `ESTRUTURA TÁTICA PERPÉTUO:
    1. SETUP: Landing page, VSL (Video Sales Letter) e automação de e-mails (7 dias).
    2. TRÁFEGO: Anúncios sempre ativos (Ads) renovados a cada 2-3 semanas para evitar saturação.
    3. AUTOMAÇÃO: Gatilhos de escassez individual (Deadline Funnel) e segmentação por comportamento.
    4. MANUTENÇÃO: Testes A/B constantes em headlines e botões de checkout.`
  },
  {
    id: 'seed-relampago',
    name: 'Lançamento Relâmpago',
    description: 'Injeção de caixa rápido (5-7 dias) para base engajada.',
    phases: ['Definição da Oferta', 'Execução (Sequência Curta)', 'Fechamento'],
    aiContext: `ESTRUTURA TÁTICA RELÂMPAGO:
    1. OFERTA: Desconto agressivo ou bônus inédito por tempo curtíssimo.
    2. EXECUÇÃO: Sequência de 4 e-mails (Anúncio, Benefícios, FAQ/Dúvidas, Last Call).
    3. FOCO: 100% em Gatilhos de Urgência e Escassez para base que já conhece o produto.`
  },
  {
    id: 'seed-meteorico',
    name: 'Lançamento Meteórico',
    description: 'Vendas ultra-rápidas via Grupos VIP de WhatsApp.',
    phases: ['Captação VIP', 'Aquecimento no Grupo', 'Dia do Lançamento', 'Pós-Meteórico'],
    aiContext: `ESTRUTURA TÁTICA METEÓRICO:
    1. CAPTAÇÃO: Convite para grupo silencioso. Gatilhos de Pertencimento e Antecipação.
    2. AQUECIMENTO (D1-D3): Vídeos informais (celular), revelação do desconto e quebra de objeções.
    3. LANÇAMENTO (D4): Abertura do carrinho no grupo. Prova social instantânea ("Parabéns Fulano!").
    4. FECHAMENTO: 24h a 48h de vendas intensas com suporte total no privado.`
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
  const { error } = await supabase.from('experts').delete().eq('id', id);
  if (error) throw error;
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
  const { error } = await supabase.from('team').delete().eq('id', id);
  if (error) throw error;
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
  const { error } = await supabase.from('campaign_blueprints').delete().eq('id', id);
  if (error) throw error;
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
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error("Erro ao deletar projeto no Supabase:", error);
    throw new Error(error.message);
  }
};
