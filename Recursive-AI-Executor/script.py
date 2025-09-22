# Create the complete FastAPI backend implementation
backend_code = {
    "main.py": '''"""
FastAPI main application for Recursive AI Executor
Handles AI code generation, execution, and retry logic
"""
import asyncio
import subprocess
import tempfile
import os
import ast
import signal
from contextlib import contextmanager
from typing import Dict, List, Optional, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import openai
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Recursive AI Executor",
    description="AI-powered code generation and execution with recursive retry logic",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client (requires API key in environment)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Configuration
MAX_RETRIES = 5
EXECUTION_TIMEOUT = 30
DANGEROUS_IMPORTS = {
    "os", "subprocess", "sys", "importlib", "eval", "exec", 
    "open", "__import__", "compile", "globals", "locals"
}


class CodeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    max_retries: Optional[int] = Field(default=MAX_RETRIES, ge=1, le=10)
    timeout: Optional[int] = Field(default=EXECUTION_TIMEOUT, ge=5, le=60)


class ExecutionResult(BaseModel):
    success: bool
    code: str
    output: Optional[str] = None
    error: Optional[str] = None
    attempt: int
    total_attempts: int
    execution_time: Optional[float] = None


class CodeResponse(BaseModel):
    success: bool
    results: List[ExecutionResult]
    final_result: ExecutionResult
    total_time: float


# Security validator using AST
class SecurityValidator(ast.NodeVisitor):
    def __init__(self):
        self.violations = []
    
    def visit_Import(self, node):
        for alias in node.names:
            if alias.name in DANGEROUS_IMPORTS:
                self.violations.append(f"Dangerous import: {alias.name}")
    
    def visit_ImportFrom(self, node):
        if node.module in DANGEROUS_IMPORTS:
            self.violations.append(f"Dangerous import from: {node.module}")
    
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in DANGEROUS_IMPORTS:
                self.violations.append(f"Dangerous function call: {node.func.id}")
        self.generic_visit(node)
    
    def visit_Attribute(self, node):
        if isinstance(node.attr, str) and node.attr.startswith('__'):
            self.violations.append(f"Dangerous attribute access: {node.attr}")
        self.generic_visit(node)


def validate_code_security(code: str) -> List[str]:
    """Validate code for security violations using AST"""
    try:
        tree = ast.parse(code)
        validator = SecurityValidator()
        validator.visit(tree)
        return validator.violations
    except SyntaxError as e:
        return [f"Syntax error: {str(e)}"]


@contextmanager
def timeout_handler(seconds: int):
    """Context manager for handling code execution timeouts"""
    def timeout_signal_handler(signum, frame):
        raise TimeoutError(f"Code execution timed out after {seconds} seconds")
    
    signal.signal(signal.SIGALRM, timeout_signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)


async def generate_code(prompt: str, previous_error: Optional[str] = None) -> str:
    """Generate Python code using OpenAI API"""
    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    system_prompt = """You are an expert Python programmer. Generate clean, working Python code based on the user's request. 
    
    Rules:
    1. Write complete, executable Python code
    2. Include proper error handling where appropriate  
    3. Add comments for complex logic
    4. Use only safe, standard library functions
    5. Avoid dangerous operations (file I/O, subprocess, imports of os/sys)
    6. Include test/demo code to show the function working
    
    If there was a previous error, fix it in the new code."""
    
    user_prompt = prompt
    if previous_error:
        user_prompt += f"\\n\\nPrevious error to fix: {previous_error}"
    
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1000,
            temperature=0.1
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate code: {str(e)}")


async def execute_code_safely(code: str, timeout: int = 30) -> tuple[bool, str, Optional[str]]:
    """Execute Python code in a safe, isolated environment"""
    
    # Validate code security first
    violations = validate_code_security(code)
    if violations:
        return False, "", f"Security violations: {'; '.join(violations)}"
    
    # Create temporary file for code execution
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        # Execute code in subprocess with timeout
        result = subprocess.run(
            ["python", temp_file],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=tempfile.gettempdir()
        )
        
        success = result.returncode == 0
        output = result.stdout if success else None
        error = result.stderr if not success else None
        
        return success, output or "", error
        
    except subprocess.TimeoutExpired:
        return False, "", f"Code execution timed out after {timeout} seconds"
    except Exception as e:
        return False, "", f"Execution error: {str(e)}"
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file)
        except:
            pass


@app.post("/execute", response_model=CodeResponse)
async def execute_recursive(request: CodeRequest):
    """Main endpoint for recursive code execution"""
    import time
    start_time = time.time()
    
    results = []
    attempt = 1
    previous_error = None
    
    while attempt <= request.max_retries:
        # Generate code
        try:
            code = await generate_code(request.prompt, previous_error)
        except Exception as e:
            error_result = ExecutionResult(
                success=False,
                code="",
                error=str(e),
                attempt=attempt,
                total_attempts=request.max_retries
            )
            results.append(error_result)
            break
        
        # Execute code
        exec_start = time.time()
        success, output, error = await execute_code_safely(code, request.timeout)
        exec_time = time.time() - exec_start
        
        result = ExecutionResult(
            success=success,
            code=code,
            output=output,
            error=error,
            attempt=attempt,
            total_attempts=request.max_retries,
            execution_time=exec_time
        )
        
        results.append(result)
        
        if success:
            # Success! Return results
            total_time = time.time() - start_time
            return CodeResponse(
                success=True,
                results=results,
                final_result=result,
                total_time=total_time
            )
        
        # Prepare for retry
        previous_error = error
        attempt += 1
    
    # All attempts failed
    total_time = time.time() - start_time
    final_result = results[-1] if results else ExecutionResult(
        success=False,
        code="",
        error="No attempts were made",
        attempt=0,
        total_attempts=request.max_retries
    )
    
    return CodeResponse(
        success=False,
        results=results,
        final_result=final_result,
        total_time=total_time
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Recursive AI Executor"}


@app.get("/")
async def root():
    """Root endpoint with basic info"""
    return {
        "message": "Recursive AI Executor API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
''',

    "requirements.txt": '''fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
openai==1.3.0
python-multipart==0.0.6
''',

    "dockerfile": '''FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 executor
RUN chown -R executor:executor /app
USER executor

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
''',

    "docker-compose.yml": '''version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    restart: unless-stopped

networks:
  default:
    name: recursive-ai-executor
'''
}

# Save all files to individual files for easy access
for filename, content in backend_code.items():
    with open(f"backend_{filename.replace('.', '_').replace('/', '_')}", 'w') as f:
        f.write(content)

print("✅ Created complete FastAPI backend implementation:")
for filename in backend_code.keys():
    print(f"  - {filename}")
print("\n📂 Files saved as: backend_[filename]")