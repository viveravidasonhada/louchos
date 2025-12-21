
import { GoogleGenAI, Type } from "@google/genai";
import { LaunchInput, LaunchStrategyJSON, Expert, TeamMember, CampaignBlueprint } from "../types";
import { generateId } from "./supabase";

export const generateLaunchStrategy = async (
  input: LaunchInput, 
  expert: Expert, 
  team: TeamMember[],
  blueprint?: CampaignBlueprint
): Promise<LaunchStrategyJSON> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const brandData = expert.branding || {
    archetype: 'Não definido',
    toneOfVoice: 'Profissional',
    contentPillars: 'Geral',
    visualIdentity: 'Geral',
    brandManifesto: 'Geral'
  };

  const teamList = team.map(m => `${m.name} (${m.role})`).join(", ");

  const SYSTEM_PROMPT = `Você é um MESTRE ESTRATEGISTA DE LANÇAMENTOS (Elite Level) com foco em ROI e Execução.
Sua missão é criar o PLANO DE GUERRA de um lançamento, incorporando a essência do Expert e distribuindo tarefas técnicas para a EQUIPE disponível.

EQUIPE DISPONÍVEL (Distribua as tarefas baseando-se nestes nomes e cargos):
${teamList}

REGRAS DE ESTRATEGISTA:
1. ESSÊNCIA DO EXPERT: Use o tom "${brandData.toneOfVoice}" e o arquétipo "${brandData.archetype}".
2. ESTRUTURA TÉCNICA (BLUEPRINT): Você DEVE seguir a lógica técnica deste modelo: ${blueprint?.aiContext}. 
   - Ex: Se for Lançamento Interno, inclua as fases de PPL, CPLs e a hierarquia de remarketing Sobral para o Gestor de Tráfego.
3. TAREFAS NOMICAS: Cada tarefa deve ser atribuída a uma pessoa real da lista acima.
4. RATIONALE ESTRATÉGICO: Explique o porquê técnico de cada ação (ex: "Usamos Meta Leads Ads nesta fase para baixar o CPL").
5. COMUNICAÇÃO: Forneça scripts prontos para WhatsApp, E-mails e Anúncios.

RESULTADO: Um JSON estruturado onde a estratégia se traduz em ações nominais e prazos lógicos dentro do período ${input.startDate} a ${input.endDate}.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING, description: "Resumo macro da estratégia e visão de faturamento" },
      phases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  strategicRationale: { type: Type.STRING, description: "O pensamento por trás desta ação" },
                  script: { type: Type.STRING, description: "Copy ou roteiro pronto" },
                  scriptChannel: { type: Type.STRING },
                  assignee: { type: Type.STRING, description: "NOME do membro da equipe (obrigatório)" },
                  deadline: { type: Type.STRING }
                },
                required: ["title", "assignee", "deadline", "strategicRationale"]
              }
            }
          },
          required: ["name", "tasks"]
        }
      }
    },
    required: ["executiveSummary", "phases"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Expert: ${expert.name}. Nicho: ${expert.niche}. Tema: ${input.theme}. Datas: ${input.startDate} a ${input.endDate}. Meta: ${input.goal}. Budget Tráfego: ${input.budget}. Público-alvo: ${input.targetAudience}.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const rawData = JSON.parse(response.text || '{}');
    
    const sanitizedPhases = (rawData.phases || []).map((phase: any) => ({
      ...phase,
      id: generateId(),
      status: 'active',
      tasks: (phase.tasks || []).map((task: any) => ({
        ...task,
        id: generateId(),
        status: 'pending',
        attachments: [],
        script: task.script || '',
        strategicRationale: task.strategicRationale || '',
        scriptChannel: task.scriptChannel || 'whatsapp'
      }))
    }));

    return {
      executiveSummary: rawData.executiveSummary,
      expertProfile: {
        tone: brandData.toneOfVoice,
        keywords: [],
        styleAnalysis: brandData.brandManifesto
      },
      phases: sanitizedPhases,
      fullStrategyContent: rawData.executiveSummary,
      theme: input.theme
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
