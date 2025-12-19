
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

  const teamListString = team.map(t => `- ${t.name} (${t.role})`).join('\n');
  
  const brandData = expert.branding || {
    archetype: 'Não definido',
    toneOfVoice: 'Profissional',
    contentPillars: 'Geral',
    visualIdentity: 'Geral',
    brandManifesto: 'Geral'
  };

  const SYSTEM_PROMPT = `Você é o LaunchOS 3.1. Gere um plano tático operacional em JSON.
- REGRAS CRÍTICAS:
1. FOCO TOTAL EM UNICIDADE: Cada tarefa deve ser distinta e possuir sua própria descrição.
2. DATAS: Use formato YYYY-MM-DD rigorosamente.
3. Arquetipo: ${brandData.archetype}. Tom: ${brandData.toneOfVoice}.
4. Distribua as tarefas proporcionalmente entre ${input.startDate} e ${input.endDate}.
5. Retorne um JSON válido conforme o schema.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING },
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
                  examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                  assignee: { type: Type.STRING },
                  deadline: { type: Type.STRING }
                },
                required: ["title", "assignee", "deadline"]
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
      contents: `Gerar lançamento: ${input.theme}. Público: ${input.targetAudience}. Objetivo: ${input.goal}. Equipe disponível: ${teamListString}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const rawData = JSON.parse(response.text || '{}');
    
    // ATENÇÃO: Atribuição de IDs únicos logo na saída da IA
    const sanitizedPhases = (rawData.phases || []).map((phase: any) => ({
      ...phase,
      id: generateId(),
      tasks: (phase.tasks || []).map((task: any) => ({
        ...task,
        id: generateId(), // ID ÚNICO PARA CADA TAREFA
        status: 'pending',
        attachments: []
      }))
    }));

    let markdown = `# ${input.theme}\n\n${rawData.executiveSummary}\n\n`;
    sanitizedPhases.forEach((p: any) => {
        markdown += `## ${p.name}\n${p.description}\n`;
        p.tasks.forEach((t: any) => markdown += `- [ ] ${t.title} (${t.deadline}) - Resp: ${t.assignee}\n`);
        markdown += `\n`;
    });

    const finalData: LaunchStrategyJSON = {
      executiveSummary: rawData.executiveSummary,
      expertProfile: {
        tone: brandData.toneOfVoice,
        keywords: [],
        styleAnalysis: brandData.brandManifesto
      },
      phases: sanitizedPhases,
      fullStrategyContent: markdown,
      theme: input.theme
    };

    return finalData;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
