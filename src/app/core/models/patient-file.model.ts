export interface PatientFile {
  id: string;
  fileName: string;
  contentType: string;
  downloadUrl: string;
  uploadedByName: string;
  createdAt: string;
}

export interface UploadUrlResponse {
  fileId: string;
  uploadUrl: string;
  key: string;
}
