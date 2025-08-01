import OpenAI from 'openai';
import { config } from './config';
import { LLMResponse, CodeChange } from '@/types';

export class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.llm.apiKey,
    });
  }

  async generateCodeChanges(
    repoUrl: string,
    prompt: string,
    codebaseContext: string
  ): Promise<LLMResponse> {
                    const systemPrompt = `You are a coding assistant that helps implement code changes. Please provide your response in valid JSON format.`;

                const userPrompt = `Repository: ${repoUrl}
            Request: ${prompt}

            Codebase Context:
            ${codebaseContext}

            Please implement the requested changes and provide your response in this JSON format:

            {
              "changes": [
                {
                  "file": "path/to/file.js",
                  "type": "modify|create|delete",
                  "content": "new content or null for delete",
                  "description": "what this change does"
                }
              ],
              "summary": "Brief summary of all changes made"
            }

            Rules:
            - Use "modify" for existing files that need changes
            - Use "create" for new files
            - Use "delete" for files to be removed (content should be null)
            - Provide full file content for "create" and "modify" operations
            - Ensure all file paths are relative to the repository root`;

    try {
      const response = await this.openai.chat.completions.create({
        model: config.llm.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.1, // Low temperature for consistent code generation
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from LLM');
      }

      const parsed = JSON.parse(jsonMatch[0]) as LLMResponse;
      
      // Validate the response structure
      if (!parsed.changes || !Array.isArray(parsed.changes)) {
        throw new Error('Invalid response structure: missing changes array');
      }

      if (!parsed.summary || typeof parsed.summary !== 'string') {
        throw new Error('Invalid response structure: missing summary');
      }

      return parsed;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LLM API error: ${error.message}`);
      }
      throw new Error('Unknown LLM API error');
    }
  }

  async analyzeCodebase(codebaseContext: string): Promise<string> {
    const prompt = `Analyze this codebase and provide a brief overview of its structure, main technologies used, and key files.

Codebase:
${codebaseContext}

Provide a concise analysis focusing on:
- Main technologies and frameworks
- Project structure
- Key entry points
- Configuration files`;

    try {
      const response = await this.openai.chat.completions.create({
        model: config.llm.model,
        messages: [
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Unable to analyze codebase';
    } catch (error) {
      console.error('Error analyzing codebase:', error);
      return 'Error analyzing codebase';
    }
  }

  validateChanges(changes: CodeChange[]): void {
    for (const change of changes) {
      if (!change.file || typeof change.file !== 'string') {
        throw new Error('Invalid change: missing or invalid file path');
      }

      if (!['modify', 'create', 'delete'].includes(change.type)) {
        throw new Error(`Invalid change type: ${change.type}`);
      }

      if (change.type === 'delete' && change.content !== null) {
        throw new Error('Delete operations should have null content');
      }

      if (change.type !== 'delete' && !change.content) {
        throw new Error('Modify and create operations require content');
      }

      if (!change.description || typeof change.description !== 'string') {
        throw new Error('Invalid change: missing or invalid description');
      }
    }
  }
} 