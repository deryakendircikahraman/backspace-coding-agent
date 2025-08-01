import { config } from './config';
import { GitHubPRResponse } from '@/types';

export class GitHubAPI {
  private token: string;
  private baseUrl: string;

  constructor() {
    this.token = config.github.token!;
    this.baseUrl = config.github.apiUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

                async getRepository(owner: string, repo: string) {
                return this.request(`/repos/${owner}/${repo}`);
              }

              async getDefaultBranch(owner: string, repo: string): Promise<string> {
                const repoInfo = await this.getRepository(owner, repo);
                return repoInfo.default_branch || 'master';
              }

                async createBranch(owner: string, repo: string, branchName: string, baseBranch: string = 'master') {
    // First get the SHA of the base branch
    const baseRef = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`);
    
    // Create the new branch
    return this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha,
      }),
    });
  }

  async createCommit(owner: string, repo: string, branch: string, message: string, files: Array<{
    path: string;
    content: string;
    mode: '100644' | '100755' | '040000' | '160000' | '120000';
  }>) {
    // Get the current tree
    const branchRef = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    const commit = await this.request(`/repos/${owner}/${repo}/git/commits/${branchRef.object.sha}`);
    
    // Create a new tree with the files
    const tree = await this.request(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: commit.tree.sha,
        tree: files,
      }),
    });

    // Create a new commit
    const newCommit = await this.request(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [commit.sha],
      }),
    });

    // Update the branch reference
    return this.request(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sha: newCommit.sha,
      }),
    });
  }

                async createPullRequest(
                owner: string,
                repo: string,
                title: string,
                body: string,
                head: string,
                base: string = 'master'
              ): Promise<GitHubPRResponse> {
    return this.request(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    });
  }

  async pushFiles(
    owner: string,
    repo: string,
    branch: string,
    message: string,
    files: Array<{
      path: string;
      content: string;
    }>
  ) {
    const treeFiles = files.map(file => ({
      path: file.path,
      content: file.content,
      mode: '100644' as const,
    }));

    await this.createCommit(owner, repo, branch, message, treeFiles);
  }

  parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return {
      owner: match[1],
      repo: match[2].replace('.git', ''),
    };
  }

  generateBranchName(prompt: string): string {
    const sanitized = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `backspace-${sanitized}-${Date.now()}`;
  }
} 