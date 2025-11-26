export interface ExportRequest {
  includeGraphs?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExportResponse {
  exportId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  message: string;
}

export interface ExportLog {
  id: string;
  patientId: number;
  therapistId: number;
  exportType: string;
  filePath: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  expiresAt: string;
}