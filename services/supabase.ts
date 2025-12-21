
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
    name: 'Lançamento Semente (Validação)',
    description: 'Focado em validar oferta e produto com baixo investimento.',
    defaultDurationDays: 18,
    phases: ['Captação de Leads', 'Show-up (Aquecimento)', 'Live de Vendas', 'Carrinho Aberto', 'Pós-Venda'],
    aiContext: `ESTRUTURA TÁTICA SEMENTE:
    - TRÁFEGO: 70% Verba em Captação (Meta Ads). 10% em Lembretes (Alcance). 20% em Remarketing de Venda.
    - OBJETIVO: Coletar dúvidas na captação para usar no pitch da live.
    - COPY: Foco em "Oportunidade de Ouro" e construção conjunta do produto.`
  },
  {
    id: 'seed-interno',
    name: 'Lançamento Interno (Alta Performance)',
    description: 'Estratégia clássica de 3 CPLs para escala com base própria.',
    defaultDurationDays: 42,
    phases: ['PPL: Construção de Lista', 'PL: Conteúdo CPL (1, 2, 3)', 'Lançamento: Carrinho Aberto', 'Urgência: Últimas Horas', 'Pós-Lançamento'],
    aiContext: `ESTRUTURA TÁTICA INTERNO:
    - TRÁFEGO PPL (40-60%): Meta Ads e YouTube Discovery para novos leads e engajamento da base.
    - TRÁFEGO PL (15-25%): Distribuição dos CPLs via Video Views no FB/IG e In-Stream no YouTube. Omnipresença via Google Display.
    - TRÁFEGO VENDAS (30-40%): Conversão focada em Hierarquia Sobral (Checkout > Inscritos > Engajados). Google Search para proteção de marca.
    - BENCHMARKS: ROI 5-10x. CPL R$2,00 - R$10,00.`
  },
  {
    id: 'seed-externo',
    name: 'Lançamento Externo (Escala Massiva)',
    description: 'Expansão agressiva através de parceiros e rede de afiliados.',
    defaultDurationDays: 45,
    phases: ['Recrutamento de Parceiros & Kit', 'Captação de Leads em Massa', 'PL: Conteúdo Amplificado', 'Vendas: Remarketing Multicamadas', 'Urgência & Debriefing'],
    aiContext: `ESTRUTURA TÁTICA EXTERNO:
    - MAESTRO: Coordenar pixels com afiliados e evitar canibalização no Google Search.
    - CANAIS: Meta, YouTube, TikTok Ads e Mídia Programática (Taboola) para awareness.
    - TRÁFEGO VENDAS: Remarketing pesado para leads de parceiros. Campanhas de "re-educação" para leads menos engajados.
    - BENCHMARKS: Faturamento 7 dígitos. CPL R$10-15. ROI 5-8x.`
  },
  {
    id: 'seed-perpetuo',
    name: 'Lançamento Perpétuo (Funil Always-On)',
    description: 'Vendas diárias automáticas com funil de nutrição evergreen.',
    defaultDurationDays: 30,
    phases: ['Setup do Funil Contínuo', 'Aquisição Topo de Funil', 'Nutrição Meio de Funil', 'Conversão Fundo de Funil', 'Otimização & Escala LTV'],
    aiContext: `ESTRUTURA TÁTICA PERPÉTUO:
    - TRÁFEGO: Campanhas Always-On. Prospecção constante (Lookalikes amplos).
    - URGÊNCIA: Implementar Deadline Funnel (escassez individualizada).
    - REMARKETING: Segmentação por tempo (3, 7, 14, 30 dias).
    - ESCALA: Técnica "Montinho-Montão". Foco em ROI estável 3-5x e CAC < LTV.
    - EXCLUSÃO: Rigorosa exclusão de compradores de todas as campanhas.`
  },
  {
    id: 'seed-relampago',
    name: 'Lançamento Relâmpago (Injeção de Caixa)',
    description: 'Oferta ultra-rápida (24h-48h) focado exclusivamente em base morna/quente.',
    defaultDurationDays: 7,
    phases: ['Definição da Oferta & Bônus de Velocidade', 'Antecipação Curta (Base)', 'Execução: Abertura Express (24h-48h)', 'Fechamento Imediato & Debriefing'],
    aiContext: `ESTRUTURA TÁTICA RELÂMPAGO (CASH INJECTION):
    - PÚBLICO: 100% QUENTE. Excluir completamente públicos frios. 
    - TRÁFEGO (Remarketing Puro): Meta Ads (Públicos: Lista de Emails, Visitantes 30d, Envolvidos 7d, Carrinho Abandonado).
    - ESTRATÉGIA DE ANÚNCIO: Objetivo Alcance com frequência alta (2-3x ao dia) para não perder o timing.
    - GOOGLE ADS: Search focado em Marca + Termos sazonais (ex: "Black Friday", "Oferta Especial").
    - COPY: Foco total em Escassez Imediata ("Só Hoje", "Últimas Horas", "Link Expira em 24h").
    - BENCHMARKS: ROI alvo 10x+. Investimento sugerido: 5-10% do faturamento esperado.`
  },
  {
    id: 'seed-meteorico',
    name: 'Lançamento Meteórico (WhatsApp VIP)',
    description: 'Vendas explosivas de 24h via Grupos VIP. ROI altíssimo e baixo investimento.',
    defaultDurationDays: 12,
    phases: ['Antecipação & Captação VIP (WhatsApp)', 'Pertencimento (Aquecimento no Grupo)', 'Dia D: Oferta Meteórica (24h)', 'Escassez Final & Fechamento', 'Debriefing e Caixa'],
    aiContext: `ESTRUTURA TÁTICA METEÓRICO (MÁQUINA DE WHATSAPP):
    - TRÁFEGO CAPTAÇÃO (Principal): Meta Ads (FB/IG Stories). Focar em 4-7 dias intensos. Objetivo: Cliques para WhatsApp ou Conversão p/ LP de Grupo.
    - SEGMENTAÇÃO: Lookalike 1% de Compradores + Envolvidos 30d. Públicos frios amplos com filtro de interesse mínimo.
    - MECÂNICA DO GRUPO: Silenciar grupo -> Enviar teasers diários -> Revelar oferta 24h antes -> Abrir link de vendas por apenas 24h.
    - REMARKETING: Retargeting de quem visitou a página de grupo mas não entrou. Google Search para proteção de marca (Expert + Oferta).
    - BENCHMARKS: ROI 15x-20x. Conversão esperada de ~10% dos membros do grupo.
    - SEGURANÇA: Cumprir rigorosamente a escassez (tirar do ar após 24h) para educar a base.`
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
