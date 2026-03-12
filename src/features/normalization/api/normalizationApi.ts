import api from "../../../api/api";

export type SchemaType =
  | "product"
  | "event"
  | "contact"
  | "professional_profile";

export interface NormalizePayload {
  input: string;
  schemaType: SchemaType;
  provider?: string;
}

export interface NormalizeProfessionPayload {
  input: string;
  provider?: string;
}

export interface NormalizeResponse {
  success: boolean;
  data: Record<string, any>;
  message: string;
}

// Special case for the profession, defining exact fields mapped from swagger
export interface ProfessionalProfileData {
  industry?: string;
  core_role?: string;
  experience_level?: string;
  key_skills?: string[];
  primary_tools?: string[];
  daily_responsibilities?: string[];
  current_objectives?: string[];
  main_pain_points?: string[];
  detailed_context?: string;
}

export interface NormalizeProfessionResponse extends NormalizeResponse {
  data: ProfessionalProfileData;
}

export const normalizeData = (payload: NormalizePayload) =>
  api.post<NormalizeResponse>("/normalize", payload).then((res) => res.data);

export const normalizeProfession = (payload: NormalizeProfessionPayload) =>
  api
    .post<NormalizeProfessionResponse>("/normalize/profession", payload)
    .then((res) => res.data);
