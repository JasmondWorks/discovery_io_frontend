import api from "../../../api/api";
import type {
  Tool,
  Workflow,
  Solution,
  PersonalizedCatalog,
} from "../../../api/types";

export const fetchTools = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) => api.get<Tool[]>("/tools", { params }).then((res) => res.data);

export const fetchToolById = (id: string) =>
  api.get<Tool>(`/tools/${id}`).then((res) => res.data);

export const fetchPersonalizedTools = () =>
  api.get<PersonalizedCatalog>("/tools/for-me").then((res) => res.data);

export const fetchWorkflows = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => api.get<Workflow[]>("/workflows", { params }).then((res) => res.data);

export const fetchWorkflowById = (id: string) =>
  api.get<Workflow>(`/workflow/${id}`).then((res) => res.data);

export const fetchSolutions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => api.get<Solution[]>("/solutions", { params }).then((res) => res.data);

export const fetchSolutionById = (id: string) =>
  api.get<Solution>(`/solution/${id}`).then((res) => res.data);
