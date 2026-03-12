import api from "../../../api/api";

export interface Bookmark {
  id: string;
  tool_name: string;
  tool_description: string;
  tool_url: string;
  tool_id?: string;
  user_id: string;
  createdAt: string;
}

export interface CreateBookmarkPayload {
  tool_name: string;
  tool_description: string;
  tool_url: string;
  tool_id?: string;
}

export const fetchBookmarks = (params?: { page?: number; limit?: number }) =>
  api
    .get<{ success: boolean; data: Bookmark[] }>("/bookmarks", { params })
    .then((res) => res.data);

export const createBookmark = (payload: string | CreateBookmarkPayload) => {
  if (typeof payload === "string") {
    // Standard catalog tool
    return api.post(`/bookmarks/${payload}`, {}).then((res) => res.data);
  }
  // AI-generated fallback
  return api.post("/bookmarks", payload).then((res) => res.data);
};

export const deleteBookmark = (id: string) =>
  api.delete(`/bookmarks/${id}`).then((res) => res.data);
