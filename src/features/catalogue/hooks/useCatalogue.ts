import { useQuery } from "@tanstack/react-query";
import {
  fetchTools,
  fetchToolById,
  fetchWorkflows,
  fetchWorkflowById,
  fetchSolutions,
  fetchSolutionById,
  fetchPersonalizedTools,
} from "../api/catalogueApi";

export function useTools(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ["tools", params],
    queryFn: () => fetchTools(params),
  });
}

export function useTool(id?: string) {
  return useQuery({
    queryKey: ["tools", id],
    queryFn: () => fetchToolById(id!),
    enabled: !!id,
  });
}

export function usePersonalizedTools() {
  return useQuery({
    queryKey: ["tools", "personalized"],
    queryFn: () => fetchPersonalizedTools(),
  });
}

export function useWorkflows(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["workflows", params],
    queryFn: () => fetchWorkflows(params),
  });
}

export function useWorkflow(id?: string) {
  return useQuery({
    queryKey: ["workflows", id],
    queryFn: () => fetchWorkflowById(id!),
    enabled: !!id,
  });
}

export function useSolutions(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["solutions", params],
    queryFn: () => fetchSolutions(params),
  });
}

export function useSolution(id?: string) {
  return useQuery({
    queryKey: ["solutions", id],
    queryFn: () => fetchSolutionById(id!),
    enabled: !!id,
  });
}
