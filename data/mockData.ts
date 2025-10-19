import { MCPServer, ServerStatus, User, GithubTemplate } from '../types';

export const MOCK_USERS: { [email: string]: User } = {
  'investor@example.com': {
    name: 'Dev Investor',
    email: 'investor@example.com',
    avatarUrl: 'https://picsum.photos/seed/user/40/40',
  }
};

interface MockDb {
  servers: { [userId: string]: MCPServer[] };
  logs: { [serverId: string]: string[] };
}

export const MOCK_TEMPLATES: GithubTemplate[] = [
  {
    id: 'gh-google-drive',
    name: 'Official Google Drive Server',
    owner: 'anthropic',
    description: 'A template to connect and interact with your Google Drive account. This server allows you to manage files, folders, and permissions directly from your AI agent.',
    stars: 12500,
    repoUrl: 'https://github.com/anthropic/mcp-servers/tree/main/sdks/google-drive',
    readmeUrl: 'https://raw.githubusercontent.com/anthropic/mcp-servers/main/sdks/google-drive/README.md',
    rawName: 'Google Drive',
  },
  {
    id: 'gh-github',
    name: 'Official GitHub Server',
    owner: 'anthropic',
    description: 'Connect to GitHub to manage issues, pull requests, and repositories. Automate your development workflows with AI-powered actions.',
    stars: 12500,
    repoUrl: 'https://github.com/anthropic/mcp-servers/tree/main/sdks/github',
    readmeUrl: 'https://raw.githubusercontent.com/anthropic/mcp-servers/main/sdks/github/README.md',
    rawName: 'GitHub',
  },
  {
    id: 'gh-slack',
    name: 'Official Slack Server',
    owner: 'anthropic',
    description: 'Integrate with Slack to send messages, manage channels, and react to events. Build powerful chatbots and notification systems.',
    stars: 12500,
    repoUrl: 'https://github.com/anthropic/mcp-servers/tree/main/sdks/slack',
    readmeUrl: 'https://raw.githubusercontent.com/anthropic/mcp-servers/main/sdks/slack/README.md',
    rawName: 'Slack',
  },
  {
    id: 'gh-postgres',
    name: 'Official Postgres Server',
    owner: 'anthropic',
    description: 'Provides a secure connection to your PostgreSQL database. Allows your AI agent to query data, describe schemas, and perform data analysis.',
    stars: 12500,
    repoUrl: 'https://github.com/anthropic/mcp-servers/tree/main/sdks/postgres',
    readmeUrl: 'https://raw.githubusercontent.com/anthropic/mcp-servers/main/sdks/postgres/README.md',
    rawName: 'Postgres',
  },
];


const initialServers: MCPServer[] = [
    {
      id: '1',
      name: 'google-drive-prod',
      status: ServerStatus.RUNNING,
      url: 'https://google-drive-prod.mcp.app',
      template: 'Google Drive',
      createdAt: '2024-07-20T10:00:00Z',
      containerId: 'a4b1c8',
      metrics: {
        cpu: 15.4,
        memory: { used: 512, total: 2048 },
        network: { inbound: 12.5, outbound: 256.3 },
      },
      functionCalls: 12450,
      totalDataIn: 5120, // MB
      totalDataOut: 25600, // MB
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    {
      id: '2',
      name: 'github-issues-dev',
      status: ServerStatus.RUNNING,
      url: 'https://github-issues-dev.mcp.app',
      template: 'GitHub',
      createdAt: '2024-07-19T15:30:00Z',
      containerId: 'f9e2d0',
      metrics: {
        cpu: 32.1,
        memory: { used: 1024, total: 4096 },
        network: { inbound: 45.8, outbound: 890.1 },
      },
      functionCalls: 897,
      totalDataIn: 1200, // MB
      totalDataOut: 5300, // MB
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: '3',
      name: 'local-filesystem-sync',
      status: ServerStatus.STOPPED,
      url: 'https://local-filesystem-sync.mcp.app',
      template: 'Filesystem',
      createdAt: '2024-07-18T09:00:00Z',
      functionCalls: 5420,
      totalDataIn: 2400,
      totalDataOut: 12800,
    },
];

const initialLogs: { [key: string]: string[] } = {};
initialServers.forEach(server => {
    initialLogs[server.id] = [
        `[${new Date(server.createdAt).toISOString()}] Server initialized with status: ${server.status}.`,
    ];
    if (server.status === ServerStatus.RUNNING) {
        initialLogs[server.id].push(`[${new Date(new Date(server.createdAt).getTime() + 1000).toISOString()}] Container ${server.containerId} created.`);
        initialLogs[server.id].push(`[${new Date(new Date(server.createdAt).getTime() + 2000).toISOString()}] Connected to template '${server.template}'.`);
    }
});


export const MOCK_DB: MockDb = {
  servers: {
    'investor@example.com': initialServers,
  },
  logs: initialLogs,
};
