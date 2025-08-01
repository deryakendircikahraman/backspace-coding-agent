export const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
    apiUrl: 'https://api.github.com',
  },
  llm: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: 4000,
  },
  sandbox: {
    timeout: 300000, // 5 minutes
    maxMemory: '512m',
    maxDisk: '1g',
    workspaceDir: '/workspace',
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
} as const;

export function validateConfig() {
  const required = [
    'GITHUB_TOKEN',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 