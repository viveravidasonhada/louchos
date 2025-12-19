
export interface LaunchInput {
  expertId: string;
  projectType: string;
  blueprintId?: string;
  theme: string;
  targetAudience: string;
  goal: string;
  budget: string;
  startDate: string;
  endDate: string;
}

export interface LaunchSection {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export interface BrandIdentity {
  archetype: string;
  toneOfVoice: string;
  contentPillars: string;
  visualIdentity: string;
  brandManifesto: string;
}

export interface Expert {
  id: string;
  name: string;
  niche: string;
  communicationStyle: string;
  avatar?: string;
  branding?: BrandIdentity;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Copywriter' | 'Designer' | 'Tráfego' | 'Strategist' | 'Tech' | 'VideoMaker' | 'Social Media' | 'Support';
  email: string;
  password?: string;
  avatar?: string;
}

export interface CampaignBlueprint {
  id: string;
  name: string;
  description: string;
  phases: string[]; 
  aiContext: string;
}

export type AttachmentType = 'image' | 'video' | 'doc' | 'link';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size?: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  observations?: string; // Novo campo para notas da equipe
  examples?: string[];
  assignee: string;
  assigneeId?: string;
  status: 'pending' | 'in_progress' | 'review' | 'done';
  dependency?: string;
  deadline?: string;
  attachments: Attachment[]; // Sempre presente como array (vazio por padrão)
  comments?: string[];
  completedAt?: string;
}

export interface LaunchPhase {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  status: 'locked' | 'active' | 'completed';
}

export interface LaunchStrategyJSON {
  id?: string;
  theme?: string;
  createdAt?: string;
  executiveSummary: string;
  expertProfile: {
    tone: string;
    keywords: string[];
    styleAnalysis: string;
  };
  phases: LaunchPhase[];
  fullStrategyContent: string;
}

export interface LaunchPlanState {
  isLoading: boolean;
  error: string | null;
  data: LaunchStrategyJSON | null;
}

export interface UserSession {
  user: TeamMember | 'admin';
  isAuthenticated: boolean;
}
