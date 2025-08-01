# Backspace - AI-Powered Code Generation Agent

Backspace is an AI-powered coding agent that automatically creates pull requests to GitHub repositories based on natural language prompts. It clones repositories, analyzes codebases, generates code changes using AI, and creates pull requests with the implemented changes.

## Features

- **Streaming API**: Real-time progress updates using Server-Sent Events (SSE)
- **AI-Powered Code Generation**: Uses OpenAI GPT-4 to understand and implement code changes
- **Secure Sandbox Environment**: Isolated execution environment for safe code operations
- **GitHub Integration**: Automatic branch creation, commits, and pull request generation
- **Telemetry & Observability**: Comprehensive logging and performance tracking
- **Modern UI**: Clean, responsive web interface for easy interaction

## Architecture

### Core Components

1. **Next.js API Route** (`/api/code`): Main endpoint that orchestrates the entire workflow
2. **GitHub API Service**: Handles repository operations and pull request creation
3. **LLM Service**: Integrates with OpenAI for code generation and analysis
4. **Sandbox Environment**: Secure execution environment for code operations
5. **Telemetry Service**: Tracks agent decision-making and performance metrics
6. **SSE Streaming**: Real-time progress updates to the frontend

### Workflow

1. **Input Validation**: Validates repository URL and prompt
2. **Repository Cloning**: Clones the target repository into a sandbox
3. **Codebase Analysis**: Analyzes the repository structure and content
4. **AI Code Generation**: Uses LLM to generate code changes based on the prompt
5. **Change Validation**: Validates generated changes for safety and correctness
6. **Git Operations**: Creates branch, commits changes, and pushes to GitHub
7. **Pull Request Creation**: Creates a pull request with detailed description
8. **Real-time Updates**: Streams progress throughout the entire process

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Server-Sent Events
- **AI**: OpenAI GPT-4 API
- **Git Operations**: GitHub REST API v3
- **Sandbox**: Local file system with process isolation
- **Telemetry**: Custom logging system (extensible to OpenTelemetry)

## Installation

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- GitHub Personal Access Token
- OpenAI API Key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/deryakendircikahraman/backspace-coding-agent.git
   cd backspace-coding-agent
   ```

2. **Install dependencies**
   ```bash
   cd apps/ui
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in `apps/ui/`:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Web Interface

1. Enter a public GitHub repository URL
2. Provide a natural language description of the changes you want
3. Click "Generate Changes"
4. Watch real-time progress updates
5. View the created pull request

### API Usage

```bash
curl -X POST http://localhost:3000/api/code \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/user/repo",
    "prompt": "Add a simple loading spinner component"
  }' \
  -N
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Yes |
| `OPENAI_API_KEY` | OpenAI API Key | Yes |
| `OPENAI_MODEL` | OpenAI model to use (default: gpt-4) | No |

### GitHub Token Permissions

Your GitHub Personal Access Token needs the following permissions:
- `repo` (Full control of private repositories)
- `workflow` (Update GitHub Action workflows)

## Testing

### Test Cases

1. **Simple File Creation**
   ```json
   {
     "repoUrl": "https://github.com/deryakendircikahraman/backspace-coding-agent",
     "prompt": "Create a new file called utils.js with a calculator function"
   }
   ```

2. **README Updates**
   ```json
   {
     "repoUrl": "https://github.com/deryakendircikahraman/backspace-coding-agent",
     "prompt": "Add installation instructions to README.md"
   }
   ```

3. **Code Modifications**
   ```json
   {
     "repoUrl": "https://github.com/deryakendircikahraman/backspace-coding-agent",
     "prompt": "Add error handling to the main function"
   }
   ```

## 📊 Telemetry

The system includes comprehensive telemetry tracking:

- **Step Tracking**: Each major operation is logged with timing
- **Decision Logging**: AI decisions and reasoning are captured
- **Performance Metrics**: Duration tracking for all operations
- **Error Tracking**: Detailed error logging with context

Telemetry data is displayed in the web interface and can be extended to integrate with OpenTelemetry or LangSmith.

## 🔒 Security

- **Sandboxed Execution**: All code operations run in isolated environments
- **Input Validation**: Comprehensive validation of repository URLs and prompts
- **Token Security**: Environment variables for sensitive API keys
- **Error Handling**: Graceful error handling without exposing sensitive information

## Limitations

- Only works with public GitHub repositories
- Requires valid GitHub and OpenAI API credentials
- Limited to text-based code changes (no binary files)
- Sandbox environment uses local file system (not cloud-based)

## Future Enhancements

- **Cloud Sandbox**: Integration with Modal, Daytona, or E2B
- **Advanced Telemetry**: OpenTelemetry and LangSmith integration
- **Multi-Repository Support**: Batch operations across multiple repos
- **Code Review**: AI-powered code review and suggestions
- **Template System**: Predefined templates for common operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-4 API
- GitHub for the comprehensive REST API
- Next.js team for the excellent framework
- The open-source community for inspiration and tools
