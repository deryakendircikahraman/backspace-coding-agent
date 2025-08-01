export interface CodeChangeRequest {
  repoUrl: string;
  prompt: string;
}

export interface CodeChange {
  file: string;
  type: 'modify' | 'create' | 'delete';
  content?: string;
  description: string;
}

export interface LLMResponse {
  changes: CodeChange[];
  summary: string;
}

export interface SSEEvent {
  type: 'progress' | 'error' | 'success';
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface GitHubPRResponse {
  html_url: string;
  number: number;
  title: string;
  state: string;
}

export interface SandboxConfig {
  timeout: number;
  maxMemory: string;
  maxDisk: string;
}

export interface ProcessStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  data?: Record<string, unknown>;
}

 