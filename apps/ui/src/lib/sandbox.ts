import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from './config';
import { CodeChange } from '@/types';

const execAsync = promisify(exec);

export class SandboxEnvironment {
  private workspaceDir: string;
  private repoPath: string;

  constructor(workspaceDir: string = '/tmp/backspace-workspace') {
    this.workspaceDir = workspaceDir;
    this.repoPath = '';
  }

  async cloneRepository(repoUrl: string, branchName: string): Promise<string> {
    try {
      // Create workspace directory if it doesn't exist
      await execAsync(`mkdir -p ${this.workspaceDir}`);
      
      // Clone the repository
      const cloneCommand = `git clone ${repoUrl} ${this.workspaceDir}/${branchName}`;
      await execAsync(cloneCommand);
      
      this.repoPath = `${this.workspaceDir}/${branchName}`;
      
      // Create and checkout new branch
      await execAsync(`cd ${this.repoPath} && git checkout -b ${branchName}`);
      
      return this.repoPath;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  }

  async getCodebaseContext(): Promise<string> {
    try {
      // Get list of all files
      const { stdout: files } = await execAsync(`find ${this.repoPath} -type f -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.py" -o -name "*.java" -o -name "*.go" -o -name "*.rs" -o -name "*.php" -o -name "*.rb" | head -20`);
      
      const fileList = files.trim().split('\n').filter(Boolean);
      let context = 'Repository Structure:\n';
      
                    // Get content of key files
              const keyFiles = ['package.json', 'README.md'];

              for (const keyFile of keyFiles) {
                try {
                  const { stdout } = await execAsync(`cat ${this.repoPath}/${keyFile} 2>/dev/null || echo "File not found"`);
                  if (stdout && !stdout.includes('File not found')) {
                    context += `\n${keyFile}:\n${stdout}\n`;
                  }
                } catch {
                  // File doesn't exist, continue
                }
              }

              // Get content of first few source files
              for (const file of fileList.slice(0, 3)) {
                try {
                  const { stdout } = await execAsync(`head -30 ${file}`);
                  const relativePath = file.replace(this.repoPath + '/', '');
                  context += `\n${relativePath}:\n${stdout}\n`;
                } catch {
                  // Skip files that can't be read
                }
              }
      
      return context;
    } catch (error) {
      throw new Error(`Failed to get codebase context: ${error}`);
    }
  }

  async applyChanges(changes: CodeChange[]): Promise<void> {
    for (const change of changes) {
      const filePath = `${this.repoPath}/${change.file}`;
      
      try {
        switch (change.type) {
          case 'create':
            // Create directory if it doesn't exist
            const dir = filePath.substring(0, filePath.lastIndexOf('/'));
            await execAsync(`mkdir -p ${dir}`);
            
            // Write file content
            await execAsync(`echo '${change.content?.replace(/'/g, "'\"'\"'")}' > ${filePath}`);
            break;
            
          case 'modify':
            // Write new content to existing file
            await execAsync(`echo '${change.content?.replace(/'/g, "'\"'\"'")}' > ${filePath}`);
            break;
            
          case 'delete':
            // Remove file
            await execAsync(`rm -f ${filePath}`);
            break;
        }
      } catch (error) {
        throw new Error(`Failed to apply change to ${change.file}: ${error}`);
      }
    }
  }

  async commitChanges(branchName: string, message: string): Promise<void> {
    try {
      await execAsync(`cd ${this.repoPath} && git add .`);
      await execAsync(`cd ${this.repoPath} && git commit -m "${message}"`);
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error}`);
    }
  }

  async pushBranch(branchName: string): Promise<void> {
    try {
      await execAsync(`cd ${this.repoPath} && git push origin ${branchName}`);
    } catch (error) {
      throw new Error(`Failed to push branch: ${error}`);
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.repoPath) {
        await execAsync(`rm -rf ${this.repoPath}`);
      }
    } catch (error) {
      console.error('Failed to cleanup sandbox:', error);
    }
  }

  async validateChanges(changes: CodeChange[]): Promise<void> {
    for (const change of changes) {
      const filePath = `${this.repoPath}/${change.file}`;
      
      // Check if file exists for modify/delete operations
      if (change.type === 'modify' || change.type === 'delete') {
        try {
          await execAsync(`test -f ${filePath}`);
        } catch {
          throw new Error(`File not found: ${change.file}`);
        }
      }
      
      // Check if file doesn't exist for create operations
      if (change.type === 'create') {
        try {
          await execAsync(`test ! -f ${filePath}`);
        } catch {
          throw new Error(`File already exists: ${change.file}`);
        }
      }
    }
  }
} 