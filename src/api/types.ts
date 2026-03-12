// Types for Discover IO API

export interface ProfessionalProfile {
  industry:
    | "software_development"
    | "design"
    | "marketing"
    | "content_creation"
    | "other";
  core_role:
    | "software_engineer"
    | "graphic_designer"
    | "content_writer"
    | "product_manager"
    | "marketer"
    | "other";
  experience_level: "beginner" | "intermediate" | "advanced" | "expert";
  key_skills: string[];
  primary_tools: string[];
  daily_responsibilities: string[];
  current_objectives: string[];
  main_pain_points: string[];
  detailed_context?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  active: boolean;
  professionalProfile?: ProfessionalProfile;
  onboardingCompleted?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  pricing: string;
  platform: string;
  verified_use_cases: string[];
  category: string;
  tags: string[];
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  complexity: "Beginner" | "Intermediate" | "Advanced";
  use_cases: string[];
  steps: string[];
  recommended_tools: string[];
}

export interface Solution {
  id: string;
  issue_title: string;
  description: string;
  tags: string[];
  cause_explanation: string;
  resolution_steps: string[];
  tradeoffs: string;
  recommended_tools: string[];
}

export interface Bookmark {
  id: string;
  user_id: string;
  tool_id?: string | null;
  tool_name: string;
  tool_description: string;
  tool_url: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  createdAt: string;
}

export interface ToolRecommendation {
  name: string;
  rationale: string;
  usefulness_score: number;
  relevance_score: number;
  reliability_score: number;
  comparison_vs_alternatives: string;
}

export interface WorkflowRecommendation {
  title: string;
  steps: string[];
  advantages_of_this_workflow: string;
}

export interface SolutionRecommendation {
  issue_title: string;
  cause_explanation: string;
  resolution_steps: string[];
  why_this_fix_is_optimal: string;
}

export interface ExpertAdvice {
  message: string;
  recommended_tools: ToolRecommendation[];
  recommended_workflows: WorkflowRecommendation[];
  recommended_solutions: SolutionRecommendation[];
  tradeoff_analysis: string;
}

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  role: "user" | "assistant" | "system";
  content: string | ExpertAdvice;
  createdAt: string;
}

export interface ChatIntent {
  user_persona: string;
  core_task: string;
  success_criteria: string;
  is_clarification_needed: boolean;
}

export interface PersonalizedCatalog {
  grouped: boolean;
  role?: string;
  industry?: string;
  catalog: Record<string, Tool[]>;
}
export interface CreateChatResponse extends ChatSession {
  extracted_intent: ChatIntent;
  status: string;
}
export interface SendMessageResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
}
