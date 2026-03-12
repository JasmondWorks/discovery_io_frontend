import api from "../../../api/api";
import type {
  ChatMessage,
  ProfessionalProfile,
  CreateChatResponse,
  SendMessageResponse,
} from "../../../api/types";

export interface ChatIntent {
  user_persona: string;
  core_task: string;
  success_criteria: string;
  is_clarification_needed: boolean;
}

export interface AnalyzeRequestPayload {
  input: string;
  userContext?: ProfessionalProfile;
}

// NOTE: The api.ts response interceptor auto-unwraps JSend envelopes,
// so res.data is already the inner payload — do NOT access res.data.data.
export const createChatSession = (prompt?: string) =>
  api.post<CreateChatResponse>("/chats", { prompt }).then((res) => res.data);

export const fetchChatHistory = (page = 1, limit = 10) =>
  api
    .get<{ data: CreateChatResponse[]; total: number }>("/chats", {
      params: { page, limit },
    })
    .then((res) => res.data.data);

export const fetchChatMessages = (chatId: string) =>
  api.get<ChatMessage[]>(`/chats/${chatId}/messages`).then((res) => res.data);

export const sendChatMessage = (chatId: string, content: string) =>
  api
    .post<ChatMessage[]>(`/chats/${chatId}/messages`, { content })
    .then((res) => res.data);

// Step 1: Initial analysis/clarification
export const analyzeRequest = (payload: AnalyzeRequestPayload) =>
  api
    .post<CreateChatResponse>("/chats", { prompt: payload.input })
    .then((res) => res.data);

// Step 2: Confirming and getting recommendations
export const confirmAndRecommend = (chatId: string, confirmation: string) =>
  api
    .post<SendMessageResponse>(`/chats/${chatId}/messages`, {
      content: confirmation,
    })
    .then((res) => res.data);
