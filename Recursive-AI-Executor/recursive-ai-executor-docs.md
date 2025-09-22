# Recursive AI Executor - Complete Implementation Guide

## 🎯 Project Overview

The **Recursive AI Executor** is a sophisticated web application that accepts natural language prompts, generates Python code using AI (OpenAI GPT), and executes it recursively until successful completion. The system automatically handles errors by improving the generated code through multiple retry attempts.

### ✨ Key Features

- **AI-Powered Code Generation**: Uses OpenAI GPT-4/3.5 to convert natural language into executable Python code
- **Recursive Retry Logic**: Automatically fixes errors and retries execution up to 5 times
- **Secure Code Execution**: Sandboxed environment with AST validation and security checks
- **Real-Time Interface**: Modern React frontend with Monaco Editor for syntax highlighting
- **Comprehensive Logging**: Tracks all attempts, execution times, and error details
- **Docker Containerization**: Fully containerized for secure deployment

## 🏗️ System Architecture

### Frontend Layer (React + Vite)
- **React Components**: PromptInput, CodeViewer, ExecutionLog, StatusIndicator
- **Monaco Editor**: VS Code-like syntax highlighting and code display
- **Tailwind CSS**: Modern, responsive styling framework
- **Real-time Updates**: WebSocket connection for live execution feedback

### Backend Layer (FastAPI + Python)
- **FastAPI Server**: High-performance async API framework
- **OpenAI Integration**: GPT model integration for code generation
- **Code Execution Engine**: Secure subprocess-based Python execution
- **Retry Logic Manager**: Intelligent error handling and code improvement

### Security & Infrastructure
- **Docker Sandbox**: Isolated containers for code execution
- **AST Validation**: Python Abstract Syntax Tree analysis for security
- **Resource Limits**: CPU, memory, and execution time constraints
- **Import Restrictions**: Blocks dangerous library imports (os, subprocess, sys)

## 🚀 Implementation Details

### Core Algorithm Flow

1. **Prompt Processing**
   ```
   User Input → Validation → AI Generation Request
   ```

2. **Code Generation** 
   ```python
   async def generate_code(prompt: str, previous_error: Optional[str] = None) -> str:
       system_prompt = """Expert Python programmer rules..."""
       user_prompt = prompt
       if previous_error:
           user_prompt += f"\n\nPrevious error to fix: {previous_error}"
       
       response = await openai.ChatCompletion.acreate(...)
       return response.choices[0].message.content
   ```

3. **Security Validation**
   ```python
   class SecurityValidator(ast.NodeVisitor):
       def visit_Import(self, node):
           # Check for dangerous imports
       def visit_Call(self, node):
           # Validate function calls
   ```

4. **Safe Execution**
   ```python
   async def execute_code_safely(code: str, timeout: int = 30):
       # AST validation
       # Subprocess execution with timeout
       # Result capture and cleanup
   ```

5. **Recursive Retry Logic**
   ```python
   attempt = 1
   while attempt <= max_retries:
       code = await generate_code(prompt, previous_error)
       success, output, error = await execute_code_safely(code)
       if success:
           return results
       previous_error = error
       attempt += 1
   ```

### Security Measures

#### 1. Code Validation (AST-Based)
- **Dangerous Import Detection**: Blocks os, sys, subprocess, eval, exec
- **Function Call Monitoring**: Prevents calls to restricted functions  
- **Attribute Access Control**: Blocks access to dunder methods
- **Syntax Validation**: Ensures code is syntactically correct

#### 2. Execution Sandboxing
- **Subprocess Isolation**: Code runs in separate Python processes
- **Resource Limits**: Memory and CPU usage constraints
- **Timeout Protection**: Automatic termination of long-running code
- **Temporary File Management**: Secure file creation and cleanup

#### 3. Docker Containerization
```dockerfile
FROM python:3.11-slim
# Non-root user execution
RUN useradd -m -u 1000 executor
USER executor
# Health checks and resource limits
```

## 📱 Frontend Implementation

### React Component Structure
```jsx
// Main Application Component
function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <PromptSidebar />
        <CodeViewer />
        <ExecutionLog />
      </div>
      <StatusBar />
    </div>
  );
}
```

### Monaco Editor Integration
```jsx
import Editor from '@monaco-editor/react';

function CodeViewer({ code, language = 'python' }) {
  return (
    <Editor
      height="400px"
      language={language}
      theme="vs-dark"
      value={code}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false
      }}
    />
  );
}
```

### State Management
```jsx
const [executionState, setExecutionState] = useState({
  isRunning: false,
  currentAttempt: 0,
  maxAttempts: 5,
  results: [],
  status: 'idle'
});
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.11+ with pip
- **Docker** and Docker Compose
- **OpenAI API Key**

### Local Development

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd recursive-ai-executor
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   export OPENAI_API_KEY="your-api-key-here"
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup** 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Docker Setup**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   
   # Start services
   docker-compose up -d
   ```

### Environment Variables
```bash
# Backend
OPENAI_API_KEY=your-openai-api-key
MAX_RETRIES=5
EXECUTION_TIMEOUT=30

# Frontend  
REACT_APP_API_URL=http://localhost:8000
```

## 🔧 Configuration Options

### Backend Configuration
```python
# main.py settings
MAX_RETRIES = 5                    # Maximum retry attempts
EXECUTION_TIMEOUT = 30             # Code execution timeout (seconds)
DANGEROUS_IMPORTS = {              # Blocked imports for security
    "os", "subprocess", "sys", "eval", "exec", "open"
}
```

### Frontend Configuration
```javascript
// App configuration
const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  MAX_RETRIES: 5,
  TIMEOUT: 30,
  THEME: 'dark'
};
```

## 📊 API Documentation

### POST /execute
Execute code with recursive retry logic

**Request:**
```json
{
  "prompt": "Create a function to calculate factorial",
  "max_retries": 5,
  "timeout": 30
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "success": false,
      "code": "def factorial(n):\n    if n = 1: ...",
      "error": "SyntaxError: invalid syntax",
      "attempt": 1,
      "total_attempts": 5
    },
    {
      "success": true,
      "code": "def factorial(n):\n    if n == 1: ...",
      "output": "Factorial of 5: 120",
      "attempt": 2,
      "total_attempts": 5,
      "execution_time": 0.15
    }
  ],
  "final_result": { /* last attempt result */ },
  "total_time": 2.34
}
```

### GET /health
Health check endpoint
```json
{
  "status": "healthy",
  "service": "Recursive AI Executor"
}
```

## 🚢 Deployment Guide

### Production Docker Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale backend instances  
docker-compose up -d --scale backend=3

# Monitor logs
docker-compose logs -f backend
```

### Cloud Deployment Options

#### 1. **AWS ECS/Fargate**
```yaml
# task-definition.json
{
  "family": "recursive-ai-executor",
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [...]
}
```

#### 2. **Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recursive-ai-executor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: recursive-ai-executor
  template:
    spec:
      containers:
      - name: backend
        image: recursive-ai-executor:latest
        ports:
        - containerPort: 8000
```

#### 3. **Google Cloud Run**
```bash
# Deploy to Cloud Run
gcloud run deploy recursive-ai-executor \
  --image gcr.io/project-id/recursive-ai-executor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🧪 Testing Strategy

### Backend Testing
```python
# test_main.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_execute_simple_code():
    response = client.post("/execute", json={
        "prompt": "print('hello world')",
        "max_retries": 3
    })
    assert response.status_code == 200
    assert response.json()["success"] == True
```

### Frontend Testing  
```jsx
// CodeViewer.test.jsx
import { render, screen } from '@testing-library/react';
import CodeViewer from './CodeViewer';

test('renders code with syntax highlighting', () => {
  render(<CodeViewer code="print('hello')" language="python" />);
  expect(screen.getByText(/hello/)).toBeInTheDocument();
});
```

### Integration Testing
```python
# test_integration.py
async def test_full_execution_flow():
    # Test complete prompt -> generation -> execution flow
    result = await execute_recursive(CodeRequest(
        prompt="create a simple calculator function"
    ))
    assert result.success == True
    assert "def" in result.final_result.code
```

## 📈 Performance Optimization

### Backend Optimizations
- **Async Processing**: FastAPI with async/await for concurrent requests
- **Connection Pooling**: OpenAI API connection reuse
- **Caching**: Redis cache for frequently generated code patterns
- **Resource Limits**: CPU and memory constraints for security

### Frontend Optimizations  
- **Code Splitting**: Lazy loading of Monaco Editor
- **Virtual Scrolling**: For large execution logs
- **Debounced Input**: Prevent excessive API calls during typing
- **Service Workers**: Offline capability and caching

### Infrastructure Optimizations
- **Load Balancing**: Multiple backend instances
- **CDN**: Static asset delivery
- **Database**: PostgreSQL for execution history
- **Monitoring**: Prometheus + Grafana for metrics

## 🔍 Monitoring & Observability

### Logging Strategy
```python
import logging
from structlog import configure, get_logger

# Structured logging setup
logger = get_logger()

# Log execution attempts
logger.info("code_execution_started", 
           prompt=prompt, attempt=attempt)
logger.error("code_execution_failed", 
            error=error, attempt=attempt)
```

### Metrics Collection
- **Execution Success Rate**: Percentage of successful completions
- **Average Retry Count**: Mean attempts before success
- **Response Times**: API endpoint performance
- **Error Categories**: Classification of common failures

### Health Monitoring
```python
@app.get("/metrics")
async def get_metrics():
    return {
        "total_executions": execution_counter,
        "success_rate": success_rate,
        "average_attempts": avg_attempts,
        "uptime": get_uptime()
    }
```

## 🎯 Demo Scenarios

### Scenario 1: Simple Function Creation
**Prompt**: "Create a function to calculate factorial"
**Expected Flow**:
1. Generate code with syntax error (`n = 1` instead of `n == 1`)
2. Error caught: "SyntaxError: invalid syntax"  
3. Regenerate with fix
4. Successful execution and output

### Scenario 2: Complex Algorithm Implementation  
**Prompt**: "Implement quicksort algorithm with example"
**Expected Flow**:
1. Generate initial implementation
2. Possible logic error in partitioning
3. Fix algorithm and add proper test cases
4. Successful execution with sorted output

### Scenario 3: Data Processing Task
**Prompt**: "Create code to analyze a list of numbers and find statistics"
**Expected Flow**:
1. Generate comprehensive statistics function
2. Handle edge cases (empty lists, etc.)
3. Successful execution with sample data

## 📝 Troubleshooting Guide

### Common Issues

1. **OpenAI API Errors**
   ```python
   # Solution: Check API key and rate limits
   if not openai.api_key:
       raise HTTPException(status_code=500, 
                         detail="OpenAI API key not configured")
   ```

2. **Code Execution Timeouts**
   ```python
   # Solution: Implement proper timeout handling
   try:
       result = subprocess.run(cmd, timeout=30)
   except subprocess.TimeoutExpired:
       return False, "", "Execution timeout"
   ```

3. **Security Violations**
   ```python
   # Solution: Enhance AST validation
   violations = validate_code_security(code)
   if violations:
       return False, "", f"Security violations: {violations}"
   ```

4. **Frontend Monaco Loading Issues**
   ```jsx
   // Solution: Dynamic import with error boundary
   const MonacoEditor = lazy(() => import('@monaco-editor/react'));
   ```

## 📚 Additional Resources

### Documentation Links
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [React Documentation](https://react.dev/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/docs.html)

### Security Best Practices
- [Python AST Security](https://docs.python.org/3/library/ast.html)
- [Docker Security](https://docs.docker.com/engine/security/)
- [OpenAI Safety Guidelines](https://platform.openai.com/docs/guides/safety-best-practices)

### Performance References
- [FastAPI Performance](https://fastapi.tiangolo.com/benchmarks/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Docker Optimization](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **Backend**: Black formatting, type hints, docstrings
- **Frontend**: Prettier formatting, ESLint, TypeScript
- **Testing**: Minimum 80% code coverage
- **Documentation**: Update README and API docs

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Conclusion

The Recursive AI Executor demonstrates the powerful combination of AI code generation with intelligent error handling and retry mechanisms. The system provides a robust, secure, and user-friendly platform for converting natural language requirements into executable Python code.

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/your-repo/recursive-ai-executor).

**Happy Coding! 🚀**