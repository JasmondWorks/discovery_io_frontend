import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  analyzeRequest,
  confirmAndRecommend,
  createChatSession,
  fetchChatHistory,
  fetchChatMessages,
  sendChatMessage,
} from "../api/chatbotApi";

export function useChatSessions() {
  return useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => fetchChatHistory(),
  });
}

export function useChatMessages(chatId?: string) {
  return useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: () => fetchChatMessages(chatId!),
    enabled: !!chatId,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChatSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, content }: { chatId: string; content: string }) =>
      sendChatMessage(chatId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.chatId],
      });
    },
  });
}

export function useAnalyzeRequest() {
  const mutation = useMutation({
    mutationFn: analyzeRequest,
  });

  return {
    analyze: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
}

export function useConfirmAndRecommend() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      chatId,
      confirmation,
    }: {
      chatId: string;
      confirmation: string;
    }) => confirmAndRecommend(chatId, confirmation),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.chatId],
      });
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });

  return {
    recommend: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
