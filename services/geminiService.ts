
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

  const SYSTEM_PROMPT = `Você é um MESTRE ESTRATEGISTA DE LANÇAMENTOS com 15 anos de experiência e múltiplos "7 em 7". 
Sua missão é criar a ESTRATÉGIA COMPLETA de um lançamento, incorporando a essência do Expert e distribuindo tarefas para a EQUIPE disponível.

EQUIPE DISPONÍVEL (Atribua cada tarefa a um desses nomes):
${teamList}

DIRETRIZES DE ESTRATEGISTA:
1. ESSÊNCIA DO EXPERT: Use o tom "${brandData.toneOfVoice}" e o arquétipo "${brandData.archetype}". O manifesto "${brandData.brandManifesto}" deve guiar a narrativa principal.
2. VISÃO 360º: A estratégia deve cobrir: Tráfego Pago, Design, Copywriting, Configuração Técnica, Vídeo e Suporte.
3. BLUEPRINT: Siga rigorosamente a estrutura técnica do modelo: ${blueprint?.aiContext}.
4. UNIFICAÇÃO: Cada tarefa deve conter:
   - 'strategicRationale': Explicação sênior do porquê esta tarefa é vital para o ROI.
   - 'script': Se for uma tarefa de comunicação (WhatsApp, E-mail, Vídeo, Chat de Live), forneça a copy pronta.

RESULTADO: Um JSON estruturado onde a estratégia se traduz em ações concretas para cada membro da equipe.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING, description: "Plano de guerra macro e visão estratégica do lançamento" },
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
                  strategicRationale: { type: Type.STRING, description: "O pensamento estratégico por trás desta ação" },
                  script: { type: Type.STRING, description: "Copy pronta ou roteiro detalhado (se aplicável)" },
                  scriptChannel: { type: Type.STRING },
                  assignee: { type: Type.STRING, description: "NOME do membro da equipe atribuído (deve ser um dos nomes fornecidos)" },
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
      contents: `Expert: ${expert.name}. Nicho: ${expert.niche}. Tema: ${input.theme}. Datas: ${input.startDate} a ${input.endDate}. Objetivo: ${input.goal}.`,
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
