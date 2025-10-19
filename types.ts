export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

export enum ServerStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  CREATING = 'Creating',
  STARTING = 'Starting',
  STOPPING = 'Stopping',
  DELETING = 'Deleting',
}

export interface ServerMetrics {
  cpu: number; // percentage
  memory: {
    used: number; // MB
    total: number; // MB
  };
  network: {
    inbound: number; // KB/s
    outbound: number; // KB/s
  };
}

export interface MCPServer {
  id: string;
  name: string;
  status: ServerStatus;
  url: string;
  template: string;
  createdAt: string;
  containerId?: string;
  metrics?: ServerMetrics;
  functionCalls: number;
  totalDataIn: number; // MB
  totalDataOut: number; // MB
  startedAt?: string;
}

export interface GithubTemplate {
  id: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  repoUrl: string;
  readmeUrl: string;
  rawName: string; // The simple name for the backend, e.g., 'Google Drive'
}
