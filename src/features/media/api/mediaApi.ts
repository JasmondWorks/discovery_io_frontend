import api from "../../../api/api";

export interface UploadMediaPayload {
  file: File;
  folder?: string;
}

export interface UploadMediaResponse {
  // Define response fields if backend provides them, e.g., url, public_id
  url?: string;
  [key: string]: any;
}

export const uploadMedia = (payload: UploadMediaPayload) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  if (payload.folder) {
    formData.append("folder", payload.folder);
  }

  // Passing the formData as the body
  return api
    .post<UploadMediaResponse>("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};
