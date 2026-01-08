export enum OCRStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface DocumentData {
  id: string;
  title: string;
  originalImageUrl?: string; // Optional for pure whiteboard documents
  extractedText: string;
  canvasData?: string; // JSON string of canvas elements
  createdAt: number;
  status: OCRStatus;
  confidence?: number;
}

export interface ProcessingError {
  message: string;
  code?: string;
}

export type ProcessingResult = {
  text: string;
  confidence?: number;
};
