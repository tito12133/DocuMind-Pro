
export type Department = 'Sales' | 'Legal' | 'HR' | 'Finance' | 'Operations' | 'Title' | 'General';

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  department: Department;
  content?: string | ArrayBuffer | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
  isTyping?: boolean;
}

export type ActiveView = 'documents' | 'templates' | 'generate' | 'analytics' | 'info';

export type ActionResult = {
  type: 'summary' | 'extract' | 'compare' | 'generate' | null;
  data: any;
  title: string;
  docNames?: string[];
} | null;

export interface Template {
  id: string;
  name:string;
  category: 'Real Estate' | 'Legal' | 'Business';
  fields: number;
  description: string;
}

export type ModalType = 
  | { type: 'viewDocument'; docId: string }
  | { type: 'previewTemplate'; templateId: string }
  | { type: 'generateContract'; contract: any }
  | { type: 'generateNew' };

export type NotificationType = {
  message: string;
  type: 'success' | 'error';
} | null;
